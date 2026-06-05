/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Bases por serviço (defaults: accounts :8081, auth :8082, transactions :8083).
  readonly VITE_API_URL?: string; // fallback p/ accounts
  readonly VITE_ACCOUNTS_URL?: string;
  readonly VITE_AUTH_URL?: string;
  readonly VITE_TRANSACTIONS_URL?: string;
  readonly VITE_ANALYTICS_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
