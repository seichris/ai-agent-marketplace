# Valyu Service Deployment

Coolify deployment should use the dedicated Dockerfile at `docker/valyu-service.Dockerfile`.

Required runtime environment variables:

- `PORT=4050`
- `VALYU_API_KEY`
- `VALYU_API_BASE_URL=https://api.valyu.ai`
- `MARKETPLACE_VERIFICATION_TOKEN` when completing marketplace website verification

Recommended Coolify settings:

- build pack: Dockerfile
- dockerfile location: `docker/valyu-service.Dockerfile`
- exposed port: `4050`
- health check path: `/health`
