import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { embedOne } from "@/lib/supabase/embed";

export const dynamic = "force-dynamic";

export default async function WorkspaceProfilePage() {
  const profile = await getProfile();
  const supabase = await createServerSupabaseClient();
  if (!profile) return null;

  const { data: emp } = await supabase
    .from("hr_employees")
    .select(
      "id, employee_number, employment_status, employment_type, contract_type, job_title, hire_date, end_date, work_email, work_phone, office_location, hr_departments ( name )",
    )
    .eq("user_id", profile.id)
    .single();

  const { data: myEducation } = emp
    ? await supabase
        .from("hr_employee_education")
        .select("institution, degree, field, ended_on")
        .eq("employee_id", emp.id)
        .order("ended_on", { ascending: false })
        .limit(8)
    : { data: [] };

  const { data: myTraining } = emp
    ? await supabase
        .from("hr_training_records")
        .select("title, provider, completed_on")
        .eq("employee_id", emp.id)
        .order("completed_on", { ascending: false })
        .limit(8)
    : { data: [] };

  const dep = embedOne<{ name: string }>(emp?.hr_departments);

  return (
    <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-bcp-anthracite">Profil employé</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-bcp-muted">Nom affiché</dt>
          <dd className="font-medium text-bcp-anthracite">{profile.display_name || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-bcp-muted">E-mail compte</dt>
          <dd className="text-bcp-anthracite">{profile.email || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-bcp-muted">Matricule</dt>
          <dd>{emp?.employee_number || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-bcp-muted">Service</dt>
          <dd>{dep?.name || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-bcp-muted">Poste</dt>
          <dd>{emp?.job_title || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-bcp-muted">E-mail pro</dt>
          <dd>{emp?.work_email || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-bcp-muted">Téléphone</dt>
          <dd>{emp?.work_phone || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-bcp-muted">Lieu</dt>
          <dd>{emp?.office_location || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-bcp-muted">Contrat</dt>
          <dd>{emp?.contract_type || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-bcp-muted">Type</dt>
          <dd>{emp?.employment_type}</dd>
        </div>
        <div>
          <dt className="text-xs text-bcp-muted">Embauche</dt>
          <dd>{emp?.hire_date || "—"}</dd>
        </div>
      </dl>

      {(myEducation ?? []).length > 0 && (
        <div className="mt-8 border-t border-bcp-border pt-6">
          <h3 className="text-sm font-semibold text-bcp-anthracite">Formation</h3>
          <ul className="mt-3 space-y-2 text-sm text-bcp-muted">
            {(myEducation ?? []).map((ed, i) => (
              <li key={i}>
                <span className="font-medium text-bcp-anthracite">{ed.degree || "—"}</span> · {ed.institution}
                {ed.field ? ` · ${ed.field}` : ""}
                {ed.ended_on ? ` (${ed.ended_on})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(myTraining ?? []).length > 0 && (
        <div className="mt-8 border-t border-bcp-border pt-6">
          <h3 className="text-sm font-semibold text-bcp-anthracite">Formations pro</h3>
          <ul className="mt-3 space-y-2 text-sm text-bcp-muted">
            {(myTraining ?? []).map((tr, i) => (
              <li key={i}>
                <span className="font-medium text-bcp-anthracite">{tr.title}</span>
                {tr.provider ? ` · ${tr.provider}` : ""}
                {tr.completed_on ? ` · ${tr.completed_on}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-xs text-bcp-muted">
        Les modifications de fiche sont effectuées par le service RH. Contactez votre administrateur RH pour toute mise à jour.
      </p>
    </section>
  );
}
