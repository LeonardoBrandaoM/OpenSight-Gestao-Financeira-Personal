# Próximos Passos — OpenSight (2026-06-06)

Balanço após a montagem completa dos 12 serviços da arquitetura e da ligação de
todas as 11 páginas do frontend. **O sistema está completo em estrutura, mas roda
quase tudo com dados de _seed_ em memória.** Este documento lista o que falta,
separando "estrutura existe mas nunca foi exercida" de "ainda não começou".

Referências: `ArquiteturaOpenSight.md` (design canônico), `Progresso.md` (estado
atual), `EstruturaDeProjeto.md` (estrutura-alvo), `CLAUDE.md` (decisões/invariantes).

---

## 1. Tornar real o que já está estruturado (maior valor)

- **Subir Postgres de verdade.** Repos `PostgresRepo`, `migrations/0001_*.sql` e
  `driver_pgx.go` existem em todos os serviços, mas **nunca rodaram contra um
  banco**. Falta:
  - provisionar os bancos (retomar/validar `deploy/docker-compose.yml`, um
    `database-per-service`);
  - aplicar as migrations (runner, ex.: golang-migrate);
  - subir os serviços com `DATABASE_URL` e validar o caminho Postgres
    (hoje só o caminho memória foi exercido).
- **Job de precompute (CQRS).** Os read-models (`*_read_model`,
  `analytics_read_model`) são preenchidos por seed. Falta o job que **lê
  `transactions`/`accounts` e materializa** os read-models (analytics, budget,
  categorização etc.). É o que faz o "precompute" deixar de ser fachada.
- **Sync Pluggy real.** Conector READ-ONLY + pipeline `cmd/sync` existem, mas
  nunca rodaram com credenciais/`item id` reais → nenhum dado real entrou ponta
  a ponta (Pluggy → canonical → DB → serviços → frontend).

## 2. Caminhos de escrita (mutações do usuário)

Quase todos os serviços são **somente leitura** (`GET overview`). As ações da UI
ainda são _front-only_ e não persistem. Falta criar os endpoints
`POST/PUT/PATCH` e a persistência para:

- criar/remover categorias e tipos de transação (RF-004);
- editar metas de orçamento;
- renovar/revogar consentimentos e conectar novas instituições.

> Invariante: isso é escrita de **configuração do usuário**, não de movimentação
> de dinheiro. O READ-ONLY de dinheiro (5 camadas, §4.4) permanece intocado.

## 3. Decisão Belvo (pendência registrada no CLAUDE.md)

Decisão de produto: **Belvo como provedor MVP, Pluggy como fallback**, com
conector **provider-agnostic** (RNF-012). Hoje o conector é **só Pluggy** e o doc
de arquitetura ainda é Pluggy-específico. Falta:

- camada anticorrupção genérica (interface estável de provedor);
- conector Belvo (auth `secretId`/`secretPassword`), mantendo o transporte
  READ-ONLY;
- atualizar `ArquiteturaOpenSight.md` para refletir Belvo.

## 4. Segurança / produção de fato

- Serviços novos rodam em **modo dev** (sem `AUTH_PUBLIC_KEY`); em produção
  precisam validar JWT com a chave pública do auth-service.
- Sem **API gateway** (frontend fala com ~15 portas direto), sem rate limiting,
  sem Secrets Manager configurado, sem observabilidade (logs/métricas/tracing).
- RLS e roles de menor privilégio estão **documentados nas migrations** mas não
  aplicados num banco real.

## 5. Qualidade e processo

- **Cobertura de testes baixa**: testes em audit e nas APIs de analytics/budget;
  faltam testes nos demais serviços, testes de integração e runner de testes no
  frontend (hoje o gate é só `tsc --noEmit`).
- Sem **CI/CD**.

---

## Ordem sugerida

O maior retorno é o **item 1**, nesta sequência, que transforma o sistema de
"maquete funcional" em "dados reais ponta a ponta":

1. Subir o Postgres (`deploy/docker-compose.yml`, um banco por serviço).
2. Aplicar as migrations (runner).
3. Escrever o **job de precompute** que popula os read-models a partir de
   `transactions`/`accounts`.
4. Rodar o **sync Pluggy real** com uma conta de teste.

Depois: caminhos de escrita (item 2) → segurança de produção/gateway (item 4) →
conector Belvo (item 3) → testes/CI (item 5).

> Deploy permanece **explicitamente adiado** pelo dono do projeto.
