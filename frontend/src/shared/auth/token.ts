// Armazenamento do access token (JWT). Cache em memória + persistência em
// localStorage. O client HTTP lê daqui para enviar o header Authorization.
const KEY = 'opensight.jwt';

let cached: string | null = null;
try {
  cached = localStorage.getItem(KEY);
} catch {
  /* SSR/sem storage */
}

export function getToken(): string | null {
  return cached;
}

export function setToken(token: string | null): void {
  cached = token;
  try {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
