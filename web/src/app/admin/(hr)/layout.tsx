import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  getProfile,
  canAccessHrAdmin,
  canAccessProjectsAdmin,
  canAccessBothAdminPlatforms,
} from "@/lib/supabase/auth";
import { AdminPlatformHeader } from "@/components/admin/AdminPlatformHeader";
import { getUnreadNotificationCount } from "@/lib/notifications/queries";

export const dynamic = "force-dynamic";

export default async function AdminHrPlatformLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/portal/login?next=/admin/hr");
  }
  if (!canAccessHrAdmin(profile.role)) {
    if (canAccessProjectsAdmin(profile.role)) {
      redirect("/admin");
    }
    redirect("/portal/login?next=/admin/hr");
  }

  const both = canAccessBothAdminPlatforms(profile.role);
  const unreadNotifications = await getUnreadNotificationCount();

  return (
    <>
      <AdminPlatformHeader
        variant="hr"
        showClientsUsers={false}
        showSwitcherToHr={false}
        showSwitcherToProjects={both}
        unreadNotifications={unreadNotifications}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">{children}</div>
    </>
  );
}
