import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

export const Route = createFileRoute("/admin/_panel/invite-codes")({
  component: InviteCodesPage,
});

type Row = { id: string; code: string; used_by: string | null; created_at: string };

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function InviteCodesPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [custom, setCustom] = useState("");
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  const load = async () => {
    setRows(null);
    const { data, error } = await supabase
      .from("invite_codes")
      .select("id, code, used_by, created_at")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setRows(data ?? []);
    const ids = Array.from(new Set((data ?? []).map((r) => r.used_by).filter(Boolean) as string[]));
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles").select("id, name").in("id", ids);
      setProfiles(Object.fromEntries((ps ?? []).map((p: any) => [p.id, p.name])));
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setCreating(true);
    const code = (custom.trim() || genCode()).toUpperCase();
    const { error } = await supabase.from("invite_codes").insert({ code });
    setCreating(false);
    if (error) return toast.error(error.message);
    setCustom("");
    toast.success(`Invite created: ${code}`);
    load();
  };

  const remove = async (id: string, used: boolean) => {
    if (used) return toast.error("Cannot delete a used code");
    if (!confirm("Delete this invite code?")) return;
    const { error } = await supabase.from("invite_codes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Copied");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Invite codes</h1>
        <p className="text-sm text-muted-foreground mt-1">Required for students to sign up.</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface/40 p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <KeyRound className="h-5 w-5 text-primary hidden sm:block" />
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value.toUpperCase())}
          placeholder="Optional custom code (else random 8-char)"
          className="flex-1 h-10 rounded-lg bg-background border border-border px-3 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={create}
          disabled={creating}
          className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-glow inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Generate
        </button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase tracking-wider bg-surface-elevated/40">
            <tr>
              <th className="text-left font-medium px-4 py-3">Code</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Used by</th>
              <th className="text-left font-medium px-4 py-3">Created</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {rows === null ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-t border-border/60"><td colSpan={5} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td></tr>
              ))
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No invite codes yet.</td></tr>
            ) : (
              rows.map((r) => {
                const used = !!r.used_by;
                return (
                  <tr key={r.id} className="border-t border-border/60 hover:bg-surface-elevated/30">
                    <td className="px-4 py-3">
                      <button onClick={() => copy(r.code)} className="inline-flex items-center gap-1.5 font-mono text-sm hover:text-primary">
                        {r.code} <Copy className="h-3 w-3 opacity-60" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${used ? "bg-muted text-muted-foreground border-border/60" : "bg-success/15 text-success border-success/30"}`}>
                        {used ? "Used" : "Available"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{used ? (profiles[r.used_by!] ?? r.used_by) : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(r.id, used)}
                        disabled={used}
                        className="h-8 w-8 grid place-items-center rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
