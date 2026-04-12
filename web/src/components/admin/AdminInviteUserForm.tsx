"use client";

import { inviteUser } from "@/app/admin/actions";
import { RecaptchaServerActionForm } from "@/components/recaptcha/RecaptchaServerActionForm";

type ClientRow = { id: string; name: string };

export function AdminInviteUserForm({ clients }: { clients: ClientRow[] }) {
  return (
    <RecaptchaServerActionForm
      action={inviteUser}
      recaptchaAction="INVITE_USER"
      formClassName="mt-4 flex flex-wrap items-end gap-3"
    >
      <input type="hidden" name="redirect_to" value="/admin/users" />
      <div className="min-w-[200px] flex-1">
        <label className="text-xs font-medium text-bcp-muted">E-mail</label>
        <input
          name="email"
          type="email"
          required
          placeholder="email@exemple.com"
          className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm"
        />
      </div>
      <div className="min-w-[150px]">
        <label className="text-xs font-medium text-bcp-muted">Nom (optionnel)</label>
        <input
          name="display_name"
          placeholder="Nom complet"
          className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-bcp-muted">Rôle</label>
        <select name="role" defaultValue="client" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
          <option value="client">Client</option>
          <option value="collaborator">Collaborateur</option>
          <option value="project_manager">Chef de projet</option>
          <option value="people_manager">Manager équipe</option>
          <option value="hr_admin">Admin RH</option>
          <option value="admin">Admin</option>
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
      <div>
        <label className="text-xs font-medium text-bcp-muted">Langue du lien (e-mail)</label>
        <select name="auth_locale" defaultValue="fr" className="mt-1 w-full rounded-lg border border-bcp-border px-2 py-2 text-sm">
          <option value="fr">FR</option>
          <option value="en">EN</option>
          <option value="ar">AR</option>
        </select>
      </div>
      <button type="submit" className="rounded-full bg-gradient-gold px-5 py-2 text-xs font-semibold text-bcp-anthracite shadow-sm">
        Envoyer l&apos;invitation
      </button>
    </RecaptchaServerActionForm>
  );
}
