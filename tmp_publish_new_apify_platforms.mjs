import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { config as loadDotenv } from "dotenv";

import { createProviderSiteSession, submitProviderService, syncProviderSpec } from "./packages/cli/src/provider.ts";

loadDotenv({ path: resolve(process.cwd(), ".env"), override: false, quiet: true });

const cwd = process.cwd();
const apiUrl = process.env.MARKETPLACE_API_BASE_URL;
const adminToken = process.env.MARKETPLACE_ADMIN_TOKEN;

if (!apiUrl) {
  throw new Error("MARKETPLACE_API_BASE_URL is required.");
}

if (!adminToken) {
  throw new Error("MARKETPLACE_ADMIN_TOKEN is required.");
}

const entries = [
  {
    name: "google-play",
    appUuid: "z12kjhgf8z1m8lnzs490n5v3",
    specPath: "apps/apify-service/specs/google-play.mainnet.template.json",
  },
  {
    name: "appstore",
    appUuid: "n11n4cpvaxn2lrh6x6nnmrt3",
    specPath: "apps/apify-service/specs/appstore.mainnet.template.json",
  },
  {
    name: "google-search",
    appUuid: "irfj8s8zx3c4ew3qc3bccbsp",
    specPath: "apps/apify-service/specs/google-search.mainnet.template.json",
  },
  {
    name: "trustpilot",
    appUuid: "lgqtrowjqpzssomrfdxnlgg3",
    specPath: "apps/apify-service/specs/trustpilot.mainnet.template.json",
  },
  {
    name: "reddit-community",
    appUuid: "xzbynx0ex00txpfc50sl1jkc",
    specPath: "apps/apify-service/specs/reddit-community.mainnet.template.json",
  },
];

function runCoolify(args) {
  return execFileSync("coolify", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
}

function parseLastJson(output) {
  const lines = output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("{") || line.startsWith("["));
  if (lines.length === 0) {
    throw new Error(`No JSON found in output:\n${output}`);
  }
  return JSON.parse(lines.at(-1));
}

function getApp(appUuid) {
  return parseLastJson(runCoolify(["app", "get", appUuid, "--format", "json"]));
}

function getAppDeployments(appUuid) {
  return parseLastJson(runCoolify(["app", "deployments", "list", appUuid, "--format", "json"]));
}

function getAppEnv(appUuid) {
  return parseLastJson(runCoolify(["app", "env", "list", appUuid, "--show-sensitive", "--format", "json"]));
}

function upsertAppEnv(appUuid, key, value) {
  const existing = getAppEnv(appUuid).find((item) => item.key === key);
  if (existing) {
    runCoolify(["app", "env", "delete", appUuid, existing.uuid, "--force"]);
    runCoolify([
      "app",
      "env",
      "create",
      appUuid,
      "--key",
      key,
      "--value",
      String(value),
      "--runtime",
    ]);
    return;
  }
  runCoolify([
    "app",
    "env",
    "create",
    appUuid,
    "--key",
    key,
    "--value",
    String(value),
    "--runtime",
  ]);
}

function deployApp(appUuid) {
  runCoolify(["app", "deploy", appUuid]);
}

async function waitForAppHealthy(appUuid, timeoutMs = 240_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const app = getApp(appUuid);
    if (app.status === "running:healthy") {
      return app;
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 5000));
  }
  throw new Error(`Timed out waiting for app ${appUuid} to become healthy.`);
}

async function sleep(ms) {
  await new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function waitForPublicProof(expectedUrl, expectedToken, timeoutMs = 600_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(expectedUrl);
      const body = (await response.text()).trim();
      if (response.ok && body === expectedToken) {
        return;
      }
    } catch {
      // Keep polling until the public host serves the new proof.
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
    } catch (error) {
      throw new Error(
        `${init.method ?? "GET"} ${path} returned non-JSON ${response.status}: ${text.slice(0, 200)}`,
      );
    }
  }
  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} failed: ${response.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function publishService(serviceId) {
  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/internal/provider-services/${serviceId}/publish`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${adminToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      reviewerIdentity: "codex",
      settlementMode: "verified_escrow",
    }),
  });
  const text = await response.text();
  let body = null;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error(`Publish failed for ${serviceId}: non-JSON ${response.status}: ${text.slice(0, 200)}`);
    }
  }
  if (!response.ok) {
    throw new Error(`Publish failed for ${serviceId}: ${response.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function processEntry(entry) {
  const serviceApp = getApp(entry.appUuid);
  if (serviceApp.status !== "running:healthy") {
    return {
      name: entry.name,
      status: "skipped",
      reason: `app not healthy: ${serviceApp.status}`,
    };
  }

  const spec = JSON.parse(readFileSync(resolve(cwd, entry.specPath), "utf8"));
  const syncResult = await syncProviderSpec({
    specPath: resolve(cwd, entry.specPath),
    apiUrl,
    network: "mainnet",
  });

  const session = await createProviderSiteSession({
    apiUrl,
    network: "mainnet",
  });

  const challenge = await providerRequest(
    session,
    `/provider/services/${syncResult.service.id}/verification-challenge`,
    { method: "POST" },
  );

  upsertAppEnv(entry.appUuid, "APIFY_SITE_PROOF", challenge.token);
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

  const published = await publishService(syncResult.service.id);

  return {
    name: entry.name,
    status: "published",
    serviceId: syncResult.service.id,
    slug: spec.service.slug,
    verificationId: challenge.verificationId,
    verificationStatus: verification?.status ?? null,
    submissionStatus: submission.status,
    publishedSettlementMode: published?.service?.settlementMode ?? null,
  };
}

const results = [];
const selectedEntries = process.env.APIFY_PUBLISH_ONLY
  ? entries.filter((entry) => process.env.APIFY_PUBLISH_ONLY.split(",").includes(entry.name))
  : entries;

for (const entry of selectedEntries) {
  try {
    const result = await processEntry(entry);
    results.push(result);
    console.log(JSON.stringify(result));
  } catch (error) {
    const failure = {
      name: entry.name,
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    };
    results.push(failure);
    console.log(JSON.stringify(failure));
  }
}

console.log(JSON.stringify(results, null, 2));
