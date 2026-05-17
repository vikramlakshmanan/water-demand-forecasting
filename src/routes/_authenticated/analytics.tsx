import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { ChartCard } from "./dashboard";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — AquaIntel" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => (await supabase.from("water_data").select("*").order("year")).data ?? [],
  });
  const rows = data ?? [];
  const latest = rows.filter((r) => r.year === 2025);

  const byCity = latest.map((r) => ({
    city: r.city,
    consumption: Number(r.water_consumption),
    reservoir: Number(r.reservoir_level),
    groundwater: Number(r.groundwater_level),
    rainfall: Number(r.rainfall),
  }));

  const radarData = latest.map((r) => ({
    city: r.city,
    Reservoir: Number(r.reservoir_level),
    Groundwater: Number(r.groundwater_level),
    Rainfall: Math.min(100, Number(r.rainfall) / 30),
    Sustainability: Math.round((Number(r.reservoir_level) + Number(r.groundwater_level)) / 2),
  }));

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cross-dimensional comparisons across monitored cities.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Consumption by City (2025)" subtitle="ML/day">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byCity}>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="city" stroke="oklch(0.72 0.04 250)" fontSize={12} />
              <YAxis stroke="oklch(0.72 0.04 250)" fontSize={12} />
              <Tooltip contentStyle={{ background: "oklch(0.19 0.05 268)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
              <Bar dataKey="consumption" fill="oklch(0.78 0.16 200)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Reservoir vs Groundwater Levels" subtitle="%">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byCity}>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="city" stroke="oklch(0.72 0.04 250)" fontSize={12} />
              <YAxis stroke="oklch(0.72 0.04 250)" fontSize={12} />
              <Tooltip contentStyle={{ background: "oklch(0.19 0.05 268)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="reservoir" fill="oklch(0.78 0.16 200)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="groundwater" fill="oklch(0.74 0.18 295)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Resource Health Radar" subtitle="Multi-metric snapshot per city" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {radarData.map((d) => (
              <div key={d.city}>
                <h4 className="mb-2 text-center text-sm font-semibold">{d.city}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={[d]}>
                    <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
                    <PolarAngleAxis dataKey="city" tick={false} />
                    <PolarRadiusAxis stroke="oklch(0.72 0.04 250)" fontSize={10} angle={90} domain={[0, 100]} />
                    <Radar name={d.city} dataKey="Reservoir" stroke="oklch(0.78 0.16 200)" fill="oklch(0.78 0.16 200)" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
