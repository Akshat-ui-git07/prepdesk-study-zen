import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Clock, X } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_panel/contributions")({
  component: ContributionsPage,
});

type Row = {
  id: string; type: string; content: string; status: string;
  student_id: string; created_at: string;
};

const STATUSES = ["pending", "approved", "rejected"] as const;

function ContributionsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [filter, setFilter] = useState<string>("pending");
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  const load = async () => {
    setRows(null);
    let q = supabase.from("contributions").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) { toast.error(error.message); return; }
    setRows((data ?? []) as Row[]);
    const ids = Array.from(new Set((data ?? []).map((r: any) => r.student_id)));
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles").select("id, name, section").in("id", ids);
      setProfiles(Object.fromEntries((ps ?? []).map((p: any) => [p.id, `${p.name} · ${p.section}`])));
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("contributions").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Contributions</h1>
          <p className="text-sm text-muted-foreground mt-1">Review student submissions.</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-surface border border-border/60">
          {(["pending", "approved", "rejected", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors",
                filter === s ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {rows === null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-surface/40 p-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-full mt-3" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-surface/40 p-10 text-center text-sm text-muted-foreground">
            No {filter !== "all" ? filter : ""} contributions.
          </div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/60 bg-surface/40 p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                    {r.type}
                  </span>
                  <StatusBadge status={r.status} />
                  <span className="text-xs text-muted-foreground">{profiles[r.student_id] ?? "—"}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{r.content}</p>
              <div className="mt-4 flex gap-2 justify-end">
                {STATUSES.filter((s) => s !== r.status).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(r.id, s)}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors border",
                      s === "approved" && "border-success/40 text-success hover:bg-success/15",
                      s === "rejected" && "border-destructive/40 text-destructive hover:bg-destructive/15",
                      s === "pending" && "border-border text-muted-foreground hover:bg-surface-elevated",
                    )}
                  >
                    {s === "approved" && <Check className="h-3 w-3" />}
                    {s === "rejected" && <X className="h-3 w-3" />}
                    {s === "pending" && <Clock className="h-3 w-3" />}
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === "approved"
    ? "bg-success/15 text-success border-success/30"
    : status === "rejected"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : "bg-warning/15 text-warning border-warning/30";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border", cls)}>
      {status}
    </span>
  );
}
