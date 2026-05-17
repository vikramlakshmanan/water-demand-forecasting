import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Bell, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({ meta: [{ title: "Smart Alerts — AquaIntel" }] }),
  component: AlertsPage,
});

function AlertsPage() {
  const qc = useQueryClient();
  const { isAnalyst } = useAuth();
  const { data } = useQuery({
    queryKey: ["alerts-all"],
    queryFn: async () => (await supabase.from("alerts").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const acknowledge = async (id: string) => {
    if (!isAnalyst) return toast.error("Insufficient permissions");
    const { error } = await supabase.from("alerts").update({ status: "acknowledged" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Alert acknowledged");
    qc.invalidateQueries({ queryKey: ["alerts-all"] });
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Smart Alerts</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI-generated warnings across the municipal water network.</p>
      </div>
      <div className="space-y-3">
        {(data ?? []).length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            <Bell className="mx-auto h-12 w-12 opacity-50" />
            <p className="mt-3">No alerts yet.</p>
          </div>
        )}
        {(data ?? []).map((a) => (
          <div key={a.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                  a.severity === "critical" ? "bg-destructive/20" : a.severity === "warning" ? "bg-warning/20" : "bg-aqua/20"
                }`}>
                  <AlertTriangle className={`h-5 w-5 ${
                    a.severity === "critical" ? "text-destructive" : a.severity === "warning" ? "text-warning" : "text-aqua"
                  }`} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{a.city}</span>
                    <span className="text-xs rounded-full bg-white/10 px-2 py-0.5 capitalize">{a.alert_type.replace(/_/g, " ")}</span>
                    <span className={`text-[10px] uppercase rounded-full px-2 py-0.5 ${
                      a.status === "active" ? "bg-destructive/20 text-destructive" :
                      a.status === "acknowledged" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
                    }`}>{a.status}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{a.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
              {a.status === "active" && (
                <button onClick={() => acknowledge(a.id)} className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">
                  <CheckCircle className="h-3.5 w-3.5" /> Acknowledge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
