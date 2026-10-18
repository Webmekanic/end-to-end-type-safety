import * as z from 'zod'

// Runtime description of GET /api/plans/pro. Unlike a TypeScript type,
// this exists in the running app and can check real JSON.
export const PlanSchema = z.object({
  name: z.string().min(1),
  // z.number() rejects strings, NaN and Infinity. No coercion: "29.99" fails.
  price: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/, 'Expected a 3-letter uppercase currency code'),
})

// The static type is derived from the schema, so the two can't drift apart.
export type Plan = z.infer<typeof PlanSchema>
