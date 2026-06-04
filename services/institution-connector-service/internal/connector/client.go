// Package connector é a camada anticorrupção de leitura sobre o agregador Open
// Finance (hoje Pluggy; Belvo é o alvo futuro — RNF-012). Todo acesso à rede
// passa por um transporte READ-ONLY com allowlist de endpoints (§4.4).
package connector

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"sync"
	"time"

	"github.com/joho/godotenv"
)

// DefaultBaseURL é o host da API Pluggy.
const DefaultBaseURL = "https://api.pluggy.ai"

// O apiKey da Pluggy vale 2h; renovamos com margem de segurança para evitar
// corridas de expiração / clock-skew.
const (
	apiKeyValidity     = 2 * time.Hour
	apiKeySafetyMargin = 5 * time.Minute
	apiKeyCacheTTL     = apiKeyValidity - apiKeySafetyMargin // 1h55m efetivos
)

const (
	envClientID     = "PLUGGY_CLIENT_ID"
	envClientSecret = "PLUGGY_CLIENT_SECRET"
)

// Credentials são as credenciais de servidor da Pluggy (clientId/clientSecret).
// (Belvo usaria secretId/secretPassword — mapeado quando o provedor for trocado.)
type Credentials struct {
	ClientID     string
	ClientSecret string
}

// Client é um cliente HTTP de LEITURA, thread-safe, com cache de apiKey.
type Client struct {
	baseURL string
	http    *http.Client
	creds   Credentials

	mu        sync.RWMutex
	apiKey    string
	apiKeyExp time.Time
}

// Option configura o Client.
type Option func(*Client)

// WithBaseURL troca o host (útil em testes).
func WithBaseURL(u string) Option {
	return func(c *Client) {
		if u != "" {
			c.baseURL = u
		}
	}
}

// WithHTTPClient injeta um *http.Client (será embrulhado pelo transporte READ-ONLY).
func WithHTTPClient(h *http.Client) Option {
	return func(c *Client) {
		if h != nil {
			c.http = h
		}
	}
}

// WithTimeout ajusta o timeout do http.Client.
func WithTimeout(d time.Duration) Option {
	return func(c *Client) { c.http.Timeout = d }
}

func init() { _ = godotenv.Load() }

// New cria um Client já com o transporte READ-ONLY embrulhado.
func New(creds Credentials, opts ...Option) *Client {
	c := &Client{
		baseURL: DefaultBaseURL,
		creds:   creds,
		http: &http.Client{
			Timeout:   30 * time.Second,
			Transport: newReadOnlyTransport(http.DefaultTransport),
		},
	}
	for _, o := range opts {
		o(c)
	}
	// Mesmo que um http.Client custom tenha sido injetado, garantimos READ-ONLY.
	if _, ok := c.http.Transport.(*readOnlyTransport); !ok {
		c.http.Transport = newReadOnlyTransport(c.http.Transport)
	}
	return c
}

// NewFromEnv cria um Client lendo as credenciais do ambiente/.env.
func NewFromEnv(opts ...Option) (*Client, error) {
	creds, err := credentialsFromEnv()
	if err != nil {
		return nil, err
	}
	return New(creds, opts...), nil
}

func credentialsFromEnv() (Credentials, error) {
	id := os.Getenv(envClientID)
	secret := os.Getenv(envClientSecret)
	if id == "" {
		return Credentials{}, fmt.Errorf("variável de ambiente %s não definida", envClientID)
	}
	if secret == "" {
		return Credentials{}, fmt.Errorf("variável de ambiente %s não definida", envClientSecret)
	}
	return Credentials{ClientID: id, ClientSecret: secret}, nil
}

// APIKey retorna um apiKey válido do cache ou busca um novo (double-checked locking).
func (c *Client) APIKey(ctx context.Context) (string, error) {
	c.mu.RLock()
	if c.apiKey != "" && time.Now().Before(c.apiKeyExp) {
		k := c.apiKey
		c.mu.RUnlock()
		return k, nil
	}
	c.mu.RUnlock()
	return c.fetchAPIKey(ctx)
}

// APIKeyExpiration informa quando o apiKey em cache expira (debug/observabilidade).
func (c *Client) APIKeyExpiration() time.Time {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.apiKeyExp
}

// ClearAPIKey invalida o cache (testes / forçar renovação).
func (c *Client) ClearAPIKey() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.apiKey = ""
	c.apiKeyExp = time.Time{}
}

func (c *Client) fetchAPIKey(ctx context.Context) (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	// Double-check: outra goroutine pode ter renovado enquanto esperávamos o lock.
	if c.apiKey != "" && time.Now().Before(c.apiKeyExp) {
		return c.apiKey, nil
	}
	if c.creds.ClientID == "" || c.creds.ClientSecret == "" {
		return "", fmt.Errorf("clientId e clientSecret são obrigatórios")
	}
	body, err := json.Marshal(map[string]string{
		"clientId":     c.creds.ClientID,
		"clientSecret": c.creds.ClientSecret,
	})
	if err != nil {
		return "", fmt.Errorf("erro ao serializar credenciais: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+pathAuth, bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("erro ao criar requisição de auth: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.http.Do(req)
	if err != nil {
		return "", fmt.Errorf("erro na requisição de auth: %w", err)
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("auth Pluggy falhou [%d]: %s", resp.StatusCode, string(raw))
	}
	var out struct {
		APIKey string `json:"apiKey"`
	}
	if err := json.Unmarshal(raw, &out); err != nil {
		return "", fmt.Errorf("erro ao decodificar resposta de auth: %w", err)
	}
	if out.APIKey == "" {
		return "", fmt.Errorf("apiKey vazio na resposta de auth")
	}
	c.apiKey = out.APIKey
	c.apiKeyExp = time.Now().Add(apiKeyCacheTTL)
	return c.apiKey, nil
}

// get executa um GET autenticado (X-API-KEY) na allowlist e decodifica em out.
func (c *Client) get(ctx context.Context, path string, query url.Values, out any) error {
	key, err := c.APIKey(ctx)
	if err != nil {
		return err
	}
	u := c.baseURL + path
	if len(query) > 0 {
		u += "?" + query.Encode()
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return fmt.Errorf("erro ao criar requisição GET %s: %w", path, err)
	}
	req.Header.Set("X-API-KEY", key)
	req.Header.Set("Accept", "application/json")
	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("erro na requisição GET %s: %w", path, err)
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("GET %s falhou [%d]: %s", path, resp.StatusCode, string(raw))
	}
	if out == nil {
		return nil
	}
	if err := json.Unmarshal(raw, out); err != nil {
		return fmt.Errorf("erro ao decodificar resposta de %s: %w", path, err)
	}
	return nil
}
