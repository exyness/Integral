drop function if exists match_documents;
drop table if exists search_index;

create table if not exists search_index (
  id uuid primary key default gen_random_uuid(),
  content text,
  metadata jsonb,
  embedding extensions.vector(3072), 
  user_id uuid not null,
  created_at timestamptz default now()
);

alter table search_index enable row level security;

create policy "Users can insert their own documents"
  on search_index for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own documents"
  on search_index for select
  using (auth.uid() = user_id);

create policy "Users can update their own documents"
  on search_index for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on search_index for delete
  using (auth.uid() = user_id);

create or replace function match_documents (
  query_embedding extensions.vector(3072),
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
  where auth.uid() = search_index.user_id
    and 1 - (search_index.embedding <=> query_embedding) > match_threshold
  order by search_index.embedding <=> query_embedding
  limit match_count;
end;
$$;
