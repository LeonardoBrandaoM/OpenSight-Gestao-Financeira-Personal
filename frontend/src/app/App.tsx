import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Layout } from '@/shared/layout/Layout';
import { ConsentProvider } from '@/shared/context/consent';
import { AuthProvider, useAuth } from '@/shared/auth/auth';
import { Login } from '@/features/auth/pages/Login';
import { Overview } from '@/features/overview/pages/Overview';
import { Contas } from '@/features/contas/pages/Contas';
import { ContaDetalhe } from '@/features/contas/pages/ContaDetalhe';
import { Cartoes } from '@/features/cartoes/pages/Cartoes';
import { Investimentos } from '@/features/investimentos/pages/Investimentos';
import { Transacoes } from '@/features/transacoes/pages/Transacoes';
import { Categorias } from '@/features/categorias/pages/Categorias';
import { Orcamento } from '@/features/orcamento/pages/Orcamento';
import { Projecoes } from '@/features/projecoes/pages/Projecoes';
import { Benchmarking } from '@/features/benchmarking/pages/Benchmarking';
import { Alertas } from '@/features/alertas/pages/Alertas';
import { Privacidade } from '@/features/privacidade/pages/Privacidade';

// Protege as rotas do app: sem autenticação (nem demo) → tela de login.
function RequireAuth() {
  const { status } = useAuth();
  return status === 'anon' ? <Navigate to="/login" replace /> : <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <ConsentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Overview />} />
                <Route path="/contas" element={<Contas />} />
                <Route path="/contas/:id" element={<ContaDetalhe />} />
                <Route path="/cartoes" element={<Cartoes />} />
                <Route path="/investimentos" element={<Investimentos />} />
                <Route path="/transacoes" element={<Transacoes />} />
                <Route path="/categorias" element={<Categorias />} />
                <Route path="/orcamento" element={<Orcamento />} />
                <Route path="/projecoes" element={<Projecoes />} />
                <Route path="/benchmarking" element={<Benchmarking />} />
                <Route path="/alertas" element={<Alertas />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ConsentProvider>
    </AuthProvider>
  );
}
