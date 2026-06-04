// Cliente HTTP único do frontend para o backend OpenSight.
// O navegador fala SÓ com esta API (nunca com o banco). Aqui centralizamos base
// URL, timeout, parsing de erro e (futuro) o header Authorization do JWT.
const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8081').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiGet<T>(path: string, opts: { signal?: AbortSignal; timeoutMs?: number } = {}): Promise<T> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 8000);
  // Encadeia um signal externo (ex.: cleanup de useEffect) ao timeout interno.
  if (opts.signal) {
    if (opts.signal.aborted) ctrl.abort();
    else opts.signal.addEventListener('abort', () => ctrl.abort(), { once: true });
  }
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
      // credentials/Authorization entram quando o auth-service existir.
    });
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        if (body?.error?.message) message = body.error.message;
      } catch {
        /* corpo não-JSON */
      }
      throw new ApiError(res.status, message);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}
