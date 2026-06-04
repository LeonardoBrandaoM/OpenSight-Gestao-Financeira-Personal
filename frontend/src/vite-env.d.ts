/// <reference types="vite/client" />

interface ImportMetaEnv {
  // URL base da API do backend (ex.: account-service). Default: http://localhost:8081
  readonly VITE_API_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
