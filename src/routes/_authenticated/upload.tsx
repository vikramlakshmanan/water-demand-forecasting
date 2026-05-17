import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({ meta: [{ title: "Upload Dataset — AquaIntel" }] }),
  component: UploadPage,
});

const REQUIRED_COLS = ["year", "city", "population", "rainfall", "temperature", "humidity", "water_consumption", "industrial_usage", "domestic_usage", "reservoir_level", "groundwater_level"];

function UploadPage() {
  const { isAnalyst } = useAuth();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string[]>([]);
  const [result, setResult] = useState<{ ok: number; failed: number } | null>(null);

  const handleFile = async (file: File) => {
    if (!isAnalyst) return toast.error("Only admins/analysts can upload data.");
    setBusy(true);
    setResult(null);
    try {
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) throw new Error("File is empty");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      setPreview(lines.slice(0, 5));
      const missing = REQUIRED_COLS.filter((c) => !headers.includes(c));
      if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}`);

      const rows = lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim());
        const row: any = {};
        headers.forEach((h, i) => row[h] = vals[i]);
        return {
          year: parseInt(row.year),
          city: row.city,
          area: row.area ?? null,
          population: parseInt(row.population),
          rainfall: parseFloat(row.rainfall),
          temperature: parseFloat(row.temperature),
          humidity: parseFloat(row.humidity),
          water_consumption: parseFloat(row.water_consumption),
          industrial_usage: parseFloat(row.industrial_usage),
          domestic_usage: parseFloat(row.domestic_usage),
          reservoir_level: parseFloat(row.reservoir_level),
          groundwater_level: parseFloat(row.groundwater_level),
          demand_level: row.demand_level ?? "normal",
        };
      });

      const { error } = await supabase.from("water_data").insert(rows);
      if (error) throw error;
      setResult({ ok: rows.length, failed: 0 });
      toast.success(`Imported ${rows.length} records`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
      setResult({ ok: 0, failed: 1 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Upload Dataset</h1>
        <p className="mt-1 text-sm text-muted-foreground">Import historical municipal water records via CSV.</p>
      </div>

      {!isAnalyst && (
        <div className="glass rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
          Your role is read-only. Ask an admin to grant analyst or admin permissions to upload data.
        </div>
      )}

      <label className="glass-strong block cursor-pointer rounded-2xl border-2 border-dashed border-white/15 p-12 text-center transition hover:border-aqua/60">
        <input type="file" accept=".csv" className="hidden" disabled={busy || !isAnalyst} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {busy ? <Loader2 className="mx-auto h-12 w-12 animate-spin text-aqua" /> : <Upload className="mx-auto h-12 w-12 text-aqua" />}
        <p className="mt-4 font-medium">Drop your CSV file or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">Required columns: {REQUIRED_COLS.join(", ")}</p>
      </label>

      {preview.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4" /> Preview</h3>
          <pre className="overflow-x-auto rounded-lg bg-black/30 p-3 text-xs">{preview.join("\n")}</pre>
        </div>
      )}

      {result && (
        <div className={`glass rounded-2xl p-5 ${result.failed ? "border-destructive/30" : "border-success/30"} border`}>
          <p className="text-sm">
            {result.ok > 0 ? `✓ Successfully imported ${result.ok} records.` : "Import failed — check the file format."}
          </p>
        </div>
      )}
    </div>
  );
}
