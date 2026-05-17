import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Brain, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { runForecast } from "@/lib/forecast.functions";
import { ChartCard } from "./dashboard";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/forecast")({
  head: () => ({ meta: [{ title: "Forecast Center — AquaIntel" }] }),
  component: ForecastPage,
});

function ForecastPage() {
  const [city, setCity] = useState("Mumbai");
  const [years, setYears] = useState(10);
  const forecastFn = useServerFn(runForecast);

  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data } = await supabase.from("water_data").select("city");
      return Array.from(new Set((data ?? []).map((d) => d.city)));
    },
  });

  const { data: history } = useQuery({
    queryKey: ["water-history", city],
    queryFn: async () => {
      const { data } = await supabase.from("water_data").select("*").eq("city", city).order("year");
      return data ?? [];
    },
  });

  const mutation = useMutation({
    mutationFn: () => forecastFn({ data: { city, yearsAhead: years } }),
    onSuccess: (res) => {
      if (res.error) toast.error(res.error);
      else toast.success(`Forecast generated for ${city}`);
    },
  });

  const forecast = mutation.data?.forecast ?? [];
  const recommendation = mutation.data?.recommendation ?? "";
  const peak = forecast[forecast.length - 1];

  const combined = [
    ...(history ?? []).map((h) => ({ year: h.year, historical: Number(h.water_consumption), predicted: null as number | null })),
    ...forecast.map((f) => ({ year: f.year, historical: null as number | null, predicted: f.predicted_demand })),
  ];

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-aqua">
          <Brain className="h-3 w-3" /> Forecast Center
        </div>
        <h1 className="mt-3 text-3xl font-bold">Year-by-Year Demand Forecasting</h1>
        <p className="mt-1 text-sm text-muted-foreground">ML predictions using linear regression + population-weighted ensemble models.</p>
      </div>

      <div className="glass-strong rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-[1fr,1fr,auto] md:items-end">
          <div>
            <label className="text-xs font-medium text-muted-foreground">City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1.5 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm">
              {(cities ?? ["Mumbai", "Delhi", "Bengaluru", "Chennai"]).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Forecast horizon</label>
            <select value={years} onChange={(e) => setYears(Number(e.target.value))} className="mt-1.5 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm">
              <option value={1}>Next year (2026)</option>
              <option value={5}>Next 5 years</option>
              <option value={10}>Next 10 years</option>
              <option value={15}>Next 15 years</option>
            </select>
          </div>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-aurora px-6 py-2.5 text-sm font-semibold text-primary-foreground glow-aqua disabled:opacity-60">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Run forecast
          </button>
        </div>
      </div>

      {forecast.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label={`Peak demand (${peak?.year})`} value={`${peak?.predicted_demand.toLocaleString()} ML/day`} tone="aqua" />
            <SummaryCard label="Avg confidence" value={`${Math.round(forecast.reduce((s, f) => s + f.confidence, 0) / forecast.length)}%`} tone="aqua" />
            <SummaryCard label="Sustainability (final)" value={`${peak?.sustainability_score}/100`} tone={peak && peak.sustainability_score < 50 ? "warn" : "aqua"} />
            <SummaryCard label="Shortage probability" value={`${peak?.shortage_probability}%`} tone={peak && peak.shortage_probability > 50 ? "warn" : "aqua"} />
          </div>

          <ChartCard title="Historical + Predicted Demand" subtitle={`${city} · ML/day`}>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={combined}>
                <defs>
                  <linearGradient id="gh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0.5} /><stop offset="100%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.74 0.18 295)" stopOpacity={0.5} /><stop offset="100%" stopColor="oklch(0.74 0.18 295)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="year" stroke="oklch(0.72 0.04 250)" fontSize={12} />
                <YAxis stroke="oklch(0.72 0.04 250)" fontSize={12} />
                <Tooltip contentStyle={{ background: "oklch(0.19 0.05 268)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="historical" stroke="oklch(0.78 0.16 200)" strokeWidth={2} fill="url(#gh)" connectNulls={false} />
                <Area type="monotone" dataKey="predicted" stroke="oklch(0.74 0.18 295)" strokeWidth={2} strokeDasharray="6 4" fill="url(#gp)" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Sustainability & Shortage Trajectory" subtitle="Per-year projections">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={forecast}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.06)" />
                  <XAxis dataKey="year" stroke="oklch(0.72 0.04 250)" fontSize={12} />
                  <YAxis stroke="oklch(0.72 0.04 250)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "oklch(0.19 0.05 268)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line dataKey="sustainability_score" stroke="oklch(0.78 0.18 160)" strokeWidth={2} />
                  <Line dataKey="shortage_probability" stroke="oklch(0.65 0.23 25)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> AI Recommendation</h3>
              <p className="mt-3 text-sm leading-relaxed">{recommendation}</p>
              <div className="mt-4 space-y-2">
                {forecast.slice(0, 6).map((f) => (
                  <div key={f.year} className="flex items-center justify-between rounded-lg bg-white/5 p-2.5 text-xs">
                    <span className="font-semibold">{f.year}</span>
                    <span className="text-muted-foreground">{f.predicted_demand.toLocaleString()} ML/day</span>
                    <span className={`rounded-full px-2 py-0.5 ${f.shortage_probability >= 60 ? "bg-destructive/20 text-destructive" : f.shortage_probability >= 30 ? "bg-warning/20 text-warning" : "bg-aqua/20 text-aqua"}`}>
                      {f.shortage_probability}% risk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {forecast.length === 0 && !mutation.isPending && (
        <div className="glass rounded-2xl p-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-aqua opacity-50" />
          <p className="mt-4 text-sm text-muted-foreground">Select a city and horizon, then run forecast to generate year-by-year predictions.</p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "aqua" | "warn" }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${tone === "warn" ? "text-warning" : "text-gradient-aurora"}`}>{value}</div>
    </div>
  );
}
