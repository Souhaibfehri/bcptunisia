import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { linkUserToClient, unlinkUserFromClient, updateClientCompany, deleteClientCompany } from "@/app/admin/actions";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";
import { projectStatusStyle, projectStatusLabel, memberRoleLabel } from "@/lib/status";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminClientDetailPage({ params, searchParams }: PageProps) {
  const { clientId } = await params;
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: client, error: cErr } = await supabase
    .from("clients")
    .select("id, name, slug, notes, created_at")
    .eq("id", clientId)
    .single();

  if (!client) {
    if (cErr?.code === "PGRST116") {
      notFound();
    }
    return (
      <div className="space-y-6">
        <Link href="/admin/clients" className="text-xs font-medium text-bcp-gold">← Tous les clients</Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">Erreur de chargement</h1>
          <p className="mt-2 text-sm text-red-700">
            Impossible de charger ce client. Vérifiez que l&apos;ID est correct et que la base de données est accessible.
          </p>
          {cErr && <p className="mt-2 font-mono text-xs text-red-600">{cErr.message}</p>}
        </div>
      </div>
    );
  }

  const [{ data: linkedUsers }, { data: projects }, { data: allUsers }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, display_name, role")
      .eq("client_id", clientId)
      .order("display_name"),
    supabase
      .from("projects")
      .select("id, name, status, starts_on, ends_on")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, email, display_name")
      .is("client_id", null)
      .order("display_name"),
  ]);

  const projectIds = (projects ?? []).map((p) => p.id);
  let invoices: {
    id: string;
    invoice_number: string;
    amount_cents: number;
    amount_paid_cents: number | null;
    currency: string;
    status: string;
    project_id: string;
  }[] = [];
  let invoicesErr: { message: string } | null = null;

  if (projectIds.length > 0) {
    const invRes = await supabase
      .from("invoices")
      .select("id, invoice_number, amount_cents, amount_paid_cents, currency, status, project_id")
      .in("project_id", projectIds);
    invoices = invRes.data ?? [];
    invoicesErr = invRes.error;
  }

  const linkedUserIds = (linkedUsers ?? []).map((u) => u.id);
  const { data: memberRows } = linkedUserIds.length > 0
    ? await supabase.from("project_members").select("user_id, project_id").in("user_id", linkedUserIds)
    : { data: [] as { user_id: string; project_id: string }[] };

  const userProjectCount = new Map<string, number>();
  for (const row of memberRows ?? []) {
    userProjectCount.set(row.user_id, (userProjectCount.get(row.user_id) ?? 0) + 1);
  }

  const totalInvoiced = (invoices ?? []).reduce((s, i) => s + i.amount_cents, 0);
  const totalPaid = (invoices ?? []).reduce((s, i) => s + (i.amount_paid_cents ?? 0), 0);
  const totalRemaining = Math.max(0, totalInvoiced - totalPaid);

  const redirectTo = `/admin/clients/${clientId}`;

  return (
    <div className="space-y-8">
      <AdminFlashBanner error={sp.error} success={sp.success} />

      {invoicesErr && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Impossible de charger les factures agrégées</p>
          <p className="mt-1 text-xs text-amber-800">Les totaux « facturé / restant dû » peuvent être incomplets.</p>
          <p className="mt-2 font-mono text-xs text-amber-700">{invoicesErr.message}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <Link href="/admin/clients" className="text-xs font-medium text-bcp-gold hover:text-bcp-copper">← Tous les clients</Link>
        <h1 className="mt-2 text-2xl font-bold text-bcp-anthracite">{client.name}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-bcp-muted">
          {client.slug && <span>Slug : {client.slug}</span>}
          <span>Créé le {new Date(client.created_at).toLocaleDateString("fr-FR")}</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-bcp-border bg-white p-4 text-center shadow-sm">
          <p className="text-xs text-bcp-muted">Projets</p>
          <p className="text-xl font-bold text-bcp-anthracite">{(projects ?? []).length}</p>
        </div>
        <div className="rounded-xl border border-bcp-border bg-white p-4 text-center shadow-sm">
          <p className="text-xs text-bcp-muted">Contacts</p>
          <p className="text-xl font-bold text-bcp-anthracite">{(linkedUsers ?? []).length}</p>
        </div>
        <div className="rounded-xl border border-bcp-border bg-white p-4 text-center shadow-sm">
          <p className="text-xs text-bcp-muted">Total facturé</p>
          <p className="text-xl font-bold text-bcp-anthracite">{(totalInvoiced / 100).toFixed(2)} <span className="text-xs font-normal">TND</span></p>
        </div>
        <div className="rounded-xl border border-bcp-border bg-white p-4 text-center shadow-sm">
          <p className="text-xs text-bcp-muted">Restant dû</p>
          <p className={`text-xl font-bold ${totalRemaining > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {(totalRemaining / 100).toFixed(2)} <span className="text-xs font-normal">TND</span>
          </p>
        </div>
      </div>

      {/* Edit client */}
      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">Informations client</h2>
        <form action={updateClientCompany} className="mt-4 space-y-3">
          <input type="hidden" name="client_id" value={clientId} />
          <div>
            <label className="text-xs font-medium text-bcp-muted">Nom de l&apos;entreprise</label>
            <input name="name" defaultValue={client.name} required className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Notes internes</label>
            <textarea name="notes" defaultValue={client.notes ?? ""} rows={3} placeholder="Notes visibles uniquement par les administrateurs" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-lg bg-bcp-navy px-4 py-2 text-xs font-semibold text-white">Enregistrer</button>
        </form>
        <div className="mt-3 border-t border-bcp-border pt-3">
          <form action={deleteClientCompany}>
            <input type="hidden" name="client_id" value={clientId} />
            <button type="submit" className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-500 transition hover:bg-red-50 hover:text-red-700">
              Supprimer ce client
            </button>
          </form>
        </div>
      </section>

      {/* Linked users */}
      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">
          Utilisateurs rattachés ({(linkedUsers ?? []).length})
        </h2>
        {(linkedUsers ?? []).length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
            <p className="text-sm text-bcp-muted">Aucun utilisateur rattaché à cette entreprise.</p>
            <p className="mt-1 text-xs text-bcp-muted">Utilisez le formulaire ci-dessous pour rattacher un utilisateur existant.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {(linkedUsers ?? []).map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-bcp-border bg-white px-4 py-3 shadow-sm transition hover:border-bcp-gold/40">
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={`/admin/users/${u.id}`} className="text-sm font-medium text-bcp-anthracite hover:text-bcp-navy">
                    {u.display_name || u.email}
                  </Link>
                  <span className="text-xs text-bcp-muted">{u.email}</span>
                  <span className="rounded-full bg-bcp-surface px-2 py-0.5 text-xs text-bcp-muted capitalize">
                    {memberRoleLabel(u.role)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-bcp-muted">
                    {userProjectCount.get(u.id) ?? 0} projet(s)
                  </span>
                  <form action={unlinkUserFromClient}>
                    <input type="hidden" name="user_id" value={u.id} />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <button type="submit" className="text-xs text-red-500 hover:text-red-700">Retirer</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        <form action={linkUserToClient} className="mt-4 flex flex-wrap items-end gap-2 border-t border-bcp-border pt-4">
          <input type="hidden" name="client_id" value={clientId} />
          <input type="hidden" name="redirect_to" value={redirectTo} />
          <div className="min-w-[200px] flex-1">
            <label className="text-xs text-bcp-muted">Rattacher un utilisateur</label>
            <select name="user_id" required className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm">
              <option value="">Choisir…</option>
              {(allUsers ?? []).map((u) => (
                <option key={u.id} value={u.id}>{u.display_name || u.email} ({u.email})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded-full bg-bcp-navy px-4 py-2 text-xs font-semibold text-white">
            Rattacher
          </button>
        </form>
      </section>

      {/* Projects */}
      <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-bcp-muted">
          Projets ({(projects ?? []).length})
        </h2>
        {(projects ?? []).length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-bcp-border bg-bcp-surface/30 px-4 py-6 text-center">
            <p className="text-sm text-bcp-muted">Aucun projet pour ce client.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {(projects ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-bcp-border bg-white px-4 py-3 shadow-sm transition hover:border-bcp-gold/40">
                <div>
                  <Link href={`/admin/projects/${p.id}`} className="text-sm font-medium text-bcp-anthracite hover:text-bcp-navy">
                    {p.name}
                  </Link>
                  <div className="mt-0.5 flex gap-2 text-[0.65rem] text-bcp-muted">
                    {p.starts_on && <span>Début : {p.starts_on}</span>}
                    {p.ends_on && <span>Fin : {p.ends_on}</span>}
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${projectStatusStyle(p.status)}`}>
                  {projectStatusLabel(p.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
