module opensight/services/investments-service

go 1.25.5

require opensight/packages/httpkit v0.0.0

require (
	github.com/golang-jwt/jwt/v5 v5.3.1 // indirect
	github.com/joho/godotenv v1.5.1 // indirect
)

replace opensight/packages/httpkit => ../../packages/httpkit
