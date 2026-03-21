# Tavily Service Example

This app is a standalone Tavily-backed provider example. It is not wired into `apps/api`.

## What It Does

- exposes thin proxy routes for `POST /search`, `POST /extract`, `POST /crawl`, and `POST /map`
- injects the server-side `TAVILY_API_KEY`
- serves `GET /openapi.json` for marketplace-friendly OpenAPI import
- optionally serves `GET /.well-known/fast-marketplace-verification.txt` from `MARKETPLACE_VERIFICATION_TOKEN`

## Local Run

```bash
export TAVILY_API_KEY=tvly-...
export TAVILY_API_BASE_URL=https://api.tavily.com
export TAVILY_SERVICE_PORT=4030
npm run dev:tavily-service
```

## Using It With The Marketplace

1. Create a `marketplace_proxy` provider service in the website.
2. Set the service website URL to the deployed Tavily service host.
3. Import the deployed OpenAPI document from `https://<your-host>/openapi.json`.
4. Review the imported endpoint drafts for `search`, `extract`, `crawl`, and `map`.
5. Set `MARKETPLACE_VERIFICATION_TOKEN` on the Tavily service and host the verification file.
6. Complete provider verification and submit the service for review.

Provider website verification expects an HTTPS host.
