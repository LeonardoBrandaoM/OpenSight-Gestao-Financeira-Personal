package api

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"opensight/services/auth-service/internal/domain"
	"opensight/services/auth-service/internal/httpx"
	"opensight/services/auth-service/internal/repository"
	"opensight/services/auth-service/internal/token"
)

// bcryptCost segue a arquitetura (§3.1): custo 12.
const bcryptCost = 12

type Handlers struct {
	users  repository.UserRepository
	signer *token.Signer
}

func NewHandlers(users repository.UserRepository, signer *token.Signer) *Handlers {
	return &Handlers{users: users, signer: signer}
}

type credsRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func decodeJSON(w http.ResponseWriter, r *http.Request, dst any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // limita corpo a 1MB
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid_body", "corpo JSON inválido")
		return false
	}
	return true
}

func (h *Handlers) health(w http.ResponseWriter, _ *http.Request) {
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// POST /api/v1/auth/register
func (h *Handlers) register(w http.ResponseWriter, r *http.Request) {
	var req credsRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	email := domain.NormalizeEmail(req.Email)
	if err := domain.ValidateEmail(email); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid_email", err.Error())
		return
	}
	if err := domain.ValidatePassword(req.Password); err != nil {
		httpx.Error(w, http.StatusBadRequest, "weak_password", err.Error())
		return
	}
	if _, err := h.users.GetByEmail(r.Context(), email); err == nil {
		httpx.Error(w, http.StatusConflict, "email_taken", "email já cadastrado")
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcryptCost)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "internal", "falha ao processar senha")
		return
	}
	u := domain.User{ID: newID(), Email: email, PasswordHash: string(hash), CreatedAt: time.Now().UTC()}
	if err := h.users.Create(r.Context(), u); err != nil {
		if errors.Is(err, domain.ErrEmailTaken) {
			httpx.Error(w, http.StatusConflict, "email_taken", "email já cadastrado")
			return
		}
		httpx.Error(w, http.StatusInternalServerError, "internal", "falha ao criar usuário")
		return
	}
	httpx.JSON(w, http.StatusCreated, map[string]any{"id": u.ID, "email": u.Email})
}

// POST /api/v1/auth/login
func (h *Handlers) login(w http.ResponseWriter, r *http.Request) {
	var req credsRequest
	if !decodeJSON(w, r, &req) {
		return
	}
	// Mensagem genérica em qualquer falha: não revela se o email existe.
	u, err := h.users.GetByEmail(r.Context(), domain.NormalizeEmail(req.Email))
	if err != nil {
		httpx.Error(w, http.StatusUnauthorized, "invalid_credentials", "credenciais inválidas")
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password)) != nil {
		httpx.Error(w, http.StatusUnauthorized, "invalid_credentials", "credenciais inválidas")
		return
	}
	tok, exp, err := h.signer.Sign(u.ID)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "internal", "falha ao emitir token")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{
		"accessToken": tok,
		"tokenType":   "Bearer",
		"expiresAt":   exp.Format(time.RFC3339),
	})
}

// GET /api/v1/auth/me — valida o próprio token e devolve o subject.
func (h *Handlers) me(w http.ResponseWriter, r *http.Request) {
	authz := r.Header.Get("Authorization")
	const prefix = "Bearer "
	if !strings.HasPrefix(authz, prefix) {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized", "token ausente")
		return
	}
	sub, err := h.signer.Verify(strings.TrimPrefix(authz, prefix))
	if err != nil {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized", "token inválido")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"userId": sub})
}

// GET /api/v1/auth/public-key — PEM da chave pública (outros serviços validam JWT).
func (h *Handlers) publicKey(w http.ResponseWriter, _ *http.Request) {
	pemStr, err := h.signer.PublicKeyPEM()
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "internal", "falha ao expor chave pública")
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]string{"alg": "RS256", "publicKeyPem": pemStr})
}

// newID gera um UUID v4 (sem dependência externa).
func newID() string {
	var b [16]byte
	_, _ = rand.Read(b[:])
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
