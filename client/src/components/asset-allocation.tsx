import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

const allocations = [
  { name: "Stocks", percentage: 65, color: "bg-primary-500" },
  { name: "Gold", percentage: 25, color: "bg-amber-500" },
  { name: "Cash", percentage: 10, color: "bg-success-500" },
];

export default function AssetAllocation() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Asset Allocation</h3>
      <div className="space-y-4">
        {allocations.map((allocation) => (
          <div key={allocation.name}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${allocation.color} rounded-full`}></div>
                <span className="text-sm font-medium text-slate-700">{allocation.name}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{allocation.percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`${allocation.color} h-2 rounded-full`} 
                style={{ width: `${allocation.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <Button className="w-full bg-primary-600 hover:bg-primary-700">
          <Scale className="w-4 h-4 mr-2" />
          Rebalance Portfolio
        </Button>
      </div>
    </div>
  );
}
