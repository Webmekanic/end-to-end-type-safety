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
│   │   ├── api/               API client code (generated OpenAPI client lands here, Milestone 6)
│   │   ├── components/        UI components (Milestone 3)
│   │   ├── schemas/           Zod runtime schemas (Milestone 5)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/                 Vitest tests
│   └── package.json
├── backend/
│   └── Plans.Api/             ASP.NET Core minimal API
│       ├── Program.cs
│       ├── Models/            C# contract types (Milestone 2)
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
| API on its own | `dotnet run --project backend/Plans.Api` | `GET /health` returns `Healthy` in Development. |
| Frontend on its own | `cd frontend && npm run dev` | <http://localhost:5173> |

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
2. ASP.NET Core API and OpenAPI
3. TypeScript frontend
4. Reproducible contract-mismatch demonstration
5. Zod runtime validation and tests
6. Generated TypeScript API client
7. Aspire integration, observability and demo documentation
