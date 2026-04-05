import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createValyuServiceApp } from "./app.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("valyu service", () => {
  it.each([
    {
      method: "post" as const,
      path: "/search",
      upstreamUrl: "https://api.valyu.ai/v1/search",
      requestBody: { query: "fast" },
      responseBody: { success: true, results: [] }
    },
    {
      method: "post" as const,
      path: "/contents",
      upstreamUrl: "https://api.valyu.ai/v1/contents",
      requestBody: { urls: ["https://example.com/article"] },
      responseBody: { success: true, results: [{ url: "https://example.com/article", content: "Article text" }] }
    },
    {
      method: "post" as const,
      path: "/answer",
      upstreamUrl: "https://api.valyu.ai/v1/answer",
      requestBody: { query: "What changed in Fast?" },
      responseBody: { success: true, answer: "Fast shipped an update." }
    },
    {
      method: "post" as const,
      path: "/datasources",
      upstreamUrl: "https://api.valyu.ai/v1/datasources",
      requestBody: {},
      responseBody: { success: true, datasources: [] }
    }
  ])("forwards $path requests to Valyu with the configured API key", async ({
    method,
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
    const app = createValyuServiceApp({
      valyuApiKey: "valyu-test-key"
    });

    const response = request(app)[method](path);
    const finalResponse = await response.send(requestBody);

    expect(finalResponse.status).toBe(200);
    expect(finalResponse.body).toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith(
      upstreamUrl,
      expect.objectContaining({
        method: method.toUpperCase(),
        headers: expect.objectContaining({
          "X-API-Key": "valyu-test-key",
          ...(method === "post" ? { "content-type": "application/json" } : {})
        }),
        body: JSON.stringify(requestBody)
      })
    );
  });

  it("composes route paths from a configured upstream base URL", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, results: [] }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      })
    );
    const app = createValyuServiceApp({
      valyuApiKey: "valyu-test-key",
      valyuApiBaseUrl: "https://proxy.example.com/valyu"
    });

    const response = await request(app)
      .post("/search")
      .send({ query: "fast" });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://proxy.example.com/valyu/v1/search",
      expect.objectContaining({
        method: "POST"
      })
    );
  });

  it("returns fetch failures as 502 errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network failed"));
    const app = createValyuServiceApp({
      valyuApiKey: "valyu-test-key"
    });

    const response = await request(app)
      .post("/answer")
      .send({ query: "fast" });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      error: "network failed"
    });
  });

  it("reports the normalized upstream base URL from health", async () => {
    const app = createValyuServiceApp({
      valyuApiKey: "valyu-test-key",
      valyuApiBaseUrl: "https://proxy.example.com/valyu/"
    });

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      upstreamBaseUrl: "https://proxy.example.com/valyu"
    });
  });

  it("serves a provider-facing openapi.json document", async () => {
    const app = createValyuServiceApp({
      valyuApiKey: "valyu-test-key"
    });

    const response = await request(app).get("/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.servers).toEqual([{ url: "/" }]);
    expect(Object.keys(response.body.paths)).toEqual([
      "/search",
      "/contents",
      "/answer",
      "/datasources"
    ]);
    expect(response.body.paths["/search"].post.operationId).toBe("search");
    expect(response.body.paths["/contents"].post.operationId).toBe("contents");
    expect(response.body.paths["/answer"].post.operationId).toBe("answer");
    expect(response.body.paths["/datasources"].post.operationId).toBe("datasources");
    expect(response.body.paths["/health"]).toBeUndefined();
    expect(response.body.paths["/.well-known/fast-marketplace-verification.txt"]).toBeUndefined();
  });

  it("serves the marketplace verification token when configured", async () => {
    const app = createValyuServiceApp({
      valyuApiKey: "valyu-test-key",
      verificationToken: "verify-me"
    });

    const response = await request(app).get("/.well-known/fast-marketplace-verification.txt");

    expect(response.status).toBe(200);
    expect(response.text).toBe("verify-me");
  });
});
