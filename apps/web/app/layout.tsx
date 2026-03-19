import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { resolveWebDeploymentNetwork } from "@/lib/network";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fast Marketplace",
  description: "Fast-native agent marketplace for paid APIs, skills, and source suggestions."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const apiBaseUrl = process.env.MARKETPLACE_API_BASE_URL ?? "http://localhost:3000";
  const network = resolveWebDeploymentNetwork(process.env.MARKETPLACE_FAST_NETWORK);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
          enableSystem={false}
          themes={["light", "dark"]}
        >
          <div className="flex min-h-screen flex-col">
            <SiteHeader
              apiBaseUrl={apiBaseUrl}
              deploymentNetwork={network.deploymentNetwork}
              networkLabel={network.networkLabel}
            />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
