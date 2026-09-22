# Gela Fácil

Site institucional e catálogo de produtos da Gela Fácil, com painel administrativo, controle de estoque e atendimento por WhatsApp.

## Recursos

- catálogo público carregado pela API;
- cadastro manual de produtos, imagens, preços e estoque;
- painel administrativo com autenticação por sessão;
- armazenamento de dados e imagens no Supabase;
- páginas de detalhes, serviços e banners responsivos.

## Backend e Supabase

O backend fica em `backend/` e serve o site, o painel e a API.

1. No SQL Editor do Supabase, execute `supabase/schema.sql`.
2. Opcionalmente, execute `supabase/seed.sql` para inserir os produtos iniciais.
3. Copie `backend/.env.example` para `backend/.env` e preencha `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_SITE_URL` com a origem pública do site e um `SESSION_SECRET` aleatório de pelo menos 32 caracteres.
4. No primeiro início, inclua `ADMIN_USER` e `ADMIN_PASSWORD` com pelo menos 12 caracteres. Depois que o administrador for criado, essas duas variáveis de bootstrap podem ser removidas.
5. Instale e inicie o backend:

```bash
cd backend
npm install
npm start
```

O site fica disponível em `http://localhost:3000` e o painel em `http://localhost:3000/admin/`.

Para criar outro administrador ou redefinir uma senha, configure temporariamente `ADMIN_USER` e `ADMIN_PASSWORD` e execute `npm run admin:set-password` dentro de `backend/`.

## Segurança

A chave `SUPABASE_SERVICE_ROLE_KEY` deve permanecer somente no backend. O frontend público usa apenas `/api/products`, enquanto as operações de cadastro, upload e estoque exigem uma sessão administrativa válida.

## Testes

Dentro de `backend/`, execute:

```bash
npm test
```

O teste também protege os elementos essenciais de SEO: metadados, dados estruturados, imagens, validade de `robots.txt` e `sitemap.xml` e bloqueio de indexação do painel administrativo.

## Publicação e indexação

Os arquivos `robots.txt` e `sitemap.xml` ficam na raiz do frontend e são publicados diretamente pela Vercel, sem depender do backend. No Google Search Console, cadastre `https://gela-facil.vercel.app/sitemap.xml`. Ao publicar ou remover produtos, mantenha as URLs do sitemap sincronizadas com o catálogo.
