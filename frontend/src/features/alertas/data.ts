// Dados (mock) do domínio Alertas (analytics-service / budget-service / consent-service).

export interface Alerta {
  severidade: 'critico' | 'atencao' | 'info';
  tipo: string;
  titulo: string;
  detalhe: string;
  quando: string;
}
export const alertas: Alerta[] = [
  { severidade: 'critico', tipo: 'Anomalia', titulo: 'Gasto fora do padrão', detalhe: 'R$ 480,00 em Eletrônicos — 2,3× acima da sua média.', quando: 'há 2 dias' },
  { severidade: 'critico', tipo: 'Orçamento', titulo: 'Transporte estourou a meta', detalhe: 'R$ 760,00 de R$ 700,00 (109%).', quando: 'há 3 dias' },
  { severidade: 'atencao', tipo: 'Orçamento', titulo: 'Alimentação em 93% da meta', detalhe: 'R$ 1.480,00 de R$ 1.600,00.', quando: 'há 1 dia' },
  { severidade: 'atencao', tipo: 'Consentimento', titulo: 'Consentimento expirando', detalhe: 'Banco Inter expira em 21 dias. Renove para manter a visão ativa.', quando: 'há 5 h' },
  { severidade: 'info', tipo: 'Recorrência', titulo: 'Nova assinatura detectada', detalhe: 'Cobrança recorrente de R$ 21,90 (Spotify) identificada.', quando: 'há 1 semana' },
];
