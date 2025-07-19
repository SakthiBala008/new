import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './use-websocket';

interface Portfolio {
  id: number;
  name: string;
  totalValue: string;
  expectedReturn: string;
  riskScore: string;
  sharpeRatio: string;
}

interface PortfolioHolding {
  id: number;
  symbol: string;
  allocation: string;
  quantity: string;
  currentValue: string;
  currentPrice?: string;
  dayChange?: string;
  dayChangePercent?: string;
}

interface RiskMetrics {
  id: number;
  portfolioId: number;
  var95: string;
  beta: string;
  maxDrawdown: string;
  volatility: string;
}

interface StockPrice {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  timestamp: string;
}

export function useRealTimePortfolio(portfolioId: number, userId: number) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [stockPrices, setStockPrices] = useState<StockPrice[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'portfolio_update':
        setPortfolio(message.data.portfolio);
        setHoldings(message.data.holdings);
        setRiskMetrics(message.data.riskMetrics);
        setLastUpdate(message.data.timestamp);
        break;
        
      case 'price_update':
        setStockPrices(message.data);
        setLastUpdate(message.data[0]?.timestamp);
        break;
        
      case 'connected':
        console.log('Real-time portfolio updates connected');
        break;
        
      default:
        break;
    }
  }, []);

  const { isConnected, sendMessage, connectionError } = useWebSocket('', {
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      // Subscribe to portfolio updates
      sendMessage({
        type: 'subscribe_portfolio',
        userId,
        portfolioId
      });
      
      // Subscribe to price updates
      sendMessage({
        type: 'subscribe_prices'
      });
    }
  });

  // Calculate total portfolio change
  const portfolioChange = holdings.reduce((total, holding) => {
    const change = parseFloat(holding.dayChange || '0');
    const value = parseFloat(holding.currentValue || '0');
    return total + (change * value / 100);
  }, 0);

  const portfolioChangePercent = portfolio 
    ? (portfolioChange / parseFloat(portfolio.totalValue)) * 100 
    : 0;

  return {
    portfolio,
    holdings,
    riskMetrics,
    stockPrices,
    portfolioChange,
    portfolioChangePercent,
    lastUpdate,
    isConnected,
    connectionError,
    sendMessage
  };
}