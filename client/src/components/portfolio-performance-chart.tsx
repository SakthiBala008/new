import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { Button } from "@/components/ui/button";

Chart.register(...registerables);

const timeRanges = ["1M", "3M", "1Y", "5Y"];

export default function PortfolioPerformanceChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Destroy existing chart
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
              {
                label: 'Portfolio Value',
                data: [2000000, 2100000, 2050000, 2200000, 2180000, 2350000, 2300000, 2420000, 2380000, 2456780, 2440000, 2456780],
                borderColor: 'hsl(207, 90%, 54%)',
                backgroundColor: 'hsla(207, 90%, 54%, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Benchmark (Nifty 50)',
                data: [2000000, 2080000, 2020000, 2150000, 2130000, 2280000, 2250000, 2340000, 2310000, 2380000, 2360000, 2400000],
                borderColor: 'hsl(215, 20.2%, 65.1%)',
                backgroundColor: 'transparent',
                tension: 0.4,
                borderDash: [5, 5]
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                ticks: {
                  callback: function(value) {
                    return '₹' + (Number(value) / 100000).toFixed(1) + 'L';
                  }
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Portfolio Performance</h3>
        <div className="flex space-x-2">
          {timeRanges.map((range, index) => (
            <Button
              key={range}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
              className={index === 0 ? "bg-primary-600 text-white" : ""}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>
      <div className="h-64">
        <canvas ref={chartRef} className="w-full h-full"></canvas>
      </div>
    </div>
  );
}
