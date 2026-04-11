import Link from "next/link";
import { getProfile, canAccessAdmin, canAccessHrAdmin, canAccessProjectsAdmin } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import { NotificationList, type NotificationRow } from "@/components/notifications/NotificationList";
import {
  fetchNotificationsForCurrentUser,
  getNotificationTabCounts,
  parseNotificationFilter,
} from "@/lib/notifications/queries";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ filter?: string }> };

export default async function AdminNotificationsPage({ searchParams }: PageProps) {
  const profile = await getProfile();
  if (!profile || !canAccessAdmin(profile.role)) {
    redirect("/portal/login?next=/admin/notifications");
  }
  const sp = await searchParams;
  const filter = parseNotificationFilter(sp.filter);
  const [rows, tabCounts] = await Promise.all([
    fetchNotificationsForCurrentUser(filter, 100),
    getNotificationTabCounts(),
  ]);

  const showProjects = canAccessProjectsAdmin(profile.role);
  const showHr = canAccessHrAdmin(profile.role);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 lg:px-6">
      <div>
        <div className="flex flex-wrap gap-3 text-xs">
          {showProjects ? (
            <Link href="/admin" className="font-medium text-bcp-navy hover:underline">
              ← Projets
            </Link>
          ) : null}
          {showHr ? (
            <Link href="/admin/hr" className="font-medium text-bcp-navy hover:underline">
              ← RH
            </Link>
          ) : null}
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-bcp-anthracite">Notifications</h1>
        <p className="mt-1 text-sm text-bcp-muted">Messages liés à la plateforme (congés, projets, CRM, etc.).</p>
      </div>
      <NotificationList
        rows={rows as NotificationRow[]}
        returnTo="/admin/notifications"
        listBasePath="/admin/notifications"
        filter={filter}
        tabCounts={tabCounts}
      />
    </div>
  );
}
