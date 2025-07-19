import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const algorithms = ["MPT", "Black-Litterman"];
const riskTolerances = ["conservative", "moderate", "aggressive"];
const timeHorizons = ["1year", "3years", "5years", "10years"];

export default function OptimizationTools() {
  const [investmentAmount, setInvestmentAmount] = useState("1000000");
  const [riskTolerance, setRiskTolerance] = useState("moderate");
  const [timeHorizon, setTimeHorizon] = useState("5years");
  const [algorithm, setAlgorithm] = useState("MPT");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/optimize-portfolio", {
        userId: 1, // Demo user ID
        investmentAmount: parseFloat(investmentAmount),
        riskTolerance,
        timeHorizon,
        algorithm,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Portfolio Optimized",
        description: `Created optimized portfolio with ${data.optimization.expectedReturn}% expected return`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize portfolio. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleOptimize = () => {
    optimizeMutation.mutate();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Portfolio Optimization Tools</h3>
        <div className="flex space-x-2">
          {algorithms.map((algo) => (
            <Button
              key={algo}
              variant={algorithm === algo ? "default" : "outline"}
              size="sm"
              onClick={() => setAlgorithm(algo)}
              className={algorithm === algo ? "bg-primary-600 text-white" : ""}
            >
              {algo}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border border-slate-200 rounded-lg">
          <Label htmlFor="investment-amount" className="text-sm font-medium text-slate-700 mb-2">
            Investment Amount
          </Label>
          <Input
            id="investment-amount"
            type="number"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-slate-500 mt-1">₹ (Indian Rupees)</p>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg">
          <Label className="text-sm font-medium text-slate-700 mb-2">Risk Tolerance</Label>
          <Select value={riskTolerance} onValueChange={setRiskTolerance}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {riskTolerances.map((tolerance) => (
                <SelectItem key={tolerance} value={tolerance}>
                  {tolerance.charAt(0).toUpperCase() + tolerance.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg">
          <Label className="text-sm font-medium text-slate-700 mb-2">Time Horizon</Label>
          <Select value={timeHorizon} onValueChange={setTimeHorizon}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1year">1 Year</SelectItem>
              <SelectItem value="3years">3 Years</SelectItem>
              <SelectItem value="5years">5 Years</SelectItem>
              <SelectItem value="10years">10+ Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg flex items-end">
          <Button 
            className="w-full bg-primary-600 hover:bg-primary-700"
            onClick={handleOptimize}
            disabled={optimizeMutation.isPending}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {optimizeMutation.isPending ? "Optimizing..." : "Optimize"}
          </Button>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Last optimization:</span>
          <span className="text-sm font-medium text-slate-900">2 hours ago</span>
        </div>
      </div>
    </div>
  );
}
