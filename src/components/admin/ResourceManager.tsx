import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2, X, Upload, FileCheck2 } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

export type FieldType = "text" | "textarea" | "number" | "select" | "datetime" | "json" | "file";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string | number;
};

type Row = Record<string, any> & { id: string };

type Props = {
  table: string;
  title: string;
  description?: string;
  fields: Field[];
  /** Columns shown in the list. Each can be a key or a render fn */
  columns: { key: string; label: string; render?: (row: Row) => ReactNode }[];
  orderBy?: { column: string; ascending?: boolean };
  /** Optional select query (defaults to *) for joins. Use with caution. */
  selectQuery?: string;
  /** Hide create button (for read-only resources) */
  readOnly?: boolean;
};

export function ResourceManager({
  table, title, description, fields, columns, orderBy, selectQuery, readOnly,
}: Props) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setRows(null);
    let q = supabase.from(table as any).select(selectQuery ?? "*");
    if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    const { data, error } = await q;
    if (error) { toast.error(error.message); return; }
    setRows((data ?? []) as unknown as Row[]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [table]);

  const remove = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {!readOnly && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-glow active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" /> New
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase tracking-wider bg-surface-elevated/40">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="text-left font-medium px-4 py-3">{c.label}</th>
                ))}
                {!readOnly && <th className="px-4 py-3 w-24" />}
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-border/60">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    ))}
                    {!readOnly && <td />}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-sm text-muted-foreground">No records yet.</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-border/60 hover:bg-surface-elevated/30">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 align-top">
                        {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                      </td>
                    ))}
                    {!readOnly && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditing(row)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-surface-elevated text-muted-foreground hover:text-foreground">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => remove(row.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(creating || editing) && (
        <RecordDialog
          table={table}
          fields={fields}
          initial={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function RecordDialog({
  table, fields, initial, onClose, onSaved,
}: {
  table: string;
  fields: Field[];
  initial: Row | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const v: Record<string, any> = {};
    fields.forEach((f) => {
      const init = initial?.[f.name];
      if (f.type === "datetime" && init) {
        v[f.name] = new Date(init).toISOString().slice(0, 16);
      } else if (f.type === "json") {
        v[f.name] = init ? JSON.stringify(init, null, 2) : "[]";
      } else {
        v[f.name] = init ?? f.defaultValue ?? "";
      }
    });
    return v;
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      for (const f of fields) {
        let v = values[f.name];
        if (v === "" || v === undefined) {
          if (f.required) { toast.error(`${f.label} is required`); setSaving(false); return; }
          v = null;
        }
        if (f.type === "number" && v !== null) v = Number(v);
        if (f.type === "datetime" && v) v = new Date(v).toISOString();
        if (f.type === "json" && v) {
          try { v = JSON.parse(v); } catch { toast.error(`${f.label} must be valid JSON`); setSaving(false); return; }
        }
        payload[f.name] = v;
      }
      const q = initial
        ? supabase.from(table as any).update(payload).eq("id", initial.id)
        : supabase.from(table as any).insert(payload);
      const { error } = await q;
      if (error) throw error;
      toast.success(initial ? "Updated" : "Created");
      onSaved();
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm grid place-items-center p-4 animate-[fade-in_0.15s_ease-out]">
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-border/60 shadow-elevated max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <h2 className="text-base font-semibold">{initial ? "Edit record" : "New record"}</h2>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-surface-elevated text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {f.label}{f.required && <span className="text-destructive ml-1">*</span>}
              </label>
              <div className="mt-1.5">
                {f.type === "textarea" ? (
                  <textarea
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                    placeholder={f.placeholder}
                    rows={4}
                    className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  />
                ) : f.type === "json" ? (
                  <textarea
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                    placeholder={f.placeholder ?? "[]"}
                    rows={8}
                    className="w-full rounded-lg bg-background border border-border px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  />
                ) : f.type === "select" ? (
                  <select
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                    className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">— select —</option>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === "file" ? (
                  <FileUploadInput
                    value={values[f.name] ?? ""}
                    onChange={(v) => setValues({ ...values, [f.name]: v })}
                  />
                ) : (
                  <input
                    type={f.type === "datetime" ? "datetime-local" : f.type === "number" ? "number" : "text"}
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
              </div>
            </div>
          ))}
        </form>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border/60">
          <button onClick={onClose} className="h-10 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button
            onClick={submit}
            disabled={saving}
            className="h-10 px-5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-glow disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {initial ? "Save changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FileUploadInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputId = `file-${Math.random().toString(36).slice(2)}`;

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
      const { error } = await supabase.storage.from("content").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });
      if (error) throw error;
      onChange(path);
      toast.success("File uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const filename = value ? value.split("/").pop() : null;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className={`flex items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          value
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-surface-elevated/50"
        } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Uploading…</span>
          </>
        ) : value ? (
          <div className="text-center px-4">
            <FileCheck2 className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs font-medium truncate max-w-[260px]">{filename}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Tap to replace</p>
          </div>
        ) : (
          <>
            <Upload className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Choose file to upload</span>
          </>
        )}
      </label>
      <input
        id={inputId}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
