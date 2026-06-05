// Chamadas ao auth-service (login/register). Vivem em shared/ porque a auth é
// cross-cutting (a página de login, em features/auth, consome isto).
import { apiPost, services } from '@/shared/api/client';

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
}

export async function login(email: string, password: string): Promise<string> {
  const r = await apiPost<LoginResponse>(services.auth, '/api/v1/auth/login', { email, password }, { auth: false });
  return r.accessToken;
}

export async function register(email: string, password: string): Promise<void> {
  await apiPost(services.auth, '/api/v1/auth/register', { email, password }, { auth: false });
}
