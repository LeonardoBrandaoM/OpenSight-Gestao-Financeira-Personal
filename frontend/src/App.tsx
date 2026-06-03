import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ConsentProvider } from './context/consent';
import { Overview } from './pages/Overview';
import { Contas } from './pages/Contas';
import { ContaDetalhe } from './pages/ContaDetalhe';
import { Cartoes } from './pages/Cartoes';
import { Investimentos } from './pages/Investimentos';
import { Transacoes } from './pages/Transacoes';
import { Categorias } from './pages/Categorias';
import { Orcamento } from './pages/Orcamento';
import { Projecoes } from './pages/Projecoes';
import { Benchmarking } from './pages/Benchmarking';
import { Alertas } from './pages/Alertas';
import { Privacidade } from './pages/Privacidade';

export default function App() {
  return (
    <ConsentProvider>
      <BrowserRouter>
        <Routes>
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
        </Routes>
      </BrowserRouter>
    </ConsentProvider>
  );
}
