import { SupabaseClient } from '@supabase/supabase-js';

// Configuration des timeouts et retries
const REQUEST_TIMEOUT = 10000; // 10 secondes (augmenté pour laisser le temps aux requêtes)
const MAX_RETRIES = 1; // 1 tentative de retry
const RETRY_DELAY = 1000; // 1 seconde

// Cache simple en mémoire
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 secondes

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Exécute une requête avec retry et timeout
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = MAX_RETRIES, retryDelay = RETRY_DELAY, timeout = REQUEST_TIMEOUT } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Créer une promesse avec timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      const result = await Promise.race([fn(), timeoutPromise]);
      return result as T;
    } catch (error) {
      lastError = error as Error;
      
      // Ne pas retry si c'est la dernière tentative
      if (attempt < maxRetries) {
        // Attendre avant de retry (backoff exponentiel)
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Récupère une valeur du cache si elle est encore valide
 */
function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

/**
 * Met une valeur en cache
 */
function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Requête Supabase avec cache et retry
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: any }> {
  // Vérifier le cache d'abord
  const cached = getCached<T>(key);
  if (cached !== null) {
    return { data: cached, error: null };
  }

  try {
    const result = await withRetry(queryFn, options);
    
    // Mettre en cache si succès (même si data est null, c'est une réponse valide)
    if (!result.error) {
      setCached(key, result.data);
    }
    
    return result;
  } catch (error) {
    console.error(`Erreur requête ${key}:`, error);
    return { data: null, error };
  }
}

/**
 * Nettoie le cache (utile après des actions de modification)
 */
export function clearCache(pattern?: string): void {
  if (pattern) {
    // Supprimer les clés correspondant au pattern
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    // Vider tout le cache
    cache.clear();
  }
}

/**
 * Helper pour créer une clé de cache
 */
export function createCacheKey(prefix: string, ...params: any[]): string {
  return `${prefix}:${params.join(':')}`;
}

