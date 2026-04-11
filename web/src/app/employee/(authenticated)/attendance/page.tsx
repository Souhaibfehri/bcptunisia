import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { logAttendanceSelf } from "@/app/employee/(authenticated)/actions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function WorkspaceAttendancePage({ searchParams }: Props) {
  const sp = await searchParams;
  const profile = await getProfile();
  const supabase = await createServerSupabaseClient();
  if (!profile) return null;

  const { data: empRow } = await supabase.from("hr_employees").select("id").eq("user_id", profile.id).maybeSingle();
  const { data: schedule } = empRow
    ? await supabase
        .from("hr_work_schedules")
        .select("weekly_hours, notes, effective_from, updated_at")
        .eq("employee_id", empRow.id)
        .maybeSingle()
    : { data: null };

  const { data: events } = empRow
    ? await supabase
        .from("hr_attendance_events")
        .select("id, day, check_in, check_out, notes, created_at")
        .eq("employee_id", empRow.id)
        .order("day", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="space-y-8">
      {sp.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{decodeURIComponent(sp.error)}</p>
      )}
      {sp.success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">Pointage enregistré.</p>
      )}

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Horaire de référence</h2>
        {schedule ? (
          <dl className="mt-3 text-sm text-bcp-anthracite">
            <dt className="text-xs text-bcp-muted">Heures / semaine</dt>
            <dd>{schedule.weekly_hours != null ? `${schedule.weekly_hours} h` : "—"}</dd>
            {schedule.notes && (
              <>
                <dt className="mt-2 text-xs text-bcp-muted">Notes</dt>
                <dd>{schedule.notes}</dd>
              </>
            )}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-bcp-muted">Aucun horaire enregistré par le service RH.</p>
        )}
      </section>

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Saisir un pointage (journal)</h2>
        <p className="mt-1 text-xs text-bcp-muted">Saisie simple à titre indicatif ; le module peut être étendu (badges, validation RH).</p>
        <form action={logAttendanceSelf} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-bcp-muted">Jour</label>
            <input name="day" type="date" required className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-bcp-muted">Arrivée (optionnel)</label>
            <input name="check_in" type="datetime-local" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-bcp-muted">Départ (optionnel)</label>
            <input name="check_out" type="datetime-local" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-bcp-muted">Note</label>
            <input name="notes" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-full bg-bcp-navy px-5 py-2 text-xs font-semibold text-white">
            Enregistrer
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Dernières lignes</h2>
        <ul className="mt-4 divide-y divide-bcp-border text-sm">
          {(events ?? []).map((e) => (
            <li key={e.id} className="flex flex-wrap justify-between gap-2 py-2">
              <span className="font-medium">{e.day}</span>
              <span className="text-xs text-bcp-muted">
                {e.check_in ? `In: ${e.check_in}` : ""}
                {e.check_out ? ` · Out: ${e.check_out}` : ""}
              </span>
            </li>
          ))}
        </ul>
        {(events ?? []).length === 0 && <p className="mt-2 text-sm text-bcp-muted">Aucune saisie.</p>}
      </section>
    </div>
  );
}
