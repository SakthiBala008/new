import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';

interface RealTimePortfolioProps {
  portfolioId: number;
}

export function RealTimePortfolioValue({ portfolioId }: RealTimePortfolioProps) {
  // Poll for real-time portfolio data every 5 seconds
  const { data: portfolioData, isLoading, isFetching } = useQuery({
    queryKey: [`/api/portfolio/${portfolioId}/realtime`],
    refetchInterval: 5000, // Update every 5 seconds
    refetchIntervalInBackground: true,
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const getChangeColor = (change: string) => {
    const changeNum = parseFloat(change);
    if (changeNum > 0) return 'text-green-600';
    if (changeNum < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: string) => {
    const changeNum = parseFloat(change);
    if (changeNum > 0) return <TrendingUp className="h-4 w-4" />;
    if (changeNum < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Loading Portfolio...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { portfolio, holdings, lastUpdate } = portfolioData || {};

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Activity className={`h-5 w-5 mr-2 ${isFetching ? 'animate-pulse text-blue-500' : 'text-green-500'}`} />
            Real-Time Portfolio Value
          </CardTitle>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {portfolio && (
          <div className="space-y-6">
            {/* Total Value */}
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(portfolio.totalValue)}
              </div>
              {portfolio.dayChange && (
                <div className={`flex items-center space-x-1 mt-1 ${getChangeColor(portfolio.dayChange)}`}>
                  {getChangeIcon(portfolio.dayChange)}
                  <span className="font-medium">
                    {portfolio.dayChange} ({portfolio.dayChangePercent}%)
                  </span>
                  <span className="text-sm text-gray-500">today</span>
                </div>
              )}
            </div>

            {/* Holdings */}
            {holdings && holdings.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Live Holdings</h4>
                <div className="space-y-2">
                  {holdings.slice(0, 4).map((holding: any) => (
                    <div key={holding.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{holding.symbol}</div>
                        <div className="text-xs text-gray-500">
                          {holding.quantity} shares @ {formatCurrency(holding.currentPrice || '0')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          {formatCurrency(holding.currentValue)}
                        </div>
                        {holding.dayChangePercent && (
                          <div className={`text-xs ${getChangeColor(holding.dayChangePercent)}`}>
                            {holding.dayChangePercent}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Update */}
            <div className="text-xs text-gray-500 border-t pt-3">
              Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Just now'}
              {isFetching && (
                <span className="ml-2 text-blue-500">
                  <RefreshCw className="h-3 w-3 animate-spin inline" /> Updating...
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}