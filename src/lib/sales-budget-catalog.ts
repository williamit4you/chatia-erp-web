export type SalesBudgetChartAvailability =
  | "available_now"
  | "needs_mapping"
  | "needs_new_view";

export type SalesBudgetChartPreview = {
  id: string;
  title: string;
  availability: SalesBudgetChartAvailability;
  color?: string;
};

export type SalesBudgetCategoryPreview = {
  id: string;
  name: string;
  description: string;
  plannedCount: number;
  availableNowCount: number;
  needsNewViewCount: number;
  color?: string;
  highlights: SalesBudgetChartPreview[];
};

export const salesBudgetCategoryColors: Record<string, string> = {
  overview: "#4f46e5", // indigo-600
  funnel: "#16a34a", // green-600
  seller: "#2563eb", // blue-600
  customer: "#8b5cf6", // violet-500
  product: "#f97316", // orange-500
  margin: "#ec4899", // pink-500
  source: "#14b8a6", // teal-500
  geo: "#06b6d4", // cyan-500
  payment: "#f59e0b", // amber-500
  freight: "#64748b", // slate-500
  executive: "#0f172a", // slate-900
  seller_insights: "#10b981", // emerald-500
  future_data: "#a3a3a3", // neutral-400
  kpis: "#4f46e5", // indigo-600
  velocity: "#e11d48", // rose-600
  risk: "#dc2626", // red-600
  efficiency: "#eab308", // yellow-500
  predictive: "#7c3aed", // violet-600
};

export function getSalesBudgetCategoryColor(categoryId: string): string {
  return salesBudgetCategoryColors[categoryId] ?? "#4f46e5";
}

type SalesBudgetCatalogChartLike = {
  id: string;
  title: string;
  availability: SalesBudgetChartAvailability;
  color?: string;
};

type SalesBudgetCatalogCategoryLike = {
  id: string;
  highlights?: SalesBudgetCatalogChartLike[];
  color?: string;
};

export function applySalesBudgetCatalogColors<T extends SalesBudgetCatalogCategoryLike>(
  categories: T[]
): T[] {
  return categories.map((category) => {
    const color = category.color ?? getSalesBudgetCategoryColor(category.id);
    const highlights = (category.highlights ?? []).map((chart) => ({
      ...chart,
      color: chart.color ?? color,
    }));

    return {
      ...category,
      color,
      highlights,
    } as T;
  });
}

const salesBudgetCatalogBase: SalesBudgetCategoryPreview[] = [
  {
    id: "overview",
    name: "VisÃ£o geral",
    description: "Panorama inicial de orÃ§amentos, volume, ticket mÃ©dio e sazonalidade.",
    plannedCount: 15,
    availableNowCount: 15,
    needsNewViewCount: 0,
    highlights: [
      { id: "overview_total_amount_period", title: "Valor total de orÃ§amentos por perÃ­odo", availability: "available_now" },
      { id: "overview_total_count_period", title: "Quantidade de orÃ§amentos por perÃ­odo", availability: "available_now" },
      { id: "overview_avg_ticket", title: "Ticket mÃ©dio dos orÃ§amentos", availability: "available_now" },
      { id: "overview_amount_by_company", title: "Valor total por empresa/filial", availability: "available_now" },
      { id: "overview_count_by_company", title: "Quantidade de orÃ§amentos por empresa/filial", availability: "available_now" },
      { id: "overview_monthly_evolution", title: "EvoluÃ§Ã£o mensal de orÃ§amentos", availability: "available_now" },
      { id: "overview_weekly_evolution", title: "EvoluÃ§Ã£o semanal de orÃ§amentos", availability: "available_now" },
      { id: "overview_daily_evolution", title: "EvoluÃ§Ã£o diÃ¡ria de orÃ§amentos", availability: "available_now" },
      { id: "overview_current_vs_previous_month", title: "Comparativo mÃªs atual x mÃªs anterior", availability: "available_now" },
      { id: "overview_current_year_vs_previous_year", title: "Comparativo ano atual x ano anterior", availability: "available_now" },
      { id: "overview_top_days_by_volume", title: "Top dias com maior volume de orÃ§amentos", availability: "available_now" },
      { id: "overview_top_months_by_amount", title: "Top meses com maior valor orÃ§ado", availability: "available_now" },
      { id: "overview_month_seasonality", title: "Sazonalidade de vendas/orÃ§amentos por mÃªs", availability: "available_now" },
      { id: "overview_weekday_heatmap", title: "Mapa de calor por dia da semana", availability: "available_now" },
      { id: "overview_month_year_heatmap", title: "Mapa de calor por mÃªs e ano", availability: "available_now" },
    ],
  },
  {
    id: "funnel",
    name: "Funil comercial",
    description: "Status, conversÃ£o, perdas e gargalos do funil de orÃ§amentos.",
    plannedCount: 15,
    availableNowCount: 15,
    needsNewViewCount: 0,
    highlights: [
      { id: "funnel_by_status", title: "Funil por status do orÃ§amento", availability: "available_now" },
      { id: "funnel_amount_by_status", title: "Valor total por status", availability: "available_now" },
      { id: "funnel_count_by_status", title: "Quantidade de orÃ§amentos por status", availability: "available_now" },
      { id: "funnel_conversion_percent_by_status", title: "Percentual de conversÃ£o por status", availability: "available_now" },
      { id: "funnel_open_approved_lost", title: "OrÃ§amentos em aberto x aprovados x perdidos", availability: "available_now" },
      { id: "funnel_pending_amount", title: "Valor parado em orÃ§amentos pendentes", availability: "available_now" },
      { id: "funnel_approval_rate", title: "Taxa de aprovaÃ§Ã£o de orÃ§amentos", availability: "available_now" },
      { id: "funnel_loss_cancel_rate", title: "Taxa de perda/cancelamento", availability: "available_now" },
      { id: "funnel_conversion_evolution", title: "EvoluÃ§Ã£o da conversÃ£o ao longo do tempo", availability: "available_now" },
      { id: "funnel_conversion_by_seller", title: "ConversÃ£o por vendedor", availability: "available_now" },
      { id: "funnel_conversion_by_customer", title: "ConversÃ£o por cliente", availability: "available_now" },
      { id: "funnel_conversion_by_origin", title: "ConversÃ£o por origem", availability: "available_now" },
      { id: "funnel_conversion_by_geo", title: "ConversÃ£o por cidade/UF", availability: "available_now" },
      { id: "funnel_conversion_by_payment", title: "ConversÃ£o por condiÃ§Ã£o de pagamento", availability: "available_now" },
      { id: "funnel_blocking_status_ranking", title: "Ranking de status que mais travam vendas", availability: "available_now" },
    ],
  },
  {
    id: "seller",
    name: "Vendedores",
    description: "Performance comercial, ranking, markup, desconto e evoluÃ§Ã£o por vendedor.",
    plannedCount: 20,
    availableNowCount: 20,
    needsNewViewCount: 0,
    highlights: [
      { id: "seller_total_amount", title: "Valor total orÃ§ado por vendedor", availability: "available_now" },
      { id: "seller_total_count", title: "Quantidade de orÃ§amentos por vendedor", availability: "available_now" },
      { id: "seller_avg_ticket", title: "Ticket mÃ©dio por vendedor", availability: "available_now" },
      { id: "seller_conversion", title: "ConversÃ£o por vendedor", availability: "available_now" },
      { id: "seller_avg_discount", title: "Desconto mÃ©dio concedido por vendedor", availability: "available_now" },
      { id: "seller_avg_markup", title: "Markup mÃ©dio por vendedor", availability: "available_now" },
      { id: "seller_avg_surcharge", title: "AcrÃ©scimo mÃ©dio por vendedor", availability: "available_now" },
      { id: "seller_avg_freight", title: "Valor de frete mÃ©dio por vendedor", availability: "available_now" },
      { id: "seller_ranking_amount", title: "Ranking de vendedores por valor total", availability: "available_now" },
      { id: "seller_ranking_count", title: "Ranking de vendedores por quantidade", availability: "available_now" },
      { id: "seller_ranking_ticket", title: "Ranking de vendedores por ticket mÃ©dio", availability: "available_now" },
      { id: "seller_ranking_markup", title: "Ranking de vendedores por margem/markup", availability: "available_now" },
      { id: "seller_most_lost", title: "Vendedores com mais orÃ§amentos perdidos", availability: "available_now" },
      { id: "seller_most_approved", title: "Vendedores com mais orÃ§amentos aprovados", availability: "available_now" },
      { id: "seller_monthly_evolution", title: "EvoluÃ§Ã£o mensal por vendedor", availability: "available_now" },
      { id: "seller_comparison", title: "Comparativo entre vendedores", availability: "available_now" },
      { id: "seller_share_total", title: "ParticipaÃ§Ã£o de cada vendedor no faturamento", availability: "available_now" },
      { id: "seller_abc_curve", title: "Curva ABC de vendedores", availability: "available_now" },
      { id: "seller_top_product", title: "Vendedor x produto mais orÃ§ado", availability: "available_now" },
      { id: "seller_top_customer", title: "Vendedor x cliente mais atendido", availability: "available_now" },
    ],
  },
  {
    id: "customer",
    name: "Clientes",
    description: "Ticket, recorrÃªncia, conversÃ£o, origem e distribuiÃ§Ã£o geogrÃ¡fica dos clientes.",
    plannedCount: 20,
    availableNowCount: 20,
    needsNewViewCount: 0,
    highlights: [
      { id: "customer_top_amount", title: "Top clientes por valor orÃ§ado", availability: "available_now" },
      { id: "customer_top_count", title: "Top clientes por quantidade de orÃ§amentos", availability: "available_now" },
      { id: "customer_avg_ticket", title: "Ticket mÃ©dio por cliente", availability: "available_now" },
      { id: "customer_recurring", title: "Clientes recorrentes", availability: "available_now" },
      { id: "customer_new_period", title: "Clientes novos por perÃ­odo", availability: "available_now" },
      { id: "customer_inactive_recent", title: "Clientes sem orÃ§amento recente", availability: "available_now" },
      { id: "customer_highest_discount", title: "Clientes com maior desconto recebido", availability: "available_now" },
      { id: "customer_highest_markup", title: "Clientes com maior markup", availability: "available_now" },
      { id: "customer_highest_open_amount", title: "Clientes com maior valor em aberto", availability: "available_now" },
      { id: "customer_highest_conversion", title: "Clientes com maior taxa de conversÃ£o", availability: "available_now" },
      { id: "customer_low_conversion", title: "Clientes com baixa conversÃ£o", availability: "available_now" },
      { id: "customer_abc_curve", title: "Curva ABC de clientes", availability: "available_now" },
      { id: "customer_top_share", title: "ParticipaÃ§Ã£o dos principais clientes no total", availability: "available_now" },
      { id: "customer_evolution", title: "EvoluÃ§Ã£o de orÃ§amentos por cliente", availability: "available_now" },
      { id: "customer_top_products", title: "Cliente x produtos mais orÃ§ados", availability: "available_now" },
      { id: "customer_responsible_seller", title: "Cliente x vendedor responsÃ¡vel", availability: "available_now" },
      { id: "customer_origin", title: "Cliente x origem", availability: "available_now" },
      { id: "customer_payment_condition", title: "Cliente x condiÃ§Ã£o de pagamento", availability: "available_now" },
      { id: "customer_by_city", title: "Clientes por cidade", availability: "available_now" },
      { id: "customer_by_uf", title: "Clientes por UF", availability: "available_now" },
    ],
  },
  {
    id: "product",
    name: "Produtos",
    description: "Itens orÃ§ados, demanda, valor unitÃ¡rio, mix e associaÃ§Ã£o entre produtos.",
    plannedCount: 25,
    availableNowCount: 25,
    needsNewViewCount: 0,
    highlights: [
      { id: "product_top_amount", title: "Top produtos por valor total", availability: "available_now" },
      { id: "product_top_quantity", title: "Top produtos por quantidade orÃ§ada", availability: "available_now" },
      { id: "product_highest_avg_ticket", title: "Produtos com maior ticket mÃ©dio", availability: "available_now" },
      { id: "product_highest_discount", title: "Produtos com maior desconto aplicado", availability: "available_now" },
      { id: "product_highest_markup", title: "Produtos com maior markup", availability: "available_now" },
      { id: "product_highest_surcharge", title: "Produtos com maior acrÃ©scimo", availability: "available_now" },
      { id: "product_most_quoted_period", title: "Produtos mais orÃ§ados por perÃ­odo", availability: "available_now" },
      { id: "product_least_quoted", title: "Produtos menos orÃ§ados", availability: "available_now" },
      { id: "product_demand_drop", title: "Produtos com queda de demanda", availability: "available_now" },
      { id: "product_demand_growth", title: "Produtos com crescimento de demanda", availability: "available_now" },
      { id: "product_monthly_evolution", title: "EvoluÃ§Ã£o mensal por produto", availability: "available_now" },
      { id: "product_abc_curve", title: "Curva ABC de produtos", availability: "available_now" },
      { id: "product_share_total", title: "ParticipaÃ§Ã£o dos produtos no valor total", availability: "available_now" },
      { id: "product_by_seller", title: "Produtos por vendedor", availability: "available_now" },
      { id: "product_by_customer", title: "Produtos por cliente", availability: "available_now" },
      { id: "product_by_geo", title: "Produtos por cidade/UF", availability: "available_now" },
      { id: "product_by_company", title: "Produtos por empresa/filial", availability: "available_now" },
      { id: "product_by_origin", title: "Produtos por origem do orÃ§amento", availability: "available_now" },
      { id: "product_highest_gross_unit", title: "Produtos com maior valor unitÃ¡rio bruto", availability: "available_now" },
      { id: "product_highest_net_unit", title: "Produtos com maior valor unitÃ¡rio lÃ­quido", availability: "available_now" },
      { id: "product_gross_net_gap", title: "DiferenÃ§a entre valor bruto e lÃ­quido", availability: "available_now" },
      { id: "product_avg_quantity_per_item", title: "Quantidade mÃ©dia por item", availability: "available_now" },
      { id: "product_avg_value_per_item", title: "Valor mÃ©dio por item", availability: "available_now" },
      { id: "product_mix_per_budget", title: "Mix de produtos por orÃ§amento", availability: "available_now" },
      { id: "product_cooccurrence", title: "Produtos que mais aparecem juntos", availability: "available_now" },
    ],
  },
  {
    id: "margin",
    name: "Descontos e margem",
    description: "Desconto, acrÃ©scimo, markup e orÃ§amentos com possÃ­vel margem ruim.",
    plannedCount: 25,
    availableNowCount: 25,
    needsNewViewCount: 0,
    highlights: [
      { id: "margin_total_discount", title: "Valor total de descontos concedidos", availability: "available_now" },
      { id: "margin_avg_discount_percent", title: "Percentual mÃ©dio de desconto", availability: "available_now" },
      { id: "margin_discount_by_seller", title: "Desconto por vendedor", availability: "available_now" },
      { id: "margin_discount_by_customer", title: "Desconto por cliente", availability: "available_now" },
      { id: "margin_discount_by_product", title: "Desconto por produto", availability: "available_now" },
      { id: "margin_discount_by_origin", title: "Desconto por origem", availability: "available_now" },
      { id: "margin_discount_by_payment", title: "Desconto por condiÃ§Ã£o de pagamento", availability: "available_now" },
      { id: "margin_highest_discount_ranking", title: "Ranking de maiores descontos", availability: "available_now" },
      { id: "margin_above_avg_discount_budgets", title: "OrÃ§amentos com desconto acima da mÃ©dia", availability: "available_now" },
      { id: "margin_discount_impact_total", title: "Impacto do desconto no valor total", availability: "available_now" },
      { id: "margin_discount_vs_conversion", title: "RelaÃ§Ã£o desconto x conversÃ£o", availability: "available_now" },
      { id: "margin_discount_vs_seller", title: "RelaÃ§Ã£o desconto x vendedor", availability: "available_now" },
      { id: "margin_total_surcharge", title: "Valor total de acrÃ©scimos", availability: "available_now" },
      { id: "margin_avg_surcharge_percent", title: "Percentual mÃ©dio de acrÃ©scimo", availability: "available_now" },
      { id: "margin_surcharge_by_seller", title: "AcrÃ©scimo por vendedor", availability: "available_now" },
      { id: "margin_surcharge_by_customer", title: "AcrÃ©scimo por cliente", availability: "available_now" },
      { id: "margin_surcharge_by_product", title: "AcrÃ©scimo por produto", availability: "available_now" },
      { id: "margin_avg_markup_general", title: "Markup mÃ©dio geral", availability: "available_now" },
      { id: "margin_markup_by_seller", title: "Markup por vendedor", availability: "available_now" },
      { id: "margin_markup_by_product", title: "Markup por produto", availability: "available_now" },
      { id: "margin_markup_by_customer", title: "Markup por cliente", availability: "available_now" },
      { id: "margin_markup_by_origin", title: "Markup por origem", availability: "available_now" },
      { id: "margin_low_markup_budgets", title: "OrÃ§amentos com markup baixo", availability: "available_now" },
      { id: "margin_possible_bad_margin_budgets", title: "OrÃ§amentos com possÃ­vel margem ruim", availability: "available_now" },
      { id: "margin_gross_vs_net", title: "Comparativo valor bruto x valor lÃ­quido", availability: "available_now" },
    ],
  },
  {
    id: "source",
    name: "Origem",
    description: "Canais de venda, participaÃ§Ã£o, ticket e conversÃ£o por origem.",
    plannedCount: 15,
    availableNowCount: 15,
    needsNewViewCount: 0,
    highlights: [
      { id: "source_total_amount", title: "Valor total por origem", availability: "available_now" },
      { id: "source_total_count", title: "Quantidade de orÃ§amentos por origem", availability: "available_now" },
      { id: "source_avg_ticket", title: "Ticket mÃ©dio por origem", availability: "available_now" },
      { id: "source_conversion", title: "ConversÃ£o por origem", availability: "available_now" },
      { id: "source_highest_avg_discount", title: "Origem com maior desconto mÃ©dio", availability: "available_now" },
      { id: "source_highest_markup", title: "Origem com maior markup", availability: "available_now" },
      { id: "source_evolution", title: "EvoluÃ§Ã£o de origens por perÃ­odo", availability: "available_now" },
      { id: "source_share_total", title: "ParticipaÃ§Ã£o de cada origem no total", availability: "available_now" },
      { id: "source_by_seller", title: "Origem x vendedor", availability: "available_now" },
      { id: "source_by_product", title: "Origem x produto", availability: "available_now" },
      { id: "source_by_customer", title: "Origem x cliente", availability: "available_now" },
      { id: "source_by_geo", title: "Origem x cidade/UF", availability: "available_now" },
      { id: "source_best_channels", title: "Ranking de melhores canais de venda", availability: "available_now" },
      { id: "source_high_volume_low_conversion", title: "Canais com muito orÃ§amento e pouca conversÃ£o", availability: "available_now" },
      { id: "source_low_volume_high_ticket", title: "Canais com menos volume, mas maior ticket", availability: "available_now" },
    ],
  },
  {
    id: "geo",
    name: "Geografia",
    description: "DistribuiÃ§Ã£o por UF, cidade, regiÃ£o, vendedor e oportunidade geogrÃ¡fica.",
    plannedCount: 17,
    availableNowCount: 17,
    needsNewViewCount: 0,
    highlights: [
      { id: "geo_amount_by_uf", title: "Valor total por UF", availability: "available_now" },
      { id: "geo_count_by_uf", title: "Quantidade de orÃ§amentos por UF", availability: "available_now" },
      { id: "geo_avg_ticket_by_uf", title: "Ticket mÃ©dio por UF", availability: "available_now" },
      { id: "geo_conversion_by_uf", title: "ConversÃ£o por UF", availability: "available_now" },
      { id: "geo_amount_by_city", title: "Valor total por cidade", availability: "available_now" },
      { id: "geo_count_by_city", title: "Quantidade por cidade", availability: "available_now" },
      { id: "geo_top_cities_count", title: "Ranking de cidades com mais orÃ§amentos", availability: "available_now" },
      { id: "geo_top_cities_ticket", title: "Ranking de cidades com maior ticket mÃ©dio", availability: "available_now" },
      { id: "geo_state_heatmap", title: "Mapa de calor por estado", availability: "available_now" },
      { id: "geo_city_heatmap", title: "Mapa de calor por cidade", availability: "available_now" },
      { id: "geo_seller_by_region", title: "Vendedor por regiÃ£o", availability: "available_now" },
      { id: "geo_top_product_by_uf", title: "Produto mais orÃ§ado por UF", availability: "available_now" },
      { id: "geo_customer_by_region", title: "Cliente por regiÃ£o", availability: "available_now" },
      { id: "geo_origin_by_region", title: "Origem por regiÃ£o", availability: "available_now" },
      { id: "geo_highest_avg_discount_regions", title: "RegiÃµes com maior desconto mÃ©dio", availability: "available_now" },
      { id: "geo_highest_markup_regions", title: "RegiÃµes com maior markup", availability: "available_now" },
      { id: "geo_growth_opportunity_regions", title: "RegiÃµes com maior oportunidade de crescimento", availability: "available_now" },
    ],
  },
  {
    id: "payment",
    name: "CondiÃ§Ã£o de pagamento",
    description: "Uso, ticket, desconto, markup e aprovaÃ§Ã£o por condiÃ§Ã£o de pagamento.",
    plannedCount: 12,
    availableNowCount: 12,
    needsNewViewCount: 0,
    highlights: [
      { id: "payment_total_amount", title: "Valor total por condiÃ§Ã£o de pagamento", availability: "available_now" },
      { id: "payment_total_count", title: "Quantidade por condiÃ§Ã£o de pagamento", availability: "available_now" },
      { id: "payment_avg_ticket", title: "Ticket mÃ©dio por condiÃ§Ã£o de pagamento", availability: "available_now" },
      { id: "payment_conversion", title: "ConversÃ£o por condiÃ§Ã£o de pagamento", availability: "available_now" },
      { id: "payment_avg_discount", title: "Desconto mÃ©dio por condiÃ§Ã£o de pagamento", availability: "available_now" },
      { id: "payment_avg_markup", title: "Markup mÃ©dio por condiÃ§Ã£o de pagamento", availability: "available_now" },
      { id: "payment_most_used", title: "CondiÃ§Ãµes de pagamento mais usadas", availability: "available_now" },
      { id: "payment_by_seller", title: "CondiÃ§Ã£o de pagamento x vendedor", availability: "available_now" },
      { id: "payment_by_customer", title: "CondiÃ§Ã£o de pagamento x cliente", availability: "available_now" },
      { id: "payment_by_product", title: "CondiÃ§Ã£o de pagamento x produto", availability: "available_now" },
      { id: "payment_by_origin", title: "CondiÃ§Ã£o de pagamento x origem", availability: "available_now" },
      { id: "payment_vs_approval", title: "CondiÃ§Ã£o de pagamento x aprovaÃ§Ã£o", availability: "available_now" },
    ],
  },
  {
    id: "freight",
    name: "Frete",
    description: "Valor de frete, tipo, impacto no ticket e relaÃ§Ã£o com conversÃ£o.",
    plannedCount: 11,
    availableNowCount: 12,
    needsNewViewCount: 0,
    highlights: [
      { id: "freight_total_amount", title: "Valor total de frete", availability: "available_now" },
      { id: "freight_avg_per_budget", title: "Frete mÃ©dio por orÃ§amento", availability: "available_now" },
      { id: "freight_by_seller", title: "Frete por vendedor", availability: "available_now" },
      { id: "freight_by_customer", title: "Frete por cliente", availability: "available_now" },
      { id: "freight_by_geo", title: "Frete por cidade/UF", availability: "available_now" },
      { id: "freight_by_type", title: "Frete por tipo de frete", availability: "available_now" },
      { id: "freight_ratio_total", title: "Frete em relaÃ§Ã£o ao valor total", availability: "available_now" },
      { id: "freight_high_budgets", title: "OrÃ§amentos com frete alto", availability: "available_now" },
      { id: "freight_vs_conversion", title: "RelaÃ§Ã£o frete x conversÃ£o", availability: "available_now" },
      { id: "freight_most_used_type", title: "Tipo de frete mais usado", availability: "available_now" },
      { id: "freight_avg_ticket_by_type", title: "Ticket mÃ©dio por tipo de frete", availability: "available_now" },
    ],
  },
  {
    id: "executive",
    name: "Diretoria",
    description: "Indicadores consolidados, pipeline, alertas e leitura executiva de vendas.",
    plannedCount: 20,
    availableNowCount: 20,
    needsNewViewCount: 2,
    highlights: [
      { id: "exec_dashboard", title: "Dashboard executivo de vendas", availability: "available_now" },
      { id: "exec_total_revenue_budget", title: "Receita/orÃ§amento total por perÃ­odo", availability: "available_now" },
      { id: "exec_goal_vs_actual", title: "Meta x realizado", availability: "needs_new_view" },
      { id: "exec_sales_forecast", title: "Forecast de vendas", availability: "needs_new_view" },
      { id: "exec_open_pipeline", title: "Pipeline comercial em aberto", availability: "available_now" },
      { id: "exec_opportunity_ranking", title: "Ranking de oportunidades", availability: "available_now" },
      { id: "exec_monthly_growth", title: "EvoluÃ§Ã£o de crescimento mensal", availability: "available_now" },
      { id: "exec_seller_share", title: "ParticipaÃ§Ã£o por vendedor", availability: "available_now" },
      { id: "exec_customer_share", title: "ParticipaÃ§Ã£o por cliente", availability: "available_now" },
      { id: "exec_product_share", title: "ParticipaÃ§Ã£o por produto", availability: "available_now" },
      { id: "exec_region_share", title: "ParticipaÃ§Ã£o por regiÃ£o", availability: "available_now" },
      { id: "exec_origin_share", title: "ParticipaÃ§Ã£o por origem", availability: "available_now" },
      { id: "exec_avg_markup", title: "Margem/markup mÃ©dio consolidado", availability: "available_now" },
      { id: "exec_total_discount", title: "Desconto total concedido", availability: "available_now" },
      { id: "exec_lost_opportunities", title: "Oportunidades perdidas", availability: "available_now" },
      { id: "exec_negotiation_opportunities", title: "Oportunidades em negociaÃ§Ã£o", availability: "available_now" },
      { id: "exec_strategic_customers", title: "Clientes estratÃ©gicos", availability: "available_now" },
      { id: "exec_strategic_products", title: "Produtos estratÃ©gicos", availability: "available_now" },
      { id: "exec_strategic_channels", title: "Canais estratÃ©gicos", availability: "available_now" },
      { id: "exec_sales_drop_alerts", title: "Alertas de queda de vendas", availability: "available_now" },
    ],
  },
  {
    id: "seller_insights",
    name: "Insights para vendedores",
    description: "Follow-up, potencial de recompra, comparativos e oportunidades individuais.",
    plannedCount: 20,
    availableNowCount: 20,
    needsNewViewCount: 0,
    highlights: [
      { id: "insight_customers_high_conversion_chance", title: "Clientes com maior chance de conversÃ£o", availability: "available_now" },
      { id: "insight_frequent_customers", title: "Clientes que orÃ§am com frequÃªncia", availability: "available_now" },
      { id: "insight_customers_stopped_quoting", title: "Clientes que pararam de orÃ§ar", availability: "available_now" },
      { id: "insight_recommended_products_by_customer", title: "Produtos mais indicados por cliente", availability: "available_now" },
      { id: "insight_top_products_by_region", title: "Produtos mais vendidos por regiÃ£o", availability: "available_now" },
      { id: "insight_high_acceptance_products", title: "Produtos com maior aceitaÃ§Ã£o", availability: "available_now" },
      { id: "insight_pending_followup_budgets", title: "OrÃ§amentos pendentes de follow-up", availability: "available_now" },
      { id: "insight_old_open_budgets", title: "OrÃ§amentos antigos ainda em aberto", availability: "available_now" },
      { id: "insight_high_value_no_return", title: "OrÃ§amentos de alto valor sem retorno", availability: "available_now" },
      { id: "insight_high_ticket_customers", title: "Clientes com alto ticket mÃ©dio", availability: "available_now" },
      { id: "insight_discount_sensitive_customers", title: "Clientes sensÃ­veis a desconto", availability: "available_now" },
      { id: "insight_low_discount_customers", title: "Clientes que compram sem muito desconto", availability: "available_now" },
      { id: "insight_best_origin_by_seller", title: "Melhor origem para cada vendedor", availability: "available_now" },
      { id: "insight_best_product_by_seller", title: "Melhor produto para cada vendedor", availability: "available_now" },
      { id: "insight_best_region_by_seller", title: "Melhor regiÃ£o para cada vendedor", availability: "available_now" },
      { id: "insight_seller_vs_team_avg", title: "Comparativo do vendedor com a equipe", availability: "available_now" },
      { id: "insight_personal_seller_ranking", title: "Ranking pessoal do vendedor", availability: "available_now" },
      { id: "insight_individual_monthly_evolution", title: "EvoluÃ§Ã£o mensal individual", availability: "available_now" },
      { id: "insight_underused_products_by_seller", title: "Produtos que o vendedor vende pouco", availability: "available_now" },
      { id: "insight_repurchase_potential_customers", title: "Clientes com potencial de recompra", availability: "available_now" },
    ],
  },
  {
    id: "future_data",
    name: "Novas informaÃ§Ãµes",
    description: "GrÃ¡ficos dependentes de pedido, faturamento, estoque, custo, metas e marketing.",
    plannedCount: 30,
    availableNowCount: 3,
    needsNewViewCount: 27,
    highlights: [
      { id: "future_budget_vs_sold", title: "OrÃ§ado x vendido/faturado", availability: "available_now" },
      { id: "future_budget_converted_to_order", title: "OrÃ§amento convertido em pedido", availability: "available_now" },
      { id: "future_avg_conversion_time", title: "Tempo mÃ©dio de conversÃ£o", availability: "available_now" },
      { id: "future_issue_to_approval_time", title: "Tempo mÃ©dio entre emissÃ£o e aprovaÃ§Ã£o", availability: "needs_new_view" },
      { id: "future_loss_reason", title: "Motivo de perda do orÃ§amento", availability: "needs_new_view" },
      { id: "future_cancel_reason", title: "Motivo de cancelamento", availability: "needs_new_view" },
      { id: "future_goal_by_seller", title: "Meta por vendedor", availability: "needs_new_view" },
      { id: "future_goal_by_company", title: "Meta por filial", availability: "needs_new_view" },
      { id: "future_goal_by_product", title: "Meta por produto", availability: "needs_new_view" },
      { id: "future_goal_by_region", title: "Meta por regiÃ£o", availability: "needs_new_view" },
      { id: "future_real_margin_by_product", title: "Margem real por produto", availability: "needs_new_view" },
      { id: "future_gross_profit", title: "Lucro bruto", availability: "needs_new_view" },
      { id: "future_cogs", title: "Custo do produto vendido", availability: "needs_new_view" },
      { id: "future_available_stock", title: "Estoque disponÃ­vel", availability: "needs_new_view" },
      { id: "future_stockout", title: "Ruptura de estoque", availability: "needs_new_view" },
      { id: "future_no_stock_lost_sales", title: "Produtos sem estoque que perderam venda", availability: "needs_new_view" },
      { id: "future_inventory_turnover", title: "Giro de estoque", availability: "needs_new_view" },
      { id: "future_demand_forecast", title: "PrevisÃ£o de demanda", availability: "needs_new_view" },
      { id: "future_seller_commission", title: "ComissÃ£o por vendedor", availability: "needs_new_view" },
      { id: "future_profitability_by_seller", title: "Rentabilidade por vendedor", availability: "needs_new_view" },
      { id: "future_profitability_by_customer", title: "Rentabilidade por cliente", availability: "needs_new_view" },
      { id: "future_profitability_by_product", title: "Rentabilidade por produto", availability: "needs_new_view" },
      { id: "future_customer_default", title: "InadimplÃªncia por cliente", availability: "needs_new_view" },
      { id: "future_avg_payment_term", title: "Prazo mÃ©dio de pagamento", availability: "needs_new_view" },
      { id: "future_customer_ltv", title: "Lifetime Value do cliente", availability: "needs_new_view" },
      { id: "future_customer_churn", title: "Churn de clientes", availability: "needs_new_view" },
      { id: "future_customer_repurchase", title: "Recompra por cliente", availability: "needs_new_view" },
      { id: "future_avg_purchase_frequency", title: "FrequÃªncia mÃ©dia de compra", availability: "needs_new_view" },
      { id: "future_real_cross_sell_upsell", title: "Cross-sell e up-sell real", availability: "needs_new_view" },
      { id: "future_marketing_campaign_sales", title: "Campanha de marketing x venda", availability: "needs_new_view" },
    ],
  },
  {
    id: "kpis",
    name: "KPIs essenciais",
    description: "Cards principais para abrir a tela com leitura executiva imediata.",
    plannedCount: 25,
    availableNowCount: 25,
    needsNewViewCount: 0,
    highlights: [
      { id: "kpi_total_budget_amount", title: "Valor total orÃ§ado", availability: "available_now" },
      { id: "kpi_budget_count", title: "Quantidade de orÃ§amentos", availability: "available_now" },
      { id: "kpi_avg_ticket", title: "Ticket mÃ©dio", availability: "available_now" },
      { id: "kpi_conversion_rate", title: "Taxa de conversÃ£o", availability: "available_now" },
      { id: "kpi_open_amount", title: "Valor em aberto", availability: "available_now" },
      { id: "kpi_approved_amount", title: "Valor aprovado", availability: "available_now" },
      { id: "kpi_lost_amount", title: "Valor perdido", availability: "available_now" },
      { id: "kpi_best_seller", title: "Melhor vendedor", availability: "available_now" },
      { id: "kpi_best_customer", title: "Melhor cliente", availability: "available_now" },
      { id: "kpi_best_product", title: "Melhor produto", availability: "available_now" },
      { id: "kpi_best_city", title: "Melhor cidade", availability: "available_now" },
      { id: "kpi_best_uf", title: "Melhor UF", availability: "available_now" },
      { id: "kpi_best_origin", title: "Melhor origem", availability: "available_now" },
      { id: "kpi_highest_discount", title: "Maior desconto concedido", availability: "available_now" },
      { id: "kpi_avg_discount", title: "Desconto mÃ©dio", availability: "available_now" },
      { id: "kpi_avg_markup", title: "Markup mÃ©dio", availability: "available_now" },
      { id: "kpi_avg_freight", title: "Frete mÃ©dio", availability: "available_now" },
      { id: "kpi_most_quoted_product", title: "Produto mais orÃ§ado", availability: "available_now" },
      { id: "kpi_highest_potential_customer", title: "Cliente com maior potencial", availability: "available_now" },
      { id: "kpi_seller_highest_growth", title: "Vendedor com maior crescimento", availability: "available_now" },
      { id: "kpi_seller_highest_drop", title: "Vendedor com maior queda", availability: "available_now" },
      { id: "kpi_product_highest_growth", title: "Produto com maior crescimento", availability: "available_now" },
      { id: "kpi_product_highest_drop", title: "Produto com maior queda", availability: "available_now" },
      { id: "kpi_channel_highest_conversion", title: "Canal com maior conversÃ£o", availability: "available_now" },
      { id: "kpi_channel_lowest_conversion", title: "Canal com menor conversÃ£o", availability: "available_now" },
    ],
  },
  {
    id: "velocity",
    name: "Velocidade de vendas",
    description: "Ciclo mÃ©dio de vendas, gargalos de status e aceleraÃ§Ã£o de conversÃ£o.",
    plannedCount: 5,
    availableNowCount: 4,
    needsNewViewCount: 1,
    highlights: [
      { id: "velocity_avg_cycle_time", title: "Tempo mÃ©dio do ciclo de vendas", availability: "available_now" },
      { id: "velocity_by_seller", title: "Velocidade de conversÃ£o por vendedor", availability: "available_now" },
      { id: "velocity_by_product", title: "Velocidade por produto", availability: "available_now" },
      { id: "velocity_conversion_acceleration", title: "AceleraÃ§Ã£o de conversÃ£o", availability: "available_now" },
      { id: "velocity_status_bottleneck_time", title: "Tempo mÃ©dio de permanÃªncia em status", availability: "needs_new_view" },
    ],
  },
  {
    id: "risk",
    name: "ConcentraÃ§Ã£o de Risco",
    description: "DependÃªncia de top clientes, produtos, vendedores e dependÃªncia de desconto.",
    plannedCount: 5,
    availableNowCount: 5,
    needsNewViewCount: 0,
    highlights: [
      { id: "risk_customer_concentration", title: "ConcentraÃ§Ã£o nos Top Clientes", availability: "available_now" },
      { id: "risk_product_dependence", title: "DependÃªncia de produtos", availability: "available_now" },
      { id: "risk_seller_concentration", title: "ConcentraÃ§Ã£o em vendedores", availability: "available_now" },
      { id: "risk_geo_concentration", title: "ConcentraÃ§Ã£o de risco por regiÃ£o", availability: "available_now" },
      { id: "risk_high_discount_volume", title: "Vendas dependentes de altos descontos", availability: "available_now" },
    ],
  },
  {
    id: "efficiency",
    name: "EficiÃªncia Operacional",
    description: "Taxa de ganho vs tempo, abandono e volume orÃ§ado vs fechado.",
    plannedCount: 4,
    availableNowCount: 4,
    needsNewViewCount: 0,
    highlights: [
      { id: "efficiency_win_rate_vs_time", title: "Taxa de ganho vs Idade do orÃ§amento", availability: "available_now" },
      { id: "efficiency_quote_to_close_ratio", title: "Volume orÃ§ado vs Volume fechado", availability: "available_now" },
      { id: "efficiency_abandonment_rate", title: "Taxa de abandono", availability: "available_now" },
      { id: "efficiency_avg_items_per_ticket", title: "EficiÃªncia de Mix", availability: "available_now" },
    ],
  },
  {
    id: "predictive",
    name: "AnÃ¡lise Preditiva Simples",
    description: "PrevisÃ£o de fechamento baseada em funil, sazonalidade e risco de inatividade.",
    plannedCount: 4,
    availableNowCount: 4,
    needsNewViewCount: 0,
    highlights: [
      { id: "predictive_sales_forecast", title: "PrevisÃ£o de fechamento (Funil Atual)", availability: "available_now" },
      { id: "predictive_churn_risk", title: "Risco de Churn (Inatividade)", availability: "available_now" },
      { id: "predictive_seasonal_trend", title: "TendÃªncia Sazonal", availability: "available_now" },
      { id: "predictive_high_probability_deals", title: "OrÃ§amentos com alta probabilidade", availability: "available_now" },
    ],
  },
];

export const salesBudgetCatalog: SalesBudgetCategoryPreview[] =
  applySalesBudgetCatalogColors(salesBudgetCatalogBase);

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

