/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Bases por serviço (defaults: accounts :8081, auth :8082, transactions :8083).
  readonly VITE_API_URL?: string; // fallback p/ accounts
  readonly VITE_ACCOUNTS_URL?: string;
  readonly VITE_AUTH_URL?: string;
  readonly VITE_TRANSACTIONS_URL?: string;
  readonly VITE_ANALYTICS_URL?: string;
  readonly VITE_BUDGET_URL?: string;
  readonly VITE_PROJECTION_URL?: string;
  readonly VITE_CONSENT_URL?: string;
  readonly VITE_COHORT_URL?: string;
  readonly VITE_CARDS_URL?: string;
  readonly VITE_INVESTMENTS_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
