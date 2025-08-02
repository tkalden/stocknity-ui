# Stocknity React Frontend

This is the React frontend for the Stocknity stock portfolio management application.

## Features

- **User Authentication**: Login and signup functionality
- **Stock Screening**: Filter and view stocks by sector, index, and metrics
- **Portfolio Management**: Build, optimize, and save investment portfolios
- **Market Analysis**: View charts and analysis for different stock types
- **Responsive Design**: Mobile-friendly interface using Bootstrap

## Technology Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **React Bootstrap** for UI components
- **Axios** for API communication
- **Context API** for state management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Flask backend running on port 5001

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The app will open at [http://localhost:3000](http://localhost:3000).

### Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the app for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## Project Structure

```
src/
├── components/          # React components
│   ├── Navigation.tsx   # Main navigation bar
│   ├── Home.tsx         # Home page
│   ├── Login.tsx        # Login form
│   ├── Signup.tsx       # Signup form
│   ├── Profile.tsx      # User profile
│   ├── Screener.tsx     # Stock screener
│   ├── Portfolio.tsx    # Portfolio management
│   └── Chart.tsx        # Market charts
├── context/             # React context
│   └── AuthContext.tsx  # Authentication context
├── App.tsx              # Main app component
└── index.tsx            # App entry point
```

## API Integration

The frontend communicates with the Flask backend through the following endpoints:

- **Authentication**: `/login`, `/signup`, `/logout`
- **Profile**: `/api/profile`
- **Screener**: `/screener`, `/screener/data`
- **Portfolio**: `/portfolio`, `/portfolio/data`, `/my-portfolio/data`
- **Charts**: `/api/chart/<type>`
- **News**: `/api/news`

## Development

### Adding New Components

1. Create a new component in the `src/components/` directory
2. Export it as the default export
3. Import and add it to the routing in `App.tsx`

### Styling

The app uses Bootstrap for styling. You can:
- Use Bootstrap classes directly in JSX
- Import Bootstrap components from `react-bootstrap`
- Add custom CSS in `src/App.css`

### State Management

The app uses React Context for global state management:
- `AuthContext` manages user authentication state
- Local component state for form data and UI state

## Deployment

To build for production:

```bash
npm run build
```

This creates a `build` folder with optimized production files that can be served by any static file server.

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new components
3. Add proper error handling
4. Test your changes thoroughly
