import { type AxiosInstance, type InternalAxiosRequestConfig, isAxiosError } from 'axios';

export interface SessionTokenPair {
  token: string;
  refreshToken: string | null;
}

export interface SessionRefreshOptions {
  lockName: string;
  getToken: () => string | null | undefined;
  /** Value that changes whenever the session is rotated or replaced: the refresh token. */
  getSessionMarker: () => string | null | undefined;
  refresh: (token: string | null) => Promise<SessionTokenPair>;
  replaceTokens: (pair: SessionTokenPair) => void;
  discardTokens: () => void;
  expireSession: () => void;
  isPublicAuthPath: (url?: string) => boolean;
}

type RetriedRequest = InternalAxiosRequestConfig & { hasRetriedAfterRefresh?: boolean };

class SessionChangedError extends Error {}

function usesSessionToken(
  request: InternalAxiosRequestConfig,
  isPublicAuthPath: (url?: string) => boolean,
) {
  return !isPublicAuthPath(request.url);
}

function toRefreshableRequest(
  error: unknown,
  isPublicAuthPath: (url?: string) => boolean,
): RetriedRequest | undefined {
  if (!isAxiosError(error) || error.response?.status !== 401) return undefined;
  const request = error.config as RetriedRequest | undefined;
  if (!request || request.hasRetriedAfterRefresh || !usesSessionToken(request, isPublicAuthPath)) {
    return undefined;
  }
  return request;
}

function wasSentWithToken(request: InternalAxiosRequestConfig, token: string) {
  const header = request.headers?.Authorization ?? request.headers?.authorization;
  return header === `Bearer ${token}`;
}

function isRefreshRejected(error: unknown) {
  const failure = isAxiosError(error) ? error : error instanceof Error ? error.cause : undefined;
  const status = isAxiosError(failure) ? failure.response?.status : undefined;
  return status === 400 || status === 401 || status === 403;
}

function withRefreshLock<T>(name: string, task: () => Promise<T>) {
  if (typeof navigator === 'undefined' || !navigator.locks) return task();
  return navigator.locks.request(name, task);
}

export interface SessionRefreshHandle {
  refreshAccessToken: () => Promise<string | null>;
}

export function installSessionRefresh(
  clients: AxiosInstance[],
  options: SessionRefreshOptions,
): SessionRefreshHandle {
  let pendingRefresh: Promise<SessionTokenPair> | null = null;

  // The refresh token is the change marker: if it differs from the one this refresh
  // was started with, another tab already rotated the session.
  async function refreshSession(marker: string) {
    const storedToken = options.getToken() ?? null;
    const storedMarker = options.getSessionMarker() ?? null;
    if (!storedMarker) throw new SessionChangedError();
    if (storedMarker !== marker) {
      if (!storedToken) throw new SessionChangedError();
      return { token: storedToken, refreshToken: null };
    }

    const pair = await options.refresh(storedToken);
    const currentToken = options.getToken() ?? null;
    const currentMarker = options.getSessionMarker() ?? null;
    if (currentMarker !== marker) {
      if (currentToken && currentMarker) return { token: currentToken, refreshToken: null };
      options.discardTokens();
      throw new SessionChangedError();
    }
    options.replaceTokens(pair);
    return pair;
  }

  function refreshOnce(marker: string) {
    if (pendingRefresh) return pendingRefresh;

    const refresh = withRefreshLock(
      options.lockName,
      () => refreshSession(marker),
    ) as Promise<SessionTokenPair>;
    pendingRefresh = refresh;
    void refresh
      .catch(() => undefined)
      .finally(() => {
        if (pendingRefresh === refresh) pendingRefresh = null;
      });
    return refresh;
  }

  function handleRefreshFailure(refreshError: unknown, marker: string) {
    const isSessionGone = !options.getToken() && !options.getSessionMarker();
    const isRejected = isRefreshRejected(refreshError) && options.getSessionMarker() === marker;
    if (isSessionGone || isRejected) options.expireSession();
  }

  async function refreshAccessToken() {
    const marker = options.getSessionMarker();
    if (!marker) {
      options.expireSession();
      return null;
    }
    try {
      const pair = await refreshOnce(marker);
      return options.getToken() ?? pair.token;
    } catch (refreshError) {
      handleRefreshFailure(refreshError, marker);
      return null;
    }
  }

  for (const client of clients) {
    client.interceptors.request.use(async (request) => {
      if (!pendingRefresh || !usesSessionToken(request, options.isPublicAuthPath)) {
        return request;
      }

      await pendingRefresh.catch(() => undefined);
      const token = options.getToken();
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
      return request;
    });

    client.interceptors.response.use(undefined, async (error: unknown) => {
      const request = toRefreshableRequest(error, options.isPublicAuthPath);
      if (!request) return Promise.reject(error);

      request.hasRetriedAfterRefresh = true;

      const token = options.getToken() ?? null;
      if (!pendingRefresh && token && !wasSentWithToken(request, token)) {
        return client(request);
      }

      const marker = options.getSessionMarker();
      if (!marker) {
        options.expireSession();
        return Promise.reject(error);
      }

      try {
        await refreshOnce(marker);
      } catch (refreshError) {
        handleRefreshFailure(refreshError, marker);
        return Promise.reject(error);
      }

      const newToken = options.getToken();
      if (newToken) {
        request.headers.Authorization = `Bearer ${newToken}`;
      }
      return client(request);
    });
  }

  return { refreshAccessToken };
}
