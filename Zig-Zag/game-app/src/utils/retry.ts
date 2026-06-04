/**
 * Utilitaire de retry avec exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 seconde
  maxDelay: 10000, // 10 secondes
  backoffMultiplier: 2,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'ECONNRESET', 'ETIMEDOUT'],
};

/**
 * Retry une fonction avec exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Vérifier si l'erreur est retryable
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable = opts.retryableErrors.some((retryableError) =>
        errorMessage.includes(retryableError)
      );

      if (!isRetryable || attempt === opts.maxAttempts) {
        throw error;
      }

      // Calculer le délai avec exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );

      // Attendre avant de réessayer
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
