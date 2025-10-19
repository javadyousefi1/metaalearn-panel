interface EnvConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  appName: string;
  appVersion: string;
  tokenKey: string;
  refreshTokenKey: string;
  nodeEnv: string;
}

export const env: EnvConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  appName: import.meta.env.VITE_APP_NAME || 'MetaaLearn Admin Panel',
  appVersion: import.meta.env.VITE_APP_VERSION || '0.0.1',
  tokenKey: import.meta.env.VITE_TOKEN_KEY || 'metaalearn_token',
  refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'metaalearn_refresh_token',
  nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
};

export const isDevelopment = env.nodeEnv === 'development';
export const isProduction = env.nodeEnv === 'production';
