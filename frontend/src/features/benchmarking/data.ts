// Dados (mock) do domínio Benchmarking / coorte de pares (cohort-analytics-service).
// Agregados e anonimizados — nunca representam um usuário individual (RF-012, RNF-013, RN-008..010).

export interface ComparativoCohort {
  metrica: string;
  voce: number;
  mediana: number; // mediana dos pares bem-sucedidos da mesma faixa
  unidade: string;
  maiorMelhor: boolean; // se valor maior é melhor (poupança) ou pior (gasto)
}
export interface DriverCohort {
  tipo: 'sucesso' | 'fracasso';
  texto: string;
}
export const cohort = {
  faixaRenda: '5–10 salários mínimos',
  membros: 1284, // pares consentidos na coorte
  kMinimo: 30, // k-anonimato (RN-010): coorte só aparece acima deste limiar
  trajetoria: 'melhorou' as 'melhorou' | 'estavel' | 'decaiu',
  taxaCumprimentoVoce: 75, // % de metas cumpridas (RN-009)
  taxaCumprimentoMediana: 61,
  comparativos: [
    { metrica: 'Taxa de poupança', voce: 22, mediana: 17, unidade: '% da renda', maiorMelhor: true },
    { metrica: 'Metas cumpridas', voce: 75, mediana: 61, unidade: '%', maiorMelhor: true },
    { metrica: 'Gasto em Moradia', voce: 31, mediana: 34, unidade: '% da renda', maiorMelhor: false },
    { metrica: 'Gasto em Lazer', voce: 8, mediana: 11, unidade: '% da renda', maiorMelhor: false },
    { metrica: 'Gasto em Assinaturas', voce: 4.1, mediana: 2.6, unidade: '% da renda', maiorMelhor: false },
  ] as ComparativoCohort[],
  drivers: [
    { tipo: 'sucesso', texto: 'Pares que melhoraram mantêm Moradia abaixo de 30% da renda.' },
    { tipo: 'sucesso', texto: 'Aporte automático em investimentos no início do mês, antes dos gastos.' },
    { tipo: 'fracasso', texto: 'Gasto recorrente em Assinaturas acima da mediana derruba a poupança.' },
    { tipo: 'fracasso', texto: 'Metas de Lazer raramente revisadas acompanham quem decaiu de faixa.' },
  ] as DriverCohort[],
  recomendacoes: [
    'Reduza Assinaturas em ~R$ 60/mês para se alinhar à mediana de poupança da sua faixa.',
    'Defina meta de Lazer em ~9% da renda, padrão dos pares que melhoraram.',
    'Agende um aporte automático no início do mês, como 68% dos bem-sucedidos.',
  ],
};
