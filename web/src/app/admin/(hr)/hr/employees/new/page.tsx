import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { createHrEmployeeRecord } from "@/app/admin/(hr)/hr/actions";
import { embedOne } from "@/lib/supabase/embed";

export const dynamic = "force-dynamic";

type SearchProps = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function HrNewEmployeePage({ searchParams }: SearchProps) {
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: departments } = await supabase.from("hr_departments").select("id, name").order("name");
  const { data: managers } = await supabase
    .from("hr_employees")
    .select("user_id, profiles!hr_employees_user_id_fkey ( display_name, email )")
    .not("user_id", "is", null);
  const { data: teams } = await supabase.from("hr_teams").select("id, name").order("name");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/hr/employees" className="text-xs font-medium text-bcp-navy hover:underline">
            ← Effectifs
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-bcp-anthracite">Ajouter un employé</h1>
          <p className="mt-1 text-sm text-bcp-muted">
            Création de la fiche RH sans compte portail. Vous pourrez activer l&apos;accès plus tard depuis la fiche.
          </p>
        </div>
      </div>

      <AdminFlashBanner error={sp.error} success={sp.success} />

      <form action={createHrEmployeeRecord} className="space-y-8 rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Identité</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-bcp-muted">Prénom *</label>
              <input name="first_name" required className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Nom *</label>
              <input name="last_name" required className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">E-mail personnel *</label>
              <input name="personal_email" type="email" required className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Téléphone personnel</label>
              <input name="personal_phone" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-bcp-muted">Adresse</label>
              <input name="address" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Poste &amp; contrat</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-bcp-muted">N° matricule</label>
              <input name="employee_number" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Intitulé de poste</label>
              <input name="job_title" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Service</label>
              <select name="department_id" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
                <option value="">—</option>
                {(departments ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Manager</label>
              <select name="manager_user_id" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
                <option value="">—</option>
                {(managers ?? [])
                  .filter((m): m is typeof m & { user_id: string } => Boolean(m.user_id))
                  .map((m) => {
                    const pr = embedOne<{ display_name: string | null; email: string | null }>(m.profiles);
                    return (
                      <option key={m.user_id} value={m.user_id}>
                        {pr?.display_name || pr?.email || m.user_id}
                      </option>
                    );
                  })}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Équipe (optionnel)</label>
              <select name="team_id" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
                <option value="">—</option>
                {(teams ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Statut</label>
              <select name="employment_status" defaultValue="active" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
                <option value="active">Actif</option>
                <option value="on_leave">En congé</option>
                <option value="probation">Période d&apos;essai</option>
                <option value="suspended">Suspendu</option>
                <option value="terminated">Sorti</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Type</label>
              <select name="employment_type" defaultValue="employee" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
                <option value="employee">Salarié</option>
                <option value="contractor">Prestataire</option>
                <option value="intern">Stagiaire</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Contrat</label>
              <input name="contract_type" placeholder="CDI, CDD…" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Embauche</label>
              <input name="hire_date" type="date" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Fin</label>
              <input name="end_date" type="date" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">E-mail pro</label>
              <input name="work_email" type="email" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Téléphone pro</label>
              <input name="work_phone" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-bcp-muted">Lieu de travail</label>
              <input name="office_location" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" name="civp_eligible" value="1" id="civp" className="rounded border-bcp-border" />
              <label htmlFor="civp" className="text-sm text-bcp-anthracite">
                Éligible CIVP
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Contact d&apos;urgence</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-bcp-muted">Nom</label>
              <input name="emergency_contact_name" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Téléphone</label>
              <input name="emergency_contact_phone" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Formation (optionnel)</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-bcp-muted">Établissement</label>
              <input name="education_institution" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Diplôme</label>
              <input name="education_degree" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Domaine</label>
              <input name="education_field" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-bcp-muted">Année / fin</label>
              <input name="education_ended_on" type="date" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section>
          <label className="text-xs font-medium text-bcp-muted">Notes RH (non confidentielles)</label>
          <textarea name="employee_notes" rows={3} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
        </section>

        <div className="flex flex-wrap gap-3 border-t border-bcp-border pt-6">
          <button type="submit" className="rounded-full bg-bcp-navy px-6 py-2 text-sm font-semibold text-white">
            Enregistrer la fiche
          </button>
          <Link
            href="/admin/hr/employees"
            className="rounded-full border border-bcp-border px-6 py-2 text-sm font-semibold text-bcp-anthracite"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
