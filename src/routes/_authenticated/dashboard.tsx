import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, ArrowUpRight, Droplets, Gauge, TrendingUp, Users, Waves } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line, BarChart, Bar, CartesianGrid, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AquaIntel" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const [waterRes, alertsRes] = await Promise.all([
        supabase.from("water_data").select("*").order("year", { ascending: true }),
        supabase.from("alerts").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(5),
      ]);
      return { water: waterRes.data ?? [], alerts: alertsRes.data ?? [] };
    },
  });

  const water = data?.water ?? [];
  const alerts = data?.alerts ?? [];
  const latest = water.filter((w) => w.year === 2025);
  const totalDemand = latest.reduce((sum, w) => sum + Number(w.water_consumption), 0);
  const totalPop = latest.reduce((sum, w) => sum + Number(w.population), 0);
  const avgReservoir = latest.length ? Math.round(latest.reduce((s, w) => s + Number(w.reservoir_level), 0) / latest.length) : 0;
  const criticalCount = latest.filter((w) => w.demand_level === "critical").length;

  // Aggregate yearly totals
  const yearlyAgg = Array.from(new Set(water.map((w) => w.year))).sort().map((year) => {
    const rows = water.filter((w) => w.year === year);
    return {
      year,
      consumption: rows.reduce((s, w) => s + Number(w.water_consumption), 0),
      rainfall: Math.round(rows.reduce((s, w) => s + Number(w.rainfall), 0) / rows.length),
      reservoir: Math.round(rows.reduce((s, w) => s + Number(w.reservoir_level), 0) / rows.length),
      population: rows.reduce((s, w) => s + Number(w.population), 0) / 1_000_000,
    };
  });

  const cityBreakdown = latest.map((w) => ({
    city: w.city,
    domestic: Number(w.domestic_usage),
    industrial: Number(w.industrial_usage),
  }));

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Municipal Intelligence Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live water analytics across monitored cities · 2025</p>
        </div>
        <button onClick={() => navigate({ to: "/forecast" })} className="inline-flex items-center gap-2 rounded-lg bg-aurora px-4 py-2 text-sm font-semibold text-primary-foreground glow-aqua">
          Run forecast <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? <SkeletonGrid /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Droplets} label="Total Demand (ML/day)" value={totalDemand.toLocaleString()} delta="+3.1% YoY" tone="aqua" />
            <Stat icon={Gauge} label="Avg Reservoir Level" value={`${avgReservoir}%`} delta={avgReservoir < 60 ? "Below threshold" : "Stable"} tone={avgReservoir < 60 ? "warn" : "aqua"} />
            <Stat icon={Users} label="Population Covered" value={`${(totalPop / 1_000_000).toFixed(1)}M`} delta="+1.8% YoY" tone="aqua" />
            <Stat icon={AlertTriangle} label="Cities in Critical" value={`${criticalCount}`} delta={`${alerts.length} active alerts`} tone={criticalCount > 0 ? "warn" : "aqua"} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="Year-by-Year Total Consumption" subtitle="Combined demand across all monitored cities" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={yearlyAgg}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.06)" />
                  <XAxis dataKey="year" stroke="oklch(0.72 0.04 250)" fontSize={12} />
                  <YAxis stroke="oklch(0.72 0.04 250)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "oklch(0.19 0.05 268)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="consumption" stroke="oklch(0.78 0.16 200)" strokeWidth={2} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Active Alerts" subtitle={`${alerts.length} requires attention`}>
              <div className="space-y-2.5">
                {alerts.length === 0 ? <p className="text-sm text-muted-foreground">No active alerts.</p> : alerts.map((a) => (
                  <div key={a.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${a.severity === "critical" ? "bg-destructive" : a.severity === "warning" ? "bg-warning" : "bg-aqua"}`} />
                        <span className="text-xs font-semibold">{a.city}</span>
                      </div>
                      <span className="text-[10px] uppercase text-muted-foreground">{a.severity}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{a.message}</p>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Rainfall vs Reservoir Level" subtitle="System-wide trend">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={yearlyAgg}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.06)" />
                  <XAxis dataKey="year" stroke="oklch(0.72 0.04 250)" fontSize={12} />
                  <YAxis stroke="oklch(0.72 0.04 250)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "oklch(0.19 0.05 268)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line dataKey="rainfall" stroke="oklch(0.78 0.16 200)" strokeWidth={2} dot={false} />
                  <Line dataKey="reservoir" stroke="oklch(0.74 0.18 295)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Domestic vs Industrial Usage" subtitle="By city (2025)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={cityBreakdown}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.06)" />
                  <XAxis dataKey="city" stroke="oklch(0.72 0.04 250)" fontSize={12} />
                  <YAxis stroke="oklch(0.72 0.04 250)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "oklch(0.19 0.05 268)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="domestic" fill="oklch(0.78 0.16 200)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="industrial" fill="oklch(0.74 0.18 295)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

export function Stat({ icon: Icon, label, value, delta, tone }: { icon: any; label: string; value: string; delta: string; tone: "aqua" | "warn" }) {
  return (
    <div className="glass rounded-2xl p-5 transition hover:bg-white/[0.06]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${tone === "aqua" ? "text-aqua" : "text-warning"}`} />
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
      <div className={`mt-1 text-xs ${tone === "aqua" ? "text-aqua" : "text-warning"}`}>{delta}</div>
    </div>
  );
}

export function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass h-28 animate-pulse rounded-2xl" />
      ))}
    </div>
  );
}
