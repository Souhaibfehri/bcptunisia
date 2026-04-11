import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { embedOne } from "@/lib/supabase/embed";
import { hrEmployeeDisplayName } from "@/lib/hr/display";
import {
  WEEKDAYS_FR,
  formatYmd,
  addDays,
  leaveSpansDay,
  buildLeaveCalendarHref,
  computeCalendarRange,
} from "@/lib/hr/calendar";

export const dynamic = "force-dynamic";

const BASE = "/admin/hr/leave/calendar";

type LeaveRow = {
  id: string;
  starts_on: string;
  ends_on: string;
  status: string;
  employee_id: string;
  hr_employees: unknown;
  hr_leave_types: unknown;
};

type Props = { searchParams: Promise<{ month?: string; view?: string; at?: string }> };

export default async function HrLeaveCalendarPage({ searchParams }: Props) {
  const sp = await searchParams;
  const now = new Date();
  const c = computeCalendarRange(sp, now);
  const {
    rangeStartStr,
    rangeEndStr,
    gridDays,
    year,
    month,
    ym,
    view,
    anchorMonday,
    defaultAt,
    prevYm,
    nextYm,
    prevWeekAt,
    nextWeekAt,
    prev2At,
    next2At,
  } = c;

  const supabase = await createServerSupabaseClient();
  const { data: rows } = await supabase
    .from("hr_leave_requests")
    .select(
      "id, starts_on, ends_on, status, employee_id, hr_employees ( user_id, first_name, last_name, profiles!hr_employees_user_id_fkey ( display_name, email ) ), hr_leave_types ( label )",
    )
    .lte("starts_on", rangeEndStr)
    .gte("ends_on", rangeStartStr)
    .order("starts_on", { ascending: true });

  const leaves = (rows ?? []) as LeaveRow[];

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const periodShort = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  let periodTitle = monthLabel;
  if (view === "week") {
    const a = anchorMonday;
    const b = addDays(a, 6);
    periodTitle = `Semaine du ${periodShort(a)} au ${periodShort(b)}`;
  } else if (view === "2week") {
    const a = anchorMonday;
    const b = addDays(a, 13);
    periodTitle = `Deux semaines : ${periodShort(a)} – ${periodShort(b)}`;
  }

  const leaveLabel = (r: LeaveRow) => {
    const emp = embedOne<{ user_id: string | null; first_name?: string | null; last_name?: string | null; profiles: unknown }>(
      r.hr_employees,
    );
    const name = hrEmployeeDisplayName({
      first_name: emp?.first_name,
      last_name: emp?.last_name,
      user_id: emp?.user_id ?? null,
      profiles: emp?.profiles,
    });
    const lt = embedOne<{ label: string }>(r.hr_leave_types);
    return { name, typeLabel: lt?.label ?? "Congé", status: r.status };
  };

  const href = (p: { month: string; view: typeof view; at?: string }) => buildLeaveCalendarHref(BASE, p);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-bcp-anthracite">Calendrier des congés</h1>
          <p className="mt-1 text-sm text-bcp-muted capitalize">{periodTitle}</p>
          <p className="text-xs text-bcp-muted">
            Période chargée : {rangeStartStr} → {rangeEndStr}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={href({ month: ym, view: "week", at: sp.at ?? defaultAt })}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              view === "week" ? "border-bcp-navy bg-bcp-navy text-white" : "border-bcp-border text-bcp-anthracite hover:bg-bcp-surface"
            }`}
          >
            Semaine
          </Link>
          <Link
            href={href({ month: ym, view: "2week", at: sp.at ?? defaultAt })}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              view === "2week" ? "border-bcp-navy bg-bcp-navy text-white" : "border-bcp-border text-bcp-anthracite hover:bg-bcp-surface"
            }`}
          >
            2 semaines
          </Link>
          <Link
            href={href({ month: ym, view: "month" })}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              view === "month" ? "border-bcp-navy bg-bcp-navy text-white" : "border-bcp-border text-bcp-anthracite hover:bg-bcp-surface"
            }`}
          >
            Mois
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {view === "month" ? (
          <>
            <Link
              href={href({ month: prevYm, view: "month" })}
              className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold text-bcp-anthracite hover:bg-bcp-surface"
            >
              ← Mois précédent
            </Link>
            <Link
              href={href({ month: nextYm, view: "month" })}
              className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold text-bcp-anthracite hover:bg-bcp-surface"
            >
              Mois suivant →
            </Link>
          </>
        ) : view === "week" ? (
          <>
            <Link
              href={href({ month: ym, view: "week", at: prevWeekAt })}
              className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold text-bcp-anthracite hover:bg-bcp-surface"
            >
              ← Semaine précédente
            </Link>
            <Link
              href={href({ month: ym, view: "week", at: nextWeekAt })}
              className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold text-bcp-anthracite hover:bg-bcp-surface"
            >
              Semaine suivante →
            </Link>
          </>
        ) : (
          <>
            <Link
              href={href({ month: ym, view: "2week", at: prev2At })}
              className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold text-bcp-anthracite hover:bg-bcp-surface"
            >
              ← 2 semaines avant
            </Link>
            <Link
              href={href({ month: ym, view: "2week", at: next2At })}
              className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold text-bcp-anthracite hover:bg-bcp-surface"
            >
              2 semaines après →
            </Link>
          </>
        )}
        <Link href="/admin/hr/leave" className="rounded-full bg-bcp-navy px-3 py-1.5 text-xs font-semibold text-white">
          File d&apos;attente
        </Link>
      </div>

      <section className="rounded-2xl border border-bcp-border bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS_FR.map((w) => (
            <div key={w} className="px-1 py-2 text-center text-xs font-semibold uppercase text-bcp-muted">
              {w}
            </div>
          ))}
          {gridDays.map(({ date, inMonth }) => {
            const ymd = formatYmd(date);
            const dayLeaves = leaves.filter((l) => leaveSpansDay(l, ymd));
            const isToday =
              date.getFullYear() === now.getFullYear() &&
              date.getMonth() === now.getMonth() &&
              date.getDate() === now.getDate();
            return (
              <div
                key={ymd}
                className={`min-h-[5.5rem] rounded-lg border p-1.5 text-left sm:min-h-[6.5rem] ${
                  inMonth ? "border-bcp-border bg-white" : "border-transparent bg-bcp-cream/30 text-bcp-muted"
                } ${isToday ? "ring-2 ring-bcp-navy/40" : ""}`}
              >
                <div className={`text-xs font-semibold ${inMonth ? "text-bcp-anthracite" : "text-bcp-muted"}`}>
                  {date.getDate()}
                </div>
                <ul className="mt-1 space-y-0.5">
                  {dayLeaves.slice(0, 4).map((r) => {
                    const { name, typeLabel, status } = leaveLabel(r);
                    return (
                      <li
                        key={r.id}
                        className="truncate rounded bg-bcp-navy/10 px-1 py-0.5 text-[10px] leading-tight text-bcp-navy sm:text-xs"
                        title={`${name} — ${typeLabel} (${status})`}
                      >
                        <span className="font-medium">{name}</span>
                        <span className="text-bcp-muted"> · {typeLabel}</span>
                      </li>
                    );
                  })}
                  {dayLeaves.length > 4 ? (
                    <li className="text-[10px] text-bcp-muted">+{dayLeaves.length - 4} autres</li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-bcp-anthracite">Détail sur la période</h2>
        <ul className="mt-4 divide-y divide-bcp-border text-sm">
          {leaves.map((r) => {
            const { name, typeLabel, status } = leaveLabel(r);
            return (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <span className="font-medium text-bcp-anthracite">{name}</span>
                  <span className="ml-2 text-bcp-muted">
                    {typeLabel} · {r.starts_on} → {r.ends_on}
                  </span>
                </div>
                <span className="rounded-full bg-bcp-surface px-2 py-0.5 text-xs font-medium">{status}</span>
              </li>
            );
          })}
        </ul>
        {leaves.length === 0 && <p className="mt-6 text-center text-sm text-bcp-muted">Aucun congé sur cette période.</p>}
      </section>
    </div>
  );
}
