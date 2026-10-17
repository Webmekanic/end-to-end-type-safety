# End-to-End Type Safety

Demo for the Frontend Nation TypeScript Day
**"End-to-End Type Safety: Building Reliable TypeScript Applications with .NET Aspire."**

A minimal subscription-plan app: a React + TypeScript frontend consuming an ASP.NET Core API,
orchestrated locally by .NET Aspire. The talk walks through why `response.json() as Plan` is not
validation, how a contract mismatch crashes the UI, and how Zod, OpenAPI-generated types and Aspire
each play a different role.

## Prerequisites

| Tool | Version | Pinned by |
| --- | --- | --- |
| .NET SDK | 10.0.402 (or a later 10.0.x feature band) | [`global.json`](global.json) |
| Node.js | 24.22.0 (LTS) | [`.nvmrc`](.nvmrc) |
| npm | 11.x (ships with Node 24) | |
| Aspire CLI | 13.6.1 | `dotnet tool install -g Aspire.Cli --version 13.6.1` |

Install the Aspire CLI as a .NET global tool. Make sure `~/.dotnet/tools` is on your `PATH`.
On macOS, `/etc/paths.d/dotnet-cli-tools` contains an unexpanded `~`, so add
`export PATH="$PATH:$HOME/.dotnet/tools"` to `~/.zprofile`.

The ASP.NET Core HTTPS development certificate must be trusted (`dotnet dev-certs https --trust`).
Aspire's dashboard runs over HTTPS by default.

No Docker, database or cloud account is required.

## Repository layout

```text
end-to-end-type-safety/
├── frontend/                  React + TypeScript + Vite app
│   ├── src/
│   │   ├── api/               Plan type + fetch function (generated client replaces it, Milestone 6)
│   │   ├── components/        PlanCard and price formatting
│   │   ├── schemas/           Zod runtime schemas (Milestone 5)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/                 Vitest tests
│   └── package.json
├── backend/
│   └── Plans.Api/             ASP.NET Core minimal API
│       ├── Program.cs
│       ├── Models/            C# response contract (Plan.cs)
│       └── Tests/             xUnit tests (excluded from the API build in Plans.Api.csproj)
├── aspire/
│   ├── AppHost/               Aspire orchestrator: starts the API and frontend, hosts the dashboard
│   └── ServiceDefaults/       Shared OpenTelemetry, health checks, service discovery, resilience
├── EndToEndTypeSafety.slnx    .NET solution (XML .slnx format, default in .NET 10)
├── aspire.config.json         Lets `aspire run` find the AppHost from the repo root
├── global.json                .NET SDK pin
├── .nvmrc                     Node pin
└── .editorconfig
```

## Getting started

```bash
nvm use                       # picks up .nvmrc
cd frontend && npm install && cd ..
dotnet build
```

## Running

| What | Command | Notes |
| --- | --- | --- |
| Aspire AppHost + dashboard | `aspire run` (from repo root) | Prints a dashboard login URL. The AppHost has no resources yet. |
| API on its own | `dotnet run --project backend/Plans.Api` | Listens on <http://localhost:5248> (`http` launch profile). |
| Frontend on its own | `cd frontend && npm run dev` | <http://localhost:5173> |

### Running the app (API + frontend)

Until Aspire orchestrates both (Milestone 7), start them in two terminals from the repo root:

```bash
# Terminal 1 — API
dotnet run --project backend/Plans.Api
```

```bash
# Terminal 2 — frontend
nvm use
cd frontend
npm install        # first time only
npm run dev
```

Open <http://localhost:5173>. You should see a "Choose your plan" page with a Pro card priced
**$29.99**. If the API isn't running, the page shows an error with a **Try again** button.

## Frontend

The frontend is a React 19 + TypeScript + Vite single page that fetches one plan from the API and
renders it. Requires Node 24.22.0 (`nvm use` reads [`.nvmrc`](.nvmrc)).

| File | Role |
| --- | --- |
| [`src/api/plans.ts`](frontend/src/api/plans.ts) | `Plan` type and `fetchProPlan()`: all HTTP concerns live here |
| [`src/App.tsx`](frontend/src/App.tsx) | Loading / error / success state and the retry action |
| [`src/components/PlanCard.tsx`](frontend/src/components/PlanCard.tsx) | Presentational plan card |
| [`src/components/formatPrice.ts`](frontend/src/components/formatPrice.ts) | `29.99, "USD"` → `$29.99` |
| [`vite.config.ts`](frontend/vite.config.ts) | Dev-server proxy and Vitest configuration |

### Development proxy

The browser only ever calls relative URLs such as `/api/plans/pro` on the Vite origin
(`localhost:5173`). The Vite dev server forwards every `/api/*` request to the API, so the
browser sees a single origin and no CORS setup is needed.

The proxy target comes from `API_URL` and defaults to `http://localhost:5248`. To point it
elsewhere, set it in the shell (`API_URL=http://localhost:5299 npm run dev`) or copy
[`frontend/.env.example`](frontend/.env.example) to `frontend/.env.local`. `API_URL` has no
`VITE_` prefix, so it is only read by the dev server and never bundled into browser code.

If the API is down, the proxy returns `502`, which the page shows as an error.

### The type is trusted, not checked (intentional)

`fetchProPlan()` currently does:

```ts
const plan = (await response.json()) as Plan
```

`as Plan` is a compile-time assertion. TypeScript believes it, but nothing checks the JSON at
runtime. The `Plan` type is also hand-written, so nothing ties it to the API's OpenAPI contract.
This is deliberate: the next milestones break the response on purpose to show why that matters,
and then replace the assertion with runtime validation.

### Frontend tests and build

From `frontend/`:

```bash
npm test          # Vitest + React Testing Library (jsdom); fetch is mocked, no API needed
npm run lint      # oxlint
npm run build     # tsc -b type check + Vite production build into dist/
```

### API endpoints

With the API running via `dotnet run --project backend/Plans.Api`:

| Endpoint | URL | Notes |
| --- | --- | --- |
| Pro plan | <http://localhost:5248/api/plans/pro> | `{"name":"Pro","price":29.99,"currency":"USD"}` |
| OpenAPI document | <http://localhost:5248/openapi/v1.json> | OpenAPI 3.1, Development only |
| Health | <http://localhost:5248/health> | Returns `Healthy`, Development only |
| Liveness | <http://localhost:5248/alive> | Development only |

The `https` profile (`dotnet run --project backend/Plans.Api --launch-profile https`) serves the
same paths on <https://localhost:7043>.

### The API contract

The OpenAPI document is generated at runtime by `Microsoft.AspNetCore.OpenApi` from the C# model
[`Plan`](backend/Plans.Api/Models/Plan.cs) and the endpoint metadata in
[`Program.cs`](backend/Plans.Api/Program.cs). The `Plan` schema is:

```json
{
  "required": ["name", "price", "currency"],
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "price": { "type": "number", "format": "decimal" },
    "currency": { "type": "string" }
  }
}
```

Two settings in `Program.cs` keep this contract precise:

- **`JsonNumberHandling.Strict`**: ASP.NET Core's default web JSON options also accept numbers
  sent as strings, so without this the schema documents `price` as `type: ["number", "string"]`.
- **A decimal schema transformer**: C# `decimal` is documented as `format: double` by default.
  The transformer changes it to `format: decimal`.

`backend/Plans.Api/Tests/OpenApiContractTests.cs` fails if either setting regresses.

## Testing and checks

```bash
# Backend
dotnet build
dotnet test

# Frontend (from frontend/)
npm run lint
npm test          # Vitest, single run
npm run build     # tsc -b type check + Vite production build
```

## What each piece is responsible for

These roles stay separate throughout the demo:

- **TypeScript types** (hand-written or OpenAPI-generated) check code at **compile time only**.
  They disappear at runtime and cannot detect a malformed response.
- **Zod schemas** check data at **runtime**, at the boundary where JSON enters the app.
- **OpenAPI** is the documented contract. Generating TypeScript from it reduces drift between
  backend and frontend, but it is still compile-time assistance, not validation.
- **.NET Aspire** orchestrates local development (startup, wiring, logs, traces). It makes failures
  easy to *observe*, but it does not itself guarantee type safety.

## Milestones

1. **Project foundation** ✅
2. **ASP.NET Core API and OpenAPI** ✅
3. **TypeScript frontend** ✅
4. Reproducible contract-mismatch demonstration
5. Zod runtime validation and tests
6. Generated TypeScript API client
7. Aspire integration, observability and demo documentation
