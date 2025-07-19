import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OptimizationTools from "@/components/optimization-tools";
import MlModelPerformance from "@/components/ml-model-performance";

export default function Optimization() {
  return (
    <div>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Portfolio Optimization</h2>
            <p className="text-slate-600">Use advanced algorithms to optimize your portfolio allocation</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <OptimizationTools />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Modern Portfolio Theory (MPT)</h4>
                <p className="text-sm text-slate-600">
                  Maximizes expected return for a given level of risk by optimizing asset allocation 
                  based on historical correlations and volatilities.
                </p>
                <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500">
                  <span>• Risk-Return Optimization</span>
                  <span>• Correlation Analysis</span>
                  <span>• Efficient Frontier</span>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Black-Litterman Model</h4>
                <p className="text-sm text-slate-600">
                  Incorporates investor views and market equilibrium assumptions to create 
                  more stable and intuitive portfolio allocations.
                </p>
                <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500">
                  <span>• Market Views</span>
                  <span>• Equilibrium Returns</span>
                  <span>• Uncertainty Modeling</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "2 hours ago", algorithm: "MPT", return: "14.2%", risk: "6.8" },
                  { date: "1 day ago", algorithm: "Black-Litterman", return: "13.8%", risk: "6.2" },
                  { date: "3 days ago", algorithm: "MPT", return: "15.1%", risk: "7.4" },
                ].map((opt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{opt.algorithm}</p>
                      <p className="text-sm text-slate-500">{opt.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-success-600">{opt.return} return</p>
                      <p className="text-xs text-slate-500">{opt.risk} risk score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <MlModelPerformance />
      </div>
    </div>
  );
}
