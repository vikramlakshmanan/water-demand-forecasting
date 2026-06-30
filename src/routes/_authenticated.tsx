import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { BarChart3, Bell, Brain, Database, Droplets, FileText, LayoutDashboard, Settings, Sparkles, Upload, Users, AlertTriangle, Activity, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/forecast", label: "Forecast Center", icon: Brain },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/data", label: "Municipal Data", icon: Database },
  { to: "/upload", label: "Upload Dataset", icon: Upload },
  { to: "/alerts", label: "Smart Alerts", icon: Bell },
  { to: "/recommendations", label: "AI Recommendations", icon: Sparkles },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/users", label: "Users", icon: Users },
  { to: "/profile", label: "Profile", icon: Settings },
] as const;

function AuthenticatedLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-white/10 glass-strong p-4 md:flex">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora glow-aqua">
            <Droplets className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Aqua<span className="text-gradient-aurora">Intel</span></span>
        </Link>
        <nav className="mt-8 flex-1 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-aurora text-primary-foreground font-medium glow-aqua"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-white/10 glass-strong px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aurora">
              <Droplets className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">AquaIntel</span>
          </Link>
        </div>
        <div className="md:hidden border-b border-white/10 overflow-x-auto">
          <div className="flex gap-1 px-3 py-2">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} className={`flex-shrink-0 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs ${active ? "bg-aurora text-primary-foreground" : "text-muted-foreground"}`}>
                  <item.icon className="h-3 w-3" /> {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export { AlertTriangle, Activity, TrendingUp };
