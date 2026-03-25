import { ProviderOnboard } from "@/components/provider-onboard";
import { getClientApiBaseUrl } from "@/lib/api-base-url";
import { resolveWebDeploymentNetwork } from "@/lib/network";

export const dynamic = "force-dynamic";

export default function ProviderOnboardPage() {
  const apiBaseUrl = getClientApiBaseUrl();
  const deploymentNetwork = resolveWebDeploymentNetwork(process.env.MARKETPLACE_FAST_NETWORK).deploymentNetwork;

  return (
    <main className="page-shell">
      <section className="section-sep">
        <div className="section-container section-stack">
          <ProviderOnboard apiBaseUrl={apiBaseUrl} deploymentNetwork={deploymentNetwork} />
        </div>
      </section>
    </main>
  );
}
