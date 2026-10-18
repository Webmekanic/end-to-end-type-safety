import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../src/App.tsx'
import { jsonResponse, proPlan, stubFetch } from './helpers.ts'

const stringPricePlan = { ...proPlan, price: '29.99' }

describe('App', () => {
  it('shows a loading state, then the plan name and formatted price', async () => {
    stubFetch(jsonResponse(proPlan))

    render(<App />)

    expect(screen.getByRole('status').textContent).toContain('Loading plan')
    expect(await screen.findByRole('heading', { name: 'Pro' })).toBeTruthy()
    expect(screen.getByText('$29.99')).toBeTruthy()
  })

  it('shows a visible error when the API request fails', async () => {
    stubFetch(jsonResponse({}, 500))

    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain("We couldn't load the plan.")
    expect(alert.textContent).toContain('HTTP 500')
    expect(screen.queryByText('$29.99')).toBeNull()
  })

  it('shows a friendly error instead of crashing when the plan fails validation', async () => {
    stubFetch(jsonResponse(stringPricePlan))

    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('The server sent an invalid plan response.')
    expect(alert.textContent).toContain('price: Invalid input: expected number, received string')
    // The rest of the page is still rendered: the app did not unmount.
    expect(screen.getByRole('heading', { name: 'Choose your plan' })).toBeTruthy()
  })

  it('retries after an HTTP error and shows the plan when it succeeds', async () => {
    const fetchMock = stubFetch(jsonResponse({}, 500), jsonResponse(proPlan))

    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('$29.99')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries after a validation error and recovers when the next response is valid', async () => {
    const fetchMock = stubFetch(jsonResponse(stringPricePlan), jsonResponse(proPlan))

    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('$29.99')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
