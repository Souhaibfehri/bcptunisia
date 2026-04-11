"use client";

import { useEffect, useState } from "react";

export function AdminFlashBanner({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
  }, [error, success]);

  if (!visible || (!error && !success)) return null;

  const successMessages: Record<string, string> = {
    client: "Client créé avec succès.",
    project: "Projet créé avec succès.",
    member: "Membre assigné avec succès.",
    stage: "Étape ajoutée.",
    task: "Tâche ajoutée.",
    subtask: "Sous-tâche ajoutée.",
    update: "Actualité publiée.",
    invoice: "Facture enregistrée.",
    document: "Document téléversé.",
    role: "Rôle mis à jour.",
    link: "Rattachement mis à jour.",
    status: "Statut mis à jour.",
    milestone: "Jalon mis à jour.",
    assigned: "Assignation effectuée.",
    deleted: "Élément supprimé.",
    payment: "Paiement enregistré.",
    "payment-deleted": "Paiement supprimé.",
    edited: "Modification enregistrée.",
    invited: "Invitation envoyée avec succès.",
    "user-created": "Utilisateur créé. Communiquez le mot de passe par un canal sécurisé.",
    balance: "Mouvement de solde congés enregistré.",
    "user-deleted": "Utilisateur supprimé.",
    "profile-updated": "Profil mis à jour.",
    unlinked: "Rattachement retiré.",
    "client-updated": "Client mis à jour.",
    "client-deleted": "Client supprimé.",
    crm: "Accès CRM / vente mis à jour.",
  };

  const message = error
    ? decodeURIComponent(error)
    : successMessages[success ?? ""] ?? "Opération réussie.";

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-bcp-gold/30 bg-bcp-cream text-bcp-anthracite"
      }`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="ml-4 text-xs font-medium opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
