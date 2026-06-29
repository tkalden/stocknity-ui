import { render, screen } from '@testing-library/react';
import App from './App';

// AuthProvider calls /profile on mount via the shared apiClient. Mock the api
// module so the test renders without hitting the network.
jest.mock('./utils/api', () => {
  const apiClient = {
    get: jest.fn().mockResolvedValue({ status: 401, data: {} }),
    post: jest.fn().mockResolvedValue({ data: { success: false } }),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  };
  return {
    apiClient,
    api: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
    setOnUnauthorized: jest.fn(),
    API_BASE_URL: 'http://localhost:8080/api',
    API_ENDPOINTS: { PROFILE: '/profile', LOGIN: '/login', SIGNUP: '/signup', LOGOUT: '/logout' },
  };
});

test('renders the app shell without crashing', () => {
  render(<App />);
  // The navigation brand is always present regardless of auth state.
  expect(screen.getAllByText(/stocknity/i).length).toBeGreaterThan(0);
});
