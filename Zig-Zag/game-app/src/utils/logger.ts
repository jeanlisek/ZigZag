/**
 * Utilitaire de logging conditionnel
 * En production, seuls les erreurs sont loggées
 */
/* eslint-disable no-console */

type LogLevel = 'log' | 'warn' | 'error' | 'debug';

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isDevelopment) return true;
    // En production, seulement les erreurs
    return level === 'error';
  }

  log(...args: unknown[]): void {
    if (this.shouldLog('log')) {
      console.log('[LOG]', ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: unknown[]): void {
    // Toujours logger les erreurs
    console.error('[ERROR]', ...args);
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args);
    }
  }
}

export const logger = new Logger();
