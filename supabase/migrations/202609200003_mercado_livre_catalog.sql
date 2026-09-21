-- Amplia o catalogo para armazenar os dados importados da API do Mercado Livre.

begin;

alter table public.products
  add column if not exists mercado_livre_id text,
  add column if not exists description text,
  add column if not exists gallery jsonb not null default '[]'::jsonb,
  add column if not exists source_attributes jsonb not null default '{}'::jsonb,
  add column if not exists rating numeric(3, 2) not null default 0,
  add column if not exists rating_count integer not null default 0,
  add column if not exists reviews jsonb not null default '[]'::jsonb,
  add column if not exists source_status text,
  add column if not exists source_synced_at timestamptz;

create unique index if not exists products_mercado_livre_id_idx
  on public.products (mercado_livre_id)
  where mercado_livre_id is not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_mercado_livre_id_check') then
    alter table public.products add constraint products_mercado_livre_id_check
      check (mercado_livre_id is null or mercado_livre_id ~ '^MLB[0-9]{6,}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_rating_check') then
    alter table public.products add constraint products_rating_check check (rating >= 0 and rating <= 5);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_rating_count_check') then
    alter table public.products add constraint products_rating_count_check check (rating_count >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_gallery_check') then
    alter table public.products add constraint products_gallery_check check (jsonb_typeof(gallery) = 'array');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_source_attributes_check') then
    alter table public.products add constraint products_source_attributes_check check (jsonb_typeof(source_attributes) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_reviews_check') then
    alter table public.products add constraint products_reviews_check check (jsonb_typeof(reviews) = 'array');
  end if;
end
$$;

commit;
