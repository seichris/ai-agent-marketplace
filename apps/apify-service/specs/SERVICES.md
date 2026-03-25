# Apify Service Matrix

These are the six marketplace services to deploy from `apps/apify-service`.

Each service should be:

- one standalone Coolify app
- one public HTTPS host
- one marketplace provider service
- published as `verified_escrow`
- modeled as an async `fixed_x402` route for now

## Suggested Mapping

| Actor ID | Service Name | Slug | API Namespace | Suggested Coolify App |
| --- | --- | --- | --- | --- |
| `compass/crawler-google-places` | `Google Places Scraper` | `apify-google-places-scraper` | `apify-google-places` | `fast-provider-apify-google-places` |
| `clockworks/tiktok-scraper` | `TikTok Scraper` | `apify-tiktok-scraper` | `apify-tiktok` | `fast-provider-apify-tiktok` |
| `apify/instagram-scraper` | `Instagram Scraper` | `apify-instagram-scraper` | `apify-instagram` | `fast-provider-apify-instagram` |
| `apidojo/tweet-scraper` | `Tweet Scraper` | `apify-tweet-scraper` | `apify-tweet` | `fast-provider-apify-tweet` |
| `apify/facebook-posts-scraper` | `Facebook Posts Scraper` | `apify-facebook-posts-scraper` | `apify-facebook-posts` | `fast-provider-apify-facebook-posts` |
| `streamers/youtube-scraper` | `YouTube Scraper` | `apify-youtube-scraper` | `apify-youtube` | `fast-provider-apify-youtube` |

## Required Coolify Env Per App

- `APIFY_API_TOKEN`
- `APIFY_ACTOR_ID`
- `APIFY_SERVICE_NAME`
- `APIFY_SERVICE_DESCRIPTION`
- `APIFY_API_BASE_URL=https://api.apify.com/v2`
- `MARKETPLACE_VERIFICATION_TOKEN`

Each app then gets its own matching provider spec from this folder.
