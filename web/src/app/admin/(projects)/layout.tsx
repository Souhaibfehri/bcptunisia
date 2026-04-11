import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  getProfile,
  canAccessProjectsAdmin,
  canAccessHrAdmin,
  canAccessBothAdminPlatforms,
  isFullAdmin,
} from "@/lib/supabase/auth";
import { AdminPlatformHeader } from "@/components/admin/AdminPlatformHeader";
import { getUnreadNotificationCount } from "@/lib/notifications/queries";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPlatformLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/portal/login?next=/admin");
  }
  if (!canAccessProjectsAdmin(profile.role)) {
    if (canAccessHrAdmin(profile.role)) {
      redirect("/admin/hr");
    }
    redirect("/portal/login?next=/admin");
  }

  const fullAdmin = isFullAdmin(profile.role);
  const both = canAccessBothAdminPlatforms(profile.role);
  const unreadNotifications = await getUnreadNotificationCount();

  return (
    <>
      <AdminPlatformHeader
        variant="projects"
        showClientsUsers={fullAdmin}
        showLeads={fullAdmin}
        showSwitcherToHr={both}
        showSwitcherToProjects={false}
        unreadNotifications={unreadNotifications}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">{children}</div>
    </>
  );
}
