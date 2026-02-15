# Snipets

A small project to save snippets from any text you can select in your browser.

# Usage

## Web app + Supabase Edge Functions

This project now uses Supabase Edge Functions instead of a local FastAPI server. For local development, run the Supabase CLI alongside the web app.

### 1. Start Supabase locally

```sh
supabase start
```

### 2. Configure env vars

Create a .env file for the web app (or set these in your shell):

```sh
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
VITE_EDGE_URL=http://localhost:54321/functions/v1/api
```

For the edge function itself, export these before running it locally:

```sh
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
```

### 3. Serve the edge function locally

```sh
supabase functions serve api
```

### 3a. Database schema (Supabase)

The edge function expects these tables and basic RLS policies:

```sql
create table if not exists users (
	id uuid primary key,
	username text unique not null,
	created_at timestamptz default now() not null
);

create table if not exists snippets (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references users(id) on delete cascade not null,
	text text not null,
	title text not null,
	url text,
	created_at timestamptz default now() not null
);

create table if not exists follows (
	id uuid primary key default gen_random_uuid(),
	follower_id uuid references users(id) on delete cascade not null,
	following_id uuid references users(id) on delete cascade not null,
	created_at timestamptz default now() not null,
	unique (follower_id, following_id)
);

alter table users enable row level security;
alter table snippets enable row level security;
alter table follows enable row level security;

create policy "users_select" on users
	for select using (true);

create policy "users_insert" on users
	for insert with check (auth.uid()::text = id)

create policy "snippets_select" on snippets
	for select using (auth.uid()::text = user_id);

create policy "snippets_insert" on snippets
	for insert with check (auth.uid()::text = user_id);

create policy "snippets_delete" on snippets
	for delete using (auth.uid()::text = user_id);

create policy "follows_select" on follows
	for select using (auth.uid()::text = follower_id);

create policy "follows_insert" on follows
	for insert with check (auth.uid()::text = follower_id);
```

### 4. Run the web app

```sh
cd Web
npm install
npm run dev
```

The web UI will be at http://localhost:3000.

## Chrome extension

Build the ChromeExt project, then upload the directory in chrome://extensions.
In the extension settings, set the API endpoint to your edge function URL (for example, http://localhost:54321/functions/v1/api).

# ?

Thank you for reading if you made it this far, this has been a fun little project. I hope it proves interesting if not useful.

Adios ✌️