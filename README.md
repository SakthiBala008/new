# PortfolioAI - Investment Portfolio Optimization Platform

## Overview

PortfolioAI is a comprehensive investment portfolio optimization platform that combines modern web technologies with advanced machine learning algorithms to provide intelligent portfolio management for Indian financial markets.

## Architecture

### Full-Stack Components
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **ML Services**: Python Flask + scikit-learn + TensorFlow
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket for live updates

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- PostgreSQL (optional - uses in-memory storage by default)

### Installation

1. **Install Node.js dependencies:**
```bash
npm install
```

2. **Install Python dependencies:**
```bash
pip install flask flask-cors pandas numpy scikit-learn xgboost tensorflow yfinance openpyxl
```

### Running the Application

#### Option 1: Full Stack (Recommended)
```bash
npm run dev:full
```
This starts both the Node.js server and Python ML services.

#### Option 2: Node.js Only
```bash
npm run dev
```
This starts just the main server (ML features will use fallback implementations).

#### Option 3: Python Services Only
```bash
npm run dev:python
```
This starts only the Python ML services on port 8000.

### Accessing the Application

- **Main Application**: http://localhost:5000
- **API Endpoints**: http://localhost:5000/api/*
- **Python ML Services**: http://localhost:8000/api/*

## Features

### Portfolio Management
- Create and manage multiple portfolios
- Real-time portfolio value tracking
- Asset allocation optimization
- Risk tolerance assessment

### Optimization Algorithms
- **Modern Portfolio Theory (MPT)**: Risk-return optimization
- **Black-Litterman Model**: Market equilibrium with investor views
- **Machine Learning**: XGBoost, LSTM, Random Forest predictions

### Risk Analysis
- Value at Risk (VaR) calculations
- Beta, Alpha, Sharpe ratio metrics
- Maximum drawdown analysis
- Monte Carlo simulations
- Stress testing scenarios

### Real-time Features
- Live stock price updates
- Dynamic portfolio revaluation
- WebSocket-powered real-time data
- Market data simulation

### Reporting & Export
- Excel report generation
- Comprehensive portfolio analysis
- Risk assessment reports
- Performance tracking

## API Endpoints

### Portfolio Management
- `GET /api/portfolios/:userId` - Get user portfolios
- `POST /api/portfolio` - Create new portfolio
- `GET /api/portfolio/:id` - Get portfolio details
- `POST /api/optimize-portfolio` - Optimize portfolio allocation

### Market Data
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/prices` - Real-time stock prices
- `GET /api/portfolio/:id/realtime` - Real-time portfolio data

### Analytics
- `GET /api/ml-models/performance` - ML model performance
- `GET /api/portfolio/:id/risk-metrics` - Risk analysis
- `GET /api/portfolio/:id/export` - Export portfolio data

### Python ML Services
- `POST /api/optimize-portfolio` - Advanced optimization
- `POST /api/risk-analysis` - Comprehensive risk analysis
- `POST /api/train-models` - Train ML models
- `POST /api/predict-returns` - Asset return predictions

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for state management
- **Tailwind CSS** + **shadcn/ui** for styling
- **Chart.js** for data visualization
- **Lucide React** for icons

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **WebSocket** for real-time updates
- **Zod** for validation

### Python Services
- **Flask** web framework
- **pandas** + **numpy** for data processing
- **scikit-learn** for machine learning
- **XGBoost** for gradient boosting
- **TensorFlow/Keras** for deep learning
- **yfinance** for market data
- **openpyxl** for Excel export

### Development Tools
- **Vite** for fast development
- **tsx** for TypeScript execution
- **ESBuild** for production builds
- **Tailwind CSS** for styling

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and API client
├── server/                 # Express.js backend
│   ├── services/           # Python ML services
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage layer
│   └── websocket.ts        # WebSocket server
├── shared/                 # Shared TypeScript schemas
└── migrations/             # Database migrations
```

## Development

### Adding New Features

1. **Frontend Components**: Add to `client/src/components/`
2. **API Routes**: Add to `server/routes.ts`
3. **ML Models**: Add to `server/services/`
4. **Database Schema**: Update `shared/schema.ts`

### Database Migrations

```bash
npm run db:push
```

### Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.