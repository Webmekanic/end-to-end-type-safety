using System.Text.Json.Serialization;
using Plans.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Shared Aspire defaults: OpenTelemetry (logs, traces, metrics), health checks,
// service discovery and HTTP resilience. Defined in aspire/ServiceDefaults.
builder.AddServiceDefaults();

// ASP.NET Core's web defaults accept numbers written as strings ("29.99"), and the
// OpenAPI generator faithfully documents that as `type: [number, string]`.
// Strict handling makes numbers numbers-only, at runtime and in the contract.
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.NumberHandling = JsonNumberHandling.Strict);

// Generates the OpenAPI document from the endpoint metadata below.
builder.Services.AddOpenApi(options =>
{
    // C# decimal is documented as `format: double` by default; `decimal` is accurate.
    options.AddSchemaTransformer((schema, context, _) =>
    {
        if (context.JsonTypeInfo.Type == typeof(decimal))
        {
            schema.Format = "decimal";
        }

        return Task.CompletedTask;
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Serves the contract at /openapi/v1.json.
    app.MapOpenApi();
}

// Maps /health and /alive (Development only).
app.MapDefaultEndpoints();

var plans = app.MapGroup("/api/plans").WithTags("Plans");

// TypedResults.Ok<Plan> tells OpenAPI this endpoint returns 200 with a Plan body.
plans.MapGet("/pro", () => TypedResults.Ok(new Plan
    {
        Name = "Pro",
        Price = 29.99m,
        Currency = "USD",
    }))
    .WithName("GetProPlan")
    .WithSummary("Get the Pro subscription plan");

app.Run();
