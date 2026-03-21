export interface TavilyProxyRouteDefinition {
  path: `/${string}`;
  upstreamPath: `/${string}`;
  operationId: string;
  summary: string;
  description: string;
  requestExample: Record<string, unknown>;
  responseExample: Record<string, unknown>;
}

export const TAVILY_PROXY_ROUTES: TavilyProxyRouteDefinition[] = [
  {
    path: "/search",
    upstreamPath: "/search",
    operationId: "search",
    summary: "Run a Tavily search",
    description: "Proxy a Tavily search request with the server-side Tavily API key.",
    requestExample: {
      query: "latest Fast blockchain news",
      topic: "news",
      max_results: 5
    },
    responseExample: {
      query: "latest Fast blockchain news",
      results: [
        {
          title: "Fast network update",
          url: "https://example.com/articles/fast-update",
          content: "Summary excerpt from the Tavily search response."
        }
      ]
    }
  },
  {
    path: "/extract",
    upstreamPath: "/extract",
    operationId: "extract",
    summary: "Extract content from URLs",
    description: "Proxy a Tavily extract request for one or more target URLs.",
    requestExample: {
      urls: ["https://example.com/articles/fast-update"]
    },
    responseExample: {
      results: [
        {
          url: "https://example.com/articles/fast-update",
          raw_content: "Extracted page content."
        }
      ]
    }
  },
  {
    path: "/crawl",
    upstreamPath: "/crawl",
    operationId: "crawl",
    summary: "Crawl a site with Tavily",
    description: "Proxy a Tavily crawl request for a target website.",
    requestExample: {
      url: "https://example.com/docs",
      max_depth: 2
    },
    responseExample: {
      base_url: "https://example.com/docs",
      results: [
        {
          url: "https://example.com/docs/intro",
          title: "Docs intro"
        }
      ]
    }
  },
  {
    path: "/map",
    upstreamPath: "/map",
    operationId: "map",
    summary: "Discover URLs from a site",
    description: "Proxy a Tavily map request for URL discovery on a target website.",
    requestExample: {
      url: "https://example.com/docs"
    },
    responseExample: {
      base_url: "https://example.com/docs",
      results: [
        "https://example.com/docs",
        "https://example.com/docs/intro"
      ]
    }
  }
];

export function buildTavilyOpenApiDocument(): Record<string, unknown> {
  return {
    openapi: "3.0.3",
    info: {
      title: "Tavily Marketplace Provider API",
      version: "1.0.0",
      description:
        "Thin Tavily proxy endpoints for marketplace provider onboarding. The service injects Tavily credentials server-side."
    },
    servers: [
      {
        url: "/"
      }
    ],
    paths: Object.fromEntries(
      TAVILY_PROXY_ROUTES.map((route) => [
        route.path,
        {
          post: {
            operationId: route.operationId,
            summary: route.summary,
            description: route.description,
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: buildRequestSchema(route.operationId),
                  example: route.requestExample
                }
              }
            },
            responses: {
              "200": {
                description: "Successful Tavily response.",
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
                description: "Upstream Tavily request failure.",
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
                      error: "Tavily request failed."
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
    case "extract":
      return {
        type: "object",
        required: ["urls"],
        properties: {
          urls: {
            type: "array",
            items: {
              type: "string",
              format: "uri"
            }
          }
        },
        additionalProperties: true
      };
    case "crawl":
    case "map":
      return {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            format: "uri"
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
