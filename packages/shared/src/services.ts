import type { ServiceDefinition } from "./types.js";

export const marketplaceServices: ServiceDefinition[] = [
  {
    slug: "mock-research-signals",
    name: "Mock Research Signals",
    ownerName: "Fast Marketplace",
    tagline: "Synthetic paid research endpoints for testing Fast-native agent purchases.",
    about:
      "Mock Research Signals is the sandbox service for the Fast Marketplace. It gives buyers a paid sync endpoint for instant insights and a paid async endpoint for longer-running reports, so wallets, x402 retries, polling, and refunds can all be tested against a stable surface.",
    categories: ["Research", "Testing", "Developer Tools"],
    routeIds: ["mock.quick-insight.v1", "mock.async-report.v1"],
    featured: true,
    promptIntro: 'I want to use the "Mock Research Signals" service on Fast Marketplace.',
    setupInstructions: [
      "Review the Fast Marketplace skill and wallet setup instructions.",
      "Use the x402-paid trigger routes below from a funded Fast wallet.",
      "For async routes, keep the returned job token and poll the result later from the same wallet."
    ]
  }
];

export function listServiceDefinitions(): ServiceDefinition[] {
  return marketplaceServices;
}

export function findMarketplaceServiceBySlug(slug: string): ServiceDefinition | undefined {
  return marketplaceServices.find((service) => service.slug === slug);
}
