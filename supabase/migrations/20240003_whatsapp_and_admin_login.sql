-- 1. WhatsApp number, collected from users but never rendered on the public site.
alter table attendance add column if not exists whatsapp text;

-- 2. Admin login, checked via a SECURITY DEFINER function so the password hash
--    is never exposed to the client (RLS denies direct table access).
create extension if not exists pgcrypto;

create table if not exists admin_users (
  username       text primary key,
  password_hash  text not null
);

alter table admin_users enable row level security;
-- No policies are created on purpose: this table is unreadable/unwritable
-- from the client. Only verify_admin_login() (below) can read it.

create or replace function verify_admin_login(p_username text, p_password text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_users
    where username = p_username
      and password_hash = crypt(p_password, password_hash)
  );
$$;

grant execute on function verify_admin_login(text, text) to anon, authenticated;

-- 3. Create your admin account. Replace 'youradminname' and 'your-strong-password'
--    then run this once in the Supabase SQL editor. Re-run with a new password
--    any time to rotate it (it overwrites the existing row).
insert into admin_users (username, password_hash)
values ('youradminname', crypt('your-strong-password', gen_salt('bf')))
on conflict (username) do update set password_hash = excluded.password_hash;
