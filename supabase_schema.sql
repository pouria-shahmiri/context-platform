-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE (Public Profile)
-- This table mirrors auth.users and is managed via Triggers
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  api_key text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Policies for users
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- 2. PYRAMIDS TABLE
create table if not exists public.pyramids (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  context text,
  status text default 'in_progress',
  blocks jsonb default '{}'::jsonb,
  connections jsonb default '[]'::jsonb,
  context_sources jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_modified timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on pyramids
alter table public.pyramids enable row level security;

-- Policies for pyramids
create policy "Users can view their own pyramids" on public.pyramids
  for select using (auth.uid() = user_id);

create policy "Users can insert their own pyramids" on public.pyramids
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own pyramids" on public.pyramids
  for update using (auth.uid() = user_id);

create policy "Users can delete their own pyramids" on public.pyramids
  for delete using (auth.uid() = user_id);

-- 3. PRODUCT DEFINITIONS TABLE
create table if not exists public.product_definitions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  data jsonb default '{}'::jsonb,
  linked_pyramid_id uuid references pyramids(id),
  context_sources jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_modified timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on product_definitions
alter table public.product_definitions enable row level security;

-- Policies for product_definitions
create policy "Users can view their own definitions" on public.product_definitions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own definitions" on public.product_definitions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own definitions" on public.product_definitions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own definitions" on public.product_definitions
  for delete using (auth.uid() = user_id);

-- 4. CONTEXT DOCUMENTS TABLE
create table if not exists public.context_documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  type text default 'text',
  content text,
  notion_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_modified timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on context_documents
alter table public.context_documents enable row level security;

-- Policies for context_documents
create policy "Users can view their own documents" on public.context_documents
  for select using (auth.uid() = user_id);

create policy "Users can insert their own documents" on public.context_documents
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own documents" on public.context_documents
  for update using (auth.uid() = user_id);

create policy "Users can delete their own documents" on public.context_documents
  for delete using (auth.uid() = user_id);

-- 5. CONVERSATIONS TABLE (Chat)
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on conversations
alter table public.conversations enable row level security;

-- Policies for conversations
create policy "Users can view their own conversations" on public.conversations
  for select using (auth.uid() = user_id);

create policy "Users can insert their own conversations" on public.conversations
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own conversations" on public.conversations
  for update using (auth.uid() = user_id);

create policy "Users can delete their own conversations" on public.conversations
  for delete using (auth.uid() = user_id);

-- 6. MESSAGES TABLE (Chat)
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  role text not null, -- 'user' or 'assistant'
  content text not null,
  metadata jsonb default '{}'::jsonb,
  parent_id uuid not null, -- Can be conversation_id, pyramid_id, etc.
  parent_collection text default 'conversations',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on messages
alter table public.messages enable row level security;

-- Policies for messages
create policy "Users can view their own messages" on public.messages
  for select using (auth.uid() = user_id);

create policy "Users can insert their own messages" on public.messages
  for insert with check (auth.uid() = user_id);


-- 7. AUTOMATIC USER PROFILE CREATION (TRIGGER)
-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new auth.users creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
