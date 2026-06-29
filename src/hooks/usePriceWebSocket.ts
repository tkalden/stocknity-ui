import { useCallback, useEffect, useRef, useState } from 'react';

const WS_URL = process.env.REACT_APP_PRICE_WS_URL || 'ws://localhost:8090/ws/prices';
const MOCK_MODE = process.env.REACT_APP_MOCK_PRICES === 'true';

// Reconnect backoff tuning (exponential + full jitter).
const BACKOFF_BASE_MS = 1000;   // first retry ~ up to 1s
const BACKOFF_FACTOR = 2;       // double the ceiling each attempt
const BACKOFF_CAP_MS = 30000;   // never wait more than 30s

// Heartbeat / staleness detection.
const HEARTBEAT_INTERVAL_MS = 15000; // how often we check liveness / ping
const STALE_TIMEOUT_MS = 30000;      // no message in this window => stale => reconnect

const MOCK_BASE_PRICES: Record<string, number> = {
  AAPL: 213.50,  MSFT: 450.20,  GOOGL: 192.80, AMZN: 228.40,  NVDA: 138.60,
  TSLA: 248.90,  META: 621.30,  JPM:   263.10,  V:    368.50,  UNH:  289.70,
  LYB:  38.20,   DOW:  35.80,   MOS:   27.40,   DD:   28.90,   IFF:  74.30,
  OKE:  82.50,   CVX:  148.20,  KMI:   26.80,   EXE:  91.20,   APA:  18.40,
  LYV:  135.60,  CMCSA: 37.20,  VZ:    42.80,   T:    22.10,   OMC:  88.40,
};

// Random walk: ±0.15% per tick
function nextPrice(current: number): number {
  const pct = (Math.random() - 0.5) * 0.003;
  return parseFloat((current * (1 + pct)).toFixed(2));
}

/**
 * Pure backoff calculator: exponential ceiling with full jitter.
 *
 * The ceiling for attempt N (0-indexed) is base * factor^N, clamped to cap.
 * Full jitter then picks a uniformly-random delay in [0, ceiling], which
 * spreads reconnect storms out when many clients drop at once.
 *
 * `rng` is injectable so the behaviour is deterministically testable.
 */
export function computeBackoffDelay(
  attempt: number,
  opts: { baseMs?: number; factor?: number; capMs?: number; rng?: () => number } = {}
): number {
  const baseMs = opts.baseMs ?? BACKOFF_BASE_MS;
  const factor = opts.factor ?? BACKOFF_FACTOR;
  const capMs = opts.capMs ?? BACKOFF_CAP_MS;
  const rng = opts.rng ?? Math.random;

  const safeAttempt = attempt < 0 ? 0 : attempt;
  const ceiling = Math.min(capMs, baseMs * Math.pow(factor, safeAttempt));
  return Math.round(rng() * ceiling);
}

export type WsStatus = 'connecting' | 'connected' | 'degraded' | 'mock';

export interface PriceUpdate {
  ticker: string;
  price: number;
  timestamp: number;
}

export interface UsePriceWebSocketResult {
  prices: Record<string, number>;
  lastUpdated: Record<string, number>;
  connected: boolean;
  /** True while reconnecting / stale — UI can show a warning indicator. */
  degraded: boolean;
  status: WsStatus;
  /** True when running the local mock feed (no real backend). */
  mock: boolean;
}

export function usePriceWebSocket(): UsePriceWebSocketResult {
  const [prices, setPrices] = useState<Record<string, number>>(
    MOCK_MODE ? { ...MOCK_BASE_PRICES } : {}
  );
  const [lastUpdated, setLastUpdated] = useState<Record<string, number>>({});
  const [connected, setConnected] = useState(MOCK_MODE);
  const [status, setStatus] = useState<WsStatus>(MOCK_MODE ? 'mock' : 'connecting');

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const attemptRef = useRef(0);          // consecutive failed attempts (drives backoff)
  const lastMessageAtRef = useRef(0);    // wall-clock of last inbound frame

  // Mock: tick a random subset of tickers every 600ms. Unaffected by reconnect logic.
  const startMock = useCallback(() => {
    const tick = () => {
      if (!mountedRef.current) return;
      const tickers = Object.keys(MOCK_BASE_PRICES);
      const count = 2 + Math.floor(Math.random() * 4);
      const batch = tickers.sort(() => Math.random() - 0.5).slice(0, count);

      setPrices(prev => {
        const next = { ...prev };
        batch.forEach(t => { next[t] = nextPrice(prev[t] ?? MOCK_BASE_PRICES[t]); });
        return next;
      });
      setLastUpdated(prev => {
        const next = { ...prev };
        const now = Date.now();
        batch.forEach(t => { next[t] = now; });
        return next;
      });
      mockTimer.current = setTimeout(tick, 600);
    };
    mockTimer.current = setTimeout(tick, 600);
  }, []);

  const clearTimers = useCallback(() => {
    if (reconnectTimer.current) { clearTimeout(reconnectTimer.current); reconnectTimer.current = null; }
    if (heartbeatTimer.current) { clearInterval(heartbeatTimer.current); heartbeatTimer.current = null; }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const scheduleReconnect = () => {
      if (!mountedRef.current) return;
      setConnected(false);
      setStatus('degraded');
      const delay = computeBackoffDelay(attemptRef.current);
      attemptRef.current += 1;
      reconnectTimer.current = setTimeout(connect, delay);
    };

    try {
      if (mountedRef.current && attemptRef.current === 0) setStatus('connecting');
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        attemptRef.current = 0;            // reset backoff on a clean open
        lastMessageAtRef.current = Date.now();
        setConnected(true);
        setStatus('connected');

        // Heartbeat: ping periodically and force-reconnect if the stream goes stale.
        if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
        heartbeatTimer.current = setInterval(() => {
          if (!mountedRef.current) return;
          const idle = Date.now() - lastMessageAtRef.current;
          if (idle > STALE_TIMEOUT_MS) {
            // Stale connection — drop it; onclose will schedule a reconnect.
            setStatus('degraded');
            try { ws.close(); } catch { /* ignore */ }
            return;
          }
          // Best-effort liveness ping (server may ignore unknown frames).
          if (ws.readyState === WebSocket.OPEN) {
            try { ws.send('ping'); } catch { /* ignore */ }
          }
        }, HEARTBEAT_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        lastMessageAtRef.current = Date.now();
        // Ignore non-data heartbeat replies (e.g. "pong").
        if (typeof event.data === 'string' && (event.data === 'pong' || event.data === 'ping')) return;
        try {
          const update: PriceUpdate = JSON.parse(event.data);
          if (!update.ticker || !update.price) return;
          setPrices(prev => ({ ...prev, [update.ticker]: update.price }));
          setLastUpdated(prev => ({ ...prev, [update.ticker]: Date.now() }));
        } catch { /* ignore malformed frame */ }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        if (heartbeatTimer.current) { clearInterval(heartbeatTimer.current); heartbeatTimer.current = null; }
        scheduleReconnect();
      };

      ws.onerror = () => { try { ws.close(); } catch { /* ignore */ } };
    } catch {
      scheduleReconnect();
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (MOCK_MODE) {
      startMock();
    } else {
      connect();
    }
    return () => {
      mountedRef.current = false;
      clearTimers();
      if (mockTimer.current) clearTimeout(mockTimer.current);
      wsRef.current?.close();
    };
  }, [connect, startMock, clearTimers]);

  return {
    prices,
    lastUpdated,
    connected,
    degraded: status === 'degraded',
    status,
    mock: MOCK_MODE,
  };
}
