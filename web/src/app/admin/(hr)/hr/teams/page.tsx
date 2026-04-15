import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { addHrTeamMember, createHrTeam } from "@/app/admin/(hr)/hr/actions";
import { PendingSubmitButton } from "@/components/admin/PendingSubmitButton";
import { DeleteHrTeamButton } from "@/components/hr/DeleteHrTeamButton";
import { embedOne } from "@/lib/supabase/embed";
import { hrEmployeeDisplayName } from "@/lib/hr/display";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchProps = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function HrTeamsPage({ searchParams }: SearchProps) {
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: teams } = await supabase.from("hr_teams").select("id, name, description, created_at").order("name");

  const { data: memberships } = await supabase
    .from("hr_team_members")
    .select("team_id, role, hr_employees ( user_id, first_name, last_name, profiles!hr_employees_user_id_fkey ( display_name, email ) )");

  const { data: employees } = await supabase
    .from("hr_employees")
    .select("id, user_id, first_name, last_name, profiles!hr_employees_user_id_fkey ( display_name, email )")
    .order("created_at", { ascending: false });

  const byTeam = new Map<string, typeof memberships>();
  for (const m of memberships ?? []) {
    const list = byTeam.get(m.team_id) ?? [];
    list.push(m);
    byTeam.set(m.team_id, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-bcp-anthracite">Équipes</h1>
        <p className="mt-1 text-sm text-bcp-muted">
          Groupes pour rattacher des managers (rôle « manager » sur l&apos;équipe) : ils peuvent traiter les congés des membres.
        </p>
      </div>

      <AdminFlashBanner error={sp.error} success={sp.success} />

      <section className="rounded-2xl border border-bcp-border bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Nouvelle équipe</h2>
        <form action={createHrTeam} className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label className="text-xs text-bcp-muted">Nom</label>
            <input name="name" required className="mt-1 rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div className="min-w-[12rem] flex-1">
            <label className="text-xs text-bcp-muted">Description</label>
            <input name="description" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <PendingSubmitButton
            pendingLabel="Création…"
            className="min-h-10 rounded-full bg-bcp-navy px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            Créer
          </PendingSubmitButton>
        </form>
      </section>

      <div className="space-y-6">
        {(teams ?? []).map((t) => {
          const members = byTeam.get(t.id) ?? [];
          return (
            <section key={t.id} className="rounded-2xl border border-bcp-border bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-bcp-anthracite">{t.name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <DeleteHrTeamButton teamId={t.id} teamName={t.name} memberCount={members.length} />
                  <Link href={`/admin/hr/teams/${t.id}`} className="text-xs font-semibold text-bcp-navy hover:underline">
                    Détail équipe →
                  </Link>
                </div>
              </div>
              {t.description && <p className="mt-1 text-sm text-bcp-muted">{t.description}</p>}
              <p className="mt-1 text-xs text-bcp-muted">{members.length} membre{members.length !== 1 ? "s" : ""}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {members.map((m, i) => {
                  const emp = embedOne<{
                    user_id: string | null;
                    first_name?: string | null;
                    last_name?: string | null;
                    profiles: unknown;
                  }>(m.hr_employees);
                  const name = hrEmployeeDisplayName(emp ?? {});
                  return (
                    <li key={`${m.team_id}-${i}`} className="text-bcp-anthracite">
                      {name}{" "}
                      <span className="text-xs text-bcp-muted">({m.role === "manager" ? "Manager" : "Membre"})</span>
                    </li>
                  );
                })}
              </ul>
              {members.length === 0 && <p className="mt-2 text-sm text-bcp-muted">Aucun membre.</p>}

              <form action={addHrTeamMember} className="mt-4 flex flex-col gap-3 border-t border-bcp-border pt-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-2">
                <input type="hidden" name="team_id" value={t.id} />
                <div>
                  <label className="text-xs text-bcp-muted">Ajouter</label>
                  <select name="employee_id" required className="mt-1 block min-w-[12rem] rounded-lg border border-bcp-border px-2 py-2 text-sm">
                    <option value="">—</option>
                    {(employees ?? []).map((e) => (
                      <option key={e.id} value={e.id}>
                        {hrEmployeeDisplayName({
                          first_name: (e as { first_name?: string }).first_name,
                          last_name: (e as { last_name?: string }).last_name,
                          user_id: e.user_id,
                          profiles: e.profiles,
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-bcp-muted">Rôle dans l&apos;équipe</label>
                  <select name="member_role" className="mt-1 block rounded-lg border border-bcp-border px-2 py-2 text-sm">
                    <option value="member">Membre</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <PendingSubmitButton
                  pendingLabel="Ajout…"
                  className="min-h-10 rounded-full border border-bcp-border px-3 py-2 text-xs font-semibold text-bcp-anthracite disabled:opacity-60"
                >
                  Ajouter
                </PendingSubmitButton>
              </form>
            </section>
          );
        })}
      </div>

      {(teams ?? []).length === 0 && (
        <p className="rounded-xl border border-dashed border-bcp-border bg-white px-6 py-10 text-center text-sm text-bcp-muted">
          Aucune équipe. Créez-en une pour regrouper collaborateurs et managers.
        </p>
      )}
    </div>
  );
}
