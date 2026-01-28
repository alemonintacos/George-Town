create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  category text not null default 'goal' check (category in ('university', 'work', 'social', 'goal')),
  subcategory text,
  scheduled_date date,
  scheduled_start text,
  scheduled_end text,
  repeat_days jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Migration for existing tables:
-- alter table tasks add column category text not null default 'goal' check (category in ('university', 'work', 'social', 'goal'));
-- alter table tasks add column subcategory text;
-- alter table tasks add column scheduled_date date;
-- alter table tasks add column scheduled_start text;
-- alter table tasks add column scheduled_end text;
-- alter table tasks add column repeat_days jsonb;

create table time_entries (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz,
  duration_seconds int,
  created_at timestamptz not null default now()
);

create index idx_time_entries_task_id on time_entries(task_id);
