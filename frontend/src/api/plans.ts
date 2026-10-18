import type * as z from 'zod'
import { PlanSchema } from '../schemas/plan.ts'
import { invalidPlanPayload, isInvalidPlanDemoEnabled } from './demoInvalidPlan.ts'
// Generated from contracts/openapi.json: what the API *promises* (compile time only).
import type { Plan } from './generated/index.ts'

export type { Plan }

// Thrown when the API responds 2xx but the body doesn't match the plan contract.
export class PlanValidationError extends Error {
  readonly issues: string[]

  constructor(zodIssues: z.core.$ZodIssue[]) {
    const issues = zodIssues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    super(`Invalid plan response from /api/plans/pro — ${issues.join('; ')}`)
    this.name = 'PlanValidationError'
    this.issues = issues
  }
}

export async function fetchProPlan(signal?: AbortSignal): Promise<Plan> {
  // Relative URL: in development, Vite proxies /api to the ASP.NET Core API.
  const response = await fetch('/api/plans/pro', { signal })

  if (!response.ok) {
    throw new Error(`Failed to load plan (HTTP ${response.status})`)
  }

  // JSON from the network is untrusted until validated.
  const body: unknown = isInvalidPlanDemoEnabled() ? invalidPlanPayload : await response.json()

  // Checks the real value at runtime, replacing the old `as Plan` assertion.
  const result = PlanSchema.safeParse(body)
  if (!result.success) {
    throw new PlanValidationError(result.error.issues)
  }

  return result.data
}
