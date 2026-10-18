var builder = DistributedApplication.CreateBuilder(args);

// The ASP.NET Core API. Endpoints come from its launchSettings.json; /health is
// mapped by ServiceDefaults and tells Aspire when the API is actually ready.
var api = builder.AddProject<Projects.Plans_Api>("plans-api")
    .WithHttpHealthCheck("/health");

// The Vite dev server (npm run dev). Aspire assigns its port and passes it to Vite.
// API_URL is read by vite.config.ts on the server side to proxy /api to the API;
// it is never exposed to browser code.
builder.AddViteApp("frontend", "../../frontend")
    .WithEnvironment("API_URL", api.GetEndpoint("http"))
    .WaitFor(api);

builder.Build().Run();
