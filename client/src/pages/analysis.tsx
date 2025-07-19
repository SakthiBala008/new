import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioPerformanceChart from "@/components/portfolio-performance-chart";
import RiskAnalysis from "@/components/risk-analysis";
import TopStocks from "@/components/top-stocks";

export default function Analysis() {
  return (
    <div>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Portfolio Analysis</h2>
            <p className="text-slate-600">Detailed performance and risk analysis</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <PortfolioPerformanceChart />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskAnalysis portfolioId={1} />
          <TopStocks />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Annual Return", value: "14.2%", change: "+2.1%" },
                { label: "Volatility", value: "15.3%", change: "-0.8%" },
                { label: "Alpha", value: "2.4%", change: "+0.6%" },
                { label: "Information Ratio", value: "1.2", change: "+0.1" },
              ].map((metric, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">{metric.label}</span>
                  <div className="text-right">
                    <span className="font-medium text-slate-900">{metric.value}</span>
                    <span className="text-xs text-success-600 ml-2">{metric.change}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sector Allocation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { sector: "Technology", percentage: 35, color: "bg-blue-500" },
                { sector: "Financial Services", percentage: 25, color: "bg-green-500" },
                { sector: "Healthcare", percentage: 15, color: "bg-purple-500" },
                { sector: "Consumer Goods", percentage: 15, color: "bg-orange-500" },
                { sector: "Energy", percentage: 10, color: "bg-red-500" },
              ].map((sector, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{sector.sector}</span>
                    <span>{sector.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`${sector.color} h-2 rounded-full`}
                      style={{ width: `${sector.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benchmark Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Nifty 50", return: "12.1%", outperformance: "+2.1%" },
                { name: "Sensex", return: "11.8%", outperformance: "+2.4%" },
                { name: "Nifty 500", return: "13.2%", outperformance: "+1.0%" },
              ].map((benchmark, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-900">{benchmark.name}</span>
                    <span className="text-sm text-slate-600">{benchmark.return}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-success-600">
                      {benchmark.outperformance} outperformance
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
