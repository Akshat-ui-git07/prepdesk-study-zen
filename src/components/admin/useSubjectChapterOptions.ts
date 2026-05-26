import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Option = { value: string; label: string };

export function useSubjects() {
  const [opts, setOpts] = useState<Option[]>([]);
  const [map, setMap] = useState<Record<string, string>>({});
  useEffect(() => {
    supabase.from("subjects").select("id, name").order("name").then(({ data }) => {
      const list = (data ?? []).map((s) => ({ value: s.id, label: s.name }));
      setOpts(list);
      setMap(Object.fromEntries(list.map((o) => [o.value, o.label])));
    });
  }, []);
  return { opts, map };
}

export function useChapters() {
  const [opts, setOpts] = useState<Option[]>([]);
  const [map, setMap] = useState<Record<string, string>>({});
  useEffect(() => {
    supabase
      .from("chapters")
      .select("id, number, name, subject:subjects(name)")
      .order("number")
      .then(({ data }) => {
        const list = (data ?? []).map((c: any) => ({
          value: c.id,
          label: `${c.subject?.name ?? "?"} · Ch ${c.number} — ${c.name}`,
        }));
        setOpts(list);
        setMap(Object.fromEntries(list.map((o) => [o.value, o.label])));
      });
  }, []);
  return { opts, map };
}
