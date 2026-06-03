// Consentimentos da plataforma (LGPD Tipo A) — estado compartilhado pelo app.
// Mock até o backend existir; espelha os toggles granulares do RNF-013/§6.1.
// O toggle `benchmarking` (default OFF) gateia o módulo de coorte (RF-012).
import { createContext, useContext, useState, type ReactNode } from 'react';

export interface ConsentState {
  processamento: boolean; // processamento de dados (essencial)
  analytics: boolean; // analytics do próprio usuário
  treinamentoML: boolean; // uso anonimizado p/ treino de modelos
  benchmarking: boolean; // participação na coorte de pares (opt-in, default OFF)
  comunicacoes: boolean; // emails/relatórios
}

const padrao: ConsentState = {
  processamento: true,
  analytics: true,
  treinamentoML: true,
  benchmarking: false,
  comunicacoes: true,
};

interface ConsentContextValue extends ConsentState {
  toggle: (chave: keyof ConsentState) => void;
  set: (chave: keyof ConsentState, valor: boolean) => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<ConsentState>(padrao);
  const toggle = (chave: keyof ConsentState) =>
    setEstado((e) => ({ ...e, [chave]: !e[chave] }));
  const set = (chave: keyof ConsentState, valor: boolean) =>
    setEstado((e) => ({ ...e, [chave]: valor }));
  return <ConsentContext.Provider value={{ ...estado, toggle, set }}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent precisa estar dentro de <ConsentProvider>');
  return ctx;
}
