package api

import (
	"errors"
	"net/http"

	"opensight/services/account-service/internal/domain"
	"opensight/services/account-service/internal/httpx"
	"opensight/services/account-service/internal/repository"
)

// Handlers agrupa os handlers HTTP do serviço.
type Handlers struct {
	repo repository.AccountRepository
}

func NewHandlers(repo repository.AccountRepository) *Handlers {
	return &Handlers{repo: repo}
}

func (h *Handlers) health(w http.ResponseWriter, _ *http.Request) {
	httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// GET /api/v1/accounts — lista as contas do usuário autenticado.
func (h *Handlers) listAccounts(w http.ResponseWriter, r *http.Request) {
	uid := UserID(r.Context())
	accounts, err := h.repo.List(r.Context(), uid)
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "internal", "falha ao listar contas")
		return
	}
	if accounts == nil {
		accounts = []domain.Account{}
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"results": accounts})
}

// GET /api/v1/accounts/{id} — recupera uma conta do usuário.
func (h *Handlers) getAccount(w http.ResponseWriter, r *http.Request) {
	uid := UserID(r.Context())
	id := r.PathValue("id")
	account, err := h.repo.Get(r.Context(), uid, id)
	if errors.Is(err, domain.ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "not_found", "conta não encontrada")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "internal", "falha ao buscar conta")
		return
	}
	httpx.JSON(w, http.StatusOK, account)
}

// GET /api/v1/accounts/{id}/balance-history — histórico de saldo da conta.
func (h *Handlers) getBalanceHistory(w http.ResponseWriter, r *http.Request) {
	uid := UserID(r.Context())
	id := r.PathValue("id")
	pts, err := h.repo.BalanceHistory(r.Context(), uid, id)
	if errors.Is(err, domain.ErrNotFound) {
		httpx.Error(w, http.StatusNotFound, "not_found", "conta não encontrada")
		return
	}
	if err != nil {
		httpx.Error(w, http.StatusInternalServerError, "internal", "falha ao buscar histórico")
		return
	}
	if pts == nil {
		pts = []domain.BalancePoint{}
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"results": pts})
}
