package PluggySDK

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/joho/godotenv"
)

// Constantes para as variáveis de ambiente
const (
	pluggyClientID     = "PLUGGY_CLIENT_ID"
	pluggyClientSecret = "PLUGGY_CLIENT_SECRET"
)

// constantes de tempo
const (
	// Tempo de validade esperado da API (30 minutos)
	ApiKeyValidityTime = 30 * time.Minute

	// Margem de segurança (2 minutos)
	CacheSecurityMargin = 2 * time.Minute

	// Tempo efetivo de cache (28 minutos)
	CacheEffectiveTime = ApiKeyValidityTime - CacheSecurityMargin
)

// Cache para armazenar a API Key
type ApiKeyCache struct {
	Key       string
	ExpiresAt time.Time
	mu        sync.RWMutex
}

// Estrutura para credenciais
type Credentials struct {
	ClientID     string
	ClientSecret string
}

// Resposta da API Pluggy para obtenção de API Key
type ApiKeyResponse struct {
	ApiKey string `json:"apiKey"`
}

// Instância global do cache
var apiKeyCache = &ApiKeyCache{}

// Carrega o arquivo .env (se existir)
// Retorna erro apenas se o arquivo existir mas não puder ser lido
func init() {
	// Tenta carregar .env, mas não falha se não existir
	_ = godotenv.Load()
}

// LoadCredentialsFromEnv carrega as credenciais das variáveis de ambiente
func LoadCredentialsFromEnv() (Credentials, error) {
	clientID := os.Getenv(pluggyClientID)
	clientSecret := os.Getenv(pluggyClientSecret)

	if clientID == "" {
		return Credentials{}, fmt.Errorf("variável de ambiente %s não definida", pluggyClientID)
	}

	if clientSecret == "" {
		return Credentials{}, fmt.Errorf("variável de ambiente %s não definida", pluggyClientSecret)
	}

	return Credentials{
		ClientID:     clientID,
		ClientSecret: clientSecret,
	}, nil
}

// GetApiKey obtém a API Key da Pluggy com sistema de cache
// Se credenciais não forem fornecidas, tenta carregar do .env
// Se a chave ainda estiver válida, retorna do cache
// Caso contrário, solicita uma nova chave
func GetApiKey(creds ...Credentials) (string, error) {
	var credentials Credentials
	var err error

	// Se credenciais não foram passadas, carrega do .env
	if len(creds) == 0 {
		credentials, err = LoadCredentialsFromEnv()
		if err != nil {
			return "", fmt.Errorf("erro ao carregar credenciais: %w", err)
		}
	} else {
		credentials = creds[0]
	}

	apiKeyCache.mu.RLock()

	// Verifica se há uma chave em cache válida
	if apiKeyCache.Key != "" && time.Now().Before(apiKeyCache.ExpiresAt) {
		cachedKey := apiKeyCache.Key
		apiKeyCache.mu.RUnlock()
		return cachedKey, nil
	}

	apiKeyCache.mu.RUnlock()

	// Se não há cache válido, obtém uma nova chave
	return fetchNewApiKey(credentials)
}

// fetchNewApiKey solicita uma nova API Key da Pluggy
func fetchNewApiKey(creds Credentials) (string, error) {
	apiKeyCache.mu.Lock()
	defer apiKeyCache.mu.Unlock()

	// Double-check: outra goroutine pode ter atualizado enquanto esperávamos o lock
	if apiKeyCache.Key != "" && time.Now().Before(apiKeyCache.ExpiresAt) {
		return apiKeyCache.Key, nil
	}

	// Valida credenciais
	if creds.ClientID == "" || creds.ClientSecret == "" {
		return "", fmt.Errorf("client_id e client_secret são obrigatórios")
	}

	// Prepara o corpo da requisição
	reqBody := map[string]string{
		"clientId":     creds.ClientID,
		"clientSecret": creds.ClientSecret,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("erro ao serializar credenciais: %w", err)
	}

	// URL da API Pluggy para autenticação
	url := "https://api.pluggy.ai/auth"

	// Cria a requisição HTTP
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("erro ao criar requisição: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Executa a requisição
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("erro na requisição HTTP: %w", err)
	}
	defer resp.Body.Close()

	// Lê o corpo da resposta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("erro ao ler resposta: %w", err)
	}

	// Verifica status code
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("erro na API Pluggy [%d]: %s", resp.StatusCode, string(body))
	}

	// Parse da resposta
	var apiKeyResp ApiKeyResponse
	if err := json.Unmarshal(body, &apiKeyResp); err != nil {
		return "", fmt.Errorf("erro ao fazer parse da resposta: %w", err)
	}

	if apiKeyResp.ApiKey == "" {
		return "", fmt.Errorf("API Key vazia na resposta")
	}

	// Armazena no cache
	// Subtrai 2 minutos da expiração para renovar antes de expirar (margem de segurança)
	apiKeyCache.Key = apiKeyResp.ApiKey
	apiKeyCache.ExpiresAt = time.Now().Add(CacheEffectiveTime)

	return apiKeyResp.ApiKey, nil
}

// ClearCache limpa o cache da API Key (útil para testes ou forçar renovação)
func ClearCache() {
	apiKeyCache.mu.Lock()
	defer apiKeyCache.mu.Unlock()

	apiKeyCache.Key = ""
	apiKeyCache.ExpiresAt = time.Time{}
}

// GetCachedKeyExpiration retorna quando a chave em cache expira (útil para debugging)
func GetCachedKeyExpiration() time.Time {
	apiKeyCache.mu.RLock()
	defer apiKeyCache.mu.RUnlock()

	return apiKeyCache.ExpiresAt
}
