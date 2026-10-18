/// <reference types="vite/client" />

interface ImportMetaEnv {
  // "true" enables the malformed-plan demo in development. See src/api/demoInvalidPlan.ts.
  readonly VITE_DEMO_INVALID_PLAN?: string
}
