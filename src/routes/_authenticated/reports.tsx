import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — AquaIntel" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["reports-data"],
    queryFn: async () => (await supabase.from("water_data").select("*").order("year")).data ?? [],
  });

  const exportCSV = () => {
    const rows = data ?? [];
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map((r: any) => headers.map((h) => r[h]).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `aquaintel-report-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const reports = [
    { title: "Municipal Water Analytics Report 2025", desc: "Full year-end summary across all monitored cities", type: "Annual" },
    { title: "Reservoir Sustainability Outlook", desc: "10-year projection of reservoir & groundwater levels", type: "Forecast" },
    { title: "Shortage Risk Assessment", desc: "City-by-city probability scoring with mitigation actions", type: "Risk" },
    { title: "Industrial vs Domestic Usage", desc: "Breakdown of consumption patterns by sector", type: "Breakdown" },
  ];

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Generate municipal analytics reports and export data.</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-lg bg-aurora px-4 py-2 text-sm font-semibold text-primary-foreground glow-aqua">
          <Download className="h-4 w-4" /> Export full CSV
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <div key={r.title} className="glass group rounded-2xl p-5 transition hover:bg-white/[0.06]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aurora/20"><FileText className="h-5 w-5 text-aqua" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{r.title}</h3>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-muted-foreground">{r.type}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                <button onClick={exportCSV} className="mt-3 inline-flex items-center gap-1.5 text-xs text-aqua hover:underline">
                  <Download className="h-3 w-3" /> Download CSV
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
