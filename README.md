# BarrLog
BarrLog helps you record what you worked on, how long you spent on it, and how your projects progress over time.

It started with a practical problem: when working on several projects, it is surprisingly difficult to reconstruct where the time actually went.

Rather than building another elaborate productivity system, BarrLog focuses on the smallest useful unit: **what did I work on today?**

This is a hono, solidjs, drizzle, neon Single page application with serverside rendering with cloudflare as the deployment target.

## Build steps
Install Dependencies: `pnpm install`
- "dev": Run in dev mode, hot compiles, best way to start building new features
- "test":  Test using vitest
- "build:pwa": Build Progressive Web App (pwa)
- "build": build app and pwa
- "preview": Run this before deploying, this will run closer to how it will be deployed on Cloudflare
- "deploy": Deploy to cloudflare
- "cf-typegen": Update typescript to include latest cloudflare bindings
- "db": Upload db url into cloudflare bindings

## Testing
1. Install playwrite browser: `pnpm exec playwright install`
2. Run tests in background: `pnpm test`

## Running Locally
After installing the dependencies (`pnpm install`) you can start the dev server with:
```zsh
pnpm dev
```

## Deploying to Cloudflare

Before deploying to cloudflare you may want to preview it locally using

```zsh
pnpm run preview
```

```zsh
pnpm run deploy
```

## Adding Secrets to the cloudflare workers
For a new cloudflare worker environment you must add the necesary secrets
(see `.dev.vars.example` for all secrets used by the app) 
`npx wrangler secret put ENV_VARIABLE`

## Updating cloudflare bindings
To re-generate typescript types for cloudflare bindings:

```txt
pnpm run cf-typegen
```

- [latest](https://barr.victorpass.dev)
- [all deployments](https://dash.cloudflare.com/0c855cdf521de8fed5ad5d3ac1c22763/workers/services/view/worklogger/production/deployments)
- [Change subdomain](https://dash.cloudflare.com/0c855cdf521de8fed5ad5d3ac1c22763/workers/subdomain)

## DB
generate migration files: `npx drizzle-kit generate`
migrate database: `npx drizzle-kit migrate`
pull latest schema: `npx drizzle-kit pull`
view database: `npx drizzle-kit studio`

## Authentication
We authenticate via google auth
Locally, authentication will not run by default.  To use google authenticator please set the`GOOGLE_ID` and `GOOGLE_SECRET` from the [google auth console](https://console.cloud.google.com/auth/clients/1009621445851-9f41276apmvvrekvlhl1casmmuu8sqgl.apps.googleusercontent.com)
