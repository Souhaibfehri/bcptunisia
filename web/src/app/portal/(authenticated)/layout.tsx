import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, isBlockedFromEmployeePortal, isHrStaff, isStaffRole } from "@/lib/supabase/auth";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { NotificationRealtimeRefresher } from "@/components/notifications/NotificationRealtimeRefresher";
import { getUnreadNotificationCount } from "@/lib/notifications/queries";

export const dynamic = "force-dynamic";

export default async function PortalAuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getProfile();

  if (!profile) {
    redirect("/portal/login");
  }

  const showAdminLink = isStaffRole(profile.role) || isHrStaff(profile.role);

  let showEmployeePortalLink = false;
  if (profile.role !== "client" && !isBlockedFromEmployeePortal(profile.role)) {
    const supabase = await createServerSupabaseClient();
    const { data: emp } = await supabase
      .from("hr_employees")
      .select("user_id, portal_status")
      .eq("user_id", profile.id)
      .maybeSingle();
    showEmployeePortalLink = !!emp && emp.portal_status === "active";
  }

  const unreadNotifications = await getUnreadNotificationCount();

  return (
    <div className="min-h-screen bg-bcp-surface">
      <NotificationRealtimeRefresher />
      <PortalHeader
        showAdminLink={showAdminLink}
        showEmployeePortalLink={showEmployeePortalLink}
        notificationsHref="/portal/notifications"
        unreadNotifications={unreadNotifications}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">{children}</div>
    </div>
  );
}
