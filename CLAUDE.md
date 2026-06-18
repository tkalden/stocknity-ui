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

Deploy:
```bash
npm run deploy:vercel   # vercel --prod
```

## Environment Variables

`.env.local` controls local dev:
```
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_PRICE_WS_URL=ws://localhost:8090/ws/prices
REACT_APP_MOCK_PRICES=true   # enables mock WebSocket price feed, no backend needed
```

Production backend: `https://stock-portfolio-theta.vercel.app/api`

## Architecture

**Stack:** React 19, TypeScript, React Router v7, React Bootstrap, Axios.

**Auth:** Cookie-based sessions. `AuthContext` (`src/context/AuthContext.tsx`) wraps the whole app, calls `/api/profile` on mount to restore session, and exposes `useAuth()`. Axios `withCredentials: true` is set globally here. All 401 responses auto-clear auth state.

**API layer:** Two parallel patterns exist:
- `src/utils/api.ts` — typed `apiClient` axios instance + `api.get/post/put/delete` helpers returning `ApiResponse<T>`. Prefer this for new code.
- `AuthContext` uses raw `axios` directly with `axios.defaults.baseURL`. These are separate instances; don't mix them.

All endpoint strings live in `src/config/api.ts` (`API_ENDPOINTS`). Dynamic endpoints (chart, sentiment) are functions: `API_ENDPOINTS.CHART('candlestick')`.

**Real-time prices:** `src/hooks/usePriceWebSocket.ts` — WebSocket hook connecting to `REACT_APP_PRICE_WS_URL`. When `REACT_APP_MOCK_PRICES=true`, skips WebSocket entirely and runs a local random-walk simulation (±0.15%/tick, 600ms interval). Returns `{ prices, lastUpdated, connected }`.

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

**Deployment:** Vercel. `vercel.json` handles SPA routing rewrites. Build output goes to `build/`.
