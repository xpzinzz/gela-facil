# Gela Fácil

Vitrine de produtos indicados por afiliado do Mercado Livre e apresentação dos serviços locais da Gela Fácil.

- Produtos: pagamento, entrega, troca e garantia são de responsabilidade do Mercado Livre e do vendedor.
- Serviços Gela Fácil: instalação e manutenção apenas de ar-condicionado em Linhares, Sooretama, Aracruz e Rio Bananal.
- Outros refrigeradores: não possuem instalação ou manutenção oferecida pela Gela Fácil.
- WhatsApp: (27) 99973-5745.

## Links de afiliado

Gere o link do produto no **Portal de Afiliados e Criadores** ou pela **Barra de Afiliados** do Mercado Livre. Depois, no painel administrativo, cole esse link no campo de importação. O backend resolve o `meli.la` apenas para identificar o anúncio e preserva o link afiliado original no produto. O botão “Ver no Mercado Livre” usa exatamente esse endereço.

A API de anúncios não cria o rastreamento de afiliado. Por isso, importar somente um ID `MLB...` preenche os dados, mas o link de afiliado ainda precisa ser informado antes de divulgar o produto.

## Backend e Supabase

O backend fica em `backend/` e serve o site, o admin e a API.

1. No SQL Editor do Supabase, rode `supabase/schema.sql`. Para carregar imediatamente os produtos iniciais, rode também `supabase/seed.sql`.
2. Crie `backend/.env` com `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PRODUCT_IMAGES_BUCKET=products` e um `SESSION_SECRET` aleatório de pelo menos 32 caracteres.
3. No primeiro início, inclua também `ADMIN_USER` e `ADMIN_PASSWORD` (senha com pelo menos 12 caracteres). O backend cria o primeiro registro em `admin_users` e salva somente o hash bcrypt da senha. Depois que esse administrador existir no banco, essas duas variáveis de bootstrap podem ser removidas do ambiente.
4. O schema cria um bucket público chamado `products`. Mantenha `SUPABASE_PRODUCT_IMAGES_BUCKET=products` no `.env`.
5. Para conectar a API do Mercado Livre, configure `MERCADO_LIVRE_CLIENT_ID`, `MERCADO_LIVRE_CLIENT_SECRET` e `MERCADO_LIVRE_REDIRECT_URI` somente no `backend/.env`. O painel conduz a autorização e o backend renova o token automaticamente. Nunca coloque segredo ou token no frontend.
6. Instale e rode:

```bash
cd backend
npm install
npm start
```

Depois acesse:

- Site: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin/`

### Criar ou redefinir o acesso administrativo

Se ainda não houver um administrador, ou se você não souber mais a senha do registro existente, defina temporariamente no `backend/.env`:

```env
ADMIN_USER=seu_usuario
ADMIN_PASSWORD=uma_senha_forte_com_12_ou_mais_caracteres
```

Com o backend parado, execute:

```bash
cd backend
npm run admin:set-password
```

O comando cria o usuário informado ou troca sua senha, reativa o acesso e nunca grava a senha original no Supabase. Após confirmar o login, remova `ADMIN_PASSWORD` do `.env` e reinicie o backend.

O Live Server nas portas 5500–5599 também pode ser usado para visualizar o site. Nessas portas, as páginas públicas consultam o backend no mesmo host, na porta 3000. Mantenha `npm start` rodando em `backend/`, com o `.env` configurado. O Live Server sozinho não fornece a API de produtos. Em produção, a API continua no mesmo endereço do site.

A chave `SUPABASE_SERVICE_ROLE_KEY` deve ficar somente no `backend/.env`. O frontend público acessa apenas `/api/products`, que não expõe estoque, SKU ou limites de estoque. Rode o SQL do schema para ativar RLS e revogar acesso direto dos papéis públicos do Supabase.

No cadastro de produto do admin, voce pode enviar uma imagem para o bucket ou colar uma URL pronta. Quando houver upload, o backend salva a imagem no Supabase Storage e grava a URL publica no produto.

## Importação do Mercado Livre

No painel administrativo, abra **Adicionar produto** e conecte a conta do Mercado Livre. Depois, cole preferencialmente o link de afiliado `meli.la` e use **Buscar dados do anúncio**. O backend consulta a API oficial e preenche:

- título, marca, preço atual e preço anterior;
- imagem principal e galeria;
- descrição e ficha técnica;
- média, quantidade e comentários de avaliações;
- status público do anúncio.

Produtos já importados exibem um botão de sincronização na tabela do painel. O sistema não mostra estoque numérico do vendedor: para afiliados, a API informa apenas se o anúncio está ativo ou indisponível. O campo de estoque do painel continua sendo um controle interno e não representa o estoque do Mercado Livre.

Em uma base existente, execute, nesta ordem:

1. `supabase/migrations/202609200003_mercado_livre_catalog.sql`, para os dados dos anúncios;
2. `supabase/migrations/202609210001_mercado_livre_oauth.sql`, para os tokens OAuth protegidos por RLS.

### Fluxo completo

1. Escolha um anúncio de produto elegível no Mercado Livre.
2. Gere o link pelo Portal/Barra de Afiliados.
3. No admin da Gela Fácil, conecte sua conta do Mercado Livre uma única vez.
4. Cole o link afiliado no importador; o backend extrai o `MLB` e consulta anúncio, preço vigente, fotos, descrição, atributos e avaliações.
5. Revise os dados e salve. O link afiliado original fica associado ao produto.
6. O visitante conhece o produto na Gela Fácil e clica conscientemente em “Ver no Mercado Livre”. A compra, pagamento, entrega e atribuição da comissão ocorrem no Mercado Livre.
7. Use o botão de sincronização no admin para atualizar os dados. Se o token expirar, o backend usa o `refresh_token` e salva os novos tokens automaticamente.
