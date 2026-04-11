import Link from "next/link";
import { PortalSignOut } from "./PortalSignOut";

export function PortalHeader({
  title = "Espace client",
  showSignOut = true,
  showAdminLink = false,
  showEmployeePortalLink = false,
  notificationsHref,
  unreadNotifications = 0,
}: {
  title?: string;
  showSignOut?: boolean;
  showAdminLink?: boolean;
  /** Lien vers /employee (collaborateurs avec fiche RH), jamais pour les comptes client */
  showEmployeePortalLink?: boolean;
  notificationsHref?: string;
  unreadNotifications?: number;
}) {
  return (
    <header className="border-b border-white/10 bg-bcp-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link href="/fr" className="text-xs font-semibold uppercase tracking-wider text-bcp-gold-bright">
            BCP Tunisia
          </Link>
          <span className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden />
          <Link href="/portal/dashboard" className="text-sm font-semibold text-white/90 hover:text-white">
            {title}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {notificationsHref ? (
            <Link href={notificationsHref} className="relative text-xs text-white/70 hover:text-white">
              Notifications
              {unreadNotifications > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-bcp-gold px-1 text-[10px] font-bold text-bcp-anthracite">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
              ) : null}
            </Link>
          ) : null}
          {showEmployeePortalLink ? (
            <Link href="/employee" className="hidden text-xs text-white/70 hover:text-white sm:inline">
              Mon espace RH
            </Link>
          ) : null}
          {showAdminLink ? (
            <Link
              href="/admin"
              className="hidden text-xs text-white/70 hover:text-white sm:inline"
            >
              Administration
            </Link>
          ) : null}
          {showSignOut ? <PortalSignOut /> : null}
        </div>
      </div>
    </header>
  );
}
