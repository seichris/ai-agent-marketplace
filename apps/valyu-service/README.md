# Valyu Service Example

This app is a standalone Valyu-backed provider wrapper. It follows the same deployment pattern as `apps/tavily-service`, but it is scoped to a thin hosted proxy for synchronous Valyu endpoints.

## What It Does

- exposes thin proxy routes for `POST /search`, `POST /contents`, `POST /answer`, and `POST /datasources`
- injects the server-side `VALYU_API_KEY`
- serves `GET /openapi.json` for marketplace-friendly OpenAPI import
- optionally serves `GET /.well-known/fast-marketplace-verification.txt` from `MARKETPLACE_VERIFICATION_TOKEN`

## Local Run

```bash
export VALYU_API_KEY=val_...
export VALYU_API_BASE_URL=https://api.valyu.ai
export VALYU_SERVICE_PORT=4050
npm run dev:valyu-service
```

## Using It With The Marketplace

1. Deploy `apps/valyu-service` to an HTTPS host.
2. In Coolify, prefer the dedicated Dockerfile at `docker/valyu-service.Dockerfile`.
3. Set the service website URL to the deployed Valyu service host.
4. Import the deployed OpenAPI document from `https://<your-host>/openapi.json`.
5. Review the imported endpoint drafts for `search`, `contents`, `answer`, and `datasources`.
6. Set `MARKETPLACE_VERIFICATION_TOKEN` on the Valyu service and host the verification file.
7. Complete provider verification and submit the service for review.

Provider website verification expects an HTTPS host.
