import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — AquaIntel" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, roles } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name").eq("id", user.id).single().then(({ data }) => {
      if (data) setName(data.name);
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name, updated_at: new Date().toISOString() }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account preferences.</p>
      </div>
      <div className="glass rounded-2xl p-6 max-w-2xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-aurora text-xl font-bold text-primary-foreground">
            {(user?.email ?? "U")[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{user?.email}</div>
            <div className="text-xs text-muted-foreground capitalize">Role: {roles[0] ?? "viewer"}</div>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="mt-1.5 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-aqua/60" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input value={user?.email ?? ""} disabled className="mt-1.5 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm opacity-60" />
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-aurora px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-aqua disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
        </button>
      </div>
    </div>
  );
}
