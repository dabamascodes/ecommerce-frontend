export const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(
        `%c[INFO] %c${message}`,
        'color: #6366f1; font-weight: bold;',
        'color: inherit;',
        data ?? ''
      );
    }
  },
  error: (message: string, error?: any) => {
    if (import.meta.env.DEV) {
      console.error(
        `%c[ERROR] %c${message}`,
        'color: #ef4444; font-weight: bold;',
        'color: inherit;',
        error ?? ''
      );
    }
  },
};