// DEMO ONLY: simulates the API breaking its contract by sending `price` as a string.
// Enable with VITE_DEMO_INVALID_PLAN=true in frontend/.env.local, then restart Vite.
// `import.meta.env.DEV` is replaced with `false` in production builds, so the check
// compiles to `return false` and the demo can never activate there.

export function isInvalidPlanDemoEnabled(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_DEMO_INVALID_PLAN === 'true'
}

export const invalidPlanPayload = {
  name: 'Pro',
  price: '29.99', // ← the contract says number
  currency: 'USD',
}
