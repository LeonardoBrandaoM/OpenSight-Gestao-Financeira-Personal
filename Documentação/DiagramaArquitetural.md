# Diagramas Arquiteturais - OpenSight

**Referencia:** Documento de Arquitetura OpenSight v1.0.0  
**Data:** 09/04/2026

> Todos os diagramas utilizam a sintaxe [Mermaid](https://mermaid.js.org/). Para visualizar, utilize editores com suporte a Mermaid (VS Code com extensao, GitHub, GitLab, ou https://mermaid.live).

---

## 1. Visao Geral da Arquitetura em Camadas

```mermaid
graph TB
    subgraph "CAMADA 1 - CLIENT"
        CLIENT["React SPA/PWA<br/>(TypeScript)"]
        MOBILE["Mobile Futuro<br/>(React Native)"]
    end

    subgraph "CAMADA 2 - EDGE / PERIMETRO"
        CF["CloudFlare<br/>WAF + DDoS Protection<br/>TLS 1.3 Termination<br/>Geo-Restrict Brasil"]
    end

    subgraph "CAMADA 3 - API GATEWAY"
        KONG["Kong Gateway<br/>JWT Validation<br/>Rate Limiting<br/>Schema Validation<br/>mTLS Backend"]
    end

    subgraph "CAMADA 4 - SERVICE MESH (EKS + Istio)"
        direction TB
        subgraph "Servicos de Autenticacao"
            AUTH["auth-service<br/>(Go)"]
            CONSENT["consent-service<br/>(Go)"]
        end
        subgraph "Servicos Core"
            CONNECTOR["institution-connector<br/>(Go) - CRITICO"]
            ACCOUNT["account-service<br/>(Go)"]
            TRANSACTION["transaction-service<br/>(Go)"]
            CATEGORIZATION["categorization-service<br/>(Python + Go)"]
        end
        subgraph "Servicos de Inteligencia"
            ANALYTICS["analytics-service<br/>(Go)"]
            PROJECTION["projection-service<br/>(Go + Python)"]
            BUDGET["budget-service<br/>(Go)"]
        end
        subgraph "Servicos de Suporte"
            NOTIFICATION["notification-service<br/>(Go)"]
            PRIVACY["privacy-service<br/>(Go) - LGPD"]
            AUDIT["audit-service<br/>(Go)"]
        end
    end

    subgraph "CAMADA 5 - DATA LAYER"
        PG[("PostgreSQL 14+<br/>12 databases<br/>AES-256 at-rest")]
        REDIS[("Redis 7+<br/>Cluster Mode<br/>TLS + KMS")]
        RABBIT["RabbitMQ<br/>(Amazon MQ)"]
    end

    subgraph "CAMADA 6 - INFRAESTRUTURA AWS sa-east-1"
        KMS["AWS KMS"]
        HSM["AWS CloudHSM<br/>RSA-4096 Keys"]
        SECRETS["AWS Secrets Manager"]
        S3["S3<br/>Backups + ML Models<br/>Audit Cold Storage"]
        ECR["ECR<br/>Container Registry"]
    end

    subgraph "EXTERNO"
        PLUGGY["Pluggy API<br/>api.pluggy.ai<br/>(Open Finance)"]
        GOOGLE["Google Identity"]
        APPLE["Apple Sign-In"]
        SES["AWS SES<br/>(Email)"]
        FCM["Firebase FCM<br/>(Push)"]
    end

    CLIENT -->|HTTPS| CF
    MOBILE -->|HTTPS| CF
    CF -->|TLS| KONG
    KONG -->|mTLS| AUTH
    KONG -->|mTLS| ACCOUNT
    KONG -->|mTLS| TRANSACTION
    KONG -->|mTLS| ANALYTICS
    KONG -->|mTLS| PRIVACY

    CONNECTOR -->|"HTTPS (READ-ONLY)<br/>Egress Gateway"| PLUGGY
    AUTH -->|OAuth 2.0 + PKCE| GOOGLE
    AUTH -->|OAuth 2.0 + PKCE| APPLE
    NOTIFICATION --> SES
    NOTIFICATION --> FCM

    AUTH --> PG
    CONSENT --> PG
    CONNECTOR --> PG
    ACCOUNT --> PG
    TRANSACTION --> PG
    CATEGORIZATION --> PG
    ANALYTICS --> PG
    PROJECTION --> PG
    BUDGET --> PG
    NOTIFICATION --> PG
    PRIVACY --> PG
    AUDIT --> PG

    AUTH --> REDIS
    KONG --> REDIS

    CONNECTOR --> RABBIT
    TRANSACTION --> RABBIT
    CATEGORIZATION --> RABBIT
    PRIVACY --> RABBIT
    AUDIT --> RABBIT

    CONNECTOR --> HSM
    CONSENT --> HSM
    AUTH --> KMS
    CATEGORIZATION --> S3

    style CONNECTOR fill:#ff6b6b,stroke:#c0392b,color:#fff
    style PRIVACY fill:#3498db,stroke:#2980b9,color:#fff
    style AUDIT fill:#2ecc71,stroke:#27ae60,color:#fff
    style HSM fill:#e74c3c,stroke:#c0392b,color:#fff
    style CF fill:#f39c12,stroke:#e67e22,color:#fff
    style PLUGGY fill:#9b59b6,stroke:#8e44ad,color:#fff
```

---

## 2. Fluxo de Autenticacao

```mermaid
sequenceDiagram
    participant U as Usuario
    participant C as Client (React)
    participant CF as CloudFlare WAF
    participant GW as Kong Gateway
    participant AS as auth-service
    participant DB as auth_db (PostgreSQL)
    participant KMS as AWS KMS
    participant R as Redis

    U->>C: Email + Senha
    C->>CF: POST /api/v1/auth/login (HTTPS)
    CF->>CF: WAF Check + Bot Detection
    CF->>GW: Forward (TLS)
    GW->>R: Check Rate Limit (10/hora/usuario)
    
    alt Rate Limit Excedido
        GW-->>C: 429 Too Many Requests
    end
    
    GW->>AS: Forward (mTLS)
    AS->>DB: Buscar usuario por email
    AS->>AS: Verificar bcrypt hash (cost 12)
    
    alt Senha Incorreta
        AS->>DB: Incrementar login_attempts
        alt 5+ tentativas falhas
            AS->>DB: Bloquear conta (lockout)
            AS-->>C: 423 Account Locked
        else < 5 tentativas
            AS-->>C: 401 Unauthorized
        end
    end

    AS-->>C: 200 + 2FA Challenge Token (5 min TTL)
    
    U->>C: Codigo TOTP (Google Authenticator)
    C->>GW: POST /api/v1/auth/verify-2fa
    GW->>AS: Forward (mTLS)
    AS->>DB: Verificar TOTP secret (descriptografar AES-256-GCM)
    AS->>AS: Validar codigo TOTP
    
    alt TOTP Invalido
        AS->>DB: Incrementar 2fa_attempts
        alt 5+ tentativas falhas
            AS->>DB: Bloquear conta
            AS-->>C: 423 Account Locked
        else < 5 tentativas
            AS-->>C: 401 Invalid 2FA Code
        end
    end

    AS->>KMS: Assinar JWT (RS256)
    KMS-->>AS: JWT assinado
    AS->>DB: Armazenar refresh token (hashed)
    AS->>R: Cachear sessao (15 min TTL)
    AS-->>C: 200 + JWT Access Token (15 min) + Refresh Token (30 dias)
    
    Note over C: JWT armazenado em memoria<br/>Refresh em httpOnly cookie
```

---

## 3. Enforcement Read-Only (5 Camadas)

```mermaid
graph TB
    subgraph "CAMADA 1 - CODIGO (Compile-Time)"
        CODE["Allowlist de Endpoints<br/>POST: /auth (somente)<br/>GET: /accounts, /transactions, ...<br/>PUT/PATCH/DELETE: VAZIO"]
        TRANSPORT["HTTP Transport Wrapper<br/>Intercepta TODA requisicao<br/>Rejeita fora da allowlist<br/>Unit + Fuzz Tested"]
        CODE --> TRANSPORT
    end

    subgraph "CAMADA 2 - REDE (Runtime)"
        NP["K8s NetworkPolicy<br/>Namespace opensight-connector<br/>Egress SOMENTE api.pluggy.ai:443"]
        ISTIO["Istio Egress Gateway<br/>Loga todas as requisicoes<br/>URL + Metodo + Headers"]
        NP --> ISTIO
    end

    subgraph "CAMADA 3 - PLATAFORMA PLUGGY"
        PLUGGY_CONFIG["Conta Pluggy<br/>Permissoes Read-Only<br/>Controle Administrativo"]
    end

    subgraph "CAMADA 4 - OAUTH SCOPES"
        SCOPES["Scopes Constantes no Codigo<br/>ACCOUNTS_READ<br/>TRANSACTIONS_READ<br/>IDENTITY_READ<br/>(Nunca write scopes)"]
    end

    subgraph "CAMADA 5 - AUDITORIA"
        AUDIT_LOG["Audit Service<br/>Log de TODAS as requisicoes HTTP<br/>Metodo + URL + Status Code"]
        PENTEST["Pentests Trimestrais<br/>Tentam disparar write ops"]
        CI_TEST["Testes de Integracao no CI<br/>Verificam rejeicao de<br/>PUT/PATCH/DELETE"]
        AUDIT_LOG --> PENTEST
        AUDIT_LOG --> CI_TEST
    end

    REQ["Requisicao para<br/>api.pluggy.ai"] --> CODE
    TRANSPORT -->|Passou Camada 1| NP
    ISTIO -->|Passou Camada 2| PLUGGY_CONFIG
    PLUGGY_CONFIG -->|Passou Camada 3| SCOPES
    SCOPES -->|Passou Camada 4| AUDIT_LOG

    BLOCK1["BLOQUEADO"]
    BLOCK2["BLOQUEADO"]
    BLOCK3["BLOQUEADO"]
    BLOCK4["BLOQUEADO"]

    TRANSPORT -.->|"PUT/PATCH/DELETE"| BLOCK1
    NP -.->|"Host != api.pluggy.ai"| BLOCK2
    PLUGGY_CONFIG -.->|"Write operation"| BLOCK3
    SCOPES -.->|"Write scope"| BLOCK4

    style BLOCK1 fill:#e74c3c,stroke:#c0392b,color:#fff
    style BLOCK2 fill:#e74c3c,stroke:#c0392b,color:#fff
    style BLOCK3 fill:#e74c3c,stroke:#c0392b,color:#fff
    style BLOCK4 fill:#e74c3c,stroke:#c0392b,color:#fff
    style CODE fill:#2ecc71,stroke:#27ae60,color:#fff
    style NP fill:#2ecc71,stroke:#27ae60,color:#fff
    style PLUGGY_CONFIG fill:#2ecc71,stroke:#27ae60,color:#fff
    style SCOPES fill:#2ecc71,stroke:#27ae60,color:#fff
    style AUDIT_LOG fill:#3498db,stroke:#2980b9,color:#fff
```

---

## 4. Fluxo de Sincronizacao de Dados Bancarios

```mermaid
sequenceDiagram
    participant CRON as Scheduler (6h)
    participant RMQ as RabbitMQ
    participant CONN as institution-connector
    participant HSM as CloudHSM
    participant PLUGGY as Pluggy API
    participant ACCT as account-service
    participant TXN as transaction-service
    participant CAT as categorization-service
    participant ANA as analytics-service
    participant BUD as budget-service
    participant AUD as audit-service

    CRON->>RMQ: sync.triggered (user_id, institution_id)
    RMQ->>CONN: Consume message
    
    CONN->>CONN: Verificar cache de API Key (28 min TTL)
    
    alt API Key expirada
        CONN->>PLUGGY: POST /auth (client_id, client_secret)
        PLUGGY-->>CONN: API Key (30 min validade)
        CONN->>CONN: Cachear API Key
    end

    CONN->>HSM: Descriptografar access_token do usuario
    HSM-->>CONN: access_token em plaintext (somente em memoria)
    
    CONN->>PLUGGY: GET /accounts (Bearer token)
    Note over CONN,PLUGGY: Read-Only Transport Wrapper<br/>valida endpoint na allowlist
    PLUGGY-->>CONN: Dados de contas (JSON)
    
    CONN->>PLUGGY: GET /transactions (Bearer token)
    PLUGGY-->>CONN: Dados de transacoes (JSON)
    
    CONN->>AUD: audit.event (sync started, endpoints called)
    
    CONN->>RMQ: sync.completed (accounts_data, transactions_data)
    
    par Processamento Paralelo
        RMQ->>ACCT: Consume sync.completed
        ACCT->>ACCT: Normalizar + atualizar saldos
        ACCT->>ACCT: Criptografar account_number (AES-256)
    and
        RMQ->>TXN: Consume sync.completed
        TXN->>TXN: Normalizar + deduplicar (hash)
        TXN->>TXN: Detectar transferencias entre contas (RN-005)
        TXN->>RMQ: transactions.new
    end
    
    RMQ->>CAT: Consume transactions.new
    CAT->>CAT: ML inference (gRPC) - categorizar
    CAT->>RMQ: transaction.categorized
    
    par Pos-Categorizacao
        RMQ->>ANA: Consume transaction.categorized
        ANA->>ANA: Atualizar agregacoes + detectar anomalias (RN-006)
    and
        RMQ->>BUD: Consume transaction.categorized
        BUD->>BUD: Verificar metas (50%/80%/100%)
    end
```

---

## 5. LGPD - Cascading Delete (Direito a Exclusao)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant C as Client
    participant PRIV as privacy-service
    participant AUTH as auth-service
    participant RMQ as RabbitMQ
    participant CON as consent-service
    participant CONN as connector-service
    participant ACCT as account-service
    participant TXN as transaction-service
    participant CAT as categorization-service
    participant ANA as analytics-service
    participant PROJ as projection-service
    participant BUD as budget-service
    participant NOTIF as notification-service
    participant AUD as audit-service

    U->>C: Solicitar exclusao de conta
    C->>PRIV: DELETE /api/v1/privacy/account
    PRIV->>AUTH: Verificar re-autenticacao
    AUTH-->>PRIV: Identidade confirmada
    
    PRIV->>PRIV: Criar deletion_request (ID, timestamp)
    PRIV->>RMQ: deletion.requested (fanout exchange)
    
    par Exclusao em Paralelo (Saga)
        RMQ->>AUTH: Consume deletion.requested
        AUTH->>AUTH: Deletar usuario + invalidar sessoes
        AUTH->>RMQ: deletion.completed.auth
    and
        RMQ->>CON: Consume deletion.requested
        CON->>CON: Revogar consentimentos via Pluggy
        CON->>RMQ: deletion.completed.consent
    and
        RMQ->>CONN: Consume deletion.requested
        CONN->>CONN: Deletar sync jobs + items
        CONN->>RMQ: deletion.completed.connector
    and
        RMQ->>ACCT: Consume deletion.requested
        ACCT->>ACCT: Deletar contas do usuario
        ACCT->>RMQ: deletion.completed.account
    and
        RMQ->>TXN: Consume deletion.requested
        TXN->>TXN: Deletar transacoes do usuario
        TXN->>RMQ: deletion.completed.transaction
    and
        RMQ->>CAT: Consume deletion.requested
        CAT->>CAT: Deletar regras + correcoes
        CAT->>RMQ: deletion.completed.categorization
    and
        RMQ->>ANA: Consume deletion.requested
        ANA->>ANA: Deletar agregacoes
        ANA->>RMQ: deletion.completed.analytics
    and
        RMQ->>PROJ: Consume deletion.requested
        PROJ->>PROJ: Deletar projecoes + cenarios
        PROJ->>RMQ: deletion.completed.projection
    and
        RMQ->>BUD: Consume deletion.requested
        BUD->>BUD: Deletar metas
        BUD->>RMQ: deletion.completed.budget
    and
        RMQ->>NOTIF: Consume deletion.requested
        NOTIF->>NOTIF: Deletar preferencias + historico
        NOTIF->>RMQ: deletion.completed.notification
    end

    loop Rastrear conclusao
        PRIV->>RMQ: Consume deletion.completed.*
        PRIV->>PRIV: Marcar servico como completo
    end

    PRIV->>PRIV: Todos confirmados -> exclusao completa
    PRIV->>AUD: audit.event (exclusao anonimizada: request_id, timestamp, SEM PII)
    PRIV-->>C: 200 OK - Conta excluida
    
    Note over AUD: Registro anonimizado<br/>retido por 5 anos
```

---

## 6. Topologia de Rede (VPC)

```mermaid
graph TB
    subgraph "INTERNET"
        USERS["Usuarios"]
        PLUGGY_EXT["Pluggy API<br/>api.pluggy.ai"]
    end

    subgraph "CloudFlare"
        WAF["WAF + DDoS<br/>Geo-Restrict Brasil<br/>TLS 1.3 Termination"]
    end

    subgraph "AWS VPC 10.0.0.0/16 - sa-east-1"
        subgraph "Public Subnets (10.0.1-3.0/24) - 3 AZs"
            NLB["Network Load<br/>Balancer"]
            NAT1["NAT Gateway<br/>AZ-1"]
            NAT2["NAT Gateway<br/>AZ-2"]
            NAT3["NAT Gateway<br/>AZ-3"]
        end

        subgraph "Private Subnets (10.0.10-30.0/24) - 3 AZs"
            subgraph "EKS Cluster"
                INGRESS["NGINX Ingress<br/>Controller"]
                ISTIO_CP["Istio Control<br/>Plane"]
                
                subgraph "System Pool (3x m6i.large)"
                    MONITORING["DataDog Agent<br/>Prometheus<br/>Grafana"]
                end
                
                subgraph "App Pool (3-12x m6i.xlarge, Auto-Scale)"
                    SERVICES["12 Microservicos<br/>(mTLS entre todos)"]
                end
                
                subgraph "ML Pool (1-3x m6i.2xlarge)"
                    ML["Categorization<br/>Projection<br/>ML Inference"]
                end
            end
        end

        subgraph "Data Subnets (10.0.100-201.0/24) - 3 AZs"
            RDS[("RDS PostgreSQL<br/>Multi-AZ<br/>12 databases<br/>AES-256 TDE")]
            ELASTICACHE[("ElastiCache Redis<br/>3 shards x 2 replicas<br/>TLS + KMS")]
            AMQ["Amazon MQ<br/>(RabbitMQ)<br/>Cluster"]
        end

        subgraph "Security Services"
            KMS["AWS KMS<br/>CMK Keys"]
            CLOUDHSM["CloudHSM Cluster<br/>2 HSMs (HA)<br/>RSA-4096 Keys"]
            SECRETS["Secrets Manager<br/>Auto-Rotation"]
        end

        subgraph "Storage & Logs"
            S3_BACKUP["S3<br/>Backups<br/>SSE-KMS"]
            S3_AUDIT["S3<br/>Audit Cold<br/>5 anos"]
            S3_ML["S3<br/>ML Models +<br/>Anonymous Data"]
            CW["CloudWatch<br/>VPC Flow Logs"]
        end
    end

    USERS -->|HTTPS| WAF
    WAF -->|TLS| NLB
    NLB --> INGRESS
    INGRESS --> ISTIO_CP
    ISTIO_CP --> SERVICES
    ISTIO_CP --> ML

    SERVICES -->|mTLS| RDS
    SERVICES -->|TLS| ELASTICACHE
    SERVICES -->|TLS| AMQ
    SERVICES --> KMS
    SERVICES --> CLOUDHSM
    SERVICES --> SECRETS

    SERVICES -->|"Egress (connector only)<br/>via NAT Gateway"| NAT1
    NAT1 -->|HTTPS READ-ONLY| PLUGGY_EXT

    SERVICES --> S3_BACKUP
    SERVICES --> S3_AUDIT
    ML --> S3_ML

    style CLOUDHSM fill:#e74c3c,stroke:#c0392b,color:#fff
    style WAF fill:#f39c12,stroke:#e67e22,color:#fff
    style RDS fill:#3498db,stroke:#2980b9,color:#fff
    style SERVICES fill:#2ecc71,stroke:#27ae60,color:#fff
    style PLUGGY_EXT fill:#9b59b6,stroke:#8e44ad,color:#fff
```

---

## 7. Pipeline CI/CD

```mermaid
graph LR
    subgraph "Desenvolvimento"
        DEV["Developer<br/>Push"]
    end

    subgraph "GitHub Actions - Build & Test"
        LINT["Lint<br/>golangci-lint<br/>eslint"]
        TEST["Unit Tests<br/>min 80%<br/>coverage"]
        SAST["SAST Scan<br/>Semgrep<br/>gosec"]
        DEP["Dependency<br/>Scan<br/>Trivy + Snyk"]
    end

    subgraph "GitHub Actions - Container"
        BUILD["Build<br/>Container<br/>Image"]
        SCAN["Image Scan<br/>Trivy"]
        SIGN["Sign Image<br/>cosign/Sigstore"]
        PUSH["Push to<br/>ECR"]
    end

    subgraph "Staging"
        INT_TEST["Integration<br/>Tests"]
        ARGOCD_S["ArgoCD<br/>Deploy Staging"]
        SMOKE["Smoke Tests +<br/>Security Regression"]
    end

    subgraph "Producao"
        APPROVE["Aprovacao<br/>Manual"]
        ARGOCD_P["ArgoCD<br/>Canary Deploy"]
        VERIFY["Post-Deploy<br/>Verification"]
    end

    DEV --> LINT
    LINT --> TEST
    TEST --> SAST
    SAST --> DEP
    DEP --> BUILD
    BUILD --> SCAN
    SCAN --> SIGN
    SIGN --> PUSH
    PUSH --> INT_TEST
    INT_TEST --> ARGOCD_S
    ARGOCD_S --> SMOKE
    SMOKE --> APPROVE
    APPROVE --> ARGOCD_P
    ARGOCD_P --> VERIFY

    LINT -.->|FAIL| BLOCK_L["BLOCKED"]
    TEST -.->|"< 80%"| BLOCK_T["BLOCKED"]
    SAST -.->|HIGH/CRIT| BLOCK_S["BLOCKED"]
    DEP -.->|CRIT CVE| BLOCK_D["BLOCKED"]
    SCAN -.->|CRIT vuln| BLOCK_I["BLOCKED"]

    style BLOCK_L fill:#e74c3c,color:#fff
    style BLOCK_T fill:#e74c3c,color:#fff
    style BLOCK_S fill:#e74c3c,color:#fff
    style BLOCK_D fill:#e74c3c,color:#fff
    style BLOCK_I fill:#e74c3c,color:#fff
    style APPROVE fill:#f39c12,stroke:#e67e22,color:#fff
    style VERIFY fill:#2ecc71,stroke:#27ae60,color:#fff
```

---

## 8. Fluxo de Eventos (Mensageria Assincrona)

```mermaid
graph LR
    subgraph "Publishers"
        AUTH_P["auth-service"]
        CONSENT_P["consent-service"]
        CONN_P["connector-service"]
        TXN_P["transaction-service"]
        CAT_P["categorization-service"]
        BUD_P["budget-service"]
        ANA_P["analytics-service"]
        PRIV_P["privacy-service"]
        SCHED["Scheduler (cron)"]
    end

    subgraph "RabbitMQ Exchanges"
        EX_USER["user<br/>(topic)"]
        EX_CONSENT["consent<br/>(topic)"]
        EX_SYNC["sync<br/>(topic)"]
        EX_TXN["transactions<br/>(direct)"]
        EX_CAT["categorized<br/>(topic)"]
        EX_ALERT["alerts<br/>(direct)"]
        EX_DELETE["deletion<br/>(fanout)"]
        EX_AUDIT["audit<br/>(dedicated)"]
    end

    subgraph "Consumers"
        AUTH_C["auth-service"]
        CONSENT_C["consent-service"]
        CONN_C["connector-service"]
        ACCT_C["account-service"]
        TXN_C["transaction-service"]
        CAT_C["categorization-service"]
        ANA_C["analytics-service"]
        BUD_C["budget-service"]
        NOTIF_C["notification-service"]
        PRIV_C["privacy-service"]
        AUD_C["audit-service"]
    end

    AUTH_P -->|user.created| EX_USER
    EX_USER --> CONSENT_C
    EX_USER --> NOTIF_C

    CONSENT_P -->|consent.granted/revoked| EX_CONSENT
    CONSENT_P -->|consent.expiring| EX_CONSENT
    EX_CONSENT --> CONN_C
    EX_CONSENT --> ACCT_C
    EX_CONSENT --> NOTIF_C

    SCHED -->|sync.triggered| EX_SYNC
    CONN_P -->|sync.completed| EX_SYNC
    EX_SYNC --> CONN_C
    EX_SYNC --> ACCT_C
    EX_SYNC --> TXN_C

    TXN_P -->|transactions.new| EX_TXN
    EX_TXN --> CAT_C

    CAT_P -->|transaction.categorized| EX_CAT
    EX_CAT --> ANA_C
    EX_CAT --> BUD_C

    BUD_P -->|alert.budget| EX_ALERT
    ANA_P -->|alert.anomaly| EX_ALERT
    EX_ALERT --> NOTIF_C

    PRIV_P -->|deletion.requested| EX_DELETE
    EX_DELETE --> AUTH_C
    EX_DELETE --> CONSENT_C
    EX_DELETE --> CONN_C
    EX_DELETE --> ACCT_C
    EX_DELETE --> TXN_C
    EX_DELETE --> CAT_C
    EX_DELETE --> ANA_C
    EX_DELETE --> BUD_C
    EX_DELETE --> NOTIF_C
    EX_DELETE --> PRIV_C

    AUTH_P -.->|audit.event| EX_AUDIT
    CONSENT_P -.->|audit.event| EX_AUDIT
    CONN_P -.->|audit.event| EX_AUDIT
    TXN_P -.->|audit.event| EX_AUDIT
    PRIV_P -.->|audit.event| EX_AUDIT
    EX_AUDIT -.-> AUD_C

    style EX_DELETE fill:#e74c3c,stroke:#c0392b,color:#fff
    style EX_AUDIT fill:#3498db,stroke:#2980b9,color:#fff
    style CONN_P fill:#ff6b6b,stroke:#c0392b,color:#fff
    style PRIV_P fill:#3498db,stroke:#2980b9,color:#fff
```

---

## 9. Camadas de Criptografia

```mermaid
graph TB
    subgraph "Em Transito"
        TLS["TLS 1.3<br/>(min 1.2)"]
        MTLS["mTLS (Istio)<br/>X.509 ECDSA P-256<br/>Rotacao 24h auto"]
    end

    subgraph "Em Repouso"
        TDE["PostgreSQL TDE<br/>AES-256<br/>AWS KMS CMK"]
        S3E["S3 SSE-KMS<br/>AES-256"]
        REDE["Redis<br/>At-Rest KMS"]
    end

    subgraph "Criptografia de Coluna"
        BCRYPT["Senhas<br/>bcrypt cost 12<br/>(one-way hash)"]
        TOTP_E["2FA Secrets<br/>AES-256-GCM<br/>KMS DEK"]
        ACCT_E["Account Numbers<br/>AES-256"]
        DESC_E["Descriptions (PII)<br/>AES-256"]
    end

    subgraph "Tokens Bancarios (Maximo Nivel)"
        RSA["RSA-4096<br/>Criptografia Assimetrica"]
        HSM_K["Chave Privada<br/>NUNCA sai do HSM"]
        PUB_K["Chave Publica<br/>Criptografa antes<br/>do armazenamento"]
        
        RSA --> HSM_K
        RSA --> PUB_K
    end

    subgraph "Gerenciamento de Chaves"
        KMS_S["AWS KMS<br/>Rotacao Anual"]
        HSM_S["AWS CloudHSM<br/>Rotacao Trimestral"]
        CITADEL["Istio Citadel<br/>Rotacao 24h"]
        ACM["AWS ACM<br/>Auto-Renewal"]
    end

    TLS --> ACM
    MTLS --> CITADEL
    TDE --> KMS_S
    S3E --> KMS_S
    REDE --> KMS_S
    TOTP_E --> KMS_S
    ACCT_E --> KMS_S
    DESC_E --> KMS_S
    RSA --> HSM_S

    style HSM_K fill:#e74c3c,stroke:#c0392b,color:#fff
    style RSA fill:#e74c3c,stroke:#c0392b,color:#fff
    style HSM_S fill:#e74c3c,stroke:#c0392b,color:#fff
```

---

## Legenda de Cores

| Cor | Significado |
|-----|-------------|
| Vermelho | Seguranca critica / HSM / Read-Only enforcement |
| Azul | LGPD / Privacy / Compliance |
| Verde | Operacional / Sucesso / Verificacao |
| Amarelo/Laranja | Edge protection / Aprovacao manual |
| Roxo | Integracao externa (Pluggy) |
