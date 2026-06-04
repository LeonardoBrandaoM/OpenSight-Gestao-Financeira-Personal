// Barrel de compatibilidade dos mocks.
// Os dados foram divididos por domínio em `features/<x>/data.ts` (ver
// Documentação/EstruturaDeProjeto.md). Este arquivo apenas re-exporta tudo para
// não quebrar imports existentes (`from '@/data/mock'`). Em etapa futura, as
// páginas passam a importar direto de `@/features/<x>/data` e este barrel sai.
export { rng, meses } from '@/shared/lib/mock-helpers';
export * from '@/features/overview/data';
export * from '@/features/orcamento/data';
export * from '@/features/categorias/data';
export * from '@/features/projecoes/data';
export * from '@/features/transacoes/data';
export * from '@/features/contas/data';
export * from '@/features/alertas/data';
export * from '@/features/privacidade/data';
export * from '@/features/benchmarking/data';
export * from '@/features/investimentos/data';
export * from '@/features/cartoes/data';
