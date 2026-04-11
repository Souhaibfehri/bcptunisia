"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function PortalSignOut() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        const supabase = createBrowserSupabaseClient();
        await supabase.auth.signOut();
        router.push("/portal/login");
        router.refresh();
      }}
      className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
    >
      Déconnexion
    </button>
  );
}
