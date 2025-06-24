export interface AppError {
  error: string;
  message: string;
  code: number;
}

export interface NotifyOptions {
  success?: string;
  error?: string;
  successType?: 'success' | 'info' | 'warning';
  errorType?: 'error' | 'warning' | 'info';
  duration?: number;
}
