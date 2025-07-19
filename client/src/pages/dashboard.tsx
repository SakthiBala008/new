import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StatsOverview from "@/components/stats-overview";
import PortfolioPerformanceChart from "@/components/portfolio-performance-chart";
import AssetAllocation from "@/components/asset-allocation";
import MlModelPerformance from "@/components/ml-model-performance";
import TopStocks from "@/components/top-stocks";
import RiskAnalysis from "@/components/risk-analysis";
import OptimizationTools from "@/components/optimization-tools";
import ExportSection from "@/components/export-section";
import { RealTimeTicker } from "@/components/real-time-ticker";
import { RealTimePortfolioValue } from "@/components/real-time-portfolio-value";

export default function Dashboard() {
  // Poll dashboard data every 10 seconds for real-time updates
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/1'], // Using user ID 1 for demo
    refetchInterval: 10000, // Update every 10 seconds
    refetchIntervalInBackground: true,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-slate-900">Error Loading Dashboard</h1>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Failed to load dashboard data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Real-time Stock Ticker */}
      <RealTimeTicker />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Portfolio Dashboard</h2>
            <p className="text-slate-600">Optimize your investments with AI-powered insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-primary-600 hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              New Portfolio
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <StatsOverview data={dashboardData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Performance Chart */}
          <div className="lg:col-span-2">
            <PortfolioPerformanceChart />
          </div>

          {/* Asset Allocation */}
          <AssetAllocation />
        </div>

        {/* ML Model Performance */}
        <MlModelPerformance data={dashboardData?.mlPerformance} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Stocks */}
          <TopStocks stocks={dashboardData?.topStocks} />

          {/* Risk Analysis */}
          <RiskAnalysis portfolioId={1} />
        </div>

        {/* Optimization Tools */}
        <OptimizationTools />

        {/* Export Section */}
        <ExportSection />
      </div>
    </div>
  );
}
