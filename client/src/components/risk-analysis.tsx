import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface RiskAnalysisProps {
  portfolioId: number;
}

export default function RiskAnalysis({ portfolioId }: RiskAnalysisProps) {
  const { data: riskMetrics } = useQuery({
    queryKey: ['/api/portfolio', portfolioId, 'risk-metrics'],
  });

  const defaultMetrics = {
    var95: "-45230.00",
    beta: "1.12",
    maxDrawdown: "-8.50",
  };

  const metrics = riskMetrics || defaultMetrics;

  const riskItems = [
    {
      label: "Value at Risk (VaR)",
      value: `₹${Math.abs(parseFloat(metrics.var95)).toLocaleString('en-IN')}`,
      percentage: 15,
      color: "bg-danger-500",
      description: "95% confidence level",
      isNegative: true,
    },
    {
      label: "Beta (Market Sensitivity)",
      value: metrics.beta,
      percentage: 56,
      color: "bg-amber-500",
      description: "Slightly more volatile than market",
      isNegative: false,
    },
    {
      label: "Maximum Drawdown",
      value: `${metrics.maxDrawdown}%`,
      percentage: 25,
      color: "bg-danger-500",
      description: "Largest portfolio decline",
      isNegative: true,
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Risk Analysis</h3>
      
      <div className="space-y-6">
        {riskItems.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              <span className={`text-sm font-semibold ${item.isNegative ? 'text-danger-600' : 'text-slate-900'}`}>
                {item.isNegative && !item.value.startsWith('-') ? '-' : ''}{item.value}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
          </div>
        ))}

        <div className="pt-4 border-t border-slate-200">
          <Button variant="outline" className="w-full border-primary-600 text-primary-600 hover:bg-primary-50">
            <Calculator className="w-4 h-4 mr-2" />
            Run Risk Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
