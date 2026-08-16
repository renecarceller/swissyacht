create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'archived', 'blocked')),
  last_message text,
  last_message_at timestamptz,
  buyer_last_seen_at timestamptz,
  seller_last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (buyer_id, seller_id, listing_id),
  check (buyer_id <> seller_id)
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 3000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.message_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  message_id uuid not null references public.conversation_messages(id) on delete cascade,
  type text not null default 'new_message',
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed', 'disabled')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists conversations_buyer_idx on public.conversations(buyer_id, last_message_at desc);
create index if not exists conversations_seller_idx on public.conversations(seller_id, last_message_at desc);
create index if not exists conversations_listing_idx on public.conversations(listing_id);
create index if not exists conversation_messages_conversation_idx on public.conversation_messages(conversation_id, created_at);
create index if not exists conversation_messages_unread_idx on public.conversation_messages(conversation_id, sender_id, read_at) where read_at is null;
create index if not exists message_notifications_user_idx on public.message_notifications(user_id, read_at, created_at desc);

alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.message_notifications enable row level security;

grant select, insert, update on public.conversations to authenticated;
grant select, insert, update on public.conversation_messages to authenticated;
grant select, insert, update on public.message_notifications to authenticated;

create policy "conversation participants read" on public.conversations for select to authenticated
using (buyer_id = (select auth.uid()) or seller_id = (select auth.uid()) or public.is_admin());

create policy "buyers create listing conversations" on public.conversations for insert to authenticated
with check (
  buyer_id = (select auth.uid())
  and seller_id = (select owner_id from public.listings where listings.id = listing_id)
  and buyer_id <> seller_id
);

create policy "conversation participants update" on public.conversations for update to authenticated
using (buyer_id = (select auth.uid()) or seller_id = (select auth.uid()) or public.is_admin())
with check (buyer_id = (select auth.uid()) or seller_id = (select auth.uid()) or public.is_admin());

create policy "conversation messages participant read" on public.conversation_messages for select to authenticated
using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.buyer_id = (select auth.uid()) or c.seller_id = (select auth.uid()) or public.is_admin())
  )
);

create policy "conversation messages participant insert" on public.conversation_messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and c.status = 'open'
      and (c.buyer_id = (select auth.uid()) or c.seller_id = (select auth.uid()))
  )
);

create policy "conversation messages participant update" on public.conversation_messages for update to authenticated
using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.buyer_id = (select auth.uid()) or c.seller_id = (select auth.uid()) or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.buyer_id = (select auth.uid()) or c.seller_id = (select auth.uid()) or public.is_admin())
  )
);

create policy "message notifications owner read" on public.message_notifications for select to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

create policy "message notifications owner update" on public.message_notifications for update to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());

create policy "message notifications participant insert" on public.message_notifications for insert to authenticated
with check (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.buyer_id = (select auth.uid()) or c.seller_id = (select auth.uid()) or public.is_admin())
      and user_id in (c.buyer_id, c.seller_id)
  )
);
