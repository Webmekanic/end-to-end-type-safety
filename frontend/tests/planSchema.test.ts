import { describe, expect, it } from 'vitest'
import { PlanSchema } from '../src/schemas/plan.ts'
import { proPlan } from './helpers.ts'

function issuePaths(input: unknown) {
  const result = PlanSchema.safeParse(input)
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))
}

describe('PlanSchema', () => {
  it('accepts a valid plan', () => {
    expect(PlanSchema.safeParse(proPlan)).toEqual({ success: true, data: proPlan })
  })

  it('rejects a string price instead of coercing it', () => {
    expect(issuePaths({ ...proPlan, price: '29.99' })).toEqual(['price'])
  })

  it('rejects a negative price', () => {
    expect(issuePaths({ ...proPlan, price: -1 })).toEqual(['price'])
  })

  it.each(['usd', 'US', 'USDT', ''])('rejects the invalid currency code %j', (currency) => {
    expect(issuePaths({ ...proPlan, currency })).toEqual(['currency'])
  })

  it('rejects an empty name', () => {
    expect(issuePaths({ ...proPlan, name: '' })).toEqual(['name'])
  })

  it('rejects missing required fields', () => {
    expect(issuePaths({})).toEqual(['name', 'price', 'currency'])
  })
})
