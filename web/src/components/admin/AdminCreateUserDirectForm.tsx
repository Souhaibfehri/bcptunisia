"use client";

import { createUserDirect } from "@/app/admin/actions";
import { RecaptchaServerActionForm } from "@/components/recaptcha/RecaptchaServerActionForm";

type ClientRow = { id: string; name: string };

export function AdminCreateUserDirectForm({ clients }: { clients: ClientRow[] }) {
  return (
    <RecaptchaServerActionForm
      action={createUserDirect}
      recaptchaAction="CREATE_USER"
      formClassName="mt-4 flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="text-xs font-medium text-bcp-muted">E-mail</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm"
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="text-xs font-medium text-bcp-muted">Mot de passe (12+ car.)</label>
          <input
            name="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm"
          />
        </div>
        <div className="min-w-[150px]">
          <label className="text-xs font-medium text-bcp-muted">Nom (optionnel)</label>
          <input name="display_name" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-medium text-bcp-muted">Rôle</label>
          <select name="role" defaultValue="collaborator" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
            <option value="client">Client</option>
            <option value="collaborator">Collaborateur</option>
            <option value="project_manager">Chef de projet</option>
            <option value="people_manager">Manager équipe</option>
            <option value="hr_admin">Admin RH</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super admin</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-bcp-muted">Entreprise</label>
          <select name="client_id" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
            <option value="">— Aucune —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <input type="hidden" name="redirect_to" value="/admin/users" />
        <button
          type="submit"
          className="rounded-full border border-bcp-border bg-bcp-surface px-5 py-2 text-xs font-semibold text-bcp-anthracite hover:bg-bcp-cream"
        >
          Créer le compte
        </button>
      </div>
    </RecaptchaServerActionForm>
  );
}
