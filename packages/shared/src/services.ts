import { getDefaultMarketplaceNetworkConfig, type MarketplaceNetworkConfig } from "./network.js";
import { buildSeededPublishedServiceVersions } from "./seed.js";
import type { ServiceDefinition } from "./types.js";

export const marketplaceServices: ServiceDefinition[] = buildSeededPublishedServiceVersions();

export function listServiceDefinitions(
  config: MarketplaceNetworkConfig = getDefaultMarketplaceNetworkConfig()
): ServiceDefinition[] {
  return buildSeededPublishedServiceVersions(config);
}

export function findMarketplaceServiceBySlug(
  slug: string,
  config: MarketplaceNetworkConfig = getDefaultMarketplaceNetworkConfig()
): ServiceDefinition | undefined {
  return listServiceDefinitions(config).find((service) => service.slug === slug);
}
