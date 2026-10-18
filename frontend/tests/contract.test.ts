import { describe, expectTypeOf, it } from 'vitest'
import type * as z from 'zod'
import type { Plan } from '../src/api/generated/index.ts'
import { PlanSchema } from '../src/schemas/plan.ts'

// These are compile-time assertions: `tsc` (npm run typecheck / build) fails if the
// Zod schema and the OpenAPI-generated type disagree, e.g. after the backend adds a
// field or changes `price` to `number | string`. At runtime they are no-ops.
describe('Zod schema vs generated OpenAPI contract', () => {
  it('PlanSchema produces exactly the generated Plan type', () => {
    expectTypeOf<z.infer<typeof PlanSchema>>().toEqualTypeOf<Plan>()
  })
})
