import { describe, expect, it, vi } from 'vitest'
import { fetchProPlan, PlanValidationError } from '../src/api/plans.ts'
import { jsonResponse, proPlan, stubFetch } from './helpers.ts'

describe('fetchProPlan', () => {
  it('requests the Pro plan through the relative /api path', async () => {
    const fetchMock = stubFetch(jsonResponse(proPlan))

    await fetchProPlan()

    expect(fetchMock).toHaveBeenCalledWith('/api/plans/pro', expect.anything())
  })

  it('returns the validated plan on success', async () => {
    stubFetch(jsonResponse(proPlan))

    const plan = await fetchProPlan()

    expect(plan).toEqual(proPlan)
    expect(typeof plan.price).toBe('number')
  })

  it('rejects with the HTTP status for non-success responses', async () => {
    stubFetch(jsonResponse({ title: 'Service Unavailable' }, 503))

    await expect(fetchProPlan()).rejects.toThrow('Failed to load plan (HTTP 503)')
  })

  it('rejects a malformed body with a validation error listing each issue', async () => {
    stubFetch(jsonResponse({ plan: 'Pro' }))

    const error = await fetchProPlan().catch((e: unknown) => e)

    expect(error).toBeInstanceOf(PlanValidationError)
    expect((error as PlanValidationError).issues).toEqual([
      'name: Invalid input: expected string, received undefined',
      'price: Invalid input: expected number, received undefined',
      'currency: Invalid input: expected string, received undefined',
    ])
  })

  it('rejects a string price rather than coercing it', async () => {
    stubFetch(jsonResponse({ ...proPlan, price: '29.99' }))

    await expect(fetchProPlan()).rejects.toThrow(
      'Invalid plan response from /api/plans/pro — price: Invalid input: expected number, received string',
    )
  })

  it('propagates aborts without reporting them as validation errors', async () => {
    const controller = new AbortController()
    controller.abort()
    stubFetch()
    vi.mocked(fetch).mockImplementation((_url, init) =>
      Promise.reject(init?.signal?.reason ?? new Error('not aborted')),
    )

    const error = await fetchProPlan(controller.signal).catch((e: unknown) => e)

    // Compare by name: Node's and jsdom's DOMException are different classes.
    expect(error).not.toBeInstanceOf(PlanValidationError)
    expect((error as Error).name).toBe('AbortError')
  })
})

describe('fetchProPlan with the VITE_DEMO_INVALID_PLAN demo switch', () => {
  it('still calls the real endpoint, then rejects the simulated string price', async () => {
    vi.stubEnv('VITE_DEMO_INVALID_PLAN', 'true')
    const fetchMock = stubFetch(jsonResponse(proPlan))

    await expect(fetchProPlan()).rejects.toBeInstanceOf(PlanValidationError)
    expect(fetchMock).toHaveBeenCalledWith('/api/plans/pro', expect.anything())
  })

  it('is ignored outside development builds', async () => {
    vi.stubEnv('VITE_DEMO_INVALID_PLAN', 'true')
    vi.stubEnv('DEV', false)
    stubFetch(jsonResponse(proPlan))

    await expect(fetchProPlan()).resolves.toEqual(proPlan)
  })

  it.each(['false', '1', 'TRUE', ''])('is off unless set to exactly "true" (%j)', async (value) => {
    vi.stubEnv('VITE_DEMO_INVALID_PLAN', value)
    stubFetch(jsonResponse(proPlan))

    await expect(fetchProPlan()).resolves.toEqual(proPlan)
  })
})
