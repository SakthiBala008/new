import { Wallet, TrendingUp, Shield, BarChart3 } from "lucide-react";

interface StatsOverviewProps {
  data?: {
    totalValue: string;
    expectedReturn: string;
    riskScore: string;
    sharpeRatio: string;
  };
}

export default function StatsOverview({ data }: StatsOverviewProps) {
  const stats = [
    {
      label: "Total Portfolio Value",
      value: data ? `₹${parseFloat(data.totalValue).toLocaleString('en-IN')}` : "₹24,56,780",
      change: "+12.5%",
      changeLabel: "vs last month",
      icon: Wallet,
      bgColor: "bg-primary-100",
      iconColor: "text-primary-600",
    },
    {
      label: "Expected Returns",
      value: data ? `${data.expectedReturn}%` : "14.2%",
      change: "Optimized",
      changeLabel: "by AI models",
      icon: TrendingUp,
      bgColor: "bg-success-100",
      iconColor: "text-success-600",
    },
    {
      label: "Risk Score",
      value: data ? `${data.riskScore}/10` : "6.8/10",
      change: "Moderate",
      changeLabel: "risk profile",
      icon: Shield,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Sharpe Ratio",
      value: data?.sharpeRatio || "1.85",
      change: "Excellent",
      changeLabel: "risk-adjusted return",
      icon: BarChart3,
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-success-600 text-sm font-medium">{stat.change}</span>
              <span className="text-slate-500 text-sm ml-1">{stat.changeLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
