import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/ and https://vitest.dev/config/
export default defineConfig(({ mode }) => {
  // Reads API_URL from the shell or from .env / .env.local. No VITE_ prefix, so it
  // stays in this Node process and is never bundled into browser code.
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.API_URL || 'http://localhost:5248'

  return {
    plugins: [react()],
    server: {
      // The browser calls /api/... on the Vite origin; Vite forwards it to the API.
      // Same origin for the browser, so no CORS configuration is needed in development.
      proxy: {
        '/api': { target: apiUrl, changeOrigin: true },
      },
    },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.{ts,tsx}'],
      setupFiles: ['tests/setup.ts'],
      unstubGlobals: true,
      unstubEnvs: true,
    },
  }
})
