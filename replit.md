# PortfolioAI - Investment Portfolio Optimization Platform

## Overview

PortfolioAI is a comprehensive investment portfolio optimization platform that combines modern web technologies with advanced machine learning algorithms to provide intelligent portfolio management for Indian financial markets. The application uses AI-powered insights, Modern Portfolio Theory (MPT), and Black-Litterman models to optimize investment portfolios and provide sophisticated risk analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
The application follows a modern full-stack architecture with clear separation between client and server responsibilities:

- **Frontend**: React-based single-page application (SPA) with TypeScript
- **Backend**: Express.js server with Python Flask microservices for ML computations
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **UI Framework**: Tailwind CSS with shadcn/ui component library

### Monorepo Structure
The codebase is organized as a monorepo with shared TypeScript schemas:
- `client/` - React frontend application
- `server/` - Express.js backend server
- `shared/` - Shared TypeScript schemas and types
- `server/services/` - Python Flask services for ML and optimization

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **Tailwind CSS** with custom design system for styling
- **shadcn/ui** components for consistent UI patterns
- **Chart.js** for data visualization and portfolio performance charts

### Backend Services
- **Express.js** main server handling API routes and static file serving
- **Python Flask** microservices for computationally intensive operations:
  - ML model training and inference
  - Portfolio optimization algorithms (MPT, Black-Litterman)
  - Risk analysis and VaR calculations
  - Excel report generation

### Database Design
PostgreSQL database with the following key entities:
- `users` - User accounts and risk tolerance preferences
- `stocks` - Stock market data with real-time price updates
- `portfolios` - User portfolio configurations and metadata
- `portfolio_holdings` - Individual asset allocations within portfolios
- `ml_model_performance` - ML model accuracy tracking
- `optimization_results` - Historical optimization results
- `risk_metrics` - Calculated risk assessments per portfolio

### Machine Learning Pipeline
The ML services include:
- **XGBoost** for gradient boosting predictions
- **LSTM Networks** for time series forecasting
- **Random Forest** for ensemble learning
- Real-time model performance tracking and comparison

### Portfolio Optimization Algorithms
- **Modern Portfolio Theory (MPT)** - Risk-return optimization using historical data
- **Black-Litterman Model** - Incorporates market views and equilibrium assumptions
- **Risk Analysis** - VaR, Beta, Maximum Drawdown calculations
- **Sharpe Ratio** optimization for risk-adjusted returns

## Data Flow

1. **User Input**: Portfolio preferences, risk tolerance, investment amount
2. **Data Processing**: Historical stock data fetched and processed
3. **ML Prediction**: Multiple models generate return forecasts
4. **Optimization**: Algorithms calculate optimal asset allocations
5. **Risk Assessment**: Comprehensive risk metrics calculated
6. **Visualization**: Results displayed through interactive charts and dashboards
7. **Export**: Generate Excel reports with detailed analysis

### API Architecture
RESTful API design with the following key endpoints:
- `/api/portfolios/:userId` - User portfolio management
- `/api/optimize-portfolio` - Portfolio optimization requests
- `/api/stocks` - Stock market data access
- `/api/ml-models/performance` - ML model performance metrics
- `/api/portfolio/:id/export` - Report generation

## External Dependencies

### Database & ORM
- **PostgreSQL** - Primary database using Neon serverless
- **Drizzle ORM** - Type-safe database operations with schema migrations

### UI & Styling
- **Radix UI** - Headless UI components for accessibility
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Data & Analytics
- **Chart.js** - Client-side data visualization
- **yfinance** (Python) - Stock market data fetching
- **pandas/numpy** - Data processing and analysis
- **scikit-learn** - Machine learning algorithms
- **TensorFlow/Keras** - Deep learning models

### Development Tools
- **Vite** - Fast build tool and development server
- **TypeScript** - Type safety across the stack
- **ESBuild** - Fast JavaScript bundling for production

## Deployment Strategy

### Development Environment
- **Vite dev server** for frontend with hot module replacement
- **tsx** for running TypeScript server code directly
- **Drizzle Kit** for database schema management and migrations

### Production Build
- **Vite build** generates optimized client bundles
- **ESBuild** bundles server code for Node.js deployment
- Static assets served from `dist/public` directory
- Environment-based configuration for different deployment stages

### Database Management
- Schema definitions in `shared/schema.ts` using Drizzle
- Migration files generated in `./migrations` directory
- PostgreSQL connection via `DATABASE_URL` environment variable

The architecture prioritizes type safety, performance, and scalability while providing a sophisticated investment management platform with advanced ML capabilities.