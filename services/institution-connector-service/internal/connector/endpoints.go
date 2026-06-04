package connector

import "strings"

// Allowlist de endpoints — Camada 1 do enforcement READ-ONLY (ArquiteturaOpenSight.md §4.4).
// Somente POST /auth e GETs de leitura. Nenhum PUT/PATCH/DELETE jamais é permitido.
// Esta lista é uma constante de compilação: não é configurável em runtime (RNF-002).
const (
	pathAuth         = "/auth"
	pathAccounts     = "/accounts"
	pathTransactions = "/transactions"
	pathInvestments  = "/investments"
	pathIdentity     = "/identity"
	pathItems        = "/items"
)

// isAllowed valida método + caminho contra a allowlist imutável.
// GET aceita o recurso exato e subcaminhos (ex.: /accounts e /accounts/{id}).
func isAllowed(method, path string) bool {
	switch method {
	case "POST":
		return path == pathAuth
	case "GET":
		return matchGet(path, pathAccounts) ||
			matchGet(path, pathTransactions) ||
			matchGet(path, pathInvestments) ||
			matchGet(path, pathIdentity) ||
			matchGet(path, pathItems)
	default:
		return false
	}
}

func matchGet(path, base string) bool {
	return path == base || strings.HasPrefix(path, base+"/")
}
