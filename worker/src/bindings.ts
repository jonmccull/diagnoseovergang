export type Bindings = {
  ICD_RELEASE: string;
  API_BASE: string;
  ICD_CACHE: KVNamespace;
  FEEDBACK_DB: D1Database;
  WHO_CLIENT_ID: string;
  WHO_CLIENT_SECRET: string;
  // M6 secrets: TURNSTILE_SECRET, IP_HASH_SALT
};
