# BarrLog
BarrLog helps you record what you worked on and how long you spent on it.

BarrLog is simple to use and will always target quick a easy and easy user experience.

This is an hono/solidjs/drizzle/neon single page application and progressive web app with serverside rendering running on cloudflare workers.

## Build steps
Install Dependencies: `pnpm install`
- `dev`: Run in dev mode, hot compiles, best way to start building new features
- `test`:  Test using vitest
- `build:pwa`: Build Progressive Web App (pwa)
- `build`: build app and pwa
- `preview`: Run this before deploying, this will run closer to how it will be deployed on Cloudflare
- `deploy`: Deploy to cloudflare
- `cf-typegen`: Update typescript to include latest cloudflare bindings

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
For a new cloudflare worker environment you must add the necesary secrets.

To upload them in bulk the easiest way is to add them all from the .env file:
`npx wrangler secret bulk .env`

To add a single new secret: `npx wrangler secret put ENV_VARIABLE`

(see `.dev.vars.example` for all secrets used by the app)

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
