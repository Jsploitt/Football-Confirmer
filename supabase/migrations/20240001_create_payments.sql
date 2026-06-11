create table if not exists payments (
  name  text primary key,
  paid  boolean not null default false
);

-- Allow anonymous reads and writes (same pattern as attendance table)
alter table payments enable row level security;

create policy "Public read" on payments for select using (true);
create policy "Public insert" on payments for insert with check (true);
create policy "Public update" on payments for update using (true);
create policy "Public delete" on payments for delete using (true);
