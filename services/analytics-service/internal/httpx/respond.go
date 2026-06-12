// Package httpx — helpers de resposta JSON e middlewares (candidato a packages/).
package httpx

import (
	"encoding/json"
	"log"
	"net/http"
)

type ErrorBody struct {
	Error ErrorDetail `json:"error"`
}
type ErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

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

func Error(w http.ResponseWriter, status int, code, message string) {
	JSON(w, status, ErrorBody{Error: ErrorDetail{Code: code, Message: message}})
}
