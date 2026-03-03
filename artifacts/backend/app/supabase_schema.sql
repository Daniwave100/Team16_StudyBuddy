create extension if not exists vector;

create table if not exists study_chunks (
    id uuid primary key,
    class_id text not null,
    source text not null,
    chunk_index integer not null,
    content text not null,
    embedding vector(1536) not null,
    created_at timestamptz not null default now()
);

create index if not exists idx_study_chunks_class_id on study_chunks (class_id);
create index if not exists idx_study_chunks_embedding_hnsw
on study_chunks using hnsw (embedding vector_cosine_ops);
