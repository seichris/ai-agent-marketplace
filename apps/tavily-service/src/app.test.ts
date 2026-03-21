import request from "supertest";
import { describe, expect, it, vi, afterEach } from "vitest";

import { createTavilyServiceApp } from "./app.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("tavily service", () => {
  it.each([
    {
      path: "/search",
      upstreamUrl: "https://api.tavily.com/search",
      requestBody: { query: "fast" },
      responseBody: { query: "fast", results: [] }
    },
    {
      path: "/extract",
      upstreamUrl: "https://api.tavily.com/extract",
      requestBody: { urls: ["https://example.com/article"] },
      responseBody: { results: [{ url: "https://example.com/article", raw_content: "Article text" }] }
    },
    {
      path: "/crawl",
      upstreamUrl: "https://api.tavily.com/crawl",
      requestBody: { url: "https://example.com/docs" },
      responseBody: { base_url: "https://example.com/docs", results: [] }
    },
    {
      path: "/map",
      upstreamUrl: "https://api.tavily.com/map",
      requestBody: { url: "https://example.com/docs" },
      responseBody: { base_url: "https://example.com/docs", results: ["https://example.com/docs"] }
    }
  ])("forwards $path requests to Tavily with the configured bearer token", async ({
    path,
    upstreamUrl,
    requestBody,
    responseBody
  }) => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      })
    );
    const app = createTavilyServiceApp({
      tavilyApiKey: "tvly-test-key"
    });

    const response = await request(app).post(path).send(requestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith(
      upstreamUrl,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer tvly-test-key",
          "content-type": "application/json"
        }),
        body: JSON.stringify(requestBody)
      })
    );
  });

  it("composes route paths from a configured upstream base URL", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      })
    );
    const app = createTavilyServiceApp({
      tavilyApiKey: "tvly-test-key",
      tavilyApiBaseUrl: "https://proxy.example.com/tavily"
    });

    const response = await request(app)
      .post("/extract")
      .send({ urls: ["https://example.com/article"] });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://proxy.example.com/tavily/extract",
      expect.objectContaining({
        method: "POST"
      })
    );
  });

  it("returns fetch failures as 502 errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network failed"));
    const app = createTavilyServiceApp({
      tavilyApiKey: "tvly-test-key"
    });

    const response = await request(app)
      .post("/map")
      .send({ url: "https://example.com/docs" });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      error: "network failed"
    });
  });

  it("reports the normalized upstream base URL from health", async () => {
    const app = createTavilyServiceApp({
      tavilyApiKey: "tvly-test-key",
      tavilyApiBaseUrl: "https://proxy.example.com/tavily/"
    });

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      upstreamBaseUrl: "https://proxy.example.com/tavily"
    });
  });

  it("serves a provider-facing openapi.json document", async () => {
    const app = createTavilyServiceApp({
      tavilyApiKey: "tvly-test-key"
    });

    const response = await request(app).get("/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.servers).toEqual([{ url: "/" }]);
    expect(Object.keys(response.body.paths)).toEqual([
      "/search",
      "/extract",
      "/crawl",
      "/map"
    ]);
    expect(response.body.paths["/search"].post.operationId).toBe("search");
    expect(response.body.paths["/extract"].post.operationId).toBe("extract");
    expect(response.body.paths["/crawl"].post.operationId).toBe("crawl");
    expect(response.body.paths["/map"].post.operationId).toBe("map");
    expect(response.body.paths["/health"]).toBeUndefined();
    expect(response.body.paths["/.well-known/fast-marketplace-verification.txt"]).toBeUndefined();
  });

  it("serves the marketplace verification token when configured", async () => {
    const app = createTavilyServiceApp({
      tavilyApiKey: "tvly-test-key",
      verificationToken: "verify-me"
    });

    const response = await request(app).get("/.well-known/fast-marketplace-verification.txt");

    expect(response.status).toBe(200);
    expect(response.text).toBe("verify-me");
  });
});
