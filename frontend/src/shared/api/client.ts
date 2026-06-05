// Cliente HTTP único do frontend. O navegador fala SÓ com estas APIs (nunca com
// o banco). Centraliza base URL por serviço, timeout, parsing de erro e o header
// Authorization: Bearer <jwt> (quando há token).
import { getToken } from '@/shared/auth/token';

const env = import.meta.env;
const clean = (u: string) => u.replace(/\/$/, '');

// Bases por serviço (cada microsserviço numa porta; um gateway pode unificar depois).
export const services = {
  auth: clean(env.VITE_AUTH_URL ?? 'http://localhost:8082'),
  accounts: clean(env.VITE_ACCOUNTS_URL ?? env.VITE_API_URL ?? 'http://localhost:8081'),
  transactions: clean(env.VITE_TRANSACTIONS_URL ?? 'http://localhost:8083'),
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface Options {
  signal?: AbortSignal;
  timeoutMs?: number;
  auth?: boolean; // default true: anexa o Bearer se houver token
}

async function request<T>(method: string, base: string, path: string, body?: unknown, opts: Options = {}): Promise<T> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 8000);
  if (opts.signal) {
    if (opts.signal.aborted) ctrl.abort();
    else opts.signal.addEventListener('abort', () => ctrl.abort(), { once: true });
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.auth !== false) {
    const t = getToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }

  try {
    const res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const b = await res.json();
        if (b?.error?.message) message = b.error.message;
      } catch {
        /* corpo não-JSON */
      }
      throw new ApiError(res.status, message);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const apiGet = <T>(base: string, path: string, opts?: Options) => request<T>('GET', base, path, undefined, opts);
export const apiPost = <T>(base: string, path: string, body: unknown, opts?: Options) =>
  request<T>('POST', base, path, body, opts);
