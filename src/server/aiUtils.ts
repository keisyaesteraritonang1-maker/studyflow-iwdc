export interface RetryOptions {
  retries?: number; // max 3
  delays?: number[]; // [2000, 4000, 8000]
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
}

export function isTransientError(error: unknown): boolean {
  if (!error) return false;
  const err = error as { status?: number; code?: number | string; message?: string };
  const status = Number(err.status) || 0;
  const code = String(err.code || '');
  const message = String(err.message || '').toLowerCase();

  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 504 ||
    code === '503' ||
    code === '429' ||
    code === 'RESOURCE_EXHAUSTED' ||
    code === 'UNAVAILABLE' ||
    message.includes('503') ||
    message.includes('429') ||
    message.includes('unavailable') ||
    message.includes('high demand') ||
    message.includes('overloaded') ||
    message.includes('resource_exhausted') ||
    message.includes('rate limit') ||
    message.includes('fetch failed') ||
    message.includes('econnreset') ||
    message.includes('etimedout')
  );
}

export async function generateWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions | number = {}
): Promise<T> {
  const opts: RetryOptions = typeof options === 'number' ? { retries: options } : options;
  const retries = opts.retries ?? 3;
  const delays = opts.delays ?? [2000, 4000, 8000];

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (!isTransientError(error) || i === retries - 1) {
        throw error;
      }

      const delayMs = delays[i] ?? delays[delays.length - 1] ?? 8000;
      if (opts.onRetry) {
        opts.onRetry(i + 1, delayMs, error);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Semua percobaan retry AI gagal.');
}

/**
 * Execute generation with primary model and seamless fallback to alternative model
 * Valid models per @google/genai guidelines: gemini-3.8-flash, gemini-3.1-flash-lite, gemini-flash-latest
 */
export async function generateWithFallback<T>(
  generator: (modelName: string) => Promise<T>,
  models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'],
  retryOptions: RetryOptions = { retries: 3, delays: [2000, 4000, 8000] }
): Promise<T> {
  let lastError: unknown = null;

  for (let m = 0; m < models.length; m++) {
    const currentModel = models[m];
    try {
      return await generateWithRetry(
        () => generator(currentModel),
        retryOptions
      );
    } catch (err: unknown) {
      lastError = err;
      console.warn(`[AI Question Generator] Model "${currentModel}" failed:`, err);

      // If there is another fallback model and the error is transient, switch
      if (m < models.length - 1 && isTransientError(err)) {
        console.log(`[AI Question Generator] Fallback to model: ${models[m + 1]}...`);
        await new Promise((res) => setTimeout(res, 1000));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}
