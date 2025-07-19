import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExportSection from "@/components/export-section";
import { Calendar, TrendingUp, FileText, Clock } from "lucide-react";

export default function Reports() {
  const reports = [
    {
      title: "Monthly Portfolio Review",
      date: "December 2024",
      type: "Performance Report",
      status: "Ready",
      icon: TrendingUp,
    },
    {
      title: "Risk Assessment Report",
      date: "November 2024",
      type: "Risk Analysis",
      status: "Ready",
      icon: FileText,
    },
    {
      title: "Quarterly Optimization",
      date: "Q4 2024",
      type: "Optimization Report",
      status: "Generating",
      icon: Clock,
    },
  ];

  return (
    <div>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Reports & Export</h2>
            <p className="text-slate-600">Download and schedule your portfolio reports</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <ExportSection />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reports.map((report, index) => {
                const Icon = report.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{report.title}</h4>
                        <p className="text-sm text-slate-500">{report.type} • {report.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === "Ready" 
                          ? "bg-success-100 text-success-600" 
                          : "bg-amber-100 text-amber-600"
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <div>
                      <h4 className="font-medium text-slate-900">Weekly Performance</h4>
                      <p className="text-sm text-slate-500">Every Monday at 9:00 AM</p>
                    </div>
                  </div>
                  <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <div>
                      <h4 className="font-medium text-slate-900">Monthly Summary</h4>
                      <p className="text-sm text-slate-500">First day of each month</p>
                    </div>
                  </div>
                  <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center">
                <p className="text-sm text-slate-500">No more scheduled reports</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Performance Summary", description: "Key metrics and returns analysis" },
                { name: "Risk Assessment", description: "Comprehensive risk analysis and metrics" },
                { name: "Asset Allocation", description: "Current allocation and rebalancing suggestions" },
                { name: "Optimization Results", description: "ML model predictions and optimized allocations" },
                { name: "Benchmark Comparison", description: "Performance vs market indices" },
                { name: "Tax Optimization", description: "Tax-efficient investment strategies" },
              ].map((template, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer">
                  <h4 className="font-medium text-slate-900 mb-2">{template.name}</h4>
                  <p className="text-sm text-slate-600">{template.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
