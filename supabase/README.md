# Banco do Gela Fácil no Supabase

O Supabase usa **PostgreSQL**, portanto os arquivos desta pasta não são scripts MySQL.

## Instalação em um projeto novo

1. Abra o projeto no Supabase.
2. Entre em **SQL Editor** e crie uma nova consulta.
3. Cole e execute todo o conteúdo de [`schema.sql`](./schema.sql).
4. Opcionalmente, execute [`seed.sql`](./seed.sql) para inserir os 10 produtos iniciais. Se não executar, o backend fará essa carga quando iniciar com a tabela vazia.
5. Em `backend/.env`, troque `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` pelos valores do novo projeto.
6. Mantenha `SUPABASE_PRODUCT_IMAGES_BUCKET=products`.

O `schema.sql` cria:

- a tabela `public.products` com as colunas usadas pelo backend;
- a tabela `public.admin_users`, usada pelo login do painel;
- validações de categoria, status, preços e estoque;
- índices para catálogo, categoria e SKU;
- atualização automática de `updated_at`;
- RLS e bloqueio de acesso direto pelos papéis `anon` e `authenticated`;
- o bucket público `products`, limitado a imagens JPEG, PNG ou WebP de até 5 MB.

No primeiro início, o backend cria o primeiro registro em `admin_users` usando `ADMIN_USER` e `ADMIN_PASSWORD`. A senha é convertida em hash bcrypt antes de ser gravada; o valor original não é armazenado no banco. Depois dessa criação, as duas variáveis de bootstrap podem ser removidas. `SESSION_SECRET` continua apenas no `backend/.env`.

Se você já executou o schema anterior, aplique as migrações pendentes em ordem:

1. [`migrations/202609200002_admin_users.sql`](./migrations/202609200002_admin_users.sql), caso a tabela de administradores ainda não exista;
2. [`migrations/202609200003_mercado_livre_catalog.sql`](./migrations/202609200003_mercado_livre_catalog.sql), para armazenar descrição, galeria, ficha técnica, avaliações e status dos anúncios importados.
