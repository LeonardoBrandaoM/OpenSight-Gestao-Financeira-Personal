// Package httpx contém helpers de resposta JSON e middlewares de segurança,
// reutilizáveis pelos handlers. (Candidato a virar packages/ quando um 2º
// serviço precisar — ver EstruturaDeProjeto.md.)
package httpx

import (
	"encoding/json"
	"log"
	"net/http"
)

// ErrorBody é o envelope de erro padrão (não vaza detalhes internos).
type ErrorBody struct {
	Error ErrorDetail `json:"error"`
}
type ErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// JSON escreve um corpo JSON com o status informado.
func JSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if v == nil {
		return
	}
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("erro ao serializar resposta: %v", err)
	}
}

// Error escreve um erro padronizado.
func Error(w http.ResponseWriter, status int, code, message string) {
	JSON(w, status, ErrorBody{Error: ErrorDetail{Code: code, Message: message}})
}
