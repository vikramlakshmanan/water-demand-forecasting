import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/data")({
  head: () => ({ meta: [{ title: "Municipal Data — AquaIntel" }] }),
  component: DataPage,
});

function DataPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["water-data-all"],
    queryFn: async () => (await supabase.from("water_data").select("*").order("year", { ascending: false }).order("city")).data ?? [],
  });

  const filtered = (data ?? []).filter((r) =>
    !search || r.city.toLowerCase().includes(search.toLowerCase()) || String(r.year).includes(search)
  );

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Municipal Data</h1>
        <p className="mt-1 text-sm text-muted-foreground">Historical water records across all monitored cities.</p>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by city or year…" className="w-full rounded-lg bg-white/5 border border-white/10 pl-10 pr-3 py-2.5 text-sm outline-none focus:border-aqua/60" />
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase text-muted-foreground">
              <tr>
                {["Year", "City", "Population", "Rainfall", "Consumption", "Reservoir %", "Groundwater %", "Demand"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No records found.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="border-t border-white/5 transition hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium">{r.year}</td>
                  <td className="px-4 py-3">{r.city}</td>
                  <td className="px-4 py-3">{(Number(r.population) / 1_000_000).toFixed(2)}M</td>
                  <td className="px-4 py-3">{r.rainfall} mm</td>
                  <td className="px-4 py-3">{r.water_consumption} ML/d</td>
                  <td className="px-4 py-3">{r.reservoir_level}%</td>
                  <td className="px-4 py-3">{r.groundwater_level}%</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      r.demand_level === "critical" ? "bg-destructive/20 text-destructive" :
                      r.demand_level === "high" ? "bg-warning/20 text-warning" :
                      "bg-aqua/20 text-aqua"
                    }`}>{r.demand_level}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
