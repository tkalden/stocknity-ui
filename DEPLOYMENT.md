# Stocknity UI Deployment Guide

## Deploying to Railway

The UI is a Create React App SPA served as static files. Railway builds it with
nixpacks and serves the `build/` output via [`serve`](https://www.npmjs.com/package/serve).

### How it works
- `railway.toml` sets `builder = "nixpacks"`. Nixpacks detects the Node project,
  runs `npm install` and `npm run build` (CRA → `build/`).
- `startCommand = "npm run serve"` runs `serve -s build -l tcp://0.0.0.0:$PORT`.
  The `-s` flag rewrites unknown routes to `index.html`, giving client-side
  routing the same SPA fallback the old `vercel.json` rewrites provided.
- Railway injects `$PORT`; `serve` binds to it.

### Step 1: Create / link the Railway service
- New project → Deploy from GitHub repo → select `stocknity-ui`, or
- `railway link` from this directory using the Railway CLI.

### Step 2: Environment variables (Railway service → Variables)
```
REACT_APP_API_BASE_URL=https://<spring-api-gateway-origin>/api
```

> **IMPORTANT:** `REACT_APP_API_BASE_URL` must point at the **Spring API gateway
> origin**, not the Flask analytics app. Auth is cookie-based (httpOnly
> `sn_token` set by the gateway), so the gateway must:
> - serve the REST API + auth endpoints (`/login`, `/logout`, `/profile`, etc.),
> - set CORS `Access-Control-Allow-Credentials: true` and an explicit
>   `Access-Control-Allow-Origin` matching the UI origin (wildcard `*` is not
>   allowed with credentials),
> - set the cookie with `SameSite=None; Secure` when the UI and gateway are on
>   different sites. Note Railway's default `*.up.railway.app` subdomains are
>   each a separate site (public-suffix list), so cross-site cookie rules apply
>   unless you put UI + gateway under one custom registrable domain (e.g.
>   `app.stocknity.com` + `api.stocknity.com`), in which case `SameSite=Lax`
>   is sufficient and preferable.

CRA bakes `REACT_APP_*` vars in at **build time**, so a redeploy is required
after changing them.

> Note: builds fail if `REACT_APP_MOCK_PRICES=true` (see `scripts/check-mock-prices.js`).
> Use `ALLOW_MOCK_PRICES_IN_BUILD=true` only for intentional demo builds.

### Step 3: Custom domain (optional)
Railway service → Settings → Networking → add a custom domain and update DNS as
instructed. Putting UI and gateway under one parent domain simplifies cookies
(see above).

## Local Development

Create a `.env` (or `.env.local`) in `stocknity-ui`:
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_PRICE_WS_URL=ws://localhost:8090/ws/prices
```

Run:
```bash
npm start                 # dev server on :3000
npm run build && npm run serve   # production build served locally on :3000
```

## Troubleshooting

### Build issues
- Install deps: `npm install`
- TypeScript: `npx tsc --noEmit`
- Mock-price guard tripped the build? Unset `REACT_APP_MOCK_PRICES` (or set
  `ALLOW_MOCK_PRICES_IN_BUILD=true` for a demo build).

### API connection / auth issues
- Verify `REACT_APP_API_BASE_URL` points at the Spring gateway.
- Check the gateway's credentialed CORS config and the cookie `SameSite`/`Secure`
  attributes (see the cross-site note above).
- Ensure the gateway is reachable over HTTPS (`Secure` cookies require it).

### Deployment issues
- Check Railway build/deploy logs.
- Confirm `startCommand` runs `npm run serve` and the service is listening on `$PORT`.
- Verify environment variables are set, then redeploy (CRA env is build-time).
