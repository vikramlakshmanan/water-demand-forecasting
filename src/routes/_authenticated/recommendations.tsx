import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Droplets, Gauge, TrendingDown, Cloud, Factory } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/recommendations")({
  head: () => ({ meta: [{ title: "AI Recommendations — AquaIntel" }] }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { data } = useQuery({
    queryKey: ["recs-data"],
    queryFn: async () => (await supabase.from("water_data").select("*").eq("year", 2025)).data ?? [],
  });

  const recs = (data ?? []).flatMap((r) => generateRecs(r));

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-accent">
          <Sparkles className="h-3 w-3" /> AI Insights
        </div>
        <h1 className="mt-3 text-3xl font-bold">AI Recommendations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Actionable suggestions derived from current municipal data.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {recs.map((r, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${r.tone === "warn" ? "bg-warning/20" : "bg-aqua/20"}`}>
                <r.icon className={`h-5 w-5 ${r.tone === "warn" ? "text-warning" : "text-aqua"}`} />
              </div>
              <div>
                <div className="font-semibold">{r.city} · {r.title}</div>
                <p className="mt-1.5 text-sm text-muted-foreground">{r.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateRecs(r: any) {
  const out: any[] = [];
  if (Number(r.reservoir_level) < 60) out.push({ city: r.city, title: "Expand reservoir storage", body: `Reservoir at ${r.reservoir_level}% — recommend feasibility study for additional ${Math.round(Number(r.water_consumption) * 0.15)} ML capacity.`, icon: Gauge, tone: "warn" });
  if (Number(r.groundwater_level) < 50) out.push({ city: r.city, title: "Mandate groundwater recharge", body: `Groundwater dropped to ${r.groundwater_level}%. Implement rainwater harvesting mandates and check dam recharge programs.`, icon: TrendingDown, tone: "warn" });
  if (Number(r.rainfall) < 1000 && r.city !== "Delhi") out.push({ city: r.city, title: "Rainfall decline mitigation", body: `Only ${r.rainfall} mm annual rainfall — prioritize watershed protection and inter-basin water transfer planning.`, icon: Cloud, tone: "warn" });
  if (Number(r.industrial_usage) / Number(r.water_consumption) > 0.25) out.push({ city: r.city, title: "Industrial water reallocation", body: `Industrial usage is ${Math.round(Number(r.industrial_usage)/Number(r.water_consumption)*100)}% of total — consider tiered pricing and recycled-water mandates for industrial parks.`, icon: Factory, tone: "aqua" });
  if (out.length === 0) out.push({ city: r.city, title: "System healthy", body: `${r.city}'s water indicators are within sustainable thresholds. Continue current monitoring cadence.`, icon: Droplets, tone: "aqua" });
  return out;
}
