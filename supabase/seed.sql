-- Carga inicial opcional e idempotente.
-- O backend também insere estes produtos automaticamente quando a tabela está vazia.

insert into public.products (
  brand,
  name,
  category,
  price,
  old_price,
  stock,
  min_stock,
  sku,
  specs,
  status,
  image,
  affiliate_url
)
select
  seed.brand,
  seed.name,
  seed.category,
  seed.price,
  seed.old_price,
  seed.stock,
  seed.min_stock,
  seed.sku,
  seed.specs,
  seed.status,
  seed.image,
  null
from (
  values
    ('Samsung', 'WindFree Inverter 12.000 BTU', 'inverter', 2399.00, 2899.00, 8, 5, 'SAM-WF-12K', 'Inverter, 12.000 BTU, A+++', 'active', 'assets/produtos/samsung_windfree.png'),
    ('LG', 'Dual Inverter Voice 9.000 BTU', 'inverter', 1849.00, 2199.00, 3, 5, 'LG-DI-9K', 'Inverter, 9.000 BTU, Wi-Fi', 'active', 'assets/produtos/lg_dual_inverter.png'),
    ('Midea', 'Xtreme Save Inverter 18.000 BTU', 'inverter', 2899.00, 3499.00, 12, 5, 'MID-XS-18K', 'Inverter, 18.000 BTU, A++', 'active', 'assets/produtos/midea_xtreme_save.png'),
    ('Elgin', 'Eco Inverter Plus 24.000 BTU', 'inverter', 3699.00, 4299.00, 5, 4, 'ELG-EI-24K', 'Inverter, 24.000 BTU, Quente/Frio', 'active', 'assets/produtos/elgin_eco_inverter.png'),
    ('Springer', 'Silentia 7.500 BTU Split', 'split', 1299.00, 1699.00, 0, 4, 'SPR-SL-7.5K', 'Split, 7.500 BTU, Silencioso', 'active', 'assets/produtos/springer_silentia.png'),
    ('Philco', 'Portable Portatil 12.000 BTU', 'portatil', 1749.00, 2099.00, 2, 3, 'PHI-PB-12K', 'Portatil, 12.000 BTU, Sem obra', 'active', 'assets/produtos/philco_portable.png'),
    ('Electrolux', 'Frigobar 122 Litros EM120', 'bebidas', 1209.00, 1809.00, 7, 3, 'ELX-FB-122L', '122 Litros, Branco, 110V', 'active', 'assets/clima-bebidas/electrolux_frigobar.png'),
    ('Electrolux', 'Cervejeira Home Bar EB100', 'bebidas', 2229.00, 2729.00, 4, 3, 'ELX-CB-100L', '100 Litros, Frost Free, 110V', 'active', 'assets/clima-bebidas/electrolux_cervejeira.png'),
    ('Venax', 'Cervejeira Blue Light 102L', 'bebidas', 2529.00, 3423.00, 1, 3, 'VNX-BL-102L', '102 Litros, Blue Light, 220V', 'inactive', 'assets/clima-bebidas/venax_cervejeira.png'),
    ('Electrolux', 'Cervejeira com Torre de Chopp EB10C', 'bebidas', 2799.00, 3693.00, 0, 2, 'ELX-TC-100L', 'Torre de Chopp, 100 Litros, 110V', 'active', 'assets/clima-bebidas/electrolux_chopp.png')
) as seed (
  brand,
  name,
  category,
  price,
  old_price,
  stock,
  min_stock,
  sku,
  specs,
  status,
  image
)
where not exists (
  select 1
  from public.products existing
  where existing.sku = seed.sku
);
