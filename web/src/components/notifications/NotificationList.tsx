import Link from "next/link";
import type { NotificationFilter } from "@/lib/notifications/queries";
import {
  markAllNotificationsRead,
  markNotificationRead,
  openNotificationAndMarkRead,
} from "@/lib/notifications/actions";
import { buttonClass } from "@/components/ui/button-variants";

export type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
  kind?: string | null;
  severity?: string | null;
};

function filterHref(base: string, f: NotificationFilter): string {
  if (f === "all") return base;
  return `${base}?filter=${f}`;
}

function tabClass(active: boolean): string {
  return active
    ? "border-bcp-border/70 bg-white font-semibold text-bcp-navy shadow-sm ring-1 ring-bcp-navy/[0.06]"
    : "border-transparent text-bcp-muted hover:bg-bcp-navy/[0.04] hover:text-bcp-anthracite";
}

function kindAccentClass(kind: string | null | undefined): string {
  const k = (kind ?? "").toLowerCase();
  if (k.includes("invoice") || k.includes("payment") || k.includes("facture")) return "border-l-4 border-l-bcp-gold";
  if (k.includes("project") || k.includes("task") || k.includes("projet")) return "border-l-4 border-l-bcp-navy/40";
  if (k.includes("leave") || k.includes("hr") || k.includes("congé")) return "border-l-4 border-l-emerald-500/50";
  if (k.includes("alert") || k.includes("error") || k.includes("urgent")) return "border-l-4 border-l-red-400/80";
  return "border-l-4 border-l-transparent";
}

export function NotificationList({
  rows,
  returnTo,
  listBasePath,
  filter,
  tabCounts,
}: {
  rows: NotificationRow[];
  returnTo: string;
  listBasePath: string;
  filter: NotificationFilter;
  tabCounts: { all: number; unread: number; read: number };
}) {
  const hasUnread = tabCounts.unread > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-0.5 rounded-xl border border-bcp-border/80 bg-bcp-surface/50 p-1 text-sm">
          <Link
            href={filterHref(listBasePath, "all")}
            className={`rounded-lg border border-transparent px-3 py-2 transition-colors ${tabClass(filter === "all")}`}
          >
            Tous
            <span className="ml-1 text-xs opacity-70">({tabCounts.all})</span>
          </Link>
          <Link
            href={filterHref(listBasePath, "unread")}
            className={`rounded-lg border border-transparent px-3 py-2 transition-colors ${tabClass(filter === "unread")}`}
          >
            Non lues
            <span className="ml-1 text-xs opacity-70">({tabCounts.unread})</span>
          </Link>
          <Link
            href={filterHref(listBasePath, "read")}
            className={`rounded-lg border border-transparent px-3 py-2 transition-colors ${tabClass(filter === "read")}`}
          >
            Lues
            <span className="ml-1 text-xs opacity-70">({tabCounts.read})</span>
          </Link>
        </div>
        {hasUnread ? (
          <form action={markAllNotificationsRead}>
            <input type="hidden" name="return_to" value={returnTo} />
            <button type="submit" className={buttonClass({ variant: "secondary", size: "sm", className: "px-4" })}>
              Tout marquer comme lu
            </button>
          </form>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-bcp-border bg-bcp-cream/30 px-6 py-12 text-center">
          <p className="text-sm font-medium text-bcp-anthracite">Aucune notification pour ce filtre.</p>
          <p className="mt-1 text-xs text-bcp-muted">Les alertes importantes apparaîtront ici.</p>
        </div>
      ) : (
        <ul className="divide-y divide-bcp-border overflow-hidden rounded-xl border border-bcp-border bg-bcp-card shadow-sm">
          {rows.map((n) => {
            const urgent = n.severity === "high" || n.severity === "urgent";
            return (
              <li
                key={n.id}
                className={`flex flex-wrap items-start justify-between gap-3 px-4 py-4 pl-3 transition-colors ${kindAccentClass(n.kind)} ${
                  n.read_at ? "bg-bcp-card" : "bg-bcp-cream/35"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {!n.read_at ? (
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-bcp-navy" aria-hidden />
                    ) : null}
                    {urgent ? (
                      <span className="rounded-full border border-amber-200/80 bg-[var(--status-warning-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--status-warning-fg)]">
                        Priorité
                      </span>
                    ) : null}
                    <p className="text-[0.95rem] font-semibold leading-snug text-bcp-anthracite">{n.title}</p>
                  </div>
                  {n.body ? <p className="mt-1.5 text-sm leading-relaxed text-bcp-muted">{n.body}</p> : null}
                  <p className="mt-1.5 text-xs tabular-nums tracking-tight text-bcp-muted">
                    {new Date(n.created_at).toLocaleString("fr-FR")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {n.link ? (
                      <form action={openNotificationAndMarkRead} className="inline">
                        <input type="hidden" name="id" value={n.id} />
                        <input type="hidden" name="target" value={n.link} />
                        <input type="hidden" name="return_to" value={returnTo} />
                        <button type="submit" className={buttonClass({ size: "sm", className: "px-3 py-1 text-xs" })}>
                          Ouvrir
                        </button>
                      </form>
                    ) : null}
                    {!n.read_at ? (
                      <form action={markNotificationRead} className="inline">
                        <input type="hidden" name="id" value={n.id} />
                        <input type="hidden" name="return_to" value={returnTo} />
                        <button type="submit" className={buttonClass({ variant: "secondary", size: "sm", className: "px-3 py-1 text-xs font-medium" })}>
                          Marquer lu
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-bcp-muted">Lu</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
