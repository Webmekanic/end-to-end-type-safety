// Saves the running API's OpenAPI document to contracts/openapi.json.
// Usage (API must be running): npm run contract:export
// Override the API location with API_URL (same variable the Vite proxy uses).
import { writeFile } from 'node:fs/promises'

const apiUrl = process.env.API_URL || 'http://localhost:5248'
const source = new URL('/openapi/v1.json', apiUrl)
const target = new URL('../../contracts/openapi.json', import.meta.url)

const response = await fetch(source).catch((error) => {
  const reason = error.cause?.code ?? error.cause?.errors?.[0]?.code ?? error.message
  console.error(`Could not reach ${source} (${reason}). Is the API running?`)
  process.exit(1)
})
if (!response.ok) {
  console.error(`GET ${source} returned HTTP ${response.status}`)
  process.exit(1)
}

const document = await response.json()

// ASP.NET Core fills `servers` from the request's host and port. It isn't part of the
// contract and would make the file change depending on how the API was started.
delete document.servers

await writeFile(target, `${JSON.stringify(document, null, 2)}\n`)
console.log(`Wrote ${target.pathname} from ${source}`)
