# SDD - Sales Budget Analytics (Vendas / Orcamentos)

## Objetivo

Padronizar a experiencia do dashboard de Vendas para ficar consistente com o Financeiro, com:

- Cabecalho/filtros com o mesmo layout e tipografia do Financeiro.
- Cada grafico com **help** (objetivo, como calcular, como interpretar, cuidados) e com suporte a **analise assistida por IA**.
- Graficos geograficos (UF) com pelo menos **2 visoes** (ex.: `Cards`/`Mapa`), reutilizando o `BrazilUfMapChart` do Financeiro.
- Onde houver graficos com o **mesmo objetivo**, consolidar em um unico widget com 3-4 visoes/abas (o usuario alterna sem trocar de pagina).

## Fonte de verdade (metadados e help)

Arquivo: `web/src/lib/salesBudgetChartDefinitions.ts`

Responsabilidades:

- Definir `objective`, `calculation`, `howToRead`, `cautions`.
- Declarar `primaryVisualization` + `secondaryVisualizations` para orientar as visoes na UI.
- Declarar `groupId` quando graficos puderem ser consolidados no mesmo widget.

Arquivo: `web/src/lib/salesBudgetChartHelp.ts`

Responsabilidades:

- Expor `getSalesBudgetChartObjective()` e `getSalesBudgetAutoHelpPrompt()` consumidos pela pagina de detalhe.
- Usar o registry acima como fonte primaria e fazer fallback heuristico quando faltar definicao.

## Padrões de UI (consistencia com Financeiro)

- Header do card: mesmo padding/fonte do `DashboardWidget` do Financeiro.
- Titulo + subtitle no formato:
  - `h3` com `text-sm font-bold`
  - linha secundaria `text-[10px] font-black uppercase tracking-wider` (warnings, variacoes, etc.)
- Acoes no header:
  - `BookOpenText`: abre detalhe com `?help=1` (gera explicacao automaticamente).
  - `Search` (opcional): abre detalhe para analise livre com IA.
  - `ArrowUpRight` (opcional): abre detalhe sem auto-help.

## Visualizacoes (padrão)

### Geo / UF

- `Cards`: ranking/bar (comparacao rapida).
- `Mapa`: choropleth por UF usando `BrazilUfMapChart`.
- (Opcional) `Tabela`: quando labels forem longas, para leitura completa.

### Mesma metrica, dimensoes similares

- Consolidar por `groupId` (ex.: `geo_by_uf`):
  - Abas: `Valor`, `Quantidade`, `Ticket medio`, `Conversao`
  - Cada aba ainda pode ter sub-visoes (`Cards`/`Mapa`).

## Checkpoints (ordem de entrega)

### Checkpoint 0 - Infra e metadados (registry)

- [x] Criar registry em `salesBudgetChartDefinitions.ts` com os primeiros graficos geograficos.
- [x] Atualizar `salesBudgetChartHelp.ts` para priorizar o registry no objetivo e no prompt da IA.

### Checkpoint 1 - Geo (UF) com 2 visoes em todos os graficos relevantes

- Garantir toggle `Cards/Mapa` para:
  - `geo_amount_by_uf`, `geo_count_by_uf`, `geo_avg_ticket_by_uf`, `geo_conversion_by_uf`
  - `customer_by_uf`, `product_by_geo`, `source_by_geo`
  - `geo_origin_by_region`, `geo_highest_avg_discount_regions`, `geo_highest_markup_regions`, `geo_growth_opportunity_regions`
- Ajustar cores/intensidade para destacar maior UF no mapa.

### Checkpoint 2 - Tipografia, margens e filtros (igual Financeiro)

- Unificar header/filtros no `sales-budget-analytics/page.tsx` com o Financeiro:
  - Mesmos paddings e classes
  - Mesma estrutura de botoes
- Padronizar o header dos cards de graficos (SalesBudgetChartCard).

### Checkpoint 3 - Help por grafico (cobertura)

- Adicionar definicoes faltantes no registry, por categoria, priorizando:
  - Overview, Funnel, Seller, Customer, Product, Source, Geo
- Garantir que `?help=1` sempre gere um texto consistente (registry + IA).

### Checkpoint 4 - Consolidacao por objetivo (widgets com abas)

- Introduzir um widget "Geo por UF" (groupId `geo_by_uf`) com abas para os 4 graficos.
- Gradualmente aplicar a mesma estrategia para outros grupos com objetivo repetido.

### Checkpoint 5 - Validacao

- `npm run build` (web) e smoke test manual na tela de Vendas e detalhe do grafico.

