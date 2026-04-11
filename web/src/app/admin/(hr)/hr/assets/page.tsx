import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { assignHrAsset, createHrAsset, returnHrAsset } from "@/app/admin/(hr)/hr/actions";
import { embedOne } from "@/lib/supabase/embed";
import { hrEmployeeDisplayName } from "@/lib/hr/display";

export const dynamic = "force-dynamic";

type SearchProps = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function HrAssetsPage({ searchParams }: SearchProps) {
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: assets } = await supabase
    .from("hr_assets")
    .select("id, name, category, serial_number, status, notes, physical_condition, warranty_expires, purchase_date")
    .order("name");

  const { data: assignmentHistory } = await supabase
    .from("hr_asset_assignments")
    .select(
      "id, assigned_at, returned_at, condition_in, hr_assets ( name ), hr_employees ( user_id, first_name, last_name, profiles!hr_employees_user_id_fkey ( display_name, email ) )",
    )
    .order("assigned_at", { ascending: false })
    .limit(40);

  const { data: openAssignments } = await supabase
    .from("hr_asset_assignments")
    .select(
      "id, asset_id, employee_id, assigned_at, expected_return_on, hr_assets ( name ), hr_employees ( user_id, first_name, last_name, profiles!hr_employees_user_id_fkey ( display_name, email ) )",
    )
    .is("returned_at", null)
    .order("assigned_at", { ascending: false });

  const { data: employees } = await supabase
    .from("hr_employees")
    .select("id, user_id, first_name, last_name, personal_email, portal_status, profiles!hr_employees_user_id_fkey ( display_name, email )")
    .order("created_at", { ascending: false });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-bcp-anthracite">Matériel</h1>
        <p className="mt-1 text-sm text-bcp-muted">Registre et attributions.</p>
      </div>

      <AdminFlashBanner error={sp.error} success={sp.success} />

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Nouvel équipement</h2>
        <form action={createHrAsset} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs text-bcp-muted">Nom</label>
            <input name="name" required className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-bcp-muted">Catégorie</label>
            <input name="category" placeholder="PC, téléphone…" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-bcp-muted">N° série</label>
            <input name="serial_number" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-bcp-muted">État matériel</label>
            <input name="physical_condition" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-bcp-muted">Garantie jusqu&apos;au</label>
            <input name="warranty_expires" type="date" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-bcp-muted">Date d&apos;achat</label>
            <input name="purchase_date" type="date" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="text-xs text-bcp-muted">Notes</label>
            <input name="notes" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-full bg-bcp-navy px-5 py-2 text-xs font-semibold text-white">
            Ajouter
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Attribuer</h2>
        <form action={assignHrAsset} className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-bcp-muted">Équipement</label>
            <select name="asset_id" required className="mt-1 block rounded-lg border border-bcp-border px-2 py-2 text-sm">
              <option value="">—</option>
              {(assets ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-bcp-muted">Collaborateur</label>
            <select name="employee_id" required className="mt-1 block min-w-[14rem] rounded-lg border border-bcp-border px-2 py-2 text-sm">
              <option value="">—</option>
              {(employees ?? []).map((e) => {
                const label = hrEmployeeDisplayName({
                  first_name: (e as { first_name?: string }).first_name,
                  last_name: (e as { last_name?: string }).last_name,
                  user_id: e.user_id,
                  profiles: e.profiles,
                });
                const ps = (e as { portal_status?: string }).portal_status;
                return (
                  <option key={e.id} value={e.id}>
                    {label}
                    {ps !== "active" ? " (sans portail actif)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="text-xs text-bcp-muted">Retour prévu</label>
            <input name="expected_return_on" type="date" className="mt-1 rounded-lg border border-bcp-border px-2 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-full bg-bcp-navy px-4 py-2 text-xs font-semibold text-white">
            Attribuer
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Attributions en cours</h2>
        {(openAssignments ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-bcp-muted">Aucune.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {(openAssignments ?? []).map((a) => {
              const asset = embedOne<{ name: string }>(a.hr_assets);
              const emp = embedOne<{
                user_id: string | null;
                first_name?: string | null;
                last_name?: string | null;
                profiles: unknown;
              }>(a.hr_employees);
              const assignee = hrEmployeeDisplayName(emp ?? {});
              const exp = a.expected_return_on as string | null;
              const overdue = exp && exp < today;
              return (
                <li key={a.id} className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-bcp-border px-4 py-3">
                  <div>
                    <p className="font-medium text-bcp-anthracite">{asset?.name ?? "—"}</p>
                    <p className="text-xs text-bcp-muted">
                      {assignee} · depuis {a.assigned_at?.slice(0, 10)}
                      {exp ? ` · retour prévu ${exp}` : ""}
                    </p>
                    {overdue ? (
                      <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-700">
                        Retour en retard
                      </span>
                    ) : null}
                  </div>
                  <form action={returnHrAsset} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="assignment_id" value={a.id} />
                    <input name="condition_in" placeholder="État au retour" className="rounded-lg border border-bcp-border px-2 py-1.5 text-xs" />
                    <button type="submit" className="rounded-full border border-bcp-border px-3 py-1.5 text-xs font-semibold text-bcp-anthracite">
                      Clôturer retour
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Historique des attributions</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(assignmentHistory ?? []).map((h) => {
            const asset = embedOne<{ name: string }>(h.hr_assets);
            const emp = embedOne<{
              user_id: string | null;
              first_name?: string | null;
              last_name?: string | null;
              profiles: unknown;
            }>(h.hr_employees);
            const who = hrEmployeeDisplayName(emp ?? {});
            return (
              <li key={h.id} className="rounded-lg border border-bcp-border px-3 py-2 text-bcp-muted">
                <span className="font-medium text-bcp-anthracite">{asset?.name ?? "—"}</span>
                <span className="text-xs">
                  {" "}
                  · {who} · {h.assigned_at?.slice(0, 10)}
                  {h.returned_at ? ` → ${h.returned_at.slice(0, 10)}` : ""}
                  {h.condition_in ? ` · retour: ${h.condition_in}` : ""}
                </span>
              </li>
            );
          })}
        </ul>
        {(assignmentHistory ?? []).length === 0 && <p className="mt-2 text-sm text-bcp-muted">Aucun historique.</p>}
      </section>

      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Registre</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-bcp-border text-xs uppercase text-bcp-muted">
              <tr>
                <th className="py-2 pr-4">Nom</th>
                <th className="py-2 pr-4">Catégorie</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4">Série</th>
                <th className="py-2 pr-4">État</th>
                <th className="py-2 pr-4">Achat</th>
                <th className="py-2">Garantie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bcp-border">
              {(assets ?? []).map((a) => (
                <tr key={a.id}>
                  <td className="py-2 pr-4 font-medium text-bcp-anthracite">{a.name}</td>
                  <td className="py-2 pr-4 text-bcp-muted">{a.category || "—"}</td>
                  <td className="py-2 pr-4 text-bcp-muted">{a.status}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-bcp-muted">{a.serial_number || "—"}</td>
                  <td className="py-2 pr-4 text-xs text-bcp-muted">{a.physical_condition || "—"}</td>
                  <td className="py-2 pr-4 text-xs text-bcp-muted">{a.purchase_date || "—"}</td>
                  <td className="py-2 text-xs text-bcp-muted">{a.warranty_expires || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
