using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Plans.Api.Tests;

// Checks the actual JSON on the wire, not a deserialized C# object,
// because the frontend only ever sees the raw JSON.
public class PlansEndpointTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private async Task<(HttpResponseMessage Response, JsonElement Body)> GetProPlanAsync()
    {
        var response = await factory.CreateClient().GetAsync("/api/plans/pro");
        var json = await response.Content.ReadAsStringAsync();
        return (response, JsonDocument.Parse(json).RootElement);
    }

    [Fact]
    public async Task Get_pro_plan_returns_200_with_json()
    {
        var (response, _) = await GetProPlanAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Get_pro_plan_returns_expected_name_and_currency()
    {
        var (_, body) = await GetProPlanAsync();

        Assert.Equal("Pro", body.GetProperty("name").GetString());
        Assert.Equal("USD", body.GetProperty("currency").GetString());
    }

    [Fact]
    public async Task Get_pro_plan_serializes_price_as_a_json_number()
    {
        var (_, body) = await GetProPlanAsync();

        var price = body.GetProperty("price");

        Assert.Equal(JsonValueKind.Number, price.ValueKind);
        Assert.Equal(29.99m, price.GetDecimal());
    }
}
