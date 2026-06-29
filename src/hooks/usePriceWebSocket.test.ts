import { computeBackoffDelay } from './usePriceWebSocket';

describe('computeBackoffDelay', () => {
  const opts = { baseMs: 1000, factor: 2, capMs: 30000 };

  test('ceiling grows exponentially per attempt (rng=1 returns the ceiling)', () => {
    const rng = () => 1;
    expect(computeBackoffDelay(0, { ...opts, rng })).toBe(1000);  // 1000 * 2^0
    expect(computeBackoffDelay(1, { ...opts, rng })).toBe(2000);  // 1000 * 2^1
    expect(computeBackoffDelay(2, { ...opts, rng })).toBe(4000);  // 1000 * 2^2
    expect(computeBackoffDelay(3, { ...opts, rng })).toBe(8000);  // 1000 * 2^3
  });

  test('caps the ceiling at capMs', () => {
    const rng = () => 1;
    // 1000 * 2^10 = 1,024,000 -> capped to 30,000
    expect(computeBackoffDelay(10, { ...opts, rng })).toBe(30000);
    expect(computeBackoffDelay(100, { ...opts, rng })).toBe(30000);
  });

  test('full jitter: rng=0 yields 0, result never exceeds the ceiling', () => {
    expect(computeBackoffDelay(5, { ...opts, rng: () => 0 })).toBe(0);
    // half jitter at attempt 2 -> 0.5 * 4000 = 2000
    expect(computeBackoffDelay(2, { ...opts, rng: () => 0.5 })).toBe(2000);
  });

  test('negative attempts are treated as attempt 0', () => {
    expect(computeBackoffDelay(-3, { ...opts, rng: () => 1 })).toBe(1000);
  });

  test('jittered delay stays within [0, ceiling] across random rng', () => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const ceiling = Math.min(opts.capMs, opts.baseMs * Math.pow(opts.factor, attempt));
      for (let i = 0; i < 50; i++) {
        const d = computeBackoffDelay(attempt, opts);
        expect(d).toBeGreaterThanOrEqual(0);
        expect(d).toBeLessThanOrEqual(ceiling);
      }
    }
  });
});
