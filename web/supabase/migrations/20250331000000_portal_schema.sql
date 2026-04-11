-- BCP Tunisia — client portal & admin (run in Supabase SQL Editor or via CLI)
-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type public.app_role as enum ('super_admin', 'admin', 'client', 'collaborator');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.project_status as enum ('draft', 'active', 'on_hold', 'completed', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.work_item_status as enum ('pending', 'in_progress', 'completed', 'delayed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');
exception when duplicate_object then null;
end $$;

-- Companies (client organizations)
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User profiles (1:1 auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  role public.app_role not null default 'client',
  client_id uuid references public.clients (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_client_id_idx on public.profiles (client_id);
create index if not exists profiles_role_idx on public.profiles (role);

-- Projects (owned by a client company)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  name text not null,
  slug text,
  status public.project_status not null default 'draft',
  summary text,
  starts_on date,
  ends_on date,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, slug)
);

create index if not exists projects_client_id_idx on public.projects (client_id);

-- Who can see which project (clients + optional internal users)
create table if not exists public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index if not exists project_members_user_idx on public.project_members (user_id);

-- Custom pipeline: stages → tasks → subtasks (per project)
create table if not exists public.project_stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  status public.work_item_status not null default 'pending',
  due_on date,
  completed_at timestamptz,
  progress_percent int not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_stages_project_idx on public.project_stages (project_id, sort_order);

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.project_stages (id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  status public.work_item_status not null default 'pending',
  due_on date,
  completed_at timestamptz,
  progress_percent int not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_tasks_stage_idx on public.project_tasks (stage_id, sort_order);

create table if not exists public.project_subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.project_tasks (id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  status public.work_item_status not null default 'pending',
  due_on date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_subtasks_task_idx on public.project_subtasks (task_id, sort_order);

-- Milestones (optional link to stage/task)
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text,
  target_on date,
  achieved_at timestamptz,
  linked_stage_id uuid references public.project_stages (id) on delete set null,
  linked_task_id uuid references public.project_tasks (id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_milestones_project_idx on public.project_milestones (project_id, sort_order);

-- Client-visible updates / history
create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  body text,
  visible_to_client boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists project_updates_project_idx on public.project_updates (project_id, created_at desc);

-- Document metadata (files in Storage under bucket project-documents)
create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  storage_path text not null,
  filename text not null,
  mime_type text,
  category text,
  visible_to_client boolean not null default true,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists project_documents_project_idx on public.project_documents (project_id);

-- Invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  invoice_number text not null,
  amount_cents bigint not null,
  currency text not null default 'TND',
  status public.invoice_status not null default 'draft',
  due_on date,
  paid_at timestamptz,
  storage_path text,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_project_idx on public.invoices (project_id);

-- Audit trail
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_entity_idx on public.activity_logs (entity_type, entity_id);

-- Notifications (phase 1 table only)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  link text,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- Helper: staff (admin / super_admin)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('super_admin', 'admin')
  );
$$;

-- Helper: project membership
create or replace function public.is_project_member(p_project uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members m
    where m.project_id = p_project
      and m.user_id = auth.uid()
  )
  or public.is_staff();
$$;

-- New auth users → profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at touch
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_updated on public.clients;
create trigger clients_updated before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated on public.profiles;
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists projects_updated on public.projects;
create trigger projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

-- RLS
alter table public.clients enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_stages enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_subtasks enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_documents enable row level security;
alter table public.invoices enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

-- profiles
create policy "profiles_select_own_or_staff"
  on public.profiles for select
  using (id = auth.uid() or public.is_staff());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles_staff_manage"
  on public.profiles for all
  using (public.is_staff())
  with check (public.is_staff());

-- clients
create policy "clients_staff_all"
  on public.clients for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "clients_select_linked"
  on public.clients for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.client_id = clients.id
    )
  );

-- projects
create policy "projects_staff_all"
  on public.projects for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "projects_member_select"
  on public.projects for select
  using (public.is_project_member(id));

-- project_members
create policy "project_members_staff_all"
  on public.project_members for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "project_members_select_own"
  on public.project_members for select
  using (user_id = auth.uid() or public.is_staff());

-- stages / tasks / subtasks / milestones: staff write; members read
create policy "stages_staff_all"
  on public.project_stages for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "stages_member_select"
  on public.project_stages for select
  using (public.is_project_member(project_id));

create policy "tasks_staff_all"
  on public.project_tasks for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "tasks_member_select"
  on public.project_tasks for select
  using (
    exists (
      select 1 from public.project_stages s
      where s.id = stage_id and public.is_project_member(s.project_id)
    )
  );

create policy "subtasks_staff_all"
  on public.project_subtasks for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "subtasks_member_select"
  on public.project_subtasks for select
  using (
    exists (
      select 1 from public.project_tasks t
      join public.project_stages s on s.id = t.stage_id
      where t.id = task_id and public.is_project_member(s.project_id)
    )
  );

create policy "milestones_staff_all"
  on public.project_milestones for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "milestones_member_select"
  on public.project_milestones for select
  using (public.is_project_member(project_id));

-- updates: clients see visible_to_client only
create policy "updates_staff_all"
  on public.project_updates for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "updates_member_select"
  on public.project_updates for select
  using (
    public.is_project_member(project_id)
    and (visible_to_client = true or public.is_staff())
  );

-- documents
create policy "documents_staff_all"
  on public.project_documents for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "documents_member_select"
  on public.project_documents for select
  using (
    public.is_project_member(project_id)
    and (visible_to_client = true or public.is_staff())
  );

-- invoices: staff all; client read (invoices always visible to assigned client members for v1)
create policy "invoices_staff_all"
  on public.invoices for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "invoices_member_select"
  on public.invoices for select
  using (public.is_project_member(project_id));

-- activity_logs: staff only
create policy "activity_logs_staff"
  on public.activity_logs for all
  using (public.is_staff())
  with check (public.is_staff());

-- notifications: own rows
create policy "notifications_select"
  on public.notifications for select
  using (user_id = auth.uid() or public.is_staff());

create policy "notifications_insert"
  on public.notifications for insert
  with check (user_id = auth.uid() or public.is_staff());

create policy "notifications_update"
  on public.notifications for update
  using (user_id = auth.uid() or public.is_staff());

create policy "notifications_delete"
  on public.notifications for delete
  using (user_id = auth.uid() or public.is_staff());

-- Storage bucket (private)
insert into storage.buckets (id, name, public)
values ('project-documents', 'project-documents', false)
on conflict (id) do nothing;

-- Storage: staff full access
create policy "storage_staff_all"
  on storage.objects for all
  using (bucket_id = 'project-documents' and public.is_staff())
  with check (bucket_id = 'project-documents' and public.is_staff());

-- Storage: clients read files for projects they belong to (path prefix = project_id/)
create policy "storage_member_read"
  on storage.objects for select
  using (
    bucket_id = 'project-documents'
    and exists (
      select 1 from public.project_members m
      where m.user_id = auth.uid()
        and name like m.project_id::text || '/%'
    )
  );
