import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClientCompany } from "@/app/admin/actions";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ error?: string; success?: string }> };

export default async function AdminClientsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: clients, error: clientsErr } = await supabase
    .from("clients")
    .select("id, name, slug, created_at")
    .order("name");

  const { data: projectCounts } = await supabase
    .from("projects")
    .select("client_id");

  const { data: userCounts } = await supabase
    .from("profiles")
    .select("client_id");

  const projectsByClient = new Map<string, number>();
  for (const p of projectCounts ?? []) {
    if (p.client_id) projectsByClient.set(p.client_id, (projectsByClient.get(p.client_id) ?? 0) + 1);
  }
  const usersByClient = new Map<string, number>();
  for (const u of userCounts ?? []) {
    if (u.client_id) usersByClient.set(u.client_id, (usersByClient.get(u.client_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-bcp-anthracite">Clients</h1>
        <p className="mt-1 text-sm text-bcp-muted">Entreprises clientes et leurs rattachements.</p>
      </div>

      <AdminFlashBanner error={sp.error} success={sp.success} />

      {clientsErr && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement : {clientsErr.message}
        </div>
      )}

      {/* Create client form */}
      <form
        action={createClientCompany}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-bcp-border bg-white p-6 shadow-sm"
      >
        <div className="min-w-[200px] flex-1">
          <label className="text-xs font-medium text-bcp-muted">Nouvelle entreprise</label>
          <input
            name="name"
            required
            placeholder="Raison sociale"
            className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm focus:border-bcp-gold focus:outline-none focus:ring-1 focus:ring-bcp-gold/30"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-bcp-navy px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-bcp-anthracite"
        >
          + Créer
        </button>
      </form>

      {/* Clients table */}
      <div className="overflow-hidden rounded-xl border border-bcp-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-bcp-border bg-bcp-cream/40 text-xs uppercase text-bcp-muted">
            <tr>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3 text-center">Projets</th>
              <th className="px-4 py-3 text-center">Utilisateurs</th>
              <th className="px-4 py-3 text-right">Créé le</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-bcp-border">
            {(clients ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-bcp-muted">
                  {clientsErr ? "Impossible de charger les clients." : "Aucun client. Créez-en un ci-dessus."}
                </td>
              </tr>
            ) : (
              (clients ?? []).map((c) => {
                const projCount = projectsByClient.get(c.id) ?? 0;
                const userCount = usersByClient.get(c.id) ?? 0;
                return (
                  <tr key={c.id} className="transition hover:bg-bcp-surface/60">
                    <td className="px-4 py-3">
                      <Link href={`/admin/clients/${c.id}`} className="font-medium text-bcp-anthracite hover:text-bcp-navy">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${projCount > 0 ? "bg-blue-50 text-blue-700" : "bg-bcp-surface text-bcp-muted"}`}>
                        {projCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${userCount > 0 ? "bg-emerald-50 text-emerald-700" : "bg-bcp-surface text-bcp-muted"}`}>
                        {userCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-bcp-muted">
                      {new Date(c.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="rounded-full border border-bcp-gold/30 px-3 py-1 text-xs font-semibold text-bcp-gold transition hover:bg-bcp-gold hover:text-white"
                      >
                        Détail →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
