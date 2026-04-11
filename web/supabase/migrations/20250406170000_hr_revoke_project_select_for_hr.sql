-- HR staff no longer receive blanket SELECT on delivery/project tables (security hardening).
-- Profiles remain visible to HR for user linking and directory support.

DROP POLICY IF EXISTS "projects_hr_staff_select" ON public.projects;
DROP POLICY IF EXISTS "project_members_hr_staff_select" ON public.project_members;
DROP POLICY IF EXISTS "project_stages_hr_staff_select" ON public.project_stages;
DROP POLICY IF EXISTS "project_tasks_hr_staff_select" ON public.project_tasks;
DROP POLICY IF EXISTS "project_subtasks_hr_staff_select" ON public.project_subtasks;
