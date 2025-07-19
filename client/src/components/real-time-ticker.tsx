import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/lib/api';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StockPrice {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  name: string;
  timestamp: string;
}

export function RealTimeTicker() {
  const [isLive, setIsLive] = useState(true);

  // Poll for stock prices every 3 seconds
  const { data: stockPrices, isLoading } = useQuery({
    queryKey: ['/api/stocks/prices'],
    refetchInterval: 3000, // Update every 3 seconds
    refetchIntervalInBackground: true,
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(parseFloat(price));
  };

  const getChangeColor = (change: string) => {
    const changeNum = parseFloat(change);
    if (changeNum > 0) return 'text-green-600 bg-green-50';
    if (changeNum < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getChangeIcon = (change: string) => {
    const changeNum = parseFloat(change);
    if (changeNum > 0) return <TrendingUp className="h-3 w-3" />;
    if (changeNum < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  if (isLoading || !stockPrices) {
    return (
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-center">
          <Activity className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading real-time prices...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Activity className={`h-4 w-4 ${isLive ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Live Market Data
            </span>
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              LIVE
            </Badge>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
        
        <div className="flex space-x-6 overflow-x-auto pb-2">
          {stockPrices.slice(0, 6).map((stock: StockPrice) => (
            <div key={stock.symbol} className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {stock.symbol}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatPrice(stock.price)}
                </span>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getChangeColor(stock.change)}`}>
                  {getChangeIcon(stock.change)}
                  <span>{stock.changePercent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}