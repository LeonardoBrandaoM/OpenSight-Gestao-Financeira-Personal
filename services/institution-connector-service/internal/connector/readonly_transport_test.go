package connector

import "testing"

// TestIsAllowed valida a allowlist: só POST /auth e GETs de leitura passam;
// qualquer escrita (PUT/PATCH/DELETE/POST fora de /auth) é bloqueada.
func TestIsAllowed(t *testing.T) {
	cases := []struct {
		method, path string
		want         bool
	}{
		{"POST", "/auth", true},
		{"GET", "/accounts", true},
		{"GET", "/accounts/abc-123", true},
		{"GET", "/transactions", true},
		{"GET", "/investments", true},
		{"GET", "/identity", true},
		{"GET", "/items/xyz", true},
		// bloqueados
		{"POST", "/accounts", false},
		{"POST", "/transactions", false},
		{"PUT", "/accounts/abc", false},
		{"PATCH", "/items/xyz", false},
		{"DELETE", "/items/xyz", false},
		{"GET", "/payments", false},
		{"GET", "/auth", false}, // /auth só por POST
	}
	for _, tc := range cases {
		if got := isAllowed(tc.method, tc.path); got != tc.want {
			t.Errorf("isAllowed(%q, %q) = %v, quer %v", tc.method, tc.path, got, tc.want)
		}
	}
}
