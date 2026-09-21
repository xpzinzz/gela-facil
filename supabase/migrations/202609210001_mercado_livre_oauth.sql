-- Armazena os tokens OAuth do Mercado Livre somente para uso do backend.

begin;

create table if not exists public.mercado_livre_oauth_tokens (
  integration text primary key,
  access_token text not null,
  refresh_token text not null,
  token_type text not null default 'Bearer',
  expires_at timestamptz not null,
  user_id text,
  scope text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mercado_livre_oauth_integration_check check (integration = 'catalog'),
  constraint mercado_livre_oauth_access_token_check check (btrim(access_token) <> ''),
  constraint mercado_livre_oauth_refresh_token_check check (btrim(refresh_token) <> '')
);

alter table public.mercado_livre_oauth_tokens enable row level security;
revoke all on table public.mercado_livre_oauth_tokens from anon, authenticated;

comment on table public.mercado_livre_oauth_tokens is
  'Tokens OAuth do Mercado Livre acessiveis exclusivamente pelo backend com service role.';

commit;
