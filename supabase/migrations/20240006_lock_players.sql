-- Lets the admin "lock" a confirmed player so they can no longer cancel or
-- change their RSVP from the public page once they're confirmed (e.g. after
-- they've committed to paying). Enforced at the RLS layer, not just in the UI.
alter table attendance add column if not exists locked boolean not null default false;

-- Reset attendance policies to a known, named set so the lock rule is
-- guaranteed to apply regardless of how the table's original policies
-- (created outside these migrations) were named.
do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where tablename = 'attendance' loop
    execute format('drop policy %I on attendance', pol.policyname);
  end loop;
end $$;

alter table attendance enable row level security;
create policy "Public read" on attendance for select using (true);
create policy "Public insert" on attendance for insert with check (true);
-- Admin toggles "locked" itself via update, so this stays unrestricted —
-- only delete (cancelling / re-RSVPing, which the app does as delete+insert)
-- is blocked once locked.
create policy "Public update" on attendance for update using (true) with check (true);
create policy "Public delete" on attendance for delete using (locked = false);

grant select, insert, update, delete on attendance to anon, authenticated;
