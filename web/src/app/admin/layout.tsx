import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getProfile, canAccessAdmin } from "@/lib/supabase/auth";
import { NotificationRealtimeRefresher } from "@/components/notifications/NotificationRealtimeRefresher";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  if (!profile || !canAccessAdmin(profile.role)) {
    redirect("/portal/login?next=/admin");
  }

  return (
    <div className="min-h-screen bg-bcp-surface">
      <NotificationRealtimeRefresher />
      {children}
    </div>
  );
}
