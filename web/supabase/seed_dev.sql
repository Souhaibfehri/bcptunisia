-- BCP Tunisia — optional DEV seed (run in Supabase SQL Editor as postgres / service role)
-- Prerequisites:
--   1) Migrations applied in order:
--      - 20250331000000_portal_schema.sql
--      - 20250404120000_portal_ensure_profile_rpc.sql
--      - 20250404130000_task_assignment_and_project_scope.sql
--   2) Two auth users exist (sign up via /portal/signup), e.g. admin@your.com and client@your.com
--   3) Replace emails below, then run once.
--
-- Promote one user to staff (required for /admin):
--   update public.profiles set role = 'super_admin' where email = 'admin@example.com';

-- Client company
insert into public.clients (name, slug)
values ('Société démo', 'demo-company')
on conflict (slug) do nothing;

-- Project
insert into public.projects (client_id, name, slug, status, summary, objective, starts_on, ends_on)
select c.id, 'Projet pilote local', 'demo-pilot', 'active',
  'Données de test pour le portail',
  'Valider le portail client BCP Tunisia avec un périmètre de démonstration.',
  current_date, (current_date + interval '90 days')::date
from public.clients c
where c.slug = 'demo-company'
limit 1
on conflict (client_id, slug) do nothing;

-- Stages + tasks
insert into public.project_stages (project_id, title, sort_order, status, progress_percent)
select p.id, 'Phase découverte', 0, 'in_progress', 25
from public.projects p
join public.clients c on c.id = p.client_id
where c.slug = 'demo-company' and p.slug = 'demo-pilot'
  and not exists (
    select 1 from public.project_stages s where s.project_id = p.id and s.title = 'Phase découverte'
  );

insert into public.project_stages (project_id, title, sort_order, status, progress_percent)
select p.id, 'Réalisation', 1, 'pending', 0
from public.projects p
join public.clients c on c.id = p.client_id
where c.slug = 'demo-company' and p.slug = 'demo-pilot'
  and not exists (
    select 1 from public.project_stages s where s.project_id = p.id and s.title = 'Réalisation'
  );

insert into public.project_tasks (stage_id, title, sort_order, status)
select s.id, 'Atelier kick-off', 0, 'completed'
from public.project_stages s
join public.projects p on p.id = s.project_id
join public.clients c on c.id = p.client_id
where c.slug = 'demo-company' and p.slug = 'demo-pilot' and s.title = 'Phase découverte'
  and not exists (
    select 1 from public.project_tasks t where t.stage_id = s.id and t.title = 'Atelier kick-off'
  );

insert into public.project_tasks (stage_id, title, sort_order, status, due_on)
select s.id, 'Cadrage périmètre', 1, 'in_progress', (current_date + interval '7 days')::date
from public.project_stages s
join public.projects p on p.id = s.project_id
join public.clients c on c.id = p.client_id
where c.slug = 'demo-company' and p.slug = 'demo-pilot' and s.title = 'Phase découverte'
  and not exists (
    select 1 from public.project_tasks t where t.stage_id = s.id and t.title = 'Cadrage périmètre'
  );

-- Link CLIENT user to project (replace email)
insert into public.project_members (project_id, user_id, role)
select p.id, u.id, 'client_contact'
from public.projects p
join public.clients c on c.id = p.client_id
cross join auth.users u
where c.slug = 'demo-company' and p.slug = 'demo-pilot' and u.email = 'client@example.com'
on conflict (project_id, user_id) do nothing;

-- Sample update
insert into public.project_updates (project_id, title, body, visible_to_client)
select p.id, 'Lancement', 'Mise en place du périmètre et du planning.', true
from public.projects p
join public.clients c on c.id = p.client_id
where c.slug = 'demo-company' and p.slug = 'demo-pilot'
  and not exists (
    select 1 from public.project_updates u where u.project_id = p.id and u.title = 'Lancement'
  );

-- Sample invoice
insert into public.invoices (project_id, invoice_number, amount_cents, currency, status, due_on)
select p.id, 'FAC-DEMO-001', 1500000, 'TND', 'sent', (current_date + interval '30 days')::date
from public.projects p
join public.clients c on c.id = p.client_id
where c.slug = 'demo-company' and p.slug = 'demo-pilot'
  and not exists (
    select 1 from public.invoices i where i.project_id = p.id and i.invoice_number = 'FAC-DEMO-001'
  );

-- Sample milestone
insert into public.project_milestones (project_id, title, target_on, sort_order)
select p.id, 'Livraison pilote', (current_date + interval '60 days')::date, 0
from public.projects p
join public.clients c on c.id = p.client_id
where c.slug = 'demo-company' and p.slug = 'demo-pilot'
  and not exists (
    select 1 from public.project_milestones m where m.project_id = p.id and m.title = 'Livraison pilote'
  );

-- Optional: give admin user a membership too for testing
-- insert into public.project_members (project_id, user_id, role)
-- select p.id, u.id, 'project_manager'
-- from public.projects p
-- join public.clients c on c.id = p.client_id
-- cross join auth.users u
-- where c.slug = 'demo-company' and p.slug = 'demo-pilot' and u.email = 'admin@example.com'
-- on conflict (project_id, user_id) do nothing;
