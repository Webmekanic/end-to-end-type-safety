import * as z from 'zod'

// Runtime description of GET /api/plans/pro. Unlike a TypeScript type,
// this exists in the running app and can check real JSON.
// Its inferred type must equal the generated contract type; tests/contract.test.ts
// fails the type check (npm run typecheck / build) if they drift apart.
export const PlanSchema = z.object({
  name: z.string().min(1),
  // z.number() rejects strings, NaN and Infinity. No coercion: "29.99" fails.
  price: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/, 'Expected a 3-letter uppercase currency code'),
})
