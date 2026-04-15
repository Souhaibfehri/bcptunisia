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
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:py-4 lg:px-6">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
          <Link
            href="/fr"
            className="inline-flex min-h-10 items-center text-xs font-semibold uppercase tracking-wider text-bcp-gold-bright"
          >
            BCP Tunisia
          </Link>
          <span className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden />
          <nav className="-mx-1 flex max-w-full items-center gap-1 overflow-x-auto overflow-y-hidden px-1 pb-1 text-sm [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible sm:pb-0">
            {variant === "projects" ? (
              <>
                <Link
                  href="/admin"
                  className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-2 font-semibold text-white hover:bg-white/10 hover:text-white/90 sm:py-1.5"
                >
                  Tableau de bord
                </Link>
                <span className="text-white/30" aria-hidden>
                  |
                </span>
                <Link
                  href="/admin/projects"
                  className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-2 text-white/80 hover:bg-white/10 hover:text-white sm:py-1.5"
                >
                  Projets
                </Link>
                {showLeads && (
                  <>
                    <span className="text-white/30" aria-hidden>
                      |
                    </span>
                    <Link
                      href="/admin/leads"
                      className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-2 text-white/80 hover:bg-white/10 hover:text-white sm:py-1.5"
                    >
                      Leads
                    </Link>
                  </>
                )}
                {showClientsUsers && (
                  <>
                    <span className="text-white/30" aria-hidden>
                      |
                    </span>
                    <Link
                      href="/admin/clients"
                      className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-2 text-white/80 hover:bg-white/10 hover:text-white sm:py-1.5"
                    >
                      Clients
                    </Link>
                    <span className="text-white/30" aria-hidden>
                      |
                    </span>
                    <Link
                      href="/admin/users"
                      className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-2 text-white/80 hover:bg-white/10 hover:text-white sm:py-1.5"
                    >
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
                <Link
                  href="/admin/hr"
                  className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-2 font-semibold text-white hover:bg-white/10 hover:text-white/90 sm:py-1.5"
                >
                  Tableau de bord RH
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/admin/notifications"
            className="relative inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15 sm:py-1"
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
              className="inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15 sm:py-1"
            >
              Basculer vers RH
            </Link>
          )}
          {variant === "hr" && showSwitcherToProjects && (
            <Link
              href="/admin"
              className="inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15 sm:py-1"
            >
              Basculer vers Projets
            </Link>
          )}
          <Link
            href="/portal/dashboard"
            className="inline-flex min-h-10 items-center text-xs text-white/70 hover:text-white sm:min-h-0"
          >
            Espace client
          </Link>
          <PortalSignOut />
        </div>
      </div>
    </header>
  );
}
