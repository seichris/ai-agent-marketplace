# Fast Marketplace Skill

Use this skill when you want an agent to discover and call paid APIs from the Fast Marketplace.

## What this skill does

- finds marketplace services and endpoints
- explains the exact request body for each endpoint
- uses a funded local Fast wallet to pay x402 routes
- handles async job polling and repeat retrieval

## Setup

1. Create or load a local Fast wallet.
2. Fund the wallet with `fastUSDC`.
3. Open the marketplace catalog at `https://fast.8o.vc`.
4. Review the service page you want to use.
5. Copy the generated “Use this service” block into your agent or workflow.

## Payment flow

1. Send the first request to the paid endpoint without a payment proof.
2. Read the `402 Payment Required` response.
3. Authorize payment from the Fast wallet.
4. Retry the same request with the payment signature/proof.

## Async flow

1. If a route returns `202 Accepted`, store the `jobToken`.
2. Create a wallet-bound auth session for that job if needed.
3. Poll the job result until it completes or fails.
4. If the job fails permanently after acceptance, the marketplace refund policy applies.

## Discovery

- Marketplace UI: `https://fast.8o.vc`
- Skill URL: `https://fast.8o.vc/skill.md`
- OpenAPI: `https://fastapi.8o.vc/openapi.json`
- LLM summary: `https://fastapi.8o.vc/llms.txt`
- Marketplace catalog JSON: `https://fastapi.8o.vc/.well-known/marketplace.json`

## Notes

- The paid data plane does not use long-lived API keys.
- Wallet identity is the payer identity.
- Polling and repeat reads are tied to the wallet that paid.
- If a needed endpoint or source does not exist yet, submit a suggestion from the marketplace UI.
