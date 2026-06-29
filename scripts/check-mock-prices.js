#!/usr/bin/env node
/*
 * Build guard: prevents shipping a production bundle that uses the mock price
 * feed. The mock feed (REACT_APP_MOCK_PRICES=true) generates random prices and
 * must never reach real users.
 *
 * This runs as the `prebuild` npm hook, so `npm run build` aborts before
 * react-scripts compiles anything.
 *
 * Escape hatch: set ALLOW_MOCK_PRICES_IN_BUILD=true for an intentional demo
 * build (e.g. a sales/staging deploy with no live market-data backend).
 */
'use strict';

const mockEnabled = process.env.REACT_APP_MOCK_PRICES === 'true';
const allowOverride = process.env.ALLOW_MOCK_PRICES_IN_BUILD === 'true';

if (mockEnabled && !allowOverride) {
  console.error('\n\x1b[31m✖ Build blocked: REACT_APP_MOCK_PRICES=true\x1b[0m');
  console.error(
    '  Mock prices are simulated random data and must not ship to production.\n' +
    '  Fix one of the following:\n' +
    '    • Unset REACT_APP_MOCK_PRICES (or set it to false) before building, or\n' +
    '    • For an intentional demo build, set ALLOW_MOCK_PRICES_IN_BUILD=true.\n'
  );
  process.exit(1);
}

if (mockEnabled && allowOverride) {
  console.warn(
    '\x1b[33m⚠ Building WITH mock prices (ALLOW_MOCK_PRICES_IN_BUILD=true). ' +
    'This bundle will show simulated prices.\x1b[0m'
  );
}
