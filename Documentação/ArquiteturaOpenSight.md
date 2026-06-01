# DOCUMENTO DE ARQUITETURA DE SOFTWARE

## Open Sight - Sistema de Gestao Financeira Pessoal via Open Finance

**Versao:** 1.0.0  
**Data:** 09/04/2026  
**Status:** Draft  
**Autor:** Leonardo Brandao Maia Filho  
**Referencia:** SRS Gestor Financeiro v0.0.003  

---

## 1. CONTEXTO E VISAO GERAL

O OpenSight e um sistema SaaS de gestao financeira pessoal que se conecta ao Open Finance brasileiro via Pluggy SDK, operando em modo estritamente **READ-ONLY**. A arquitetura e projetada com principio **security-first** e **defense-in-depth**, atendendo aos requisitos de compliance com:

- **LGPD** (Lei Geral de Protecao de Dados)
- **Regulamentacoes do Banco Central** (Open Finance Brasil)
- **ISO/IEC 27001:2013** (Gestao de Seguranca da Informacao)
- **PCI DSS v4.0** (Padrao de Seguranca de Dados)

**Escopo Negativo Absoluto:** O sistema NUNCA realizara movimentacoes financeiras (transferencias, pagamentos, investimentos). Esta restricao e enforced em 5 camadas independentes.

---

## 2. ARQUITETURA EM CAMADAS (Defense-in-Depth)

A arquitetura segue um modelo de 6 camadas horizontais, onde cada camada adiciona uma barreira de seguranca:

### Camada 1 - CLIENT
- **Tecnologia:** React SPA/PWA (TypeScript) | Mobile futuro (React Native)
- Comunicacao exclusiva via HTTPS com Edge Layer
- Cache local criptografado (IndexedDB) para suporte offline
- **Nenhum segredo armazenado no cliente** — toda autenticacao via httpOnly secure cookies ou Bearer tokens

### Camada 2 - EDGE / PERIMETRO
- **Tecnologia:** CloudFlare (WAF + DDoS Protection)
- Terminacao TLS 1.3 (minimo 1.2)
- Regras WAF: OWASP Top 10 + padroes de fraude brasileiros
- Restricao geografica (somente Brasil, com excecoes para viagem)
- Bot detection + CAPTCHA
- Injecao de headers de seguranca: HSTS, CSP, X-Frame-Options, X-Content-Type-Options

### Camada 3 - API GATEWAY
- **Tecnologia:** Kong Gateway (self-hosted no K8s)
- Validacao JWT (assinatura, expiracao, issuer, audience)
- Rate limiting: 100 req/min/IP, 10 tentativas login/hora/usuario
- Validacao de schema request/response
- Roteamento versionado (/api/v1/, /api/v2/)
- Injecao de Correlation ID para distributed tracing
- mTLS para comunicacao com servicos backend
- Logs sanitizados (sem PII nos logs do gateway)

### Camada 4 - SERVICE MESH
- **Tecnologia:** Kubernetes (EKS) com Istio service mesh
- mTLS em **TODA** comunicacao inter-servico (zero-trust)
- Cada microservico em namespace Kubernetes proprio
- Network Policies com least-privilege pod-to-pod
- Pod Security Standards: perfil `restricted` em todos os namespaces

### Camada 5 - DATA LAYER
- **Tecnologia:** PostgreSQL 14+ por servico, Redis, RabbitMQ (Amazon MQ)
- Database-per-service pattern (sem cross-database joins)
- Todos os bancos criptografados at-rest (AES-256 via AWS KMS)
- Todas as conexoes de banco via TLS
- Redis: sem PII, somente IDs, contadores e dados agregados

### Camada 6 - INFRAESTRUTURA
- **Provedor:** AWS sa-east-1 (Sao Paulo) — **TODOS** os recursos
- EKS (Kubernetes gerenciado)
- AWS KMS + CloudHSM para gerenciamento de chaves
- AWS Secrets Manager para segredos
- S3 para backups criptografados
- CloudWatch + DataDog para observabilidade

---

## 3. MICROSERVICOS

### 3.1 auth-service (Go)
| Aspecto | Detalhe |
|---------|---------|
| **Responsabilidade** | Registro, login, senhas, 2FA (TOTP), emissao/refresh JWT, SSO (Google/Apple), sessoes, lockout |
| **Database** | `auth_db` — users, credentials (bcrypt cost 12), 2FA secrets (AES-256-GCM), sessions, login_attempts |
| **Saida** | JWT access tokens (15 min, RS256 via KMS) + refresh tokens (30 dias, opacos, hash no DB) |
| **Eventos** | Publica: `user.created`, `user.deleted` |

### 3.2 consent-service (Go)
| Aspecto | Detalhe |
|---------|---------|
| **Responsabilidade** | Ciclo de vida de consentimentos LGPD + Open Finance, orquestracao OAuth 2.0+PKCE via Pluggy, rastreamento de expiracao (90 dias), auditoria granular |
| **Database** | `consent_db` — consents, consent_history, consent_scopes, audit_log |
| **Eventos** | Publica: `consent.granted`, `consent.revoked`, `consent.expiring` |
| **Regra** | Alerta 7 dias antes da expiracao (RN-002) |

### 3.3 institution-connector-service (Go) — SERVICO MAIS CRITICO
| Aspecto | Detalhe |
|---------|---------|
| **Responsabilidade** | **TODA** comunicacao com Pluggy API. Evolucao do `GET_ApiKey.go` existente. Gerenciamento de API keys, sync de dados, webhooks |
| **Database** | `connector_db` — sync_jobs, sync_status, raw_responses (criptografadas AES-256, TTL 24h) |
| **Seguranca** | **Ponto 1 de enforcement READ-ONLY** — allowlist compile-time de endpoints |
| **Restricao de rede** | Unico servico com egress permitido para `api.pluggy.ai:443` |

### 3.4 account-service (Go)
| Aspecto | Detalhe |
|---------|---------|
| **Responsabilidade** | Dados normalizados de contas, consolidacao multi-instituicao, conversao cambial (BRL) |
| **Database** | `account_db` — accounts, balances, balance_history |
| **Criptografia** | `account_number_enc` (AES-256) |

### 3.5 transaction-service (Go)
| Aspecto | Detalhe |
|---------|---------|
| **Responsabilidade** | Transacoes normalizadas, deduplicacao por hash (instituicao+data+valor+descricao), busca/filtro, exportacao CSV/JSON, deteccao de transferencias entre contas proprias (RN-005) |
| **Database** | `transaction_db` — transactions, transaction_hashes |
| **Criptografia** | `description_original` (AES-256 para PII) |
| **Eventos** | Publica: `transactions.new` |

### 3.6 categorization-service (Python + Go wrapper)
| Aspecto | Detalhe |
|---------|---------|
| **Responsabilidade** | Categorizacao ML (alvo: 85% acuracia), aprendizado com correcoes do usuario (RN-001 — 3 correcoes criam regra implicita por 6 meses), motor de regras personalizadas |
| **Database** | `categorization_db` — categories, user_rules, model_metadata |
| **ML** | Inference via gRPC (baixa latencia), modelo armazenado em S3 criptografado |
| **Eventos** | Publica: `transaction.categorized` |

### 3.7 analytics-service (Go)
| Aspecto | Detalhe |
|---------|---------|
| **Responsabilidade** | Agregacoes de dashboard, resumos de gastos por categoria, deteccao de tendencias e anomalias (RN-006 — gasto > 2 desvios padrao + > R$100) |
| **Database** | `analytics_db` — agregacoes pre-computadas, resumos mensais |

### 3.8 projection-service (Go + Python)
| Aspecto | Detalhe |
|---------|---------|
| **Responsabilidade** | Projecoes financeiras (3/6/12 meses), simulacao "E se...", cenarios otimista/realista/pessimista, deteccao de recorrencias, alerta de saldo negativo futuro |
| **Database** | `projection_db` — projections, scenarios, recurring_patterns |
| **Regra** | Requer minimo 60 dias de historico OU 20 transacoes (RN-004) |

### 3.9 budget-service (Go)
| Aspecto | Detalhe |
|---------|---------|
| **Responsabilidade** | Metas orcamentarias mensais por categoria, alertas progressivos (50%/80%/100%), historico de compliance, sugestao automatica (media 3 meses - 10%) |
| **Database** | `budget_db` — goals, goal_progress, alert_history |

### 3.10 notification-service (Go)
| Aspecto | Detalhe |
|---------|---------|
| **Responsabilidade** | Entrega multi-canal: email (AWS SES/SendGrid), push (FCM/APNS), in-app. Templates, delivery tracking, preferencias do usuario |
| **Database** | `notification_db` — templates, delivery_log, user_preferences |

### 3.11 privacy-service (Go) — LGPD
| Aspecto | Detalhe |
|---------|---------|
| **Responsabilidade** | Direitos do titular LGPD: acesso, portabilidade (JSON+CSV), exclusao (cascading delete), dashboard de privacidade, inventario de dados, anonimizacao para ML, gestao DPO, workflow de breach notification |
| **Database** | `privacy_db` — data_inventory, deletion_requests, portability_requests, breach_log |
| **Eventos** | Publica: `deletion.requested` (cascading em todos os servicos) |

### 3.12 audit-service (Go)
| Aspecto | Detalhe |
|---------|---------|
| **Responsabilidade** | Log de auditoria imutavel, retencao 5 anos, deteccao de adulteracao (hash chaining), relatorios de compliance |
| **Database** | `audit_db` — **append-only** (sem permissao UPDATE/DELETE nas tabelas de audit) + S3 cold storage |
| **Integridade** | Cada registro contem hash do registro anterior (cadeia de integridade) |

---

## 4. ARQUITETURA DE SEGURANCA

### 4.1 Fluxo de Autenticacao

```
1. POST /api/v1/auth/login (email + senha)
2. API Gateway verifica rate limit (10 tentativas/hora/usuario)
3. auth-service verifica bcrypt hash (cost 12)
4. Se valido → desafio 2FA (TOTP via Google Authenticator)
   - Token de desafio temporario (5 min)
5. Usuario submete codigo TOTP
6. Sucesso:
   - JWT access token (15 min, assinado RS256 via KMS)
   - Refresh token (30 dias, opaco, rotacao obrigatoria)
7. Fluxo SSO: OAuth 2.0 + PKCE com Google/Apple
8. 5 tentativas falhas de 2FA → bloqueio automatico da conta
```

**Estrutura do JWT:**
```json
{
  "sub": "user-uuid",
  "iss": "opensight-auth",
  "aud": "opensight-api",
  "exp": 1234567890,
  "iat": 1234567890,
  "scope": ["read:accounts", "read:transactions", "read:analytics"],
  "mfa_verified": true
}
```
> **NOTA:** Todos os scopes sao READ-ONLY. Nao existem scopes de escrita para dados financeiros.

### 4.2 Camadas de Criptografia

| Camada | Algoritmo | Gerenciamento de Chave | Rotacao |
|--------|-----------|------------------------|---------|
| Dados at-rest (PostgreSQL) | AES-256 (TDE) | AWS KMS CMK | Anual automatica |
| Dados em transito (todos) | TLS 1.3 (minimo 1.2) | ACM certificates | Auto-renewal |
| **Tokens bancarios (Pluggy)** | **RSA-4096 assimetrico** | **AWS CloudHSM** | **Trimestral** |
| Senhas de usuario | bcrypt, cost factor 12 | N/A (hash one-way) | N/A |
| Segredos 2FA (TOTP) | AES-256-GCM | AWS KMS DEK | On rotation event |
| Backups | AES-256 (S3 SSE-KMS) | AWS KMS CMK | Anual automatica |
| mTLS inter-servico | X.509, ECDSA P-256 | Istio Citadel (auto) | 24h automatica |

**Detalhamento — Tokens Bancarios (RSA-4096 + HSM):**
1. Par de chaves RSA-4096 gerado e armazenado dentro do AWS CloudHSM
2. Quando um access/refresh token do Pluggy e recebido pelo `institution-connector-service`, ele e **criptografado com a chave publica** antes de qualquer armazenamento em PostgreSQL
3. Descriptografia ocorre **somente no momento do uso**, chamando o HSM para descriptografar com a chave privada
4. **A chave privada NUNCA sai do HSM** — mesmo com dump completo do banco de dados, os tokens sao inuteis
5. Rotacao trimestral: novo par de chaves gerado, tokens existentes re-criptografados em batch job

### 4.3 Gestao de Segredos

| Segredo | Armazenamento | Rotacao |
|---------|---------------|---------|
| Credenciais Pluggy (client_id/secret) | AWS Secrets Manager | Manual (coordenado com Pluggy) |
| Senhas de banco de dados | AWS Secrets Manager | 90 dias (automatica via Lambda) |
| JWT signing keys (RS256) | AWS KMS | Anual (30 dias overlap: chave antiga valida, nova assina) |
| Certificados TLS | ACM / Let's Encrypt | Auto-renewal 30 dias antes |
| 2FA encryption keys | AWS KMS DEK | On rotation event |

**Injecao no K8s:**
- External Secrets Operator sincroniza do AWS Secrets Manager → K8s Secrets
- Montados como **volumes**, NAO como env vars (evita exposicao via `/proc`)
- Em desenvolvimento local: `.env` via `godotenv` (NUNCA commitado no Git)

### 4.4 ENFORCEMENT READ-ONLY — 5 Camadas Independentes

Esta e a invariante de seguranca mais critica do sistema. E enforced em **cinco camadas independentes**, de modo que a falha de qualquer uma delas nao compromete a restricao:

#### Camada 1 — Allowlist no Codigo (Compile-Time)

```go
// readonly_transport.go — institution-connector-service
var allowedEndpoints = map[string][]string{
    "POST":   {"/auth"},           // Unico POST permitido: autenticacao API
    "GET":    {
        "/accounts", "/accounts/{id}",
        "/transactions",
        "/items/{id}",
        "/identity",
        "/investments",
    },
    "DELETE": {},                   // VAZIO — nenhuma operacao de delete
    "PUT":    {},                   // VAZIO — nenhuma operacao de update
    "PATCH":  {},                   // VAZIO — nenhuma operacao de update
}
```

Um **HTTP transport wrapper** customizado intercepta **toda** requisicao de saida para `api.pluggy.ai` e rejeita qualquer request que nao corresponda a allowlist. Este wrapper e **unit-tested** e **fuzz-tested** no CI.

#### Camada 2 — Controle de Egress na Rede

- K8s NetworkPolicy + Istio egress gateway restringe pods do namespace `opensight-connector` a **somente** comunicar com `api.pluggy.ai:443`
- **Nenhum outro servico** pode fazer chamadas externas ao Pluggy
- O egress gateway loga todas as requisicoes de saida com metodo HTTP, URL e headers sanitizados

#### Camada 3 — Configuracao da Conta Pluggy

- Conta Pluggy configurada com permissoes **read-only** no nivel da plataforma Pluggy
- Controle administrativo adicional alem do codigo

#### Camada 4 — Restricao de Scopes OAuth

- Ao criar tokens Pluggy Connect para consentimento do usuario, o sistema requisita **somente** scopes de leitura:
  - `ACCOUNTS_READ`
  - `TRANSACTIONS_READ`
  - `IDENTITY_READ`
- Lista de scopes e uma **constante** no codigo — nao e configuravel em runtime

#### Camada 5 — Auditoria e Pentest

- **Todas** as requisicoes HTTP de saida do `institution-connector-service` sao logadas no audit-service (metodo, URL, status code, timestamp)
- **Pentests trimestrais** especificamente tentam disparar operacoes de escrita
- **Testes de integracao automatizados** no CI verificam que o HTTP transport wrapper rejeita metodos de escrita (PUT, PATCH, DELETE)

### 4.5 Rede Zero-Trust

```
Internet
  ↓
CloudFlare WAF (geo-restrict Brasil, OWASP Top 10, bot detection)
  ↓
AWS Network Load Balancer (subnet publica, sa-east-1)
  ↓
EKS NGINX Ingress Controller (subnet privada)
  ↓
Istio Service Mesh (mTLS em toda comunicacao)
  ↓
Pods individuais (subnets privadas, sem IP publico)
  ↓
RDS PostgreSQL (subnet isolada de dados, Security Groups restritos)
```

**Design de VPC (10.0.0.0/16):**

| Tipo | CIDR | Conteudo | AZs |
|------|------|----------|-----|
| Public Subnets | 10.0.1.0/24 - 10.0.3.0/24 | NLB + NAT Gateway apenas | 3 |
| Private Subnets | 10.0.10.0/24 - 10.0.30.0/24 | EKS worker nodes | 3 |
| Data Subnets | 10.0.100.0/24 - 10.0.201.0/24 | RDS, ElastiCache, Amazon MQ | 3 |

- **VPC Flow Logs** habilitados → CloudWatch + S3
- **Default deny all** ingress/egress por namespace K8s
- Regras explicitas de allow por par de servicos (least-privilege)
- NAT Gateway em cada AZ para chamadas de saida (Pluggy API)

### 4.6 Modelo de Ameacas

| Ameaca | Vetor | Mitigacao |
|--------|-------|-----------|
| JWT roubado | Interceptacao, XSS | Expiracao 15 min, rotacao de refresh token, device fingerprint, logout-all |
| Tokens bancarios comprometidos | Dump de DB, acesso indevido | RSA-4096 com chave privada no HSM; dump de DB e inutil sem acesso fisico ao HSM |
| SQL injection | Input malicioso | Queries parametrizadas (Go `database/sql`), validacao no gateway |
| XSS | Script injection no frontend | CSP headers restritivos, React auto-escaping, proibido `dangerouslySetInnerHTML` |
| CSRF | Requisicoes cross-origin | SameSite=Strict cookies, CSRF tokens para operacoes state-changing |
| Ameaca interna | Funcionario malicioso | Audit logging de todo acesso a dados, least-privilege, sem acesso direto a DB em prod |
| Supply chain attack | Dependencia comprometida | Dependabot, go.sum verification, scan de imagens (Trivy), imagens assinadas (cosign/Sigstore) |
| DDoS | Inundacao de trafego | CloudFlare L3/L4/L7, rate limiting no API Gateway, resource limits no K8s |
| Exfiltracao de dados | Saida nao autorizada | VPC Flow Logs, egress filtering por namespace, DLP scanning em S3 |
| Credential stuffing | Listas de credenciais vazadas | Rate limiting por usuario, 2FA obrigatorio, correlacao de IPs no audit log |
| Brute force 2FA | Tentativas massivas de TOTP | Bloqueio apos 5 tentativas, tokens de desafio com TTL de 5 min |

---

## 5. ARQUITETURA DE DADOS

### 5.1 Database-per-Service com Criptografia

| Servico | Database | Colunas com Criptografia de Coluna | Tamanho Estimado (Ano 1) |
|---------|----------|-------------------------------------|--------------------------|
| auth-service | auth_db | password_hash (bcrypt), totp_secret (AES-256-GCM) | 500 MB |
| consent-service | consent_db | access_token_enc (RSA-4096), refresh_token_enc (RSA-4096) | 1 GB |
| connector-service | connector_db | raw_response_enc (AES-256, TTL 24h) | 2 GB |
| account-service | account_db | account_number_enc (AES-256) | 2 GB |
| transaction-service | transaction_db | description_original (AES-256) | 50 GB |
| categorization-service | categorization_db | (nenhuma — opera com IDs de categoria) | 5 GB |
| analytics-service | analytics_db | (nenhuma — dados pre-agregados) | 10 GB |
| projection-service | projection_db | (nenhuma — dados estatisticos) | 5 GB |
| budget-service | budget_db | (nenhuma) | 1 GB |
| notification-service | notification_db | (nenhuma — referencia somente user_id) | 2 GB |
| privacy-service | privacy_db | (nenhuma — somente metadata) | 500 MB |
| audit-service | audit_db | (append-only, hash-chained, imutavel) | 100 GB (5 anos) |

### 5.2 Backup e Retencao

| Tipo | Estrategia | Retencao | Criptografia |
|------|-----------|----------|-------------|
| Hot Backup | RDS automated snapshots, diarios | 30 dias, point-in-time recovery ate 1 hora (RPO) | KMS CMK |
| Cold Backup | Snapshots mensais → S3 Glacier Deep Archive | 5 anos | S3 SSE-KMS |
| Audit Logs | Append-only PostgreSQL → S3 Parquet apos 90 dias | 5 anos total | KMS CMK |
| Transacoes | Particionadas por mes, aged partitions → read-only tablespace | 5 anos (obrigacao legal) | AES-256 |
| RTO | Multi-AZ RDS failover automatico (minutos) | Restore completo < 4 horas | — |

### 5.3 Redis

- **Tecnologia:** ElastiCache Redis 7+, cluster mode enabled, 3 shards, 2 replicas cada
- **Criptografia:** In-transit (TLS) + at-rest (KMS)
- **Subnet:** Data subnet isolada
- **Usos:**
  - Cache de sessao (TTL 15 min)
  - Contadores de rate limiting (sliding window)
  - Cache de dados do dashboard (TTL 5 min)
  - Locks de deduplicacao para sync jobs
- **Regra critica:** **NENHUM PII no Redis** — somente IDs, contadores e dados agregados nao-sensiveis

---

## 6. COMPLIANCE LGPD

### 6.1 Consentimento (Dois Tipos)

**Tipo A — Consentimento da Plataforma (LGPD Art. 7):**
- Coletado no cadastro
- Toggles granulares: processamento de dados, analytics, treinamento ML, comunicacoes por email
- Armazenado com: timestamp, IP, user-agent, versao do termo
- Re-consentimento obrigatorio quando termos mudam

**Tipo B — Consentimento Open Finance (Regulacao Banco Central):**
- Validade maxima: 90 dias (RN-002)
- Gerenciado via fluxo de redirect Pluggy Connect
- Scopes: somente leitura (ACCOUNTS_READ, TRANSACTIONS_READ, IDENTITY_READ)
- Alerta 7 dias antes da expiracao
- Audit trail completo de grant/revoke/renew

### 6.2 Direito a Exclusao — Cascading Delete (Saga Pattern)

```
1. Usuario solicita exclusao via dashboard de privacidade
2. Re-autenticacao obrigatoria (seguranca contra exclusao acidental)
3. privacy-service publica evento `deletion.requested` com user_id e request_id
4. CADA servico consome o evento e executa exclusao:
   a. auth-service: deleta usuario, invalida todas as sessoes
   b. consent-service: revoga consentimentos via Pluggy API, deleta registros
   c. institution-connector-service: deleta sync jobs, dispara exclusao de items Pluggy
   d. account-service: deleta todas as contas do usuario
   e. transaction-service: deleta todas as transacoes do usuario
   f. categorization-service: deleta regras e correcoes do usuario
   g. analytics-service: deleta agregacoes do usuario
   h. projection-service: deleta projecoes e cenarios
   i. budget-service: deleta metas
   j. notification-service: deleta preferencias e historico de entrega
5. Cada servico publica `deletion.completed.{service_name}`
6. privacy-service rastreia conclusao de todos os servicos (saga coordinator)
7. Quando TODOS confirmam → exclusao marcada como completa
8. audit-service retem registro ANONIMIZADO (5 anos): request_id, timestamp, status — SEM PII
9. Fallback: retry com exponential backoff, alerta para equipe de ops apos 3 falhas
10. SLA: exclusao completa em 72 horas
```

### 6.3 Portabilidade de Dados

1. Usuario solicita exportacao via dashboard de privacidade
2. privacy-service orquestra coleta de dados de cada servico
3. Cada servico produz documento JSON com os dados do usuario
4. privacy-service empacota em ZIP criptografado
5. Link de download enviado por email (signed URL, expiracao 24h)
6. Formatos: JSON (machine-readable) + CSV (human-readable)

### 6.4 Pipeline de Anonimizacao para ML (RN-007)

```
transaction-service (fonte)
  ↓
anonymization-job (batch agendado, K8s Job isolado):
  1. Consulta transacoes do periodo de treinamento
  2. Remove: user_id, account_id, institution_id
  3. Remove: nomes, CPFs das descricoes (NER-based PII detection)
  4. Arredonda valores monetarios para multiplos de R$10
  5. Substitui datas por offsets relativos (dia-da-semana, dia-do-mes)
  6. Gera IDs sinteticos (sem link de volta aos originais)
  7. Escreve dataset anonimizado em bucket S3 separado (KMS key separada)
  8. Loga execucao no audit-service
  ↓
categorization-service ML training (le SOMENTE do bucket S3 anonimizado)
```

**Isolamento critico:** O ambiente de treinamento ML **NAO tem acesso** a databases de producao. Enforced via IAM policies + network isolation (namespace K8s separado, sem acesso a subnets de dados).

### 6.5 Breach Notification

1. **Deteccao automatica:** Anomaly detection nos audit logs (padroes incomuns de acesso a dados, leituras em massa)
2. **Reporte manual:** Equipe de seguranca pode acionar workflow
3. **Na deteccao:** privacy-service cria breach record, notifica DPO imediatamente
4. **Relogio de 72 horas inicia** — sistema auto-envia notificacoes para usuarios afetados e ANPD se DPO aprovar dentro do prazo
5. Templates de comunicacao pre-aprovados pelo juridico

---

## 7. PADROES DE COMUNICACAO

### 7.1 Sincrono (REST / gRPC)

Usado para fluxos request/response orientados ao usuario, onde latencia importa:

| Chamador | Chamado | Protocolo | Caso de Uso |
|----------|---------|-----------|-------------|
| Client | API Gateway | REST/HTTPS | Todas as interacoes do usuario |
| API Gateway | auth-service | REST | Login, refresh de token |
| API Gateway | account-service | REST | Dados do dashboard |
| API Gateway | transaction-service | REST | Lista/busca de transacoes |
| API Gateway | analytics-service | REST | Graficos, resumos |
| API Gateway | privacy-service | REST | Dashboard de privacidade, solicitacao de exclusao |
| analytics-service | transaction-service | gRPC | Queries de agregacao (alto throughput) |
| projection-service | transaction-service | gRPC | Fetch de dados historicos |
| categorization-service | ML inference | gRPC | Predicao de modelo (baixa latencia) |

### 7.2 Assincrono (Event-Driven via RabbitMQ)

Usado para workflows desacoplados, processamento em background e propagacao de dados entre servicos:

| Evento | Publisher | Consumers | Tipo de Exchange |
|--------|-----------|-----------|------------------|
| `user.created` | auth | consent, notification | Topic |
| `deletion.requested` | privacy | TODOS os servicos | Fanout |
| `consent.granted` | consent | connector | Direct |
| `consent.revoked` | consent | connector, account | Topic |
| `consent.expiring` | consent | notification | Direct |
| `sync.triggered` | scheduler (cron) | connector | Direct |
| `sync.completed` | connector | account, transaction | Topic |
| `transactions.new` | transaction | categorization | Direct |
| `transaction.categorized` | categorization | analytics, budget | Topic |
| `alert.budget_threshold` | budget | notification | Direct |
| `alert.anomaly` | analytics | notification | Direct |
| `audit.event` | TODOS | audit | Exchange dedicado (duravel) |

**Garantias de mensagem:**
- Eventos de auditoria: **at-least-once** com consumidores idempotentes (critico para compliance)
- Eventos de sync: **at-least-once** com deduplicacao no consumidor
- Eventos de notificacao: **at-most-once** aceitavel (usuario pode re-acionar)

### 7.3 Jobs Agendados

| Job | Frequencia | Servico | Janela |
|-----|-----------|---------|--------|
| Auto-sync de instituicoes | A cada 6 horas | connector | — |
| Check de expiracao de consentimento | Diario | consent | 09:00 BRT |
| Pre-computacao de analytics | Diario | analytics | 02:00 BRT |
| Retraining do modelo ML | Semanal | categorization | Dom 03:00 BRT |
| Pipeline de anonimizacao | Semanal | privacy | Dom 01:00 BRT |
| Archival de audit logs | Diario | audit | 04:00 BRT |
| Verificacao de backups | Diario | ops automation | 05:00 BRT |

---

## 8. OBSERVABILIDADE

### 8.1 Logging
- **Formato:** JSON estruturado — cada linha contem: timestamp (UTC), service_name, trace_id, span_id, user_id (UUID pseudonimizado), level, message, metadata
- **Regra de PII:** **NENHUM PII nos logs.** Nomes, emails, dados financeiros NUNCA logados. Respostas do Pluggy logadas somente como status codes.
- **Pipeline:** Aplicacao → stdout → FluentBit (DaemonSet) → Amazon OpenSearch/DataDog Logs → S3 archive (90 dias hot, 5 anos cold)
- **Niveis:** ERROR (aciona on-call), WARN (dashboards), INFO (operacional), DEBUG (dev/staging apenas)

### 8.2 Metricas e Alertas
- **Infraestrutura (CloudWatch + DataDog):** CPU, memoria, disco, rede por node/pod; RDS connections, replication lag; Redis hit ratio, evictions
- **Aplicacao (DataDog APM):** Request rate, error rate, latencia p50/p95/p99 por servico e endpoint
- **Negocio:** Usuarios ativos, instituicoes conectadas, transacoes processadas, consentimentos expirando

**Thresholds de alerta:**

| Condicao | Severidade | Acao |
|----------|-----------|------|
| Error rate > 1% por 5 min | WARN | Dashboard |
| Error rate > 5% por 2 min | PAGE | Aciona on-call |
| p99 latencia > 5s (dashboard) | WARN | Dashboard |
| Pluggy API error > 10% | PAGE | Aciona on-call |
| Qualquer 5xx no auth-service | PAGE | Imediato |
| Queue depth > 10.000 msgs | WARN | Dashboard |
| DB connection pool > 80% | WARN | Dashboard |
| Disco > 85% | WARN | Dashboard |
| Disco > 95% | PAGE | Aciona on-call |

### 8.3 Distributed Tracing
- OpenTelemetry SDK em todo servico (Go e Python)
- Contexto propagado via header `traceparent` (W3C Trace Context)
- Backend: DataDog APM
- Sampling: 100% para erros, 10% para requisicoes normais
- Caminhos criticos (login, sync, dashboard load): sempre 100% sampling

### 8.4 Security Monitoring
- AWS GuardDuty para deteccao de ameacas a nivel de conta
- CloudTrail para todas as chamadas de API AWS
- VPC Flow Logs analisados para anomalias
- WAF logs para tracking de padroes de ataque
- Correlacao de falhas de autenticacao por faixa de IP (deteccao de credential stuffing)
- Anomaly detection nos audit logs: alertas para padroes de acesso massivo a dados

---

## 9. CI/CD PIPELINE

```
Developer push → GitHub
  ↓
GitHub Actions Workflow:
  1. Lint (golangci-lint, eslint)
  2. Unit tests (min 80% coverage — gate obrigatorio)
  3. SAST scan (Semgrep, gosec)
  4. Dependency vulnerability scan (Trivy, Snyk)
  5. Build container image
  6. Container image scan (Trivy)
  7. Assinatura de imagem (cosign/Sigstore)
  8. Push para ECR
  9. Integration tests em ambiente efemero
  10. Deploy para staging (ArgoCD GitOps)
  11. Smoke tests + security regression suite
  12. Aprovacao manual para producao
  13. Deploy para producao (ArgoCD, canary com Istio traffic splitting)
  14. Verificacao pos-deploy (synthetic monitoring)
```

**Gates que bloqueiam deploy:**
- SAST findings severidade HIGH ou CRITICAL
- CVEs conhecidas em dependencias (CRITICAL)
- Vulnerabilidades em imagem de container (CRITICAL)
- Cobertura de testes abaixo de 80%
- Testes de integracao falhando
- Imagem de container nao assinada

---

## 10. EVOLUCAO DO CODEBASE ATUAL

O modulo `PluggySDKGo/GET_ApiKey.go` existente se torna a fundacao do `institution-connector-service`. Estrutura alvo:

```
/institution-connector-service/
  /cmd/connector-service/main.go           — entrypoint do servico
  /internal/pluggy/client.go               — evolucao do GET_ApiKey.go
  /internal/pluggy/readonly_transport.go   — HTTP transport com allowlist (SEGURANCA CRITICA)
  /internal/pluggy/endpoints.go            — constantes de endpoints permitidos
  /internal/sync/worker.go                 — orquestracao de sync jobs
  /internal/api/handlers.go                — HTTP handlers
  /pkg/crypto/tokens.go                    — criptografia RSA-4096 de tokens bancarios
```

**Mudancas necessarias na migracao:**
1. Reestruturar Go module de layout flat para layout padrao Go
2. Substituir `.env` / `godotenv` por AWS Secrets Manager (manter `.env` somente para dev local)
3. Adicionar o read-only HTTP transport wrapper ao redor do `http.Client` existente em `fetchNewApiKey`
4. Implementar criptografia RSA-4096 para tokens antes do armazenamento

---

## HISTORICO DE REVISOES

| Versao | Data | Autor | Descricao |
|--------|------|-------|-----------|
| 1.0.0 | 09/04/2026 | Leonardo Brandao Maia Filho | Versao inicial do documento de arquitetura |

---

**Fim do Documento**

*Este documento deve ser revisado e aprovado por:*
- *Arquiteto de Software*
- *Representante de Seguranca da Informacao*
- *DPO (Oficial de Protecao de Dados)*
- *Product Owner*
