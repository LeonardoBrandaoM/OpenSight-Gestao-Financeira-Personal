# SDK Pluggy - Função GetApiKey

> **Status:** migrado. A lógica vive agora em `services/institution-connector-service/internal/connector` (pacote `connector`, método `Client.APIKey(ctx)`), com transporte READ-ONLY. O cache real usa **2h** (TTL do apiKey Pluggy) — este documento descreve a versão original (~28min). Auth via header `X-API-KEY`.
>
> **Ver também:** [Arquitetura](../ArquiteturaOpenSight.md) · [SRS](<../SRSGestorFinanceiro(0.0.005).MD>) · [Estrutura de Projeto](../EstruturaDeProjeto.md) · [Diagramas](../DiagramaArquitetural.md).

## Descrição

Implementação da função `GetApiKey` para o SDK da API Pluggy em Go, com sistema de cache automático e carregamento de credenciais via arquivo `.env`.

## Características

✅ **Cache Automático**: A API Key é armazenada em cache por ~28 minutos (buffer de 2 min)  
✅ **Carregamento via .env**: Credenciais carregadas automaticamente do arquivo `.env`  
✅ **Thread-Safe**: Usa `sync.RWMutex` para operações concorrentes seguras  
✅ **Double-Check Locking**: Evita requisições duplicadas em cenários concorrentes  
✅ **Renovação Automática**: Renova a chave automaticamente quando expira  
✅ **Timeout**: Proteção com timeout de 30 segundos nas requisições HTTP  

## Instalação

### 1. Instalar dependências

```bash
go get github.com/joho/godotenv
```

### 2. Configurar arquivo .env

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
PLUGGY_CLIENT_ID=seu-client-id-aqui
PLUGGY_CLIENT_SECRET=seu-client-secret-aqui
```

**⚠️ IMPORTANTE**: Nunca versione o arquivo `.env` com suas credenciais reais! O `.gitignore` já está configurado para ignorá-lo.

## Estruturas

### Credentials
```go
type Credentials struct {
    ClientID     string
    ClientSecret string
}
```

### ApiKeyCache (interno)
```go
type ApiKeyCache struct {
    Key       string
    ExpiresAt time.Time
    mu        sync.RWMutex
}
```

## Funções Principais

### LoadCredentialsFromEnv
```go
func LoadCredentialsFromEnv() (Credentials, error)
```

**Descrição**: Carrega as credenciais das variáveis de ambiente definidas no arquivo `.env`.

**Variáveis esperadas:**
- `PLUGGY_CLIENT_ID`: Client ID da Pluggy
- `PLUGGY_CLIENT_SECRET`: Client Secret da Pluggy

**Retorno:**
- `Credentials`: Struct com as credenciais carregadas
- `error`: Erro se alguma variável não estiver definida

### GetApiKey
```go
func GetApiKey(creds ...Credentials) (string, error)
```

**Parâmetros:**
- `creds` (opcional): Credenciais da Pluggy. Se não fornecidas, carrega automaticamente do `.env`

**Retorno:**
- `string`: API Key válida
- `error`: Erro em caso de falha

**Comportamento:**
1. Se credenciais não forem passadas, carrega do arquivo `.env`
2. Verifica se existe API Key válida em cache
3. Se sim, retorna do cache (operação rápida)
4. Se não, solicita nova chave da API Pluggy
5. Armazena em cache com expiração de 29 minutos
6. Retorna a nova chave

### ClearCache
```go
func ClearCache()
```

Limpa o cache da API Key. Útil para:
- Testes
- Forçar renovação da chave
- Debugging

### GetCachedKeyExpiration
```go
func GetCachedKeyExpiration() time.Time
```

Retorna a data/hora de expiração da chave em cache. Útil para monitoramento.

## Exemplo de Uso

### Uso Básico (com .env) - **Recomendado**

```go
package main

import (
    "fmt"
    "log"
    "pluggy"
)

func main() {
    // Carrega automaticamente do arquivo .env
    apiKey, err := pluggy.GetApiKey()
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("API Key:", apiKey)

    // Chamadas subsequentes retornam do cache (rápido)
    apiKey2, _ := pluggy.GetApiKey()
    fmt.Println("Do cache:", apiKey2)
}
```

### Uso com Credenciais Manuais (alternativa)

```go
package main

import (
    "fmt"
    "log"
    "pluggy"
)

func main() {
    // Passar credenciais manualmente
    creds := pluggy.Credentials{
        ClientID:     "seu-client-id",
        ClientSecret: "seu-client-secret",
    }

    apiKey, err := pluggy.GetApiKey(creds)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("API Key:", apiKey)
}
```

### Carregamento Explícito de Credenciais

```go
package main

import (
    "fmt"
    "log"
    "pluggy"
)

func main() {
    // Carregar explicitamente do .env
    creds, err := pluggy.LoadCredentialsFromEnv()
    if err != nil {
        log.Fatalf("Erro ao carregar .env: %v", err)
    }

    fmt.Printf("Client ID: %s\n", creds.ClientID)
    
    // Usar as credenciais
    apiKey, err := pluggy.GetApiKey(creds)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println("API Key:", apiKey)
}
```

## Tratamento de Erros

A função retorna erros nos seguintes casos:

- **Credenciais vazias**: `client_id e client_secret são obrigatórios`
- **Erro de serialização**: Problema ao converter credenciais para JSON
- **Erro HTTP**: Falha na comunicação com a API
- **Status não-OK**: API retornou erro (inclui status code e mensagem)
- **Parse inválido**: Resposta da API em formato inesperado
- **API Key vazia**: Resposta válida mas sem API Key

## Performance

### Primeira Chamada
- ~500ms - 2s (depende da latência da API Pluggy)
- Faz requisição HTTP completa

### Chamadas Subsequentes (cache hit)
- ~1-5µs (microsegundos)
- Apenas leitura de memória

## Concorrência

A implementação é **thread-safe** e otimizada para cenários concorrentes:

```go
// Múltiplas goroutines podem chamar simultaneamente
for i := 0; i < 100; i++ {
    go func() {
        key, _ := pluggy.GetApiKey(creds)
        // Todas receberão a mesma chave válida
        // Apenas 1 requisição HTTP será feita
    }()
}
```

## Segurança

### ✅ Boas Práticas Implementadas

1. **Arquivo .env não versionado**: O `.gitignore` já ignora arquivos `.env`
2. **Carregamento automático**: Credenciais carregadas de variáveis de ambiente
3. **Exemplo fornecido**: Use `.env.example` como template

### ⚠️ Nunca faça isso:

```go
// ❌ ERRADO - credenciais hardcoded
creds := pluggy.Credentials{
    ClientID:     "abc123",
    ClientSecret: "secret456",
}
```

### ✅ Faça assim:

```go
// ✅ CORRETO - credenciais do .env
apiKey, err := pluggy.GetApiKey()
```

### Configuração em Produção

Para ambientes de produção, configure as variáveis de ambiente diretamente no servidor:

```bash
export PLUGGY_CLIENT_ID=seu-client-id
export PLUGGY_CLIENT_SECRET=seu-client-secret
```

Ou use serviços de gerenciamento de secrets como:
- AWS Secrets Manager
- Google Cloud Secret Manager
- HashiCorp Vault
- Docker Secrets

## Endpoint Utilizado

```
POST https://api.pluggy.ai/auth
Content-Type: application/json

{
  "clientId": "seu-client-id",
  "clientSecret": "seu-client-secret"
}
```

**Resposta esperada:**
```json
{
  "apiKey": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "expiresIn": 1800
}
```

## Próximos Passos

Após implementar esta função, você pode prosseguir com:
- Funções para listar instituições financeiras
- Funções para criar conexões (Items)
- Funções para buscar contas e transações
- Funções para gerenciar webhooks

## Notas Técnicas

- **Buffer de Expiração**: A chave expira 2 minutos antes do tempo oficial para garantir que nunca seja usada uma chave expirada (margem de segurança)
- **Validade Padrão**: A Pluggy retorna chaves com 1800 segundos (30 minutos) de validade
- **Validade Efetiva em Cache**: Com o buffer de 2 minutos, o cache mantém a chave por 28 minutos
- **Cache Global**: O cache é compartilhado por toda a aplicação (variável `apiKeyCache`)

### Timeline da Margem de Segurança

```
Momento 0          ━━━━━━━━━━━━━━ API Key obtida da Pluggy
    │                              (Validade: 30 minutos)
    │
    │ (28 minutos - cache ativo)
    │
    ▼
Minuto 28          ━━━━━━━━━━━━━━ Cache expira
    │                              GetApiKey() solicita nova chave
    │
    │ (2 minutos - margem de segurança)
    │
    ▼
Minuto 30          ━━━━━━━━━━━━━━ API Key original expiraria
                                   (mas já foi renovada!)
```

### Por que 2 minutos de margem?

✅ **Confiabilidade**: Evita usar chaves próximas à expiração  
✅ **Clock Skew**: Protege contra diferenças de relógio entre cliente/servidor  
✅ **Retry**: Tempo para tentar novamente em caso de falha  
✅ **Produção**: Reduz drasticamente erros 401 em produção