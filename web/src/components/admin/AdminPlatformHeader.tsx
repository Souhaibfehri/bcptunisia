import Link from "next/link";
import { PortalSignOut } from "@/components/portal/PortalSignOut";

type Props = {
  variant: "projects" | "hr";
  showClientsUsers: boolean;
  /** Leads / CRM — super_admin | admin only */
  showLeads?: boolean;
  showSwitcherToHr: boolean;
  showSwitcherToProjects: boolean;
  unreadNotifications?: number;
};

export function AdminPlatformHeader({
  variant,
  showClientsUsers,
  showLeads = false,
  showSwitcherToHr,
  showSwitcherToProjects,
  unreadNotifications = 0,
}: Props) {
  return (
    <header className="border-b border-bcp-border bg-gradient-to-r from-bcp-anthracite to-bcp-navy text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link href="/fr" className="text-xs font-semibold uppercase tracking-wider text-bcp-gold-bright">
            BCP Tunisia
          </Link>
          <span className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden />
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            {variant === "projects" ? (
              <>
                <Link href="/admin" className="font-semibold text-white hover:text-white/90">
                  Tableau de bord
                </Link>
                <span className="text-white/30" aria-hidden>
                  |
                </span>
                <Link href="/admin/projects" className="text-white/80 hover:text-white">
                  Projets
                </Link>
                {showLeads && (
                  <>
                    <span className="text-white/30" aria-hidden>
                      |
                    </span>
                    <Link href="/admin/leads" className="text-white/80 hover:text-white">
                      Leads
                    </Link>
                  </>
                )}
                {showClientsUsers && (
                  <>
                    <span className="text-white/30" aria-hidden>
                      |
                    </span>
                    <Link href="/admin/clients" className="text-white/80 hover:text-white">
                      Clients
                    </Link>
                    <span className="text-white/30" aria-hidden>
                      |
                    </span>
                    <Link href="/admin/users" className="text-white/80 hover:text-white">
                      Utilisateurs
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <span className="text-xs font-medium uppercase tracking-wide text-white/60">Plateforme RH</span>
                <span className="text-white/30" aria-hidden>
                  |
                </span>
                <Link href="/admin/hr" className="font-semibold text-white hover:text-white/90">
                  Tableau de bord RH
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/notifications"
            className="relative rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/15"
          >
            Notifications
            {unreadNotifications > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bcp-gold px-1 text-[10px] font-bold text-bcp-anthracite">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            ) : null}
          </Link>
          {variant === "projects" && showSwitcherToHr && (
            <Link
              href="/admin/hr"
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/15"
            >
              Basculer vers RH
            </Link>
          )}
          {variant === "hr" && showSwitcherToProjects && (
            <Link
              href="/admin"
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/15"
            >
              Basculer vers Projets
            </Link>
          )}
          <Link href="/portal/dashboard" className="text-xs text-white/70 hover:text-white">
            Espace client
          </Link>
          <PortalSignOut />
        </div>
      </div>
    </header>
  );
}
