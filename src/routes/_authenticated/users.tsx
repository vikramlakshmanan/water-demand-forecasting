import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users as UsersIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({ meta: [{ title: "Users — AquaIntel" }] }),
  component: UsersPage,
});

function UsersPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
      ]);
      return (profiles.data ?? []).map((p) => ({
        ...p,
        roles: (roles.data ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
      }));
    },
  });

  const updateRole = async (userId: string, role: "admin" | "analyst" | "viewer") => {
    if (!isAdmin) return toast.error("Admins only");
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) return toast.error(error.message);
    toast.success("Role updated");
    qc.invalidateQueries({ queryKey: ["users-list"] });
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">{isAdmin ? "Manage user roles across the platform." : "Read-only view. Admin role required to edit."}</p>
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">User</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Role</th></tr>
            </thead>
            <tbody>
              {(data ?? []).length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-muted-foreground"><UsersIcon className="mx-auto h-8 w-8 opacity-50" /><p className="mt-2">No users yet.</p></td></tr>
              ) : (data ?? []).map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select value={u.roles[0] ?? "viewer"} onChange={(e) => updateRole(u.id, e.target.value as any)} className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-xs">
                        <option value="viewer">Viewer</option>
                        <option value="analyst">Analyst</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="rounded-full bg-aqua/20 px-2 py-0.5 text-xs text-aqua capitalize">{u.roles[0] ?? "viewer"}</span>
                    )}
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
