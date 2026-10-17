var builder = WebApplication.CreateBuilder(args);

// Shared Aspire defaults: OpenTelemetry (logs, traces, metrics), health checks,
// service discovery and HTTP resilience. Defined in aspire/ServiceDefaults.
builder.AddServiceDefaults();

var app = builder.Build();

// Maps /health and /alive (Development only).
app.MapDefaultEndpoints();

// Subscription plan endpoints and the OpenAPI document are added in Milestone 2.

app.Run();
