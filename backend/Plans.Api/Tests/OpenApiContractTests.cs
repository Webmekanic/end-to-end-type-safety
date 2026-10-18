using System.Net;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Plans.Api.Tests;

// Guards the documented contract that the TypeScript client will be generated from.
public class OpenApiContractTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private async Task<JsonElement> GetOpenApiDocumentAsync()
    {
        var response = await factory.CreateClient().GetAsync("/openapi/v1.json");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        return JsonDocument.Parse(json).RootElement;
    }

    [Fact]
    public async Task Document_describes_the_pro_plan_endpoint()
    {
        var document = await GetOpenApiDocumentAsync();

        var schemaRef = document
            .GetProperty("paths")
            .GetProperty("/api/plans/pro")
            .GetProperty("get")
            .GetProperty("responses")
            .GetProperty("200")
            .GetProperty("content")
            .GetProperty("application/json")
            .GetProperty("schema")
            .GetProperty("$ref")
            .GetString();

        Assert.Equal("#/components/schemas/Plan", schemaRef);
    }

    [Fact]
    public async Task Plan_schema_describes_price_as_a_required_decimal_number()
    {
        var document = await GetOpenApiDocumentAsync();
        var plan = document.GetProperty("components").GetProperty("schemas").GetProperty("Plan");

        var price = plan.GetProperty("properties").GetProperty("price");
        var required = plan.GetProperty("required").EnumerateArray().Select(e => e.GetString());

        // A plain "number", not ["number", "string"]: the contract must not permit string prices.
        Assert.Equal(JsonValueKind.String, price.GetProperty("type").ValueKind);
        Assert.Equal("number", price.GetProperty("type").GetString());
        Assert.Equal("decimal", price.GetProperty("format").GetString());
        Assert.Equal(["name", "price", "currency"], required);
    }

    [Fact]
    public async Task Committed_contract_matches_the_live_document()
    {
        var response = await factory.CreateClient().GetAsync("/openapi/v1.json");
        var live = JsonNode.Parse(await response.Content.ReadAsStringAsync())!.AsObject();
        var committed = JsonNode.Parse(await File.ReadAllTextAsync(FindCommittedContract()));

        // The export script drops `servers` (host/port specific); compare everything else.
        live.Remove("servers");

        Assert.True(
            JsonNode.DeepEquals(live, committed),
            "contracts/openapi.json is out of date. Start the API and run "
                + "`npm run contract:export && npm run contract:generate` in frontend/.");
    }

    private static string FindCommittedContract()
    {
        for (var dir = new DirectoryInfo(AppContext.BaseDirectory); dir is not null; dir = dir.Parent)
        {
            var path = Path.Combine(dir.FullName, "contracts", "openapi.json");
            if (File.Exists(path)) return path;
        }

        throw new FileNotFoundException("contracts/openapi.json not found above " + AppContext.BaseDirectory);
    }
}
