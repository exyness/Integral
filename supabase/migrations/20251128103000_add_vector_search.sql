-- Create extensions schema if not exists
create schema if not exists extensions;

-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector with schema extensions;

-- Create a table to store your documents and their embeddings
create table if not exists search_index (
  id uuid primary key default gen_random_uuid(),
  content text,
  metadata jsonb,
  embedding extensions.vector(768), -- Gemini embedding dimension
  user_id uuid not null, -- We'll link this manually or via auth if using Supabase Auth
  created_at timestamptz default now()
);

-- Enable RLS
alter table search_index enable row level security;

-- Create policies
create policy "Users can insert their own documents"
on search_index for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can select their own documents"
on search_index for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own documents"
on search_index for update
to authenticated
using (auth.uid() = user_id);

create policy "Users can delete their own documents"
on search_index for delete
to authenticated
using (auth.uid() = user_id);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding extensions.vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    search_index.id,
    search_index.content,
    search_index.metadata,
    1 - (search_index.embedding <=> query_embedding) as similarity
  from search_index
  where 1 - (search_index.embedding <=> query_embedding) > match_threshold
  order by search_index.embedding <=> query_embedding
  limit match_count;
end;
$$;
