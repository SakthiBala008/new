import { Button } from "@/components/ui/button";
import { RefreshCw, Brain, Network, TreePine } from "lucide-react";

interface MlModelPerformanceProps {
  data?: Array<{
    modelName: string;
    accuracy: string;
  }>;
}

export default function MlModelPerformance({ data }: MlModelPerformanceProps) {
  const models = data || [
    { modelName: "XGBoost", accuracy: "94.2", icon: Brain, color: "blue" },
    { modelName: "LSTM", accuracy: "91.8", icon: Network, color: "purple" },
    { modelName: "Random Forest", accuracy: "89.5", icon: TreePine, color: "green" },
  ];

  const getModelIcon = (modelName: string) => {
    switch (modelName) {
      case "XGBoost": return Brain;
      case "LSTM": return Network;
      case "Random Forest": return TreePine;
      default: return Brain;
    }
  };

  const getModelColor = (modelName: string) => {
    switch (modelName) {
      case "XGBoost": return { bg: "bg-blue-100", text: "text-blue-600", badge: "bg-success-100 text-success-600" };
      case "LSTM": return { bg: "bg-purple-100", text: "text-purple-600", badge: "bg-blue-100 text-blue-600" };
      case "Random Forest": return { bg: "bg-green-100", text: "text-green-600", badge: "bg-amber-100 text-amber-600" };
      default: return { bg: "bg-blue-100", text: "text-blue-600", badge: "bg-success-100 text-success-600" };
    }
  };

  const getBadgeText = (modelName: string) => {
    switch (modelName) {
      case "XGBoost": return "Best Performance";
      case "LSTM": return "Time Series";
      case "Random Forest": return "Stable";
      default: return "Active";
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">ML Model Performance</h3>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Models
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model) => {
          const Icon = getModelIcon(model.modelName);
          const colors = getModelColor(model.modelName);
          const badgeText = getBadgeText(model.modelName);

          return (
            <div key={model.modelName} className="text-center p-4 border border-slate-200 rounded-lg">
              <div className={`w-12 h-12 ${colors.bg} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <h4 className="font-semibold text-slate-900">{model.modelName}</h4>
              <p className={`text-2xl font-bold ${colors.text} mt-2`}>{model.accuracy}%</p>
              <p className="text-sm text-slate-500">Accuracy</p>
              <div className="mt-3">
                <span className={`px-2 py-1 ${colors.badge} text-xs rounded-full`}>
                  {badgeText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
