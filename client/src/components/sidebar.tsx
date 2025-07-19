import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Briefcase, 
  Settings, 
  TrendingUp, 
  Shield, 
  FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Portfolio Builder", href: "/portfolio", icon: Briefcase },
  { name: "Optimization", href: "/optimization", icon: Settings },
  { name: "Analysis", href: "/analysis", icon: TrendingUp },
  { name: "Risk Profile", href: "/risk", icon: Shield },
  { name: "Reports", href: "/reports", icon: FileText },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">PortfolioAI</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center px-4 py-3 rounded-lg font-medium transition-colors",
                    isActive 
                      ? "text-primary-600 bg-primary-50" 
                      : "text-slate-600 hover:bg-slate-50"
                  )}>
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
          <div>
            <p className="text-sm font-medium text-slate-900">John Investor</p>
            <p className="text-xs text-slate-500">Premium Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
