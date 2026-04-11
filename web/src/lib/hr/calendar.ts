export type CalendarViewMode = "month" | "week" | "2week";

export const WEEKDAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function monthBounds(ym: string): { start: string; end: string; year: number; month: number } {
  const [ys, ms] = ym.split("-");
  const year = Number(ys) || new Date().getFullYear();
  const month = Math.min(12, Math.max(1, Number(ms) || new Date().getMonth() + 1));
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { start, end, year, month };
}

export function parseYmd(s: string | undefined): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function formatYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function mondayOfWeek(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

export function eachDayInclusive(start: Date, end: Date): Date[] {
  const out: Date[] = [];
  for (let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate()); cur <= end; cur = addDays(cur, 1)) {
    out.push(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()));
  }
  return out;
}

export function monthGridDays(year: number, month1to12: number): { date: Date; inMonth: boolean }[] {
  const first = new Date(year, month1to12 - 1, 1);
  const last = new Date(year, month1to12, 0);
  const start = mondayOfWeek(first);
  const endSunday = addDays(mondayOfWeek(last), 6);
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let cur = new Date(start); cur <= endSunday; cur = addDays(cur, 1)) {
    cells.push({
      date: new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()),
      inMonth: cur.getMonth() === month1to12 - 1,
    });
  }
  while (cells.length % 7 !== 0) {
    const lastCell = cells[cells.length - 1]!.date;
    const n = addDays(lastCell, 1);
    cells.push({ date: n, inMonth: false });
  }
  return cells;
}

export function leaveSpansDay(leave: { starts_on: string; ends_on: string }, ymd: string): boolean {
  return leave.starts_on <= ymd && leave.ends_on >= ymd;
}

export function buildLeaveCalendarHref(basePath: string, p: { month: string; view: CalendarViewMode; at?: string }): string {
  const u = new URLSearchParams();
  u.set("month", p.month);
  u.set("view", p.view);
  if (p.at) u.set("at", p.at);
  return `${basePath}?${u.toString()}`;
}

export type CalendarRangeResult = {
  rangeStartStr: string;
  rangeEndStr: string;
  gridDays: { date: Date; inMonth: boolean }[];
  year: number;
  month: number;
  ym: string;
  view: CalendarViewMode;
  anchorMonday: Date;
  defaultAt: string;
  prevYm: string;
  nextYm: string;
  prevWeekAt: string;
  nextWeekAt: string;
  prev2At: string;
  next2At: string;
};

export function computeCalendarRange(
  sp: { month?: string; view?: string; at?: string },
  now: Date = new Date(),
): CalendarRangeResult {
  const defaultYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const ym = (sp.month ?? defaultYm).slice(0, 7);
  const { start, end, year, month } = monthBounds(ym);

  const view: CalendarViewMode =
    sp.view === "week" || sp.view === "2week" || sp.view === "month" ? sp.view : "month";

  const firstOfMonth = new Date(year, month - 1, 1);
  const defaultAt = formatYmd(mondayOfWeek(firstOfMonth));
  const atParsed = parseYmd(sp.at);
  const anchorMonday = view === "month" ? mondayOfWeek(firstOfMonth) : mondayOfWeek(atParsed ?? firstOfMonth);

  let rangeStartStr = start;
  let rangeEndStr = end;
  let gridDays: { date: Date; inMonth: boolean }[] = [];

  if (view === "week") {
    const mon = anchorMonday;
    const sun = addDays(mon, 6);
    rangeStartStr = formatYmd(mon);
    rangeEndStr = formatYmd(sun);
    gridDays = eachDayInclusive(mon, sun).map((date) => ({ date, inMonth: true }));
  } else if (view === "2week") {
    const mon = anchorMonday;
    const endD = addDays(mon, 13);
    rangeStartStr = formatYmd(mon);
    rangeEndStr = formatYmd(endD);
    gridDays = eachDayInclusive(mon, endD).map((date) => ({ date, inMonth: true }));
  } else {
    gridDays = monthGridDays(year, month);
    rangeStartStr = start;
    rangeEndStr = end;
  }

  const prevYmDate = new Date(year, month - 2, 1);
  const nextYmDate = new Date(year, month, 1);
  const prevYm = `${prevYmDate.getFullYear()}-${String(prevYmDate.getMonth() + 1).padStart(2, "0")}`;
  const nextYm = `${nextYmDate.getFullYear()}-${String(nextYmDate.getMonth() + 1).padStart(2, "0")}`;

  const prevWeekAt = formatYmd(addDays(anchorMonday, -7));
  const nextWeekAt = formatYmd(addDays(anchorMonday, 7));
  const prev2At = formatYmd(addDays(anchorMonday, -14));
  const next2At = formatYmd(addDays(anchorMonday, 14));

  return {
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
  };
}
