export type SalesBudgetChartAvailability =
  | "available_now"
  | "needs_mapping"
  | "needs_new_view";

export type SalesBudgetChartPreview = {
  id: string;
  title: string;
  availability: SalesBudgetChartAvailability;
};

export type SalesBudgetCategoryPreview = {
  id: string;
  name: string;
  description: string;
  plannedCount: number;
  availableNowCount: number;
  needsNewViewCount: number;
  highlights: SalesBudgetChartPreview[];
};

export const salesBudgetCatalog: SalesBudgetCategoryPreview[] = [
  {
    id: "overview",
    name: "Visao geral",
    description: "Panorama inicial de orcamentos, volume, ticket medio e sazonalidade.",
    plannedCount: 15,
    availableNowCount: 15,
    needsNewViewCount: 0,
    highlights: [
      { id: "overview_total_amount_period", title: "Valor total de orcamentos por periodo", availability: "available_now" },
      { id: "overview_total_count_period", title: "Quantidade de orcamentos por periodo", availability: "available_now" },
      { id: "overview_monthly_evolution", title: "Evolucao mensal de orcamentos", availability: "available_now" },
      { id: "overview_weekday_heatmap", title: "Mapa de calor por dia da semana", availability: "available_now" },
    ],
  },
  {
    id: "funnel",
    name: "Funil comercial",
    description: "Status, conversao, perdas e gargalos do funil de orcamentos.",
    plannedCount: 15,
    availableNowCount: 12,
    needsNewViewCount: 0,
    highlights: [
      { id: "funnel_by_status", title: "Funil por status do orcamento", availability: "available_now" },
      { id: "funnel_approval_rate", title: "Taxa de aprovacao de orcamentos", availability: "needs_mapping" },
      { id: "funnel_conversion_by_seller", title: "Conversao por vendedor", availability: "needs_mapping" },
      { id: "funnel_blocking_status_ranking", title: "Ranking de status que mais travam vendas", availability: "available_now" },
    ],
  },
  {
    id: "seller",
    name: "Vendedores",
    description: "Performance comercial, ranking, markup, desconto e evolucao por vendedor.",
    plannedCount: 20,
    availableNowCount: 18,
    needsNewViewCount: 0,
    highlights: [
      { id: "seller_total_amount", title: "Valor total orcado por vendedor", availability: "available_now" },
      { id: "seller_conversion", title: "Conversao por vendedor", availability: "needs_mapping" },
      { id: "seller_abc_curve", title: "Curva ABC de vendedores", availability: "available_now" },
      { id: "seller_top_product", title: "Vendedor x produto mais orcado", availability: "available_now" },
    ],
  },
  {
    id: "customer",
    name: "Clientes",
    description: "Ticket, recorrencia, conversao, origem e distribuicao geografica dos clientes.",
    plannedCount: 20,
    availableNowCount: 17,
    needsNewViewCount: 0,
    highlights: [
      { id: "customer_top_amount", title: "Top clientes por valor orcado", availability: "available_now" },
      { id: "customer_recurring", title: "Clientes recorrentes", availability: "available_now" },
      { id: "customer_highest_conversion", title: "Clientes com maior taxa de conversao", availability: "needs_mapping" },
      { id: "customer_top_products", title: "Cliente x produtos mais orcados", availability: "available_now" },
    ],
  },
  {
    id: "product",
    name: "Produtos",
    description: "Itens orcados, demanda, valor unitario, mix e associacao entre produtos.",
    plannedCount: 25,
    availableNowCount: 23,
    needsNewViewCount: 0,
    highlights: [
      { id: "product_top_amount", title: "Top produtos por valor total", availability: "available_now" },
      { id: "product_demand_growth", title: "Produtos com crescimento de demanda", availability: "available_now" },
      { id: "product_mix_per_budget", title: "Mix de produtos por orcamento", availability: "available_now" },
      { id: "product_cooccurrence", title: "Produtos que mais aparecem juntos", availability: "available_now" },
    ],
  },
  {
    id: "margin",
    name: "Descontos e margem",
    description: "Desconto, acrescimo, markup e orcamentos com possivel margem ruim.",
    plannedCount: 25,
    availableNowCount: 22,
    needsNewViewCount: 0,
    highlights: [
      { id: "margin_total_discount", title: "Valor total de descontos concedidos", availability: "available_now" },
      { id: "margin_discount_vs_conversion", title: "Relacao desconto x conversao", availability: "needs_mapping" },
      { id: "margin_avg_markup_general", title: "Markup medio geral", availability: "available_now" },
      { id: "margin_possible_bad_margin_budgets", title: "Orcamentos com possivel margem ruim", availability: "available_now" },
    ],
  },
  {
    id: "source",
    name: "Origem",
    description: "Canais de venda, participacao, ticket e conversao por origem.",
    plannedCount: 15,
    availableNowCount: 13,
    needsNewViewCount: 0,
    highlights: [
      { id: "source_total_amount", title: "Valor total por origem", availability: "available_now" },
      { id: "source_conversion", title: "Conversao por origem", availability: "needs_mapping" },
      { id: "source_best_channels", title: "Ranking de melhores canais de venda", availability: "available_now" },
      { id: "source_high_volume_low_conversion", title: "Muito orcamento e pouca conversao", availability: "needs_mapping" },
    ],
  },
  {
    id: "geo",
    name: "Geografia",
    description: "Distribuicao por UF, cidade, regiao, vendedor e oportunidade geografica.",
    plannedCount: 17,
    availableNowCount: 15,
    needsNewViewCount: 0,
    highlights: [
      { id: "geo_amount_by_uf", title: "Valor total por UF", availability: "available_now" },
      { id: "geo_count_by_city", title: "Quantidade por cidade", availability: "available_now" },
      { id: "geo_state_heatmap", title: "Mapa de calor por estado", availability: "available_now" },
      { id: "geo_growth_opportunity_regions", title: "Regioes com oportunidade de crescimento", availability: "available_now" },
    ],
  },
  {
    id: "payment",
    name: "Condicao de pagamento",
    description: "Uso, ticket, desconto, markup e aprovacao por condicao de pagamento.",
    plannedCount: 12,
    availableNowCount: 11,
    needsNewViewCount: 0,
    highlights: [
      { id: "payment_total_amount", title: "Valor total por condicao de pagamento", availability: "available_now" },
      { id: "payment_conversion", title: "Conversao por condicao de pagamento", availability: "needs_mapping" },
      { id: "payment_most_used", title: "Condicoes de pagamento mais usadas", availability: "available_now" },
      { id: "payment_vs_approval", title: "Condicao de pagamento x aprovacao", availability: "needs_mapping" },
    ],
  },
  {
    id: "freight",
    name: "Frete",
    description: "Valor de frete, tipo, impacto no ticket e relacao com conversao.",
    plannedCount: 11,
    availableNowCount: 10,
    needsNewViewCount: 0,
    highlights: [
      { id: "freight_total_amount", title: "Valor total de frete", availability: "available_now" },
      { id: "freight_by_type", title: "Frete por tipo de frete", availability: "available_now" },
      { id: "freight_ratio_total", title: "Frete em relacao ao valor total", availability: "available_now" },
      { id: "freight_vs_conversion", title: "Relacao frete x conversao", availability: "needs_mapping" },
    ],
  },
  {
    id: "executive",
    name: "Diretoria",
    description: "Indicadores consolidados, pipeline, alertas e leitura executiva de vendas.",
    plannedCount: 20,
    availableNowCount: 15,
    needsNewViewCount: 2,
    highlights: [
      { id: "exec_dashboard", title: "Dashboard executivo de vendas", availability: "available_now" },
      { id: "exec_open_pipeline", title: "Pipeline comercial em aberto", availability: "available_now" },
      { id: "exec_goal_vs_actual", title: "Meta x realizado", availability: "needs_new_view" },
      { id: "exec_sales_forecast", title: "Forecast de vendas", availability: "needs_new_view" },
    ],
  },
  {
    id: "seller_insights",
    name: "Insights para vendedores",
    description: "Follow-up, potencial de recompra, comparativos e oportunidades individuais.",
    plannedCount: 20,
    availableNowCount: 17,
    needsNewViewCount: 0,
    highlights: [
      { id: "insight_pending_followup_budgets", title: "Orcamentos pendentes de follow-up", availability: "available_now" },
      { id: "insight_high_value_no_return", title: "Orcamentos de alto valor sem retorno", availability: "available_now" },
      { id: "insight_seller_vs_team_avg", title: "Comparativo do vendedor com a equipe", availability: "available_now" },
      { id: "insight_repurchase_potential_customers", title: "Clientes com potencial de recompra", availability: "available_now" },
    ],
  },
  {
    id: "future_data",
    name: "Novas informacoes",
    description: "Graficos dependentes de pedido, faturamento, estoque, custo, metas e marketing.",
    plannedCount: 30,
    availableNowCount: 0,
    needsNewViewCount: 30,
    highlights: [
      { id: "future_budget_vs_sold", title: "Orcado x vendido/faturado", availability: "needs_new_view" },
      { id: "future_loss_reason", title: "Motivo de perda do orcamento", availability: "needs_new_view" },
      { id: "future_real_margin_by_product", title: "Margem real por produto", availability: "needs_new_view" },
      { id: "future_marketing_campaign_sales", title: "Campanha de marketing x venda", availability: "needs_new_view" },
    ],
  },
  {
    id: "kpis",
    name: "KPIs essenciais",
    description: "Cards principais para abrir a tela com leitura executiva imediata.",
    plannedCount: 25,
    availableNowCount: 22,
    needsNewViewCount: 0,
    highlights: [
      { id: "kpi_total_budget_amount", title: "Valor total orcado", availability: "available_now" },
      { id: "kpi_conversion_rate", title: "Taxa de conversao", availability: "needs_mapping" },
      { id: "kpi_best_seller", title: "Melhor vendedor", availability: "available_now" },
      { id: "kpi_channel_highest_conversion", title: "Canal com maior conversao", availability: "needs_mapping" },
    ],
  },
];

export const salesBudgetTotals = salesBudgetCatalog.reduce(
  (acc, category) => {
    acc.plannedCharts += category.plannedCount;
    acc.availableNowCharts += category.availableNowCount;
    acc.needsNewViewCharts += category.needsNewViewCount;
    return acc;
  },
  {
    plannedCharts: 0,
    availableNowCharts: 0,
    needsNewViewCharts: 0,
  }
);
