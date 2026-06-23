-- Ensures realtime events are broadcast for these tables.
-- Without this, the app's postgres_changes subscriptions receive nothing,
-- even though the client-side code is already listening correctly.
alter publication supabase_realtime add table attendance;
alter publication supabase_realtime add table config;
alter publication supabase_realtime add table payments;
