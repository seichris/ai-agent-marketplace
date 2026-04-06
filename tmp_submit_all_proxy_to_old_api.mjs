import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { config as loadDotenv } from "dotenv";

import { createProviderSiteSession, submitProviderService, syncProviderSpec } from "./packages/cli/src/provider.ts";

loadDotenv({ path: resolve(process.cwd(), ".env"), override: false, quiet: true });

const cwd = process.cwd();
const apiUrl = "https://api.marketplace.fast.xyz";

const entries = [
  { name: "amazon", appUuid: "p7yqqyk0jpncnrrxqcmxnref", specPath: "apps/apify-service/specs/amazon.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "appstore", appUuid: "n11n4cpvaxn2lrh6x6nnmrt3", specPath: "apps/apify-service/specs/appstore.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "cheerio", appUuid: "hbl9z9w3xmtoyoz1uts1c37d", specPath: "apps/apify-service/specs/cheerio.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "contact-info", appUuid: "uaf8me1bqw128ia9amfhxi3y", specPath: "apps/apify-service/specs/contact-info.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "ecommerce", appUuid: "xjsb3l3ye98cxy3dein97hxo", specPath: "apps/apify-service/specs/ecommerce.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "facebook-ads-library", appUuid: "f11us14wwzfpey5cuusdf0pk", specPath: "apps/apify-service/specs/facebook-ads-library.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "facebook-posts", appUuid: "pb4kspvh7mdfl6me0vkoxk06", specPath: "apps/apify-service/specs/facebook-posts.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "g2-product-reviews", appUuid: "cpzks77eswat7mgkvcauwych", specPath: "apps/apify-service/specs/g2-product-reviews.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "google-places", appUuid: "uojyz8ueysj6fg0msi189nss", specPath: "apps/apify-service/specs/google-places.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "google-play", appUuid: "z12kjhgf8z1m8lnzs490n5v3", specPath: "apps/apify-service/specs/google-play.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "google-search", appUuid: "irfj8s8zx3c4ew3qc3bccbsp", specPath: "apps/apify-service/specs/google-search.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "indeed", appUuid: "f11f8q7k2fl2htwvkkgjdloo", specPath: "apps/apify-service/specs/indeed.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "instagram", appUuid: "v3ozw0tp1y8glrfvuxo5pgy6", specPath: "apps/apify-service/specs/instagram.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "leads-finder", appUuid: "ro0vvjep2oty4u2bt09qu2dk", specPath: "apps/apify-service/specs/leads-finder.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "linkedin-company-employees", appUuid: "kvdwjm0aqkawzm5zdl8vsn3k", specPath: "apps/apify-service/specs/linkedin-company-employees.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "linkedin-jobs", appUuid: "k9wsa0vq7lq9975mj8qutj4l", specPath: "apps/apify-service/specs/linkedin-jobs.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "linkedin-profile", appUuid: "w6vagkry8d2finhaq26k9kly", specPath: "apps/apify-service/specs/linkedin-profile.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "reddit-community", appUuid: "xzbynx0ex00txpfc50sl1jkc", specPath: "apps/apify-service/specs/reddit-community.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "tiktok", appUuid: "rncjdt5vs05awpj19uq6v259", specPath: "apps/apify-service/specs/tiktok.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "trustpilot", appUuid: "lgqtrowjqpzssomrfdxnlgg3", specPath: "apps/apify-service/specs/trustpilot.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "tweet", appUuid: "iuzdrzoswd9m4039q264u5ej", specPath: "apps/apify-service/specs/tweet.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "web-scraper", appUuid: "c10wv3pgkpevrv8vnje1fmsh", specPath: "apps/apify-service/specs/web-scraper.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "website-content-crawler", appUuid: "ih8wkc9s58udj62wtkz3bmyh", specPath: "apps/apify-service/specs/website-content-crawler.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "youtube", appUuid: "kq9h37nr3akz7b02hfjkm19e", specPath: "apps/apify-service/specs/youtube.mainnet.template.json", verificationEnvKey: "APIFY_SITE_PROOF" },
  { name: "tavily-mainnet", appUuid: "demb7fu3t0o47zecwrh8sidj", specPath: "apps/tavily-service/provider-spec.mainnet.template.json", verificationEnvKey: "MARKETPLACE_VERIFICATION_TOKEN" },
];

function runCoolify(args) {
  return execFileSync("coolify", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
}

function parseLastJson(output) {
  const lines = output.split("\n").map((line) => line.trim()).filter((line) => line.startsWith("{") || line.startsWith("["));
  if (lines.length === 0) throw new Error(`No JSON found in output:\n${output}`);
  return JSON.parse(lines.at(-1));
}

function getApp(appUuid) {
  return parseLastJson(runCoolify(["app", "get", appUuid, "--format", "json"]));
}

function getAppEnv(appUuid) {
  return parseLastJson(runCoolify(["app", "env", "list", appUuid, "--show-sensitive", "--format", "json"]));
}

function upsertAppEnv(appUuid, key, value) {
  const existing = getAppEnv(appUuid).find((item) => item.key === key);
  if (existing) {
    runCoolify(["app", "env", "delete", appUuid, existing.uuid, "--force"]);
  }
  runCoolify(["app", "env", "create", appUuid, "--key", key, "--value", String(value), "--runtime"]);
}

function deployApp(appUuid) {
  runCoolify(["app", "deploy", appUuid]);
}

async function sleep(ms) {
  await new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function waitForAppHealthy(appUuid, timeoutMs = 240_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const app = getApp(appUuid);
    if (app.status === "running:healthy") return app;
    await sleep(5000);
  }
  throw new Error(`Timed out waiting for app ${appUuid} to become healthy.`);
}

async function waitForPublicProof(expectedUrl, expectedToken, timeoutMs = 600_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(expectedUrl);
      const body = (await response.text()).trim();
      if (response.ok && body === expectedToken) return;
    } catch {
      // Keep polling.
    }
    await sleep(5000);
  }
  throw new Error(`Timed out waiting for public proof at ${expectedUrl}.`);
}

async function providerRequest(session, path, init = {}) {
  const response = await fetch(`${session.apiUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${session.accessToken}`,
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let body = null;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error(`${init.method ?? "GET"} ${path} returned non-JSON ${response.status}: ${text.slice(0, 200)}`);
    }
  }
  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} failed: ${response.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function processEntry(entry) {
  const serviceApp = getApp(entry.appUuid);
  if (serviceApp.status !== "running:healthy") {
    return { name: entry.name, status: "skipped", reason: `app not healthy: ${serviceApp.status}` };
  }

  const spec = JSON.parse(readFileSync(resolve(cwd, entry.specPath), "utf8"));
  const syncResult = await syncProviderSpec({
    specPath: resolve(cwd, entry.specPath),
    apiUrl,
    network: "mainnet",
  });
  const session = await createProviderSiteSession({ apiUrl, network: "mainnet" });
  const challenge = await providerRequest(
    session,
    `/provider/services/${syncResult.service.id}/verification-challenge`,
    { method: "POST" },
  );

  upsertAppEnv(entry.appUuid, entry.verificationEnvKey, challenge.token);
  deployApp(entry.appUuid);
  await waitForAppHealthy(entry.appUuid);
  await waitForPublicProof(challenge.expectedUrl, challenge.token);

  const verification = await providerRequest(
    session,
    `/provider/services/${syncResult.service.id}/verify`,
    { method: "POST" },
  );
  const submission = await submitProviderService({
    serviceRef: syncResult.service.id,
    apiUrl,
    network: "mainnet",
  });

  return {
    name: entry.name,
    status: "submitted",
    serviceId: syncResult.service.id,
    slug: spec.service.slug,
    verificationId: challenge.verificationId,
    verificationStatus: verification?.status ?? null,
    submissionStatus: submission.status,
  };
}

const results = [];
for (const entry of entries) {
  let result;
  try {
    result = await processEntry(entry);
  } catch (error) {
    result = {
      name: entry.name,
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
  results.push(result);
  console.log(JSON.stringify(result));
}

console.log(JSON.stringify(results, null, 2));
