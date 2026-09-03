-- MindfulTasks — Japandi v2 prototype
-- Supabase migration: applied as `create_tasks_table` on project imhndydivpbqvxrhupox.
-- Run this once in the Supabase SQL editor to set the same table up elsewhere.

create table public.tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title      text not null,
  priority   text not null default 'none' check (priority in ('none','low','medium','high')),
  due_date   date,
  done       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

-- Each user can only see and change their own rows.
create policy tasks_select on public.tasks
  for select using (auth.uid() = user_id);

create policy tasks_insert on public.tasks
  for insert with check (auth.uid() = user_id);

create policy tasks_update on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index tasks_user_created_idx on public.tasks (user_id, created_at);
