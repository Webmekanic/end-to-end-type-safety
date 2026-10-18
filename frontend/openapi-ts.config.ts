import { defineConfig } from '@hey-api/openapi-ts'

// Generates TypeScript types (no runtime client) from the committed contract.
// Run with: npm run contract:generate
export default defineConfig({
  input: '../contracts/openapi.json',
  output: 'src/api/generated',
  plugins: ['@hey-api/typescript'],
})
