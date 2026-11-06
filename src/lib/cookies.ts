import Cookies from 'js-cookie';
import { env } from '@/config';

const isBrowser = typeof window !== 'undefined';

/** Same policy as the public client (`client/src/lib/cookies.ts`). */
const tokenCookieOptions = () => {
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  const oneSecondInMs = 1000;
  const expirationInMs = sevenDaysInMs - oneSecondInMs;
  const expirationInDays = expirationInMs / (24 * 60 * 60 * 1000);

  return {
    path: '/',
    sameSite: 'lax' as const,
    secure: isBrowser && window.location.protocol === 'https:',
    expires: expirationInDays,
  };
};

const removeOptions = { path: '/' as const };

export const cookieUtils = {
  setAccessToken: (token: string) => {
    if (!isBrowser) return;
    Cookies.set(env.tokenKey, token, tokenCookieOptions());
  },

  getAccessToken: (): string | undefined => {
    if (!isBrowser) return undefined;
    return Cookies.get(env.tokenKey);
  },

  setRefreshToken: (token: string) => {
    if (!isBrowser) return;
    Cookies.set(env.refreshTokenKey, token, tokenCookieOptions());
  },

  setTokens: (token: string, refreshToken: string) => {
    cookieUtils.setAccessToken(token);
    cookieUtils.setRefreshToken(refreshToken);
  },

  getRefreshToken: (): string | undefined => {
    if (!isBrowser) return undefined;
    return Cookies.get(env.refreshTokenKey);
  },

  removeAccessToken: () => {
    if (!isBrowser) return;
    Cookies.remove(env.tokenKey, removeOptions);
  },

  removeRefreshToken: () => {
    if (!isBrowser) return;
    Cookies.remove(env.refreshTokenKey, removeOptions);
  },

  removeTokens: () => {
    cookieUtils.removeAccessToken();
    cookieUtils.removeRefreshToken();
  },

  isAuthenticated: (): boolean => {
    if (!isBrowser) return false;
    // A refresh-only session still counts: the first request recovers it via refresh.
    return !!(cookieUtils.getAccessToken() || cookieUtils.getRefreshToken());
  },
};

/** Move tokens from pre-cookie localStorage sessions (one-time) into cookies. */
export function migrateLegacyTokenStorage() {
  if (!isBrowser) return;
  const legacyAccess = localStorage.getItem(env.tokenKey);
  if (legacyAccess && !cookieUtils.getAccessToken()) {
    cookieUtils.setAccessToken(legacyAccess);
  }
  const legacyRefresh = localStorage.getItem(env.refreshTokenKey);
  if (legacyRefresh && !cookieUtils.getRefreshToken()) {
    cookieUtils.setRefreshToken(legacyRefresh);
  }
  localStorage.removeItem(env.tokenKey);
  localStorage.removeItem(env.refreshTokenKey);
  // Old zustand persisted auth store (included the refresh token).
  localStorage.removeItem(`${env.tokenKey}_store`);
}
