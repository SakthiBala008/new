interface Stock {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  currentPrice: string;
  changePercent: string;
}

interface TopStocksProps {
  stocks?: Stock[];
}

export default function TopStocks({ stocks }: TopStocksProps) {
  const defaultStocks = [
    { id: 1, symbol: "TCS", name: "Tata Consultancy Services", sector: "IT Services", currentPrice: "3245.00", changePercent: "5.2" },
    { id: 2, symbol: "RIL", name: "Reliance Industries", sector: "Oil & Gas", currentPrice: "2456.75", changePercent: "3.8" },
    { id: 3, symbol: "INFY", name: "Infosys Limited", sector: "IT Services", currentPrice: "1567.50", changePercent: "2.1" },
  ];

  const displayStocks = stocks?.slice(0, 3) || defaultStocks;

  const getStockIcon = (symbol: string) => {
    switch (symbol) {
      case "TCS": return { bg: "bg-gradient-to-r from-blue-500 to-blue-600", text: "TCS" };
      case "RIL": return { bg: "bg-gradient-to-r from-red-500 to-red-600", text: "RIL" };
      case "INFY": return { bg: "bg-gradient-to-r from-purple-500 to-purple-600", text: "INF" };
      default: return { bg: "bg-gradient-to-r from-gray-500 to-gray-600", text: symbol.slice(0, 3) };
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Top Performing Stocks</h3>
      <div className="space-y-4">
        {displayStocks.map((stock) => {
          const icon = getStockIcon(stock.symbol);
          const isPositive = parseFloat(stock.changePercent) > 0;

          return (
            <div key={stock.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${icon.bg} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                  {icon.text}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{stock.name}</p>
                  <p className="text-sm text-slate-500">{stock.sector}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">₹{parseFloat(stock.currentPrice).toLocaleString('en-IN')}</p>
                <p className={`text-sm ${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
                  {isPositive ? '+' : ''}{stock.changePercent}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
