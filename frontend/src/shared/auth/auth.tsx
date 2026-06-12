// Estado de autenticação compartilhado. Guarda o JWT (via token store) e expõe
// login/register/logout. Modo "demo" permite navegar sem backend (dados de
// exemplo/dev), preservando a revisão de design.
import { createContext, useContext, useState, type ReactNode } from 'react';
import { getToken, setToken } from './token';
import { login as apiLogin, register as apiRegister } from './api';

type Status = 'anon' | 'authed' | 'demo';
const EMAIL_KEY = 'opensight.email';

interface AuthValue {
  status: Status;
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  enterDemo: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

function readEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}
function persistEmail(email: string | null) {
  try {
    if (email) localStorage.setItem(EMAIL_KEY, email);
    else localStorage.removeItem(EMAIL_KEY);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(() => (getToken() ? 'authed' : 'anon'));
  const [email, setEmail] = useState<string | null>(() => readEmail());

  const doLogin = async (e: string, password: string) => {
    const token = await apiLogin(e, password);
    setToken(token);
    persistEmail(e);
    setEmail(e);
    setStatus('authed');
  };

  const doRegister = async (e: string, password: string) => {
    await apiRegister(e, password);
    await doLogin(e, password);
  };

  const logout = () => {
    setToken(null);
    persistEmail(null);
    setEmail(null);
    setStatus('anon');
  };

  // Demo: sem JWT. O backend em modo dev (sem AUTH_PUBLIC_KEY) responde, e as
  // páginas caem no mock se a API estiver offline.
  const enterDemo = () => {
    setEmail('demo');
    setStatus('demo');
  };

  return (
    <AuthContext.Provider value={{ status, email, login: doLogin, register: doRegister, logout, enterDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
