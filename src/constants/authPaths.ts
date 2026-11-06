const PUBLIC_AUTH_PATHS = [
  'Authentication/Login',
  'Authentication/RefreshToken',
  'Authentication/Logout',
  'Authentication/VerifyOtp',
  'Authentication/ResendOtp',
  'Authentication/ResetPassword',
] as const;

export function isPublicAuthPath(url?: string): boolean {
  if (!url) return false;
  const path = url.split('?')[0].replace(/^\/+/, '');
  return PUBLIC_AUTH_PATHS.some((authPath) => path.endsWith(authPath));
}
