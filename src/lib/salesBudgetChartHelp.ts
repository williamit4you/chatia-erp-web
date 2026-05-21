import {
  getSalesBudgetChartDefinition,
  getSalesBudgetChartHelpMarkdown,
} from "@/lib/salesBudgetChartDefinitions";

export function getSalesBudgetChartObjective(params: {
  chartId: string;
  title: string;
  categoryName?: string | null;
}): string {
  const chartId = params.chartId ?? "";
  const title = params.title ?? chartId;

  const def = getSalesBudgetChartDefinition(chartId);
  if (def) {
    const bullets = (label: string, items: string[]) =>
      items.length
        ? [`**${label}:**`, ...items.map((i) => `- ${i}`)].join("\n")
        : "";

    return [
      `**Objetivo:** ${def.help.objective}`,
      "",
      bullets("Como interpretar", def.help.howToRead),
      "",
      bullets("Cuidados", def.help.cautions),
    ]
      .filter((p) => p.trim().length > 0)
      .join("\n");
  }

  const normalizedTitle = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const has = (needle: string) =>
    chartId.includes(needle) || normalizedTitle.includes(needle);

  const dimension = (() => {
    if (has("por uf") || has("by_uf") || has("_uf")) return "UF";
    if (has("cidade") || has("by_city") || has("_city")) return "cidade";
    if (has("regiao") || has("region")) return "região";
    if (has("origem") || has("source")) return "origem";
    if (has("vendedor") || has("seller")) return "vendedor";
    if (has("cliente") || has("customer")) return "cliente";
    if (has("produto") || has("product")) return "produto";
    if (has("status")) return "status";
    if (
      has("periodo") ||
      has("period") ||
      has("mensal") ||
      has("semanal") ||
      has("diar")
    )
      return "período";
    return "dimensão";
  })();

  const metric = (() => {
    if (has("convers") || has("conversion")) return "taxa de conversão";
    if (has("ticket") || has("avg_ticket")) return "ticket médio";
    if (has("quantidade") || has("count")) return "quantidade";
    if (has("valor") || has("amount") || has("revenue")) return "valor total";
    if (has("desconto") || has("discount")) return "desconto médio";
    if (has("markup") || has("margem")) return "markup/margem média";
    if (has("frete") || has("freight")) return "frete";
    return "métrica";
  })();

  const visualizationHint = (() => {
    if (has("mapa") || has("heatmap") || has("calor"))
      return "Em modo **Mapa**, a cor mais forte indica maior valor relativo no período.";
    if (has("ranking") || has("top"))
      return "O ranking ordena do maior para o menor.";
    return "";
  })();

  const category = params.categoryName ? ` (${params.categoryName})` : "";

  return [
    `**Objetivo:** mostrar **${metric}** por **${dimension}**${category}, considerando o período filtrado.`,
    "",
    `**Como ler:** compare os itens para identificar concentração, destaque e distribuição.`,
    visualizationHint,
  ]
    .filter(Boolean)
    .join("\n");
}

export function getSalesBudgetAutoHelpPrompt(params: {
  chartId: string;
  title: string;
}): string {
  const chartId = params.chartId ?? "";
  const title = params.title ?? params.chartId;

  const def = getSalesBudgetChartDefinition(chartId);
  const registryHelp = getSalesBudgetChartHelpMarkdown({
    chartId,
    titleFallback: title,
  });

  const viewHint =
    def?.secondaryVisualizations?.length
      ? `Visualizações disponíveis (na UI): ${[
          def.primaryVisualization,
          ...(def.secondaryVisualizations ?? []),
        ].join(", ")}`
      : "";

  return [
    `Explique de forma objetiva o gráfico **${title}** com base nos dados do período.`,
    "",
    "Quero:",
    "- Objetivo do gráfico (1 frase)",
    "- Como interpretar (3 bullets)",
    "- 2 insights comuns que ele revela",
    "- 2 cuidados/armadilhas na leitura",
    "",
    registryHelp ? "Contexto (help do produto):" : "",
    registryHelp ? registryHelp : "",
    "",
    viewHint,
    "",
    "Se a visualização atual não for a melhor para o objetivo, sugira uma alternativa (ex.: ranking, mapa, tabela).",
  ]
    .filter((line) => line.trim().length > 0)
    .join("\n");
}
