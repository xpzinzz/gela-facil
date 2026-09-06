# Gela Fácil

Vitrine de produtos indicados por afiliado do Mercado Livre e apresentação dos serviços locais da Gela Fácil.

- Produtos: pagamento, entrega, troca e garantia são de responsabilidade do Mercado Livre e do vendedor.
- Serviços Gela Fácil: venda, instalação, manutenção e higienização de ar-condicionado, geladeira e freezer. Base em Bebedouro, Linhares–ES; disponibilidade para outras cidades sob consulta.
- WhatsApp: (27) 99973-5745.

## Links de afiliado

Os links ainda estão pendentes. Para ativar um produto, adicione a propriedade `affiliateUrl` ao item correspondente em `productDetailsDb`, dentro de `js/script.js`:

```js
affiliateUrl: "https://mercadolivre.com.br/seu-link-de-afiliado",
```

Enquanto a propriedade não existir, o botão informa ao visitante que o link estará disponível em breve.

Use links HTTPS do Mercado Livre ou do encurtador `meli.la`. Preços são referências e as condições finais devem ser conferidas no anúncio.

## Atualização e verificação

O catálogo fica em `js/script.js`, no objeto `productDetailsDb`. Depois de alterar nomes ou preços, execute `node scripts/sync-catalog.cjs` para atualizar os cards da página inicial. Execute `node tests/site-audit.cjs` para verificar busca, ordenação, consistência de preços, imagens, links internos e casos de erro.

O site é estático. `pages/payment.html` explica a compra pelo Mercado Livre e não coleta dados de cartão. O painel em `admin/` é demonstrativo, sem autenticação no servidor, persistência ou integração com o catálogo público. Não o utilize para dados reais de clientes.

As verificações automatizadas não substituem a revisão visual em navegadores desktop e mobile. Os links reais de afiliado e a conferência das especificações no anúncio continuam necessários antes de anunciar ofertas.
