# Gela Fácil

Vitrine de produtos indicados por afiliado do Mercado Livre e apresentação dos serviços locais da Gela Fácil.

- Produtos: pagamento, entrega, troca e garantia são de responsabilidade do Mercado Livre e do vendedor.
- Serviços Gela Fácil: instalação e manutenção apenas de ar-condicionado em Linhares, Sooretama, Aracruz e Rio Bananal.
- Outros refrigeradores: não possuem instalação ou manutenção oferecida pela Gela Fácil.
- WhatsApp: (27) 99973-5745.

## Links de afiliado

No painel administrativo, crie ou edite o produto e preencha **Link de afiliado do Mercado Livre**. O frontend busca esse dado pela API e o botão “Ver no Mercado Livre” abre somente URLs HTTPS do Mercado Livre ou `meli.la`.

## Backend e Supabase

O backend fica em `backend/` e serve o site, o admin e a API.

1. No Supabase, rode o SQL de `backend/sql/schema.sql`.
2. Crie `backend/.env` usando `backend/.env.example` como base.
3. Preencha `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `ADMIN_USER` e `ADMIN_PASSWORD`. `SESSION_SECRET` deve ter pelo menos 32 caracteres aleatórios; não use credenciais padrão.
4. Crie um bucket publico no Supabase Storage chamado `products`, ou ajuste `SUPABASE_PRODUCT_IMAGES_BUCKET` no `.env`.
5. Instale e rode:

```bash
cd backend
npm install
npm start
```

Depois acesse:

- Site: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin/`

O Live Server nas portas 5500–5599 também pode ser usado para visualizar o site. Nessas portas, as páginas públicas consultam o backend no mesmo host, na porta 3000. Mantenha `npm start` rodando em `backend/`, com o `.env` configurado. O Live Server sozinho não fornece a API de produtos. Em produção, a API continua no mesmo endereço do site.

A chave `SUPABASE_SERVICE_ROLE_KEY` deve ficar somente no `backend/.env`. O frontend público acessa apenas `/api/products`, que não expõe estoque, SKU ou limites de estoque. Rode o SQL do schema para ativar RLS e revogar acesso direto dos papéis públicos do Supabase.

No cadastro de produto do admin, voce pode enviar uma imagem para o bucket ou colar uma URL pronta. Quando houver upload, o backend salva a imagem no Supabase Storage e grava a URL publica no produto.
