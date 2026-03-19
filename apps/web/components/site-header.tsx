import React from "react";
import Link from "next/link";
import type { MarketplaceDeploymentNetwork } from "@marketplace/shared";

import { WalletLoginButton } from "@/components/wallet-login-button";

export function SiteHeader({
  apiBaseUrl,
  deploymentNetwork,
  networkLabel
}: {
  apiBaseUrl: string;
  deploymentNetwork: MarketplaceDeploymentNetwork;
  networkLabel: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 md:px-10 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted text-sm font-semibold">
            F
          </span>
          <div>
            <div className="text-sm font-semibold">Fast Marketplace</div>
            <div className="text-xs text-muted-foreground">Paid APIs for agents</div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Marketplace
          </Link>
          <Link
            href="/suggest"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Suggest
          </Link>
          <Link
            href="/skill.md"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            SKILL.md
          </Link>
        </nav>

        <div className="self-stretch lg:self-auto">
          <WalletLoginButton
            apiBaseUrl={apiBaseUrl}
            deploymentNetwork={deploymentNetwork}
            networkLabel={networkLabel}
          />
        </div>
      </div>
    </header>
  );
}
