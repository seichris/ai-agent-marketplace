export interface ValyuProxyRouteDefinition {
  path: `/${string}`;
  upstreamPath: `/${string}`;
  method: "POST";
  operationId: string;
  summary: string;
  description: string;
  requestExample?: Record<string, unknown>;
  responseExample: Record<string, unknown>;
}

export const VALYU_PROXY_ROUTES: ValyuProxyRouteDefinition[] = [
  {
    path: "/search",
    upstreamPath: "/v1/search",
    method: "POST",
    operationId: "search",
    summary: "Run a Valyu search",
    description: "Proxy a Valyu search request with the server-side Valyu API key.",
    requestExample: {
      query: "latest Fast blockchain news",
      max_num_results: 5
    },
    responseExample: {
      success: true,
      query: "latest Fast blockchain news",
      results: [
        {
          title: "Fast network update",
          url: "https://example.com/articles/fast-update",
          content: "Summary excerpt from the Valyu search response."
        }
      ]
    }
  },
  {
    path: "/contents",
    upstreamPath: "/v1/contents",
    method: "POST",
    operationId: "contents",
    summary: "Extract content from URLs",
    description: "Proxy a Valyu content extraction request for one or more URLs.",
    requestExample: {
      urls: ["https://example.com/articles/fast-update"]
    },
    responseExample: {
      success: true,
      results: [
        {
          url: "https://example.com/articles/fast-update",
          content: "Extracted page content."
        }
      ]
    }
  },
  {
    path: "/answer",
    upstreamPath: "/v1/answer",
    method: "POST",
    operationId: "answer",
    summary: "Generate a grounded answer",
    description: "Proxy a Valyu answer request grounded in provider-side retrieval.",
    requestExample: {
      query: "What changed in Fast this week?"
    },
    responseExample: {
      success: true,
      answer: "Fast shipped an update this week.",
      citations: [
        {
          title: "Fast network update",
          url: "https://example.com/articles/fast-update"
        }
      ]
    }
  },
  {
    path: "/datasources",
    upstreamPath: "/v1/datasources",
    method: "POST",
    operationId: "datasources",
    summary: "List available datasets",
    description: "List Valyu datasets, categories, schemas, and example queries.",
    requestExample: {},
    responseExample: {
      success: true,
      total_count: 36,
      datasources: [
        {
          id: "valyu/valyu-sec-filings",
          name: "Sec Filings",
          category: "company"
        }
      ]
    }
  }
];

export function buildValyuOpenApiDocument(): Record<string, unknown> {
  return {
    openapi: "3.0.3",
    info: {
      title: "Valyu Marketplace Provider API",
      version: "1.0.0",
      description:
        "Thin Valyu proxy endpoints for marketplace provider onboarding. The service injects Valyu credentials server-side."
    },
    servers: [{ url: "/" }],
    paths: Object.fromEntries(
      VALYU_PROXY_ROUTES.map((route) => [
        route.path,
        {
          [route.method.toLowerCase()]: {
            operationId: route.operationId,
            summary: route.summary,
            description: route.description,
            ...(route.requestExample
              ? {
                  requestBody: {
                    required: true,
                    content: {
                      "application/json": {
                        schema: buildRequestSchema(route.operationId),
                        example: route.requestExample
                      }
                    }
                  }
                }
              : {}),
            responses: {
              "200": {
                description: `Successful Valyu ${route.operationId} response.`,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: true
                    },
                    example: route.responseExample
                  }
                }
              },
              "502": {
                description: "Upstream Valyu request failure.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["error"],
                      properties: {
                        error: {
                          type: "string"
                        }
                      },
                      additionalProperties: false
                    },
                    example: {
                      error: "Valyu request failed."
                    }
                  }
                }
              }
            }
          }
        }
      ])
    )
  };
}

function buildRequestSchema(operationId: string): Record<string, unknown> {
  switch (operationId) {
    case "search":
    case "answer":
      return {
        type: "object",
        required: ["query"],
        properties: {
          query: {
            type: "string"
          }
        },
        additionalProperties: true
      };
    case "contents":
      return {
        type: "object",
        required: ["urls"],
        properties: {
          urls: {
            anyOf: [
              {
                type: "string",
                format: "uri"
              },
              {
                type: "array",
                items: {
                  type: "string",
                  format: "uri"
                }
              }
            ]
          }
        },
        additionalProperties: true
      };
    default:
      return {
        type: "object",
        additionalProperties: true
      };
  }
}
