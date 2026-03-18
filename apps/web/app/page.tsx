import { MarketplaceHome } from "@/components/marketplace-home";
import { fetchServices } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const services = await fetchServices();

  return <MarketplaceHome services={services} />;
}
