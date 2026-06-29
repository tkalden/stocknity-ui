// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// react-router v7 references TextEncoder/TextDecoder at import time, but the
// jsdom environment bundled with react-scripts 5 does not define them. Polyfill
// from Node's util so router-dependent components can be tested.
import { TextDecoder, TextEncoder } from 'util';

if (typeof (global as any).TextEncoder === 'undefined') {
    (global as any).TextEncoder = TextEncoder;
}
if (typeof (global as any).TextDecoder === 'undefined') {
    (global as any).TextDecoder = TextDecoder;
}

// react-bootstrap's responsive components (Navbar/Offcanvas) call
// window.matchMedia, which jsdom does not implement. Provide a no-op stub.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
    window.matchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
