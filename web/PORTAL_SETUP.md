# BCP Tunisia — Portail client & admin (Supabase)

## 1. Résumé

- **Site public** : inchangé (`/(site)/[locale]/*`, Sanity).
- **Studio** : `/studio`.
- **Portail client** : `/portal` (auth, dashboard, détail projet).
- **Admin** : `/admin` (tableau de bord, projets, clients, utilisateurs, pipeline dynamique).
- **OAuth callback** : `/auth/callback` (à déclarer dans Supabase).

## 2. Variables d'environnement

Copier depuis `.env.example` vers `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 3. Supabase — à faire dans le dashboard

1. Créer un projet Supabase.
2. **Authentication → URL de redirection** : ajouter `http://localhost:3010/auth/callback` (et l'URL de production + `/auth/callback`).
3. Activer les fournisseurs : Email, Google, Azure (Microsoft).
4. **SQL** : exécuter dans l'ordre (éditeur SQL Supabase, une fois chacun) :
   - `supabase/migrations/20250331000000_portal_schema.sql` — schéma, RLS, trigger, bucket Storage.
   - `supabase/migrations/20250404120000_portal_ensure_profile_rpc.sql` — `ensure_my_profile()`.
   - `supabase/migrations/20250404130000_task_assignment_and_project_scope.sql` — `assigned_to` sur tasks, `objective` sur projects, triggers `updated_at`.
5. **Storage** : le script crée le bucket `project-documents` (privé).
6. **Premier administrateur** : `update public.profiles set role = 'super_admin' where email = 'votre@email.com';`
7. **Données de test** : `supabase/seed_dev.sql` (remplacer les e-mails).

## 4. Schéma (aperçu)

- `clients` — entreprises.
- `profiles` — liés à `auth.users`, rôle (`super_admin`, `admin`, `collaborator`, `client`) + `client_id`.
- `projects` — `client_id`, statut, résumé, objectif, dates.
- `project_members` — accès utilisateur ↔ projet, rôle projet (`project_manager`, `team_member`, `client_contact`).
- `project_stages` → `project_tasks` → `project_subtasks` (pipeline modulaire).
- `project_milestones`, `project_updates`, `project_documents`, `invoices`, `activity_logs`, `notifications`.

RLS : les **clients** ne lisent que les projets dont ils sont membres ; **admin/super_admin** ont accès complet via `is_staff()`.

## 5. Commandes locales

```bash
cd web
npm install
npm run dev
```

URLs utiles :

- Portail : `http://localhost:3010/portal`
- Admin : `http://localhost:3010/admin` (compte staff requis)

## 6. Admin (fonctionnalités)

- **`/admin`** : tableau de bord riche — statistiques par statut, tâches en retard, jalons à venir, activité récente, vue équipe interne, accès rapides.
- **`/admin/projects`** : liste des projets avec statut coloré, lien vers le wizard de création.
- **`/admin/projects/new`** : assistant d'intégration multi-étapes (client → détails → équipe → structure → résumé).
- **`/admin/projects/[id]`** : détail projet complet — santé, statut éditable, équipe (interne + contacts client), jalons avec marquage, pipeline/kanban, actualités, factures, documents (upload + download + suppression), formulaires structure.
- **`/admin/clients`** : liste des entreprises, compteurs projets/utilisateurs, création rapide.
- **`/admin/clients/[id]`** : détail client — utilisateurs rattachés, projets liés, rattachement d'utilisateurs.
- **`/admin/users`** : gestion des utilisateurs — rôle système, rattachement entreprise.

## 7. Portail client (fonctionnalités)

- **`/portal/dashboard`** : projets assignés avec indicateur de santé, progression, dernière actu, jalons à venir, factures en attente.
- **`/portal/projects/[id]`** : détail projet — santé, progression, vue colonnes, pipeline, jalons (statut coloré), actualités, documents (liens signés), factures (statut + échéance).

## 8. Rôles

| Rôle système | Accès admin | Accès portail | Description |
|--------------|-------------|---------------|-------------|
| `super_admin` | Oui | Oui | Contrôle total |
| `admin` | Oui | Oui | Gestion projets/clients |
| `collaborator` | Non | Oui (projets assignés) | Équipe interne |
| `client` | Non | Oui (projets assignés) | Contact client |

## 9. Indicateurs de statut

- **Projet** : Brouillon (gris), Actif (bleu), En pause (ambre), Terminé (vert), Archivé (gris).
- **Étapes/Tâches** : En attente (gris), En cours (bleu), Terminé (vert), En retard (rouge), Annulé (gris barré).
- **Factures** : Brouillon, Envoyée, Payée, En retard, Annulée.
- **Santé projet** : En bonne voie (vert), Attention (ambre), Critique (rouge) — calculé dynamiquement depuis les échéances des tâches.

## 10. Phase suivante (recommandations)

- Édition inline des tâches (titre, description, dates, assignation depuis les cartes kanban).
- Notifications in-app + e-mail (Edge Functions / Resend).
- Journal d'activité alimenté depuis les server actions.
- Rôles `collaborator` avec accès admin restreint si nécessaire.
- Génération de types : `supabase gen types typescript`.
