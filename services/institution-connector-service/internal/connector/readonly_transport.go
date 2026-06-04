package connector

import (
	"fmt"
	"net/http"
)

// readOnlyTransport embrulha um http.RoundTripper e BLOQUEIA, antes de sair na
// rede, qualquer requisição fora da allowlist (Camada 1 do enforcement
// READ-ONLY — ArquiteturaOpenSight.md §4.4). É a primeira de 5 camadas
// independentes; nenhuma operação de escrita pode atravessar este transporte.
type readOnlyTransport struct {
	base http.RoundTripper
}

func newReadOnlyTransport(base http.RoundTripper) *readOnlyTransport {
	if base == nil {
		base = http.DefaultTransport
	}
	return &readOnlyTransport{base: base}
}

func (t *readOnlyTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	if !isAllowed(req.Method, req.URL.Path) {
		return nil, fmt.Errorf("connector READ-ONLY: requisição bloqueada %s %s (fora da allowlist)", req.Method, req.URL.Path)
	}
	return t.base.RoundTrip(req)
}
