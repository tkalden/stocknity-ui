# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server on :3000
npm run build      # production build (CI=false suppresses warnings-as-errors)
npm test           # Jest/RTL tests in watch mode
npm test -- --watchAll=false   # single test run
npm run type-check # tsc --noEmit, no emit
```

Deploy (Railway):
```bash
npm run build      # CRA build -> build/
npm run serve      # serve -s build (static SPA, client-routing fallback) on $PORT
```
Railway uses nixpacks: it runs `npm run build`, then `startCommand = npm run serve`
(see railway.toml). Set `REACT_APP_API_BASE_URL` in the Railway service variables.

## Environment Variables

`.env.local` controls local dev:
```
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_PRICE_WS_URL=ws://localhost:8090/ws/prices
REACT_APP_MOCK_PRICES=true   # enables mock WebSocket price feed, no backend needed
```

Production backend: the **Spring API gateway** (cookie auth). Set
`REACT_APP_API_BASE_URL` to the gateway origin — NOT the Flask app. See
`DEPLOYMENT.md` for CORS/cookie requirements.

## Architecture

**Stack:** React 19, TypeScript, React Router v7, React Bootstrap, Axios.

**Auth:** Cookie-based sessions (httpOnly `sn_token` set by the Spring gateway).
`AuthContext` (`src/context/AuthContext.tsx`) wraps the whole app, calls
`/api/profile` on mount to restore session (200 = logged in, 401 = not), and
exposes `useAuth()`. No token is read/written in JS. `login()` POSTs `/login`
(server sets cookie) then hydrates the user; `logout()` POSTs `/logout` (server
clears cookie) and clears local state.

**API layer:** ONE axios instance — `src/utils/api.ts` (`apiClient` +
`api.get/post/put/delete` helpers returning `ApiResponse<T>`). It owns the only
request/response interceptors. `withCredentials: true` sends the session cookie.
On a 401 the response interceptor invokes a callback that `AuthContext` registers
via `setOnUnauthorized(...)` (decoupled so api.ts doesn't import React). Never
import raw `axios` in components — use `apiClient` (axios-shaped) or `api`.

All endpoint strings live in `src/config/api.ts` (`API_ENDPOINTS`). Dynamic endpoints (chart, sentiment) are functions: `API_ENDPOINTS.CHART('candlestick')`.

**Real-time prices:** `src/hooks/usePriceWebSocket.ts` — WebSocket hook connecting to `REACT_APP_PRICE_WS_URL`. Reconnects use exponential backoff + full jitter (1s base, ×2, 30s cap; reset on open) with a heartbeat that force-reconnects on a stale stream. When `REACT_APP_MOCK_PRICES=true`, skips WebSocket entirely and runs a local random-walk simulation (±0.15%/tick, 600ms interval). Returns `{ prices, lastUpdated, connected, degraded, status, mock }`. A production `npm run build` is BLOCKED when `REACT_APP_MOCK_PRICES=true` (prebuild guard `scripts/check-mock-prices.js`); set `ALLOW_MOCK_PRICES_IN_BUILD=true` for an intentional demo build.

**Types:** All shared types in `src/types/`, organized by domain (`auth`, `portfolio`, `ai`, `cache`, `stocks`, `system`). `src/types/index.ts` re-exports everything — import from `'../types'` not individual files.

**Routes → Components:**

| Route | Component | Notes |
|---|---|---|
| `/` | `Home` | Market overview |
| `/screener` | `Screener` | Stock filter/search |
| `/portfolio` | `Portfolio` | Basic portfolio |
| `/advanced-portfolio` | `AdvancedPortfolio` | Optimization methods, backtest |
| `/ai-analysis` | `AIAnalysis` | Wraps `ai/` subcomponents |
| `/beginner-mode` | `BeginnerMode` | Simplified UX |
| `/advanced-mode` | `AdvancedMode` | Full feature UX |
| `/cache-status` | `CacheMonitor` | Admin cache controls |

AI subcomponents (`src/components/ai/`) — `SentimentAnalysis`, `StockRecommendations`, `ModelPerformance` — are composed inside `AIAnalysis`.

**Deployment:** Railway (nixpacks). `npm run build` produces `build/`; `serve -s build` serves it as a static SPA with client-routing fallback. See `DEPLOYMENT.md`.
