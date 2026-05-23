import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  component: Profile,
});

function Profile() {
  const nav = useNavigate();
  const [profile, setProfile] = useState<{ name: string; section: string; invite_code_used: string | null } | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase.from("profiles").select("name, section, invite_code_used").eq("id", user.id).maybeSingle();
      setProfile(data);
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    nav({ to: "/" });
  };

  return (
    <main className="px-5 pt-10 pb-6 animate-[fade-in_0.4s_ease-out]">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      <div className="mt-6 rounded-3xl bg-surface border border-border/60 p-6 text-center shadow-card">
        <div className="h-20 w-20 mx-auto rounded-full gradient-primary grid place-items-center text-primary-foreground text-2xl font-bold shadow-glow">
          {profile?.name?.[0]?.toUpperCase() ?? "·"}
        </div>
        {profile ? (
          <>
            <p className="mt-4 text-lg font-semibold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">
              Class 11 · Section {profile.section}
            </div>
          </>
        ) : (
          <>
            <Skeleton className="h-5 w-32 mx-auto mt-4" />
            <Skeleton className="h-4 w-48 mx-auto mt-2" />
          </>
        )}
      </div>

      {profile?.invite_code_used && (
        <div className="mt-4 rounded-2xl bg-surface border border-border/60 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Invite code</p>
            <p className="text-sm font-mono mt-0.5">{profile.invite_code_used}</p>
          </div>
        </div>
      )}

      <button
        onClick={signOut}
        className="mt-6 w-full h-12 rounded-2xl bg-surface border border-border text-destructive font-medium flex items-center justify-center gap-2 hover:bg-surface-elevated transition-all"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </main>
  );
}
