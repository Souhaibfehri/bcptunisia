import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getProfile,
  canAccessEmployeePortal,
  canAccessEmployeeCrm,
  isHrStaff,
  isStaffRole,
  isPeopleManagerRole,
} from "@/lib/supabase/auth";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { NotificationRealtimeRefresher } from "@/components/notifications/NotificationRealtimeRefresher";
import { getUnreadNotificationCount } from "@/lib/notifications/queries";

export const dynamic = "force-dynamic";

export default async function EmployeeAuthenticatedLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/portal/login?next=/employee");
  }
  if (!canAccessEmployeePortal(profile.role)) {
    redirect("/portal/dashboard");
  }

  const supabase = await createServerSupabaseClient();
  const { data: emp } = await supabase
    .from("hr_employees")
    .select("id, user_id, portal_status")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!emp || emp.portal_status !== "active") {
    redirect("/portal/dashboard");
  }

  const showAdminLink = isStaffRole(profile.role) || isHrStaff(profile.role);

  const peopleMgr = isPeopleManagerRole(profile.role);
  const { count: reportCount } = await supabase
    .from("hr_employees")
    .select("user_id", { count: "exact", head: true })
    .eq("manager_user_id", profile.id);
  const hasDirectReports = (reportCount ?? 0) > 0;

  let teamManager = false;
  if (emp.id) {
    const { count: tmCount } = await supabase
      .from("hr_team_members")
      .select("*", { count: "exact", head: true })
      .eq("employee_id", emp.id)
      .eq("role", "manager");
    teamManager = (tmCount ?? 0) > 0;
  }

  const showManagerHub = peopleMgr || hasDirectReports || teamManager;

  const showLeadsCrm = canAccessEmployeeCrm(profile, { employeePortalActive: true });

  const unreadNotifications = await getUnreadNotificationCount();

  return (
    <div className="min-h-screen bg-bcp-surface">
      <NotificationRealtimeRefresher />
      <PortalHeader
        title="Espace employé"
        showAdminLink={showAdminLink}
        showEmployeePortalLink={false}
        notificationsHref="/employee/notifications"
        unreadNotifications={unreadNotifications}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-bcp-anthracite">Mon espace RH</h1>
            <p className="mt-1 text-sm text-bcp-muted">Congés, bulletins, matériel et projets.</p>
          </div>
          <nav className="flex flex-wrap gap-2 border-b border-bcp-border pb-3 text-sm">
            <Link
              href="/employee"
              className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite"
            >
              Accueil
            </Link>
            <Link
              href="/employee/profile"
              className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite"
            >
              Profil
            </Link>
            <Link
              href="/employee/leave"
              className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite"
            >
              Congés
            </Link>
            <Link
              href="/employee/calendar"
              className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite"
            >
              Calendrier
            </Link>
            <Link
              href="/employee/payslips"
              className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite"
            >
              Bulletins
            </Link>
            <Link
              href="/employee/assets"
              className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite"
            >
              Matériel
            </Link>
            <Link
              href="/employee/projects"
              className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite"
            >
              Projets & tâches
            </Link>
            {showLeadsCrm ? (
              <Link
                href="/employee/leads"
                className="rounded-full bg-bcp-gold/15 px-3 py-1 font-medium text-bcp-navy hover:bg-bcp-gold/25"
              >
                Leads / CRM
              </Link>
            ) : null}
            <Link
              href="/employee/attendance"
              className="rounded-full px-3 py-1 text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite"
            >
              Présence
            </Link>
            {showManagerHub ? (
              <>
                <Link
                  href="/employee/manager"
                  className="rounded-full bg-bcp-navy/10 px-3 py-1 text-bcp-navy hover:bg-bcp-navy/15"
                >
                  Espace manager
                </Link>
                <Link
                  href="/employee/manager/leave"
                  className="rounded-full bg-amber-50 px-3 py-1 text-amber-900 hover:bg-amber-100"
                >
                  Équipe — congés
                </Link>
              </>
            ) : null}
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}
