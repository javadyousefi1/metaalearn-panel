import type { QueryClient } from '@tanstack/react-query';
import { cookieUtils } from '@/lib/cookies';
import { ROUTES } from '@/constants';

const CHANNEL_NAME = 'metaalearn-backoffice-session';
const SESSION_ENDED = 'session-ended';

let sessionEnded = false;
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (channel) return channel;
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch {
    channel = null;
  }
  return channel;
}

function clearTokens() {
  cookieUtils.removeTokens();
}

function redirectToLogin() {
  if (window.location.pathname !== ROUTES.AUTH.LOGIN) {
    window.location.href = ROUTES.AUTH.LOGIN;
  }
}

/** Tells other tabs this session ended. Sent at most once per page life. */
export function broadcastSessionEnded() {
  if (sessionEnded) return;
  sessionEnded = true;
  try {
    getChannel()?.postMessage({ type: SESSION_ENDED });
  } catch {
    // Cross-tab sync relies on BroadcastChannel (cookies do not fire storage events).
  }
}

/** Session expired on this tab: clear tokens, notify other tabs, redirect, all once. */
export function expireSession() {
  if (sessionEnded) return;
  clearTokens();
  broadcastSessionEnded();
  redirectToLogin();
}

/**
 * Reacts to the session ending in another tab. Does not call the backend and
 * never re-broadcasts. Returns a cleanup function.
 */
export function installSessionSync(queryClient: QueryClient) {
  const onRemoteSessionEnded = () => {
    if (sessionEnded) return;
    sessionEnded = true;
    queryClient.clear();
    clearTokens();
    redirectToLogin();
  };

  const onMessage = (event: MessageEvent) => {
    if (event.data?.type === SESSION_ENDED) onRemoteSessionEnded();
  };

  const bc = getChannel();
  bc?.addEventListener('message', onMessage);

  return () => {
    bc?.removeEventListener('message', onMessage);
  };
}
