import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { Contas } from './pages/Contas';
import { Transacoes } from './pages/Transacoes';
import { Categorias } from './pages/Categorias';
import { Orcamento } from './pages/Orcamento';
import { Projecoes } from './pages/Projecoes';
import { Alertas } from './pages/Alertas';
import { Privacidade } from './pages/Privacidade';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/contas" element={<Contas />} />
          <Route path="/transacoes" element={<Transacoes />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/orcamento" element={<Orcamento />} />
          <Route path="/projecoes" element={<Projecoes />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
