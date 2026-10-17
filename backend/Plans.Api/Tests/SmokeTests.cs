using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Plans.Api.Tests;

// Boots the real API in memory and checks that it starts with ServiceDefaults wired up.
public class SmokeTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Health_endpoint_returns_ok()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
