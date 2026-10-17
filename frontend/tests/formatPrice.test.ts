import { describe, expect, it } from 'vitest'
import { formatPrice } from '../src/components/formatPrice.ts'

describe('formatPrice', () => {
  it('formats USD with a dollar sign and two decimals', () => {
    expect(formatPrice(29.99, 'USD')).toBe('$29.99')
    expect(formatPrice(30, 'USD')).toBe('$30.00')
  })

  it('falls back to the currency code for unknown currencies', () => {
    expect(formatPrice(29.99, 'NGN')).toBe('NGN 29.99')
  })
})
