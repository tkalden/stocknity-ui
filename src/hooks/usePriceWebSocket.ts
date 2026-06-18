import { useCallback, useEffect, useRef, useState } from 'react';

const WS_URL = process.env.REACT_APP_PRICE_WS_URL || 'ws://localhost:8090/ws/prices';
const RECONNECT_DELAY_MS = 3000;
const MOCK_MODE = process.env.REACT_APP_MOCK_PRICES === 'true';

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

export interface PriceUpdate {
  ticker: string;
  price: number;
  timestamp: number;
}

export function usePriceWebSocket() {
  const [prices, setPrices] = useState<Record<string, number>>(
    MOCK_MODE ? { ...MOCK_BASE_PRICES } : {}
  );
  const [lastUpdated, setLastUpdated] = useState<Record<string, number>>({});
  const [connected, setConnected] = useState(MOCK_MODE);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const mockTimer = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Mock: tick a random subset of tickers every 600ms
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

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => { if (mountedRef.current) setConnected(true); };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const update: PriceUpdate = JSON.parse(event.data);
          if (!update.ticker || !update.price) return;
          setPrices(prev => ({ ...prev, [update.ticker]: update.price }));
          setLastUpdated(prev => ({ ...prev, [update.ticker]: Date.now() }));
        } catch { }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      ws.onerror = () => { ws.close(); };
    } catch {
      if (mountedRef.current)
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
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
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (mockTimer.current) clearTimeout(mockTimer.current);
      wsRef.current?.close();
    };
  }, [connect, startMock]);

  return { prices, lastUpdated, connected };
}
