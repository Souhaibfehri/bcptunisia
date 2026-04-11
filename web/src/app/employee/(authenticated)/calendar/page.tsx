import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import { embedOne } from "@/lib/supabase/embed";
import {
  WEEKDAYS_FR,
  formatYmd,
  addDays,
  leaveSpansDay,
  buildLeaveCalendarHref,
  computeCalendarRange,
} from "@/lib/hr/calendar";
import { buttonClass } from "@/components/ui/button-variants";

export const dynamic = "force-dynamic";

const BASE = "/employee/calendar";

type LeaveRow = {
  id: string;
  starts_on: string;
  ends_on: string;
  status: string;
  hr_leave_types: unknown;
};

type Props = { searchParams: Promise<{ month?: string; view?: string; at?: string }> };

export default async function EmployeeLeaveCalendarPage({ searchParams }: Props) {
  const profile = await getProfile();
  if (!profile) redirect("/portal/login?next=/employee/calendar");
  const supabase = await createServerSupabaseClient();
  const { data: empRow } = await supabase.from("hr_employees").select("id").eq("user_id", profile.id).maybeSingle();
  if (!empRow) redirect("/portal/dashboard");

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

  const { data: rows } = await supabase
    .from("hr_leave_requests")
    .select("id, starts_on, ends_on, status, hr_leave_types ( label )")
    .eq("employee_id", empRow.id)
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

  const href = (p: { month: string; view: typeof view; at?: string }) => buildLeaveCalendarHref(BASE, p);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-bcp-anthracite">Mon calendrier congés</h1>
          <p className="mt-1 text-sm text-bcp-muted capitalize">{periodTitle}</p>
          <p className="text-xs text-bcp-muted">
            {rangeStartStr} → {rangeEndStr}
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
            <Link href={href({ month: prevYm, view: "month" })} className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold hover:bg-bcp-surface">
              ← Mois précédent
            </Link>
            <Link href={href({ month: nextYm, view: "month" })} className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold hover:bg-bcp-surface">
              Mois suivant →
            </Link>
          </>
        ) : view === "week" ? (
          <>
            <Link href={href({ month: ym, view: "week", at: prevWeekAt })} className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold hover:bg-bcp-surface">
              ← Semaine précédente
            </Link>
            <Link href={href({ month: ym, view: "week", at: nextWeekAt })} className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold hover:bg-bcp-surface">
              Semaine suivante →
            </Link>
          </>
        ) : (
          <>
            <Link href={href({ month: ym, view: "2week", at: prev2At })} className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold hover:bg-bcp-surface">
              ← 2 semaines avant
            </Link>
            <Link href={href({ month: ym, view: "2week", at: next2At })} className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold hover:bg-bcp-surface">
              2 semaines après →
            </Link>
          </>
        )}
        <Link href="/employee/leave" className={buttonClass({ size: "sm" })}>
          Mes demandes
        </Link>
      </div>

      <section className="bcp-card rounded-2xl border border-bcp-border bg-white p-4 shadow-sm sm:p-6">
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
                className={`min-h-[5rem] p-1.5 text-left sm:min-h-[6rem] ${
                  inMonth ? `bcp-cal-day ${isToday ? "bcp-cal-day--today" : ""}` : "rounded-lg border border-transparent bg-bcp-cream/30 text-bcp-muted"
                }`}
              >
                <div className={`text-xs font-semibold ${inMonth ? "text-bcp-anthracite" : "text-bcp-muted"}`}>{date.getDate()}</div>
                <ul className="mt-1 space-y-0.5">
                  {dayLeaves.map((r) => {
                    const lt = embedOne<{ label: string }>(r.hr_leave_types);
                    return (
                      <li
                        key={r.id}
                        className="truncate rounded border border-bcp-navy/12 bg-[var(--status-info-bg)] px-1 py-0.5 text-[10px] text-[var(--status-info-fg)] sm:text-xs"
                        title={`${lt?.label} — ${r.status}`}
                      >
                        {lt?.label} · {r.status}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
