import { describe, expect, it } from 'vitest'
import { fetchProPlan } from '../src/api/plans.ts'
import { jsonResponse, proPlan, stubFetch } from './helpers.ts'

describe('fetchProPlan', () => {
  it('requests the Pro plan through the relative /api path', async () => {
    const fetchMock = stubFetch(jsonResponse(proPlan))

    await fetchProPlan()

    expect(fetchMock).toHaveBeenCalledWith('/api/plans/pro', expect.anything())
  })

  it('returns the parsed plan on success', async () => {
    stubFetch(jsonResponse(proPlan))

    await expect(fetchProPlan()).resolves.toEqual(proPlan)
  })

  it('rejects with the HTTP status for non-success responses', async () => {
    stubFetch(jsonResponse({ title: 'Service Unavailable' }, 503))

    await expect(fetchProPlan()).rejects.toThrow('Failed to load plan (HTTP 503)')
  })
})
