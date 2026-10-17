namespace Plans.Api.Models;

// The response contract for a subscription plan.
// `required` makes every property mandatory in the OpenAPI schema, so generated
// TypeScript types won't mark them optional.
public sealed record Plan
{
    public required string Name { get; init; }

    public required decimal Price { get; init; }

    public required string Currency { get; init; }
}
