/// <reference types="vite/client" />

/** Injected at build time from package.json via Vite `define`. */
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  /** Public API root; defaults to the AI Usage Tracker cloud API. */
  readonly VITE_API_BASE?: string;
  readonly VITE_API_BEARER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
