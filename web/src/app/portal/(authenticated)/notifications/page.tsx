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

export default async function PortalNotificationsPage({ searchParams }: PageProps) {
  const profile = await getProfile();
  if (!profile) redirect("/portal/login");
  const sp = await searchParams;
  const filter = parseNotificationFilter(sp.filter);
  const [rows, tabCounts] = await Promise.all([
    fetchNotificationsForCurrentUser(filter, 100),
    getNotificationTabCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/portal/dashboard" className="text-xs font-medium text-bcp-navy hover:underline">
          ← Tableau de bord
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-bcp-anthracite">Notifications</h1>
        <p className="mt-1 text-sm text-bcp-muted">Actualités sur vos projets et votre compte.</p>
      </div>
      <NotificationList
        rows={rows as NotificationRow[]}
        returnTo="/portal/notifications"
        listBasePath="/portal/notifications"
        filter={filter}
        tabCounts={tabCounts}
      />
    </div>
  );
}
