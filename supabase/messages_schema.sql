-- Kör detta i Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text not null,
  username text,
  avatar text,
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at);

alter table public.messages enable row level security;

create policy "messages_select_authenticated"
  on public.messages for select
  to authenticated
  using (true);

create policy "messages_insert_own"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "messages_delete_own"
  on public.messages for delete
  to authenticated
  using (auth.uid() = user_id);

-- Om raden nedan ger fel ("already member") kan du ignorera den — då är realtime redan aktiverat.
alter publication supabase_realtime add table public.messages;
