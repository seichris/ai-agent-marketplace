import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { config as loadDotenv } from "dotenv";

import { createProviderSiteSession, submitProviderService, syncProviderSpec } from "./packages/cli/src/provider.ts";

loadDotenv({ path: resolve(process.cwd(), ".env"), override: false, quiet: true });

const sourceApiUrl = "https://fastapi.8o.vc";
const targetApiUrl = "https://api.marketplace.fast.xyz";
const tmpDir = resolve(process.cwd(), ".tmp", "external-sync-specs");

mkdirSync(tmpDir, { recursive: true });

const slugs = [
  "stableemail",
  "stableenrich",
  "stableenrich-apollo",
  "stableenrich-clado",
  "stableenrich-exa",
  "stableenrich-firecrawl",
  "stableenrich-google-maps",
  "stableenrich-hunter",
  "stableenrich-influencer",
  "stableenrich-reddit",
  "stableenrich-serper",
  "stableenrich-whitepages",
  "stablesocial",
  "stablesocial-facebook",
  "stablesocial-instagram",
  "stablesocial-reddit",
  "stablesocial-tiktok",
  "stablestudio",
  "stableupload",
  "zapper-x402",
];

function normalizeSetupInstructions(detail) {
  const base = [
    "Review the provider docs before calling any endpoint.",
    "Authenticate directly with the provider as required by the provider.",
  ];

  const prompt = typeof detail.useThisServicePrompt === "string" ? detail.useThisServicePrompt : "";
  const extra = [];
  for (const line of prompt.split("\n")) {
    const trimmed = line.trim().replace(/^\d+\.\s*/, "");
    if (!trimmed) continue;
    if (
      trimmed.startsWith("Review the provider docs") ||
      trimmed.startsWith("Authenticate directly with")
    ) {
      extra.push(trimmed);
    }
  }

  const deduped = [...new Set([...base, ...extra])];
  return deduped.slice(0, 10);
}

function buildSpec(detail) {
  return {
    profile: {
      displayName: detail.summary.ownerName || "Fast Marketplace Providers",
      bio: "Marketplace-operated provider account for curated external API listings.",
      websiteUrl: detail.websiteUrl || "https://marketplace.fast.xyz",
      contactEmail: "marketplace@fast.xyz",
    },
    service: {
      serviceType: "external_registry",
      slug: detail.summary.slug,
      name: detail.summary.name,
      tagline: detail.summary.tagline,
      about: detail.about,
      categories: detail.summary.categories,
      promptIntro:
        typeof detail.useThisServicePrompt === "string" && detail.useThisServicePrompt.trim().length > 0
          ? detail.useThisServicePrompt.split("\n")[0].trim()
          : `Use this listing to discover ${detail.summary.name} endpoints.`,
      setupInstructions: normalizeSetupInstructions(detail),
      websiteUrl: detail.websiteUrl || detail.summary.websiteUrl || null,
      payoutWallet: null,
    },
    endpoints: detail.endpoints.map((endpoint) => ({
      endpointType: "external_registry",
      title: endpoint.title,
      description: endpoint.description,
      method: endpoint.method,
      publicUrl: endpoint.publicUrl,
      docsUrl: endpoint.docsUrl,
      authNotes: endpoint.authNotes,
      requestExample: endpoint.requestExample,
      responseExample: endpoint.responseExample,
      usageNotes: endpoint.usageNotes,
    })),
  };
}

async function run() {
  const results = [];

  for (const slug of slugs) {
    try {
      const detail = await fetch(`${sourceApiUrl}/catalog/services/${slug}`).then(async (response) => {
        if (!response.ok) {
          throw new Error(`source detail fetch failed: ${response.status}`);
        }
        return response.json();
      });

      const spec = buildSpec(detail);
      const specPath = resolve(tmpDir, `${slug}.json`);
      writeFileSync(specPath, `${JSON.stringify(spec, null, 2)}\n`, "utf8");

      const syncResult = await syncProviderSpec({
        specPath,
        apiUrl: targetApiUrl,
        network: "mainnet",
      });

      const submission = await submitProviderService({
        serviceRef: syncResult.service.id,
        apiUrl: targetApiUrl,
        network: "mainnet",
      });

      const result = {
        slug,
        status: "submitted",
        serviceId: syncResult.service.id,
        submissionStatus: submission.status,
      };
      results.push(result);
      console.log(JSON.stringify(result));
    } catch (error) {
      const result = {
        slug,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      };
      results.push(result);
      console.log(JSON.stringify(result));
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

await createProviderSiteSession({ apiUrl: targetApiUrl, network: "mainnet" });
await run();
