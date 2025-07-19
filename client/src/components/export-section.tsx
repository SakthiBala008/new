import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExportSection() {
  const { toast } = useToast();

  const handleExportToExcel = async () => {
    try {
      const response = await fetch("/api/portfolio/1/export");
      const data = await response.json();
      
      // Create a downloadable JSON file (in real implementation, this would be an Excel file)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Portfolio data has been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export portfolio data",
        variant: "destructive",
      });
    }
  };

  const handleExportToPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export functionality will be available soon",
    });
  };

  const handleScheduleReport = () => {
    toast({
      title: "Schedule Reports",
      description: "Report scheduling functionality will be available soon",
    });
  };

  const exportOptions = [
    {
      title: "Excel Report",
      description: "Complete portfolio analysis with charts and metrics",
      icon: FileSpreadsheet,
      iconColor: "text-green-600",
      action: handleExportToExcel,
    },
    {
      title: "PDF Summary",
      description: "Executive summary with key insights and recommendations",
      icon: FileText,
      iconColor: "text-red-600",
      action: handleExportToPDF,
    },
    {
      title: "Scheduled Reports",
      description: "Set up automated weekly or monthly reports",
      icon: Clock,
      iconColor: "text-blue-600",
      action: handleScheduleReport,
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Export & Reports</h3>
        <span className="px-3 py-1 bg-success-100 text-success-600 text-sm rounded-full">Ready</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="p-4 h-auto border border-slate-200 hover:border-primary-300 hover:bg-primary-50 text-left justify-start"
              onClick={option.action}
            >
              <div className="flex flex-col items-start space-y-2 w-full">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${option.iconColor}`} />
                  <span className="font-medium text-slate-900">{option.title}</span>
                </div>
                <p className="text-sm text-slate-500 text-left">{option.description}</p>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
