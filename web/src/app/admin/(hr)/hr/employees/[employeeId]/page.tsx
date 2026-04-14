import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { workItemLabel, workItemStyle, projectStatusLabel, projectStatusStyle, memberRoleLabel } from "@/lib/status";
import { PayslipDownloadButton } from "@/components/hr/PayslipDownloadButton";
import {
  updateHrEmployeeCore,
  updateHrEmployeeJob,
  upsertHrSensitive,
  uploadHrEmployeeDocument,
  addHrEducation,
  addHrTrainingRecord,
  linkHrEmployeeUser,
  setHrPortalInvitePending,
  disableHrEmployeePortal,
  adjustHrLeaveBalance,
  deleteHrEmployeeDossier,
} from "@/app/admin/(hr)/hr/actions";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { embedOne } from "@/lib/supabase/embed";
import { hrEmployeeDisplayName, PORTAL_STATUS_LABEL } from "@/lib/hr/display";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "overview", label: "Aperçu" },
  { id: "personal", label: "Informations personnelles" },
  { id: "hr", label: "Informations RH" },
  { id: "education", label: "Études & formation" },
  { id: "documents", label: "Documents" },
  { id: "payslips", label: "Bulletins" },
  { id: "leave", label: "Congés" },
  { id: "assets", label: "Matériel" },
  { id: "portal", label: "Accès portail" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type PageProps = {
  params: Promise<{ employeeId: string }>;
  searchParams: Promise<{ error?: string; success?: string; tab?: string }>;
};

export default async function HrEmployeeDetailPage({ params, searchParams }: PageProps) {
  const { employeeId: param } = await params;
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: byId, error: idErr } = await supabase.from("hr_employees").select("*").eq("id", param).maybeSingle();

  const empBase =
    !idErr && byId
      ? byId
      : await (async () => {
          const { data: byUser } = await supabase.from("hr_employees").select("*").eq("user_id", param).maybeSingle();
          if (byUser?.id) redirect(`/admin/hr/employees/${byUser.id}`);
          return null;
        })();
  if (!empBase) notFound();

  const employeeId = empBase.id as string;
  const linkedUserId = empBase.user_id as string | null;

  const { data: profileRow } = linkedUserId
    ? await supabase.from("profiles").select("email, display_name, role").eq("id", linkedUserId).maybeSingle()
    : { data: null };

  let deptRow: { id: string; name: string } | null = null;
  if (empBase.department_id) {
    const { data } = await supabase
      .from("hr_departments")
      .select("id, name")
      .eq("id", empBase.department_id)
      .maybeSingle();
    deptRow = data;
  }

  const emp = { ...empBase, profiles: profileRow, hr_departments: deptRow };
  const portalStatus = (emp as { portal_status?: string }).portal_status ?? "none";

  let mgr: { display_name: string | null; email: string | null } | null = null;
  if (emp.manager_user_id) {
    const { data: mp } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", emp.manager_user_id)
      .single();
    mgr = mp;
  }

  const { data: sensitive } = await supabase
    .from("hr_employee_sensitive")
    .select("annual_salary_cents, currency, pay_frequency, bank_iban, hr_private_notes, updated_at")
    .eq("employee_id", employeeId)
    .maybeSingle();

  const memberships = linkedUserId
    ? (
        await supabase
          .from("project_members")
          .select("project_id, role, projects ( id, name, status )")
          .eq("user_id", linkedUserId)
      ).data
    : [];

  const assignedTasks = linkedUserId
    ? (
        await supabase
          .from("project_tasks")
          .select("id, title, status, due_on, project_stages ( project_id, projects ( id, name ) )")
          .eq("assigned_to", linkedUserId)
          .not("status", "eq", "cancelled")
          .order("due_on", { ascending: true })
          .limit(25)
      ).data
    : [];

  const { data: leaveRows } = await supabase
    .from("hr_leave_requests")
    .select("id, starts_on, ends_on, status, reason, hr_leave_types ( label )")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(15);

  const { data: leaveTypesForBalance } = await supabase.from("hr_leave_types").select("id, label").order("sort_order");
  const { data: leaveBalances } = await supabase
    .from("hr_leave_balances")
    .select("year, balance_days, leave_type_id, hr_leave_types ( label )")
    .eq("employee_id", employeeId)
    .order("year", { ascending: false });
  const { data: balanceMovementRows } = await supabase
    .from("hr_leave_balance_movements")
    .select("id, year, delta_days, reference_type, note, created_at, leave_type_id, hr_leave_types ( label )")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: docs } = await supabase
    .from("hr_employee_documents")
    .select("id, category, filename, created_at, visibility, expires_on")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  const { data: educationRows } = await supabase
    .from("hr_employee_education")
    .select("id, institution, degree, field, ended_on")
    .eq("employee_id", employeeId)
    .order("ended_on", { ascending: false });

  const { data: trainingRows } = await supabase
    .from("hr_training_records")
    .select("id, title, provider, completed_on")
    .eq("employee_id", employeeId)
    .order("completed_on", { ascending: false });

  const { data: payslips } = await supabase
    .from("hr_payslips")
    .select("id, period_start, period_end, filename, created_at")
    .eq("employee_id", employeeId)
    .order("period_start", { ascending: false });

  const { data: assignments } = await supabase
    .from("hr_asset_assignments")
    .select("id, assigned_at, returned_at, expected_return_on, hr_assets ( id, name, serial_number )")
    .eq("employee_id", employeeId)
    .order("assigned_at", { ascending: false });

  const { data: departments } = await supabase.from("hr_departments").select("id, name").order("name");
  const { data: managerRows } = await supabase
    .from("hr_employees")
    .select("user_id, profiles!hr_employees_user_id_fkey ( display_name, email )")
    .not("user_id", "is", null);

  const { data: linkRows } = await supabase.from("hr_employees").select("user_id, id").not("user_id", "is", null);
  const takenProfiles = new Set(
    (linkRows ?? []).filter((r) => r.id !== employeeId).map((r) => r.user_id as string),
  );

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .neq("role", "client")
    .order("display_name", { ascending: true });

  const linkCandidates = (allProfiles ?? []).filter((p) => !takenProfiles.has(p.id));

  const prof = embedOne<{ email: string | null; display_name: string | null; role: string }>(emp.profiles);
  const dep = embedOne<{ id: string; name: string }>(emp.hr_departments);
  const displayName = hrEmployeeDisplayName({ ...emp, profiles: emp.profiles });
  const fn = ((emp as { first_name?: string }).first_name ?? "").trim();
  const ln = ((emp as { last_name?: string }).last_name ?? "").trim();
  const initials =
    `${fn.charAt(0) || prof?.display_name?.charAt(0) || "?"}${ln.charAt(0) || (prof?.display_name?.split(" ")[1]?.charAt(0) ?? "")}`.toUpperCase() ||
    "?";

  const rawTab = sp.tab ?? "overview";
  const tab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "overview";

  const tabHref = (id: TabId) => {
    const p = new URLSearchParams();
    if (id !== "overview") p.set("tab", id);
    const s = p.toString();
    return s ? `/admin/hr/employees/${employeeId}?${s}` : `/admin/hr/employees/${employeeId}`;
  };

  const pendingLeave = (leaveRows ?? []).filter((r) => r.status === "pending").length;

  const deleteConfirmTarget =
    (prof?.email && prof.email.trim()) ||
    String((emp as { personal_email?: string }).personal_email ?? "").trim() ||
    String(emp.work_email ?? "").trim() ||
    "";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/hr/employees" className="text-xs font-medium text-bcp-gold">
          ← Effectifs
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-bcp-border bg-white shadow-sm">
        <div className="flex flex-wrap items-start gap-6 bg-gradient-to-br from-bcp-navy/5 to-bcp-surface p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-bcp-navy text-lg font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-bcp-anthracite">{displayName}</h1>
            <p className="mt-1 text-sm text-bcp-muted">
              {(emp as { personal_email?: string }).personal_email || prof?.email || emp.work_email || "—"} ·{" "}
              <span className="font-mono text-xs">#{emp.employee_number || employeeId.slice(0, 8)}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white px-2 py-1 font-medium text-bcp-anthracite shadow-sm ring-1 ring-bcp-border">
                {emp.job_title || "Poste non renseigné"}
              </span>
              <span className="rounded-full bg-white px-2 py-1 text-bcp-muted shadow-sm ring-1 ring-bcp-border">{dep?.name || "Service —"}</span>
              <span className="rounded-full bg-white px-2 py-1 text-bcp-muted shadow-sm ring-1 ring-bcp-border">
                Manager : {mgr?.display_name || mgr?.email || "—"}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-800 ring-1 ring-emerald-100">
                {PORTAL_STATUS_LABEL[portalStatus] ?? portalStatus}
              </span>
            </div>
          </div>
        </div>
        <nav className="flex flex-wrap gap-1 border-t border-bcp-border bg-bcp-cream/30 px-4 py-2">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={tabHref(t.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                tab === t.id ? "bg-bcp-navy text-white" : "text-bcp-muted hover:bg-white hover:text-bcp-anthracite"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      <AdminFlashBanner error={sp.error} success={sp.success} />

      {tab === "overview" && (
        <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-bcp-border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-bcp-muted">Congés</p>
            <p className="mt-2 text-2xl font-bold text-bcp-anthracite">{pendingLeave}</p>
            <p className="text-xs text-bcp-muted">demandes en attente</p>
            <Link href={tabHref("leave")} className="mt-2 inline-block text-xs font-semibold text-bcp-navy hover:underline">
              Voir →
            </Link>
          </div>
          <div className="rounded-xl border border-bcp-border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-bcp-muted">Documents</p>
            <p className="mt-2 text-2xl font-bold text-bcp-anthracite">{(docs ?? []).length}</p>
            <p className="text-xs text-bcp-muted">fichiers enregistrés</p>
            <Link href={tabHref("documents")} className="mt-2 inline-block text-xs font-semibold text-bcp-navy hover:underline">
              Gérer →
            </Link>
          </div>
          <div className="rounded-xl border border-bcp-border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-bcp-muted">Matériel</p>
            <p className="mt-2 text-2xl font-bold text-bcp-anthracite">
              {(assignments ?? []).filter((a) => !a.returned_at).length}
            </p>
            <p className="text-xs text-bcp-muted">attributions en cours</p>
            <Link href={tabHref("assets")} className="mt-2 inline-block text-xs font-semibold text-bcp-navy hover:underline">
              Voir →
            </Link>
          </div>
          {linkedUserId ? (
            <section className="md:col-span-2 lg:col-span-3 rounded-xl border border-bcp-border bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-bcp-anthracite">Projets &amp; affectations</h2>
              {(memberships ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-bcp-muted">Aucun projet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {(memberships ?? []).map((m) => {
                    const p = m.projects as { id: string; name: string; status: string } | { id: string; name: string; status: string }[] | null;
                    const proj = p ? (Array.isArray(p) ? p[0] : p) : null;
                    if (!proj) return null;
                    return (
                      <li key={m.project_id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-bcp-surface/60 px-3 py-2 text-sm">
                        <Link href={`/admin/projects/${proj.id}`} className="font-medium text-bcp-anthracite hover:text-bcp-navy">
                          {proj.name}
                        </Link>
                        <span className="text-xs text-bcp-muted">{memberRoleLabel(m.role)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${projectStatusStyle(proj.status)}`}>
                          {projectStatusLabel(proj.status)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ) : (
            <p className="md:col-span-2 rounded-xl border border-dashed border-bcp-border bg-white p-4 text-sm text-bcp-muted">
              Aucun compte lié : les projets et tâches apparaîtront après activation du portail et liaison du profil.
            </p>
          )}
        </div>

        {deleteConfirmTarget ? (
          <section className="rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50/90 to-amber-50/40 p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-red-800">Zone sensible</h2>
            <p className="mt-2 max-w-2xl text-sm text-red-900/80">
              Supprime définitivement la fiche RH et les données associées (congés, documents RH, matériel attribué dans
              cette fiche, etc.).{" "}
              {linkedUserId ? (
                <span className="font-medium">
                  Le compte plateforme (connexion) reste actif : pour le retirer aussi, utilisez la suppression
                  utilisateur depuis Admin → Utilisateurs.
                </span>
              ) : null}
            </p>
            <div className="mt-4">
              <ConfirmDeleteModal
                action={deleteHrEmployeeDossier}
                confirmLabel={`Pour confirmer, saisissez exactement : ${deleteConfirmTarget}`}
                confirmPlaceholder={deleteConfirmTarget}
                hiddenFields={{ employee_id: employeeId }}
                triggerLabel="Supprimer la fiche RH"
                triggerClassName="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50"
                buttonText="Supprimer la fiche"
              />
            </div>
          </section>
        ) : (
          <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
            Ajoutez un e-mail (personnel, professionnel ou profil lié) sur la fiche pour pouvoir confirmer une
            suppression.
          </section>
        )}
        </>
      )}

      {tab === "personal" && (
        <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Coordonnées &amp; urgence</h2>
          <form action={updateHrEmployeeCore} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="employee_id" value={employeeId} />
            <div>
              <label className="text-xs text-bcp-muted">Prénom</label>
              <input name="first_name" defaultValue={fn} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-bcp-muted">Nom</label>
              <input name="last_name" defaultValue={ln} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-bcp-muted">E-mail personnel</label>
              <input
                name="personal_email"
                type="email"
                defaultValue={(emp as { personal_email?: string }).personal_email ?? ""}
                className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-bcp-muted">Téléphone personnel</label>
              <input
                name="personal_phone"
                defaultValue={(emp as { personal_phone?: string }).personal_phone ?? ""}
                className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-bcp-muted">Adresse</label>
              <input name="address" defaultValue={(emp as { address?: string }).address ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-bcp-muted">Contact urgence — nom</label>
              <input
                name="emergency_contact_name"
                defaultValue={(emp as { emergency_contact_name?: string }).emergency_contact_name ?? ""}
                className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-bcp-muted">Contact urgence — téléphone</label>
              <input
                name="emergency_contact_phone"
                defaultValue={(emp as { emergency_contact_phone?: string }).emergency_contact_phone ?? ""}
                className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-bcp-muted">Notes RH (non confidentielles)</label>
              <textarea
                name="employee_notes"
                rows={3}
                defaultValue={(emp as { employee_notes?: string }).employee_notes ?? ""}
                className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-full bg-bcp-navy px-5 py-2 text-xs font-semibold text-white">
                Enregistrer
              </button>
            </div>
          </form>
        </section>
      )}

      {tab === "hr" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm lg:col-span-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Emploi</h2>
            <form action={updateHrEmployeeJob} className="mt-4 space-y-3">
              <input type="hidden" name="employee_id" value={employeeId} />
              <div>
                <label className="text-xs text-bcp-muted">Matricule</label>
                <input name="employee_number" defaultValue={emp.employee_number ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-bcp-muted">Statut</label>
                <select name="employment_status" defaultValue={emp.employment_status} className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
                  <option value="active">Actif</option>
                  <option value="on_leave">En congé</option>
                  <option value="probation">Période d&apos;essai</option>
                  <option value="suspended">Suspendu</option>
                  <option value="terminated">Sorti</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-bcp-muted">Type</label>
                <select name="employment_type" defaultValue={emp.employment_type} className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
                  <option value="employee">Salarié</option>
                  <option value="contractor">Prestataire</option>
                  <option value="intern">Stagiaire</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-bcp-muted">Poste</label>
                <input name="job_title" defaultValue={emp.job_title ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-bcp-muted">Service</label>
                <select name="department_id" defaultValue={dep?.id ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
                  <option value="">—</option>
                  {(departments ?? []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-bcp-muted">Manager</label>
                <select name="manager_user_id" defaultValue={emp.manager_user_id ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
                  <option value="">—</option>
                  {(managerRows ?? [])
                    .filter((m): m is typeof m & { user_id: string } => Boolean(m.user_id) && m.user_id !== linkedUserId)
                    .map((m) => {
                      const p = embedOne<{ display_name: string | null; email: string | null }>(m.profiles);
                      return (
                        <option key={m.user_id} value={m.user_id}>
                          {p?.display_name || p?.email || m.user_id}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div>
                <label className="text-xs text-bcp-muted">Contrat</label>
                <input name="contract_type" defaultValue={emp.contract_type ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-bcp-muted">Embauche</label>
                  <input name="hire_date" type="date" defaultValue={emp.hire_date ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-bcp-muted">Fin</label>
                  <input name="end_date" type="date" defaultValue={emp.end_date ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-bcp-muted">E-mail pro</label>
                <input name="work_email" type="email" defaultValue={emp.work_email ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-bcp-muted">Téléphone</label>
                <input name="work_phone" defaultValue={emp.work_phone ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-bcp-muted">Lieu</label>
                <input name="office_location" defaultValue={emp.office_location ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="civp_eligible"
                  value="1"
                  id="civp2"
                  defaultChecked={Boolean((emp as { civp_eligible?: boolean }).civp_eligible)}
                  className="rounded border-bcp-border"
                />
                <label htmlFor="civp2" className="text-xs text-bcp-anthracite">
                  Éligible CIVP
                </label>
              </div>
              <button type="submit" className="w-full rounded-full bg-bcp-navy py-2 text-xs font-semibold text-white">
                Enregistrer
              </button>
            </form>
            <p className="mt-3 text-xs text-bcp-muted">Manager affiché : {mgr?.display_name || mgr?.email || "—"}</p>
          </section>

          <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Données confidentielles</h2>
            <p className="mt-1 text-xs text-bcp-muted">Visible uniquement par super admin et admin RH (RLS).</p>
            <form action={upsertHrSensitive} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="employee_id" value={employeeId} />
              <div>
                <label className="text-xs text-bcp-muted">Salaire annuel (TND, montant)</label>
                <input
                  name="annual_salary_cents"
                  type="number"
                  step="0.01"
                  defaultValue={sensitive?.annual_salary_cents != null ? (sensitive.annual_salary_cents / 100).toFixed(2) : ""}
                  className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-bcp-muted">Devise</label>
                <input name="currency" defaultValue={sensitive?.currency ?? "TND"} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-bcp-muted">Fréquence de paie</label>
                <input name="pay_frequency" defaultValue={sensitive?.pay_frequency ?? ""} placeholder="Mensuel" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-bcp-muted">IBAN</label>
                <input name="bank_iban" defaultValue={sensitive?.bank_iban ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-bcp-muted">Notes RH privées</label>
                <textarea name="hr_private_notes" rows={3} defaultValue={sensitive?.hr_private_notes ?? ""} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="rounded-full bg-bcp-anthracite px-5 py-2 text-xs font-semibold text-white">
                  Enregistrer données sensibles
                </button>
              </div>
            </form>
          </section>

          {linkedUserId ? (
            <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm lg:col-span-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Tâches assignées</h2>
              {(assignedTasks ?? []).length === 0 ? (
                <p className="mt-3 text-sm text-bcp-muted">Aucune tâche ouverte.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {(assignedTasks ?? []).map((t) => {
                    type StageEmbed = {
                      project_id: string;
                      projects: { id: string; name: string } | { id: string; name: string }[];
                    };
                    const st = embedOne<StageEmbed>(t.project_stages);
                    const pr = st?.projects ? embedOne<{ id: string; name: string }>(st.projects) : null;
                    return (
                      <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-bcp-surface/60 px-3 py-2 text-sm">
                        <div>
                          <span className="font-medium text-bcp-anthracite">{t.title}</span>
                          {pr && (
                            <Link href={`/admin/projects/${pr.id}`} className="ml-2 text-xs text-bcp-muted hover:text-bcp-navy">
                              {pr.name}
                            </Link>
                          )}
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${workItemStyle(t.status)}`}>{workItemLabel(t.status)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ) : null}
        </div>
      )}

      {tab === "education" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Formation & diplômes</h2>
            <form action={addHrEducation} className="mt-3 grid gap-2 border-b border-bcp-border pb-4 sm:grid-cols-2">
              <input type="hidden" name="employee_id" value={employeeId} />
              <input name="institution" placeholder="Établissement" className="rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              <input name="degree" placeholder="Diplôme" className="rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              <input name="field" placeholder="Domaine" className="rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              <input name="ended_on" type="date" className="rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              <button type="submit" className="rounded-full bg-bcp-navy px-4 py-2 text-xs font-semibold text-white sm:col-span-2">
                Ajouter une formation
              </button>
            </form>
            <ul className="mt-3 space-y-2 text-sm">
              {(educationRows ?? []).map((ed) => (
                <li key={ed.id} className="text-bcp-muted">
                  <span className="font-medium text-bcp-anthracite">{ed.degree || "—"}</span>{" "}
                  <span className="text-xs">
                    {ed.institution}
                    {ed.field ? ` · ${ed.field}` : ""}
                    {ed.ended_on ? ` · ${ed.ended_on}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Formations professionnelles</h2>
            <form action={addHrTrainingRecord} className="mt-3 flex flex-wrap items-end gap-2 border-b border-bcp-border pb-4">
              <input type="hidden" name="employee_id" value={employeeId} />
              <input name="title" required placeholder="Intitulé" className="rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              <input name="provider" placeholder="Organisme" className="rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              <input name="completed_on" type="date" className="rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              <button type="submit" className="rounded-full bg-bcp-navy px-4 py-2 text-xs font-semibold text-white">
                Ajouter
              </button>
            </form>
            <ul className="mt-3 space-y-2 text-sm">
              {(trainingRows ?? []).map((tr) => (
                <li key={tr.id} className="text-bcp-anthracite">
                  {tr.title}
                  <span className="text-xs text-bcp-muted">
                    {tr.provider ? ` · ${tr.provider}` : ""}
                    {tr.completed_on ? ` · ${tr.completed_on}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === "documents" && (
        <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Documents RH</h2>
          <form action={uploadHrEmployeeDocument} className="mt-3 flex flex-wrap items-end gap-2 border-b border-bcp-border pb-4">
            <input type="hidden" name="employee_id" value={employeeId} />
            <div>
              <label className="text-xs text-bcp-muted">Catégorie</label>
              <input name="category" placeholder="Contrat, ID…" className="mt-1 rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-bcp-muted">Visibilité</label>
              <select name="visibility" defaultValue="employee" className="mt-1 block rounded-lg border border-bcp-border px-2 py-2 text-sm">
                <option value="employee">Employé</option>
                <option value="manager">Manager</option>
                <option value="hr_only">RH uniquement</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-bcp-muted">Expiration</label>
              <input name="expires_on" type="date" className="mt-1 rounded-lg border border-bcp-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-bcp-muted">Fichier</label>
              <input name="file" type="file" required className="mt-1 block text-sm" />
            </div>
            <button type="submit" className="rounded-full bg-bcp-navy px-4 py-2 text-xs font-semibold text-white">
              Envoyer
            </button>
          </form>
          <ul className="mt-3 space-y-2 text-sm">
            {(docs ?? []).map((d) => (
              <li key={d.id} className="flex flex-wrap justify-between gap-2 text-bcp-muted">
                <span className="text-bcp-anthracite">{d.filename}</span>
                <span className="text-xs">
                  {d.category || "—"} · {d.visibility}
                  {d.expires_on ? ` · exp. ${d.expires_on}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "payslips" && (
        <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Bulletins de paie</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(payslips ?? []).map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-bcp-surface/50 px-3 py-2">
                <span>
                  {p.period_start} → {p.period_end} · {p.filename}
                </span>
                <PayslipDownloadButton payslipId={p.id} />
              </li>
            ))}
          </ul>
          {(payslips ?? []).length === 0 && <p className="text-sm text-bcp-muted">Aucun bulletin.</p>}
        </section>
      )}

      {tab === "leave" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Soldes (jours ouvrés / calendaires selon saisie)</h2>
            <p className="mt-1 text-xs text-bcp-muted">
              Les demandes approuvées sur types <strong>payés</strong> décrémentent le solde de l&apos;année de la date de début. Ajustez manuellement avec justification.
            </p>
            {(leaveBalances ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-bcp-muted">Aucun solde enregistré — ajoutez un solde initial ci-dessous.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {(leaveBalances ?? []).map((b) => {
                  const lt = embedOne<{ label: string }>(b.hr_leave_types);
                  return (
                    <li key={`${b.leave_type_id}-${b.year}`} className="flex flex-wrap justify-between gap-2 rounded-lg bg-bcp-surface/50 px-3 py-2">
                      <span className="font-medium text-bcp-anthracite">{lt?.label ?? "Type"}</span>
                      <span className="text-bcp-muted">
                        {b.year} · <strong>{Number(b.balance_days).toFixed(1)}</strong> j.
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <form action={adjustHrLeaveBalance} className="mt-4 grid gap-3 rounded-xl border border-bcp-border bg-bcp-cream/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <input type="hidden" name="employee_id" value={employeeId} />
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-bcp-muted">Type de congé</label>
                <select name="leave_type_id" required className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
                  <option value="">—</option>
                  {(leaveTypesForBalance ?? []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-bcp-muted">Année</label>
                <input name="year" type="number" required min={2000} max={2100} defaultValue={new Date().getFullYear()} className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-bcp-muted">Delta (jours, ex. +25 ou -1)</label>
                <input name="delta_days" required placeholder="+25" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="text-xs font-medium text-bcp-muted">Justification (obligatoire)</label>
                <input name="justification" required placeholder="Solde initial, correction, report…" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <button type="submit" className="rounded-full bg-bcp-navy px-4 py-2 text-xs font-semibold text-white">
                  Enregistrer le mouvement
                </button>
              </div>
            </form>
          </section>
          <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Historique des mouvements</h2>
            {(balanceMovementRows ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-bcp-muted">Aucun mouvement.</p>
            ) : (
              <ul className="mt-3 divide-y divide-bcp-border text-sm">
                {(balanceMovementRows ?? []).map((m) => {
                  const lt = embedOne<{ label: string }>(m.hr_leave_types);
                  return (
                    <li key={m.id} className="flex flex-wrap justify-between gap-2 py-2">
                      <span>
                        {lt?.label} · {m.reference_type} · {m.created_at?.slice(0, 10)}
                      </span>
                      <span className={Number(m.delta_days) < 0 ? "font-medium text-red-700" : "font-medium text-emerald-700"}>
                        {Number(m.delta_days) > 0 ? "+" : ""}
                        {Number(m.delta_days).toFixed(1)} j.
                      </span>
                      {m.note ? <p className="w-full text-xs text-bcp-muted">{m.note}</p> : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Demandes</h2>
            {(leaveRows ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-bcp-muted">Aucune demande.</p>
            ) : (
              <ul className="mt-3 divide-y divide-bcp-border">
                {(leaveRows ?? []).map((r) => {
                  const lt = embedOne<{ label: string }>(r.hr_leave_types);
                  return (
                    <li key={r.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                      <span>
                        {lt?.label} · {r.starts_on} → {r.ends_on}
                      </span>
                      <span className="text-xs font-medium text-bcp-muted">{r.status}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === "assets" && (
        <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Matériel</h2>
          {(assignments ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-bcp-muted">Aucune attribution.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {(assignments ?? []).map((a) => {
                const asset = embedOne<{ id: string; name: string; serial_number: string | null }>(a.hr_assets);
                return (
                  <li key={a.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-bcp-surface/60 px-3 py-2">
                    <span className="font-medium text-bcp-anthracite">{asset?.name ?? "—"}</span>
                    <span className="text-xs text-bcp-muted">
                      {a.returned_at ? `Retourné le ${a.returned_at.slice(0, 10)}` : "En cours"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {tab === "portal" && (
        <section className="space-y-6 rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Statut portail</h2>
            <p className="mt-2 text-lg font-semibold text-bcp-anthracite">{PORTAL_STATUS_LABEL[portalStatus] ?? portalStatus}</p>
            {prof && (
              <p className="mt-1 text-sm text-bcp-muted">
                Compte lié : {prof.display_name || prof.email} ({memberRoleLabel(prof.role)})
              </p>
            )}
          </div>

          {!linkedUserId ? (
            <div className="rounded-xl border border-bcp-border bg-bcp-surface/40 p-4">
              <h3 className="text-sm font-semibold text-bcp-anthracite">Lier un profil utilisateur</h3>
              <p className="mt-1 text-xs text-bcp-muted">Choisissez un compte existant (non déjà rattaché à une autre fiche).</p>
              <form action={linkHrEmployeeUser} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="employee_id" value={employeeId} />
                <select name="profile_user_id" required className="rounded-lg border border-bcp-border px-3 py-2 text-sm">
                  <option value="">— Profil —</option>
                  {linkCandidates.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.display_name || p.email} ({memberRoleLabel(p.role)})
                    </option>
                  ))}
                </select>
                <button type="submit" className="rounded-full bg-bcp-navy px-4 py-2 text-xs font-semibold text-white">
                  Lier et activer
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(portalStatus === "none" || portalStatus === "invite_pending") && (
                <form action={setHrPortalInvitePending}>
                  <input type="hidden" name="employee_id" value={employeeId} />
                  <button type="submit" className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900">
                    Marquer invitation en attente
                  </button>
                </form>
              )}
              <form action={disableHrEmployeePortal}>
                <input type="hidden" name="employee_id" value={employeeId} />
                <button type="submit" className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-800">
                  Désactiver le portail
                </button>
              </form>
            </div>
          )}

          <p className="text-xs text-bcp-muted">
            La désactivation retire le lien au compte : l&apos;employé ne voit plus son espace RH jusqu&apos;à une nouvelle liaison.
          </p>
        </section>
      )}
    </div>
  );
}
