const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
}

// formatPrice(29.99, 'USD') → "$29.99"
export function formatPrice(price: number, currency: string): string {
  const symbol = currencySymbols[currency] ?? `${currency} `

  // toFixed is a Number method. TypeScript is sure `price` is a number,
  // so this is safe — as long as the runtime data agrees with the type.
  return `${symbol}${price.toFixed(2)}`
}
