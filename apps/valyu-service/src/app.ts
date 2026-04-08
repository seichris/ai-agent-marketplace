import express, { type Express } from "express";

import { buildValyuOpenApiDocument, VALYU_PROXY_ROUTES, type ValyuProxyRouteDefinition } from "./openapi.js";

export interface ValyuServiceOptions {
  valyuApiKey: string;
  valyuApiBaseUrl?: string;
  verificationToken?: string | null;
}

const DEFAULT_VALYU_API_BASE_URL = "https://api.valyu.ai";

export function createValyuServiceApp(options: ValyuServiceOptions): Express {
  const app = express();
  const upstreamBaseUrl = normalizeUpstreamBaseUrl(options.valyuApiBaseUrl ?? DEFAULT_VALYU_API_BASE_URL);

  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      upstreamBaseUrl
    });
  });

  app.get("/openapi.json", (_req, res) => {
    res.json(buildValyuOpenApiDocument());
  });

  app.get("/.well-known/fast-marketplace-verification.txt", (_req, res) => {
    if (!options.verificationToken) {
      return res.status(404).type("text/plain").send("Verification token is not configured.");
    }

    return res.type("text/plain").send(options.verificationToken);
  });

  for (const route of VALYU_PROXY_ROUTES) {
    registerProxyRoute(app, route, upstreamBaseUrl, options.valyuApiKey);
  }

  return app;
}

function registerProxyRoute(
  app: Express,
  route: ValyuProxyRouteDefinition,
  upstreamBaseUrl: string,
  valyuApiKey: string
): void {
  const handler = async (req: express.Request, res: express.Response) => {
    const upstreamUrl = resolveUpstreamUrl(upstreamBaseUrl, route.upstreamPath);

    let response: globalThis.Response;
    try {
      response = await fetch(upstreamUrl, {
        method: route.method,
        headers: {
          "X-API-Key": valyuApiKey,
          "content-type": "application/json"
        },
        body: JSON.stringify(req.body ?? {})
      });
    } catch (error) {
      return res.status(502).json({
        error: error instanceof Error ? error.message : "Valyu request failed."
      });
    }

    const body = await safeResponseBody(response);
    const contentType = response.headers.get("content-type") ?? "application/json";
    return res.status(response.status).type(contentType).send(body);
  };
  app.post(route.path, handler);
}

function normalizeUpstreamBaseUrl(input: string): string {
  return new URL(input).toString().replace(/\/+$/, "");
}

function resolveUpstreamUrl(baseUrl: string, upstreamPath: string): string {
  const normalizedPath = upstreamPath.replace(/^\/+/, "");
  const resolved = new URL(baseUrl);
  const basePath = resolved.pathname.replace(/\/+$/, "");
  resolved.pathname = `${basePath}/${normalizedPath}`.replace(/\/{2,}/g, "/");
  return resolved.toString();
}

async function safeResponseBody(response: globalThis.Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}
