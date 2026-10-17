import { vi } from 'vitest'

export const proPlan = { name: 'Pro', price: 29.99, currency: 'USD' }

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Replaces the global fetch for one test; Vitest restores it afterwards (unstubGlobals).
export function stubFetch(...responses: Response[]) {
  const fetchMock = vi.fn<typeof fetch>()
  for (const response of responses) {
    fetchMock.mockResolvedValueOnce(response)
  }
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
