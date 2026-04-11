"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

/**
 * Refetches server components when the current user receives notification row changes.
 * Relies on Supabase Realtime + RLS (user only receives own rows).
 */
export function NotificationRealtimeRefresher() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let ch: ReturnType<typeof supabase.channel> | null = null;

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      ch = supabase
        .channel(`notifications-self:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            router.refresh();
          },
        )
        .subscribe();
    })();

    return () => {
      if (ch) void supabase.removeChannel(ch);
    };
  }, [router]);

  return null;
}
