# institution-connector-service

Serviço **mais crítico** do OpenSight: única porta de comunicação com o agregador
Open Finance (hoje **Pluggy**; **Belvo** é o alvo futuro — RNF-012). Opera
**estritamente READ-ONLY** (ver `Documentação/ArquiteturaOpenSight.md` §3.3, §4.4).

## Pacote `internal/connector`

Camada anticorrupção de leitura sobre a Pluggy:

- `client.go` — `Client` thread-safe com cache de `apiKey` (TTL 2h, margem 5min) e helper `get`.
- `readonly_transport.go` + `endpoints.go` — **Camada 1** do enforcement READ-ONLY: allowlist de método+rota (só `POST /auth` e GETs). Bloqueia qualquer escrita antes da rede.
- `accounts.go`, `transactions.go`, `items.go`, `identity.go`, `investments.go` — funções de leitura.
- `models.go` — DTOs da borda Pluggy (mapeados para o modelo canônico no futuro).

## Comandos

```bash
# Da raiz do repo (workspace go.work). Node/Go vivem no Windows neste WSL:
export PATH="$PATH:/mnt/c/Program Files/Go/bin"   # ou use go.exe diretamente
go build ./...
go vet ./...
go test ./...        # inclui o teste da allowlist READ-ONLY

# Rodar o serviço (smoke read-only):
cd services/institution-connector-service
go run ./cmd/connector-service     # autentica; lista contas se PLUGGY_ITEM_ID estiver setado
go run ./cmd/apikey-demo           # demonstra o cache de apiKey
```

## Variáveis de ambiente

`.env` **na raiz deste serviço** (gitignored; ver `EstruturaDeProjeto.md` §sobre `.env`):

```
PLUGGY_CLIENT_ID=...
PLUGGY_CLIENT_SECRET=...
PLUGGY_ITEM_ID=...        # opcional, para o smoke listar contas
```

Em produção, os segredos vêm do AWS Secrets Manager, não de `.env` (§4.3).
