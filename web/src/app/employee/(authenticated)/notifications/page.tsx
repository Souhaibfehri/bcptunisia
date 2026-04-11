import Link from "next/link";
import { getProfile } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import { NotificationList, type NotificationRow } from "@/components/notifications/NotificationList";
import {
  fetchNotificationsForCurrentUser,
  getNotificationTabCounts,
  parseNotificationFilter,
} from "@/lib/notifications/queries";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ filter?: string }> };

export default async function EmployeeNotificationsPage({ searchParams }: PageProps) {
  const profile = await getProfile();
  if (!profile) redirect("/portal/login?next=/employee/notifications");
  const sp = await searchParams;
  const filter = parseNotificationFilter(sp.filter);
  const [rows, tabCounts] = await Promise.all([
    fetchNotificationsForCurrentUser(filter, 100),
    getNotificationTabCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/employee" className="text-xs font-medium text-bcp-navy hover:underline">
          ← Accueil employé
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-bcp-anthracite">Notifications</h1>
        <p className="mt-1 text-sm text-bcp-muted">Congés, CRM, projets et messages internes.</p>
      </div>
      <NotificationList
        rows={rows as NotificationRow[]}
        returnTo="/employee/notifications"
        listBasePath="/employee/notifications"
        filter={filter}
        tabCounts={tabCounts}
      />
    </div>
  );
}
