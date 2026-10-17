// The shape we *expect* from GET /api/plans/pro.
// Hand-written for now; it is a compile-time promise only and does not exist at runtime.
export type Plan = {
  name: string
  price: number
  currency: string
}

export async function fetchProPlan(signal?: AbortSignal): Promise<Plan> {
  // Relative URL: in development, Vite proxies /api to the ASP.NET Core API.
  const response = await fetch('/api/plans/pro', { signal })

  if (!response.ok) {
    throw new Error(`Failed to load plan (HTTP ${response.status})`)
  }

  // ⚠️ INTENTIONALLY UNSAFE (kept for the demo).
  // `as Plan` tells the compiler to trust us; nothing checks the JSON at runtime.
  // If the API sends `"price": "29.99"`, this line still "succeeds" and the bad
  // value flows into the UI. A later milestone replaces this with Zod validation.
  const plan = (await response.json()) as Plan

  return plan
}
