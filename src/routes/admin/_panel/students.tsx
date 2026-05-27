import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, ShieldOff, Search } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

export const Route = createFileRoute("/admin/_panel/students")({
  component: StudentsPage,
});

type Row = {
  id: string;
  name: string;
  section: string;
  invite_code_used: string | null;
  created_at: string;
  isAdmin: boolean;
};

function StudentsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    setRows(null);
    const [{ data: profiles, error }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, name, section, invite_code_used, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (error) return toast.error(error.message);
    const adminIds = new Set((roles ?? []).filter((r: any) => r.role === "admin").map((r: any) => r.user_id));
    setRows((profiles ?? []).map((p: any) => ({ ...p, isAdmin: adminIds.has(p.id) })));
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (row: Row) => {
    if (row.isAdmin) {
      if (!confirm(`Revoke admin from ${row.name}?`)) return;
      const { error } = await supabase.from("user_roles").delete().eq("user_id", row.id).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin revoked");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: row.id, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Granted admin");
    }
    load();
  };

  const filtered = rows?.filter((r) =>
    !query || r.name.toLowerCase().includes(query.toLowerCase()) || r.section.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">{rows?.length ?? 0} registered students.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or section"
            className="h-10 pl-9 pr-3 rounded-xl bg-surface border border-border/60 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase tracking-wider bg-surface-elevated/40">
              <tr>
                <th className="text-left font-medium px-4 py-3">Name</th>
                <th className="text-left font-medium px-4 py-3">Section</th>
                <th className="text-left font-medium px-4 py-3">Invite</th>
                <th className="text-left font-medium px-4 py-3">Joined</th>
                <th className="text-left font-medium px-4 py-3">Role</th>
                <th className="px-4 py-3 w-32" />
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-border/60">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered!.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No students found.</td></tr>
              ) : (
                filtered!.map((r) => (
                  <tr key={r.id} className="border-t border-border/60 hover:bg-surface-elevated/30">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.section}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{r.invite_code_used ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {r.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Student</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleAdmin(r)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs border border-border hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
                      >
                        {r.isAdmin ? <><ShieldOff className="h-3 w-3" /> Revoke</> : <><Shield className="h-3 w-3" /> Make admin</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
