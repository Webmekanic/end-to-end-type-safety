import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from '../src/App.tsx'

// Smoke test: proves the TypeScript + React + Vitest toolchain is wired up.
describe('App', () => {
  it('renders the page heading', () => {
    const html = renderToString(<App />)

    expect(html).toContain('Subscription Plans')
  })
})
