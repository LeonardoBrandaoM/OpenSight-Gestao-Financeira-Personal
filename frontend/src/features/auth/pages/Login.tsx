import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/auth/auth';
import { ApiError } from '@/shared/api/client';

const inputCls =
  'w-full rounded-md border border-graphite bg-obsidian px-3 py-2 text-sm text-bone placeholder:text-steel focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember';

export function Login() {
  const { status, login, register, enterDemo } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Já autenticado (ou demo) → vai para o painel.
  useEffect(() => {
    if (status !== 'anon') nav('/', { replace: true });
  }, [status, nav]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password);
      nav('/', { replace: true });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Falha ao autenticar. O auth-service está no ar?');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-void p-6">
      <div className="panel w-full max-w-sm p-8">
        <div className="mb-6 flex items-center gap-3">
          <img src="/brand/simbolo-harpia.svg" alt="" className="h-10 w-10" />
          <div className="font-display text-xl font-bold tracking-wide text-bone">
            OPEN<span className="text-crimson">SIGHT</span>
          </div>
        </div>

        <h1 className="font-display text-lg font-semibold text-bone">
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </h1>
        <p className="mt-1 text-xs text-ash">
          {mode === 'login' ? 'Acesse sua visão financeira.' : 'Cadastre-se (senha de 12+ caracteres).'}
        </p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" autoComplete="email" className={inputCls} />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="senha" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className={inputCls} />
          {err && <p className="text-xs text-loss">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md border border-crimson bg-crimson/15 px-4 py-2 text-sm font-semibold text-bone transition hover:bg-crimson/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErr(null);
            }}
            className="text-ash transition-colors hover:text-bone"
          >
            {mode === 'login' ? 'Criar conta' : 'Já tenho conta'}
          </button>
          <button type="button" onClick={enterDemo} className="text-brass underline-offset-2 hover:underline">
            Entrar em modo demo
          </button>
        </div>
      </div>
    </div>
  );
}
