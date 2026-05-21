export type SalesBudgetChartMetric =
  | "amount"
  | "count"
  | "avg_ticket"
  | "conversion"
  | "discount"
  | "markup"
  | "freight"
  | "share"
  | "status"
  | "text";

export type SalesBudgetChartDimension =
  | "period"
  | "status"
  | "seller"
  | "customer"
  | "product"
  | "origin"
  | "uf"
  | "city"
  | "region"
  | "payment"
  | "freight_type"
  | "company";

export type SalesBudgetChartGrain =
  | "budget"
  | "budget_item"
  | "budget_status"
  | "derived";

export type SalesBudgetChartVisualization =
  | "kpi"
  | "bar"
  | "horizontal_bar"
  | "line"
  | "area"
  | "combo"
  | "pie"
  | "ranking"
  | "table"
  | "heatmap"
  | "map"
  | "funnel"
  | "scatter";

export type SalesBudgetChartHelp = {
  objective: string;
  calculation: string[];
  howToRead: string[];
  cautions: string[];
  bestVisualization?: string;
  alternativeViews?: string[];
};

export type SalesBudgetChartDefinition = {
  chartId: string;
  groupId?: string;
  categoryId: string;
  title: string;
  question: string;
  metric: SalesBudgetChartMetric;
  dimension: SalesBudgetChartDimension;
  grain: SalesBudgetChartGrain;
  primaryVisualization: SalesBudgetChartVisualization;
  secondaryVisualizations?: SalesBudgetChartVisualization[];
  help: SalesBudgetChartHelp;
};

const GEO_UF_COMMON_CAUTION = [
  "O mapa usa escala relativa (cor mais forte = maior valor relativo no periodo).",
  "Estados com 0 podem aparecer claros; use a lista/ranking para confirmar numeros.",
] as const;

const GEO_CONVERSION_CAUTION = [
  "Conversao pode ser aproximada dependendo do mapeamento de STATUS (aberto/aprovado/perdido).",
  "Compare periodos equivalentes antes de concluir tendencia.",
] as const;

const GEO_LABEL_CAUTION = [
  "Alguns graficos usam labels compostas (ex.: 'UF / Produto' ou 'Origem / UF'); use a tabela/ranking para ver o texto completo.",
  "O dashboard pode limitar a exibicao aos Top N itens; use a exportacao para ver a lista completa.",
] as const;

const PERCENT_NORMALIZATION_CAUTION = [
  "Percentuais podem vir em base 0-1 ou 0-100; confirme a escala antes de comparar.",
] as const;

const definitions: Record<string, SalesBudgetChartDefinition> = {
  geo_amount_by_uf: {
    chartId: "geo_amount_by_uf",
    groupId: "geo_by_uf",
    categoryId: "geo",
    title: "Valor total por UF",
    question: "Em quais estados o valor orcado esta mais concentrado no periodo?",
    metric: "amount",
    dimension: "uf",
    grain: "budget",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["map", "heatmap", "table"],
    help: {
      objective: "Mostrar o valor total de orcamentos por UF no periodo filtrado.",
      calculation: [
        "Normaliza a localizacao do orcamento para UF.",
        "Soma o valor total dos orcamentos por UF.",
        "Ordena do maior para o menor quando exibido em ranking.",
      ],
      howToRead: [
        "Use para identificar concentracao geografica de valor orcado.",
        "No modo Mapa, a cor mais forte indica maior valor relativo no periodo.",
        "Se precisar do numero exato, use a lista/ranking.",
      ],
      cautions: [...GEO_UF_COMMON_CAUTION],
      bestVisualization:
        "Ranking e mais rapido para comparar valores; mapa complementa para distribuicao espacial.",
      alternativeViews: [
        "Mapa: distribuicao espacial.",
        "Tabela: nomes/valores completos quando labels forem longas.",
      ],
    },
  },

  geo_count_by_uf: {
    chartId: "geo_count_by_uf",
    groupId: "geo_by_uf",
    categoryId: "geo",
    title: "Quantidade de orcamentos por UF",
    question: "Quais UFs geram mais volume de orcamentos no periodo?",
    metric: "count",
    dimension: "uf",
    grain: "budget",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["map", "heatmap", "table"],
    help: {
      objective: "Mostrar a quantidade de orcamentos por UF no periodo filtrado.",
      calculation: [
        "Normaliza a localizacao do orcamento para UF.",
        "Conta orcamentos por UF (volume).",
        "Ordena do maior para o menor quando exibido em ranking.",
      ],
      howToRead: [
        "Use para entender distribuicao de volume por estado.",
        "Compare com 'Valor total por UF' para ver onde ha volume vs valor.",
        "No modo Mapa, a cor mais forte indica maior volume relativo no periodo.",
      ],
      cautions: [...GEO_UF_COMMON_CAUTION],
      bestVisualization:
        "Ranking facilita comparar volume; mapa ajuda a enxergar distribuicao espacial.",
    },
  },

  geo_avg_ticket_by_uf: {
    chartId: "geo_avg_ticket_by_uf",
    groupId: "geo_by_uf",
    categoryId: "geo",
    title: "Ticket medio por UF",
    question: "Quais UFs tem orcamentos com ticket medio mais alto?",
    metric: "avg_ticket",
    dimension: "uf",
    grain: "derived",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["map", "table"],
    help: {
      objective: "Mostrar o ticket medio (valor total / quantidade) por UF no periodo filtrado.",
      calculation: [
        "Calcula o valor total por UF.",
        "Calcula a quantidade de orcamentos por UF.",
        "Divide valor total por quantidade para obter ticket medio por UF.",
      ],
      howToRead: [
        "Use para identificar estados com maior valor medio por orcamento.",
        "Cruze com quantidade para evitar conclusoes com base em amostras pequenas.",
        "No modo Mapa, a cor mais forte indica maior ticket medio relativo no periodo.",
      ],
      cautions: [
        ...GEO_UF_COMMON_CAUTION,
        "Tickets altos com pouca quantidade podem ser outliers; valide o volume.",
      ],
      bestVisualization:
        "Ranking evidencia diferencas de ticket; mapa e bom para padrao regional.",
    },
  },

  geo_conversion_by_uf: {
    chartId: "geo_conversion_by_uf",
    groupId: "geo_by_uf",
    categoryId: "geo",
    title: "Conversao por UF",
    question: "Quais UFs tem melhor desempenho de conversao no funil atual?",
    metric: "conversion",
    dimension: "uf",
    grain: "derived",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["map", "table"],
    help: {
      objective: "Mostrar a taxa de conversao por UF no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por UF.",
        "Calcula a taxa de conversao com base no STATUS atual (aberto/aprovado/perdido).",
      ],
      howToRead: [
        "Use para comparar desempenho do funil por estado.",
        "No modo Mapa, a cor mais forte indica maior conversao relativa no periodo.",
        "Combine com quantidade para evitar conclusoes com base em poucos casos.",
      ],
      cautions: [...GEO_UF_COMMON_CAUTION, ...GEO_CONVERSION_CAUTION],
      bestVisualization:
        "Ranking facilita comparar taxas; mapa ajuda a detectar padroes regionais.",
    },
  },

  geo_state_heatmap: {
    chartId: "geo_state_heatmap",
    groupId: "geo_by_uf",
    categoryId: "geo",
    title: "Mapa de calor por estado",
    question: "Onde existe concentracao geografrica (por UF) no periodo?",
    metric: "amount",
    dimension: "uf",
    grain: "budget",
    primaryVisualization: "heatmap",
    secondaryVisualizations: ["map", "ranking", "table"],
    help: {
      objective: "Mostrar concentracao por UF, destacando estados com maior valor relativo.",
      calculation: [
        "Soma os valores por UF.",
        "Normaliza pela maior UF para definir intensidade de cor (heat).",
      ],
      howToRead: [
        "Use para ver rapidamente quais UFs dominam a distribuicao.",
        "Troque para Mapa para perceber continuidade espacial.",
        "Troque para Ranking para confirmar numeros exatos.",
      ],
      cautions: [...GEO_UF_COMMON_CAUTION],
    },
  },

  customer_by_uf: {
    chartId: "customer_by_uf",
    groupId: "geo_by_uf",
    categoryId: "customer",
    title: "Clientes por UF",
    question: "Em quais UFs ha mais clientes distintos atendidos no periodo?",
    metric: "count",
    dimension: "uf",
    grain: "derived",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["map", "table"],
    help: {
      objective: "Mostrar clientes distintos por UF no periodo filtrado.",
      calculation: [
        "Normaliza a UF do cliente/orcamento.",
        "Conta clientes distintos por UF (deduplicado).",
      ],
      howToRead: [
        "Use para identificar presenca comercial por estado (base de clientes).",
        "Compare com valor/quantidade para entender se ha base grande mas baixo valor, ou vice-versa.",
      ],
      cautions: [
        ...GEO_UF_COMMON_CAUTION,
        "Se a UF vier do endereco do cliente, mudancas de cadastro podem afetar o historico.",
      ],
    },
  },

  product_by_geo: {
    chartId: "product_by_geo",
    groupId: "geo_mix",
    categoryId: "product",
    title: "Produtos por cidade/UF",
    question: "Quais produtos mais aparecem em orcamentos, por localidade, no periodo?",
    metric: "amount",
    dimension: "product",
    grain: "budget_item",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["map", "table"],
    help: {
      objective: "Mostrar a distribuicao de produtos por cidade/UF no periodo filtrado.",
      calculation: [
        "Normaliza a localizacao do orcamento para UF/cidade.",
        "Agrupa itens por 'UF/cidade + produto'.",
        "Soma (ou conta) os itens conforme a metrica do grafico.",
      ],
      howToRead: [
        "Use para identificar quais linhas/produtos puxam demanda em cada UF.",
        "No modo Mapa, a cor indica onde existe maior concentracao (agregada por UF).",
        "Use a tabela quando os nomes de produto forem longos.",
      ],
      cautions: [...GEO_UF_COMMON_CAUTION, ...GEO_LABEL_CAUTION],
      bestVisualization:
        "Ranking e melhor para comparar produtos; mapa complementa com distribuicao por UF.",
    },
  },

  source_by_geo: {
    chartId: "source_by_geo",
    groupId: "geo_mix",
    categoryId: "source",
    title: "Origem x cidade/UF",
    question: "Quais origens (campanhas/canais) geram orcamentos em cada UF/cidade?",
    metric: "count",
    dimension: "origin",
    grain: "budget",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["map", "table"],
    help: {
      objective: "Mostrar a distribuicao de origem/canal por cidade/UF no periodo filtrado.",
      calculation: [
        "Normaliza a localizacao do orcamento para UF/cidade.",
        "Agrupa por 'UF/cidade + origem'.",
        "Conta orcamentos (ou soma valor, dependendo do dataset) para cada grupo.",
      ],
      howToRead: [
        "Use para entender quais canais funcionam melhor em cada regiao/UF.",
        "No modo Mapa, a cor indica concentracao por UF (agregada).",
        "Cruze com conversao/valor para separar volume de qualidade.",
      ],
      cautions: [
        ...GEO_UF_COMMON_CAUTION,
        ...GEO_LABEL_CAUTION,
        "Origens 'Nenhum/Indefinido' podem indicar falta de preenchimento ou integracao.",
      ],
      bestVisualization:
        "Ranking/tabela sao melhores para ler 'origem x UF'; mapa e apenas um resumo por UF.",
    },
  },

  geo_origin_by_region: {
    chartId: "geo_origin_by_region",
    groupId: "geo_mix",
    categoryId: "geo",
    title: "Origem por regiao",
    question: "Quais origens se destacam por UF/regiao no periodo?",
    metric: "count",
    dimension: "origin",
    grain: "budget",
    primaryVisualization: "bar",
    secondaryVisualizations: ["ranking", "map", "table"],
    help: {
      objective: "Comparar origem/canal por UF (ou recorte regional) no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por UF e origem (quando a label vier composta).",
        "Conta orcamentos por combinacao.",
      ],
      howToRead: [
        "Use para encontrar canais dominantes em determinadas UFs.",
        "Troque para Ranking/Tabela para ver o texto completo das combinacoes.",
        "No modo Mapa, a cor resume o total por UF (agregado).",
      ],
      cautions: [...GEO_UF_COMMON_CAUTION, ...GEO_LABEL_CAUTION],
    },
  },

  geo_highest_avg_discount_regions: {
    chartId: "geo_highest_avg_discount_regions",
    groupId: "geo_pricing",
    categoryId: "geo",
    title: "Regioes com maior desconto medio",
    question: "Em quais UFs o desconto medio esta mais alto no periodo?",
    metric: "discount",
    dimension: "uf",
    grain: "derived",
    primaryVisualization: "bar",
    secondaryVisualizations: ["ranking", "map", "table"],
    help: {
      objective: "Mostrar onde o desconto medio esta mais alto, por UF, no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por UF.",
        "Calcula desconto medio por UF (media ponderada, quando aplicavel).",
      ],
      howToRead: [
        "Use para detectar pressao comercial (desconto alto) em determinadas UFs.",
        "Combine com conversao e quantidade para entender se o desconto esta 'comprando' resultado.",
        "No modo Mapa, a cor mais forte indica maior desconto medio relativo no periodo.",
      ],
      cautions: [
        ...GEO_UF_COMMON_CAUTION,
        ...PERCENT_NORMALIZATION_CAUTION,
        "Desconto medio pode ser distorcido por poucos orcamentos grandes; valide o volume.",
      ],
    },
  },

  geo_highest_markup_regions: {
    chartId: "geo_highest_markup_regions",
    groupId: "geo_pricing",
    categoryId: "geo",
    title: "Regioes com maior markup",
    question: "Em quais UFs o markup/margem media esta mais alto no periodo?",
    metric: "markup",
    dimension: "uf",
    grain: "derived",
    primaryVisualization: "bar",
    secondaryVisualizations: ["ranking", "map", "table"],
    help: {
      objective: "Mostrar onde o markup/margem media esta mais alto, por UF, no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por UF.",
        "Calcula markup/margem media por UF (conforme definicao do dataset).",
      ],
      howToRead: [
        "Use para identificar UFs com melhor rentabilidade media.",
        "Compare com desconto para entender estrategia de preco por regiao.",
        "No modo Mapa, a cor mais forte indica maior markup relativo no periodo.",
      ],
      cautions: [...GEO_UF_COMMON_CAUTION, ...PERCENT_NORMALIZATION_CAUTION],
    },
  },

  geo_growth_opportunity_regions: {
    chartId: "geo_growth_opportunity_regions",
    groupId: "geo_pricing",
    categoryId: "geo",
    title: "Regioes com maior oportunidade de crescimento",
    question: "Quais UFs parecem ter maior potencial de crescimento no periodo?",
    metric: "share",
    dimension: "uf",
    grain: "derived",
    primaryVisualization: "bar",
    secondaryVisualizations: ["ranking", "map", "table"],
    help: {
      objective: "Destacar UFs com maior oportunidade de crescimento com base no indicador do dataset.",
      calculation: [
        "Calcula um indicador derivado por UF (ex.: participacao, gap, ou score de oportunidade).",
        "Ordena do maior para o menor na visualizacao de ranking.",
      ],
      howToRead: [
        "Use para priorizar UFs para campanhas, time comercial ou expansao.",
        "Valide a definicao do indicador (score) antes de decidir investimento.",
        "No modo Mapa, a cor mais forte indica maior oportunidade relativa no periodo.",
      ],
      cautions: [
        ...GEO_UF_COMMON_CAUTION,
        "Scores de oportunidade dependem da formula; use o help do grafico para entender o calculo.",
      ],
    },
  },
};

export function getSalesBudgetChartDefinition(
  chartId: string
): SalesBudgetChartDefinition | null {
  return definitions[chartId] ?? null;
}

export function getSalesBudgetChartHelpMarkdown(params: {
  chartId: string;
  titleFallback?: string;
}): string | null {
  const def = getSalesBudgetChartDefinition(params.chartId);
  if (!def) return null;

  const title = def.title || params.titleFallback || def.chartId;

  const section = (label: string, lines: string[]) =>
    lines.length ? [`**${label}:**`, ...lines.map((l) => `- ${l}`)].join("\n") : "";

  const parts = [
    `**${title}**`,
    "",
    `**Objetivo:** ${def.help.objective}`,
    "",
    section("Como e calculado", def.help.calculation),
    "",
    section("Como interpretar", def.help.howToRead),
    "",
    section("Cuidados", def.help.cautions),
  ]
    .filter((p) => p.trim().length > 0)
    .join("\n");

  return parts;
}

export function getSalesBudgetChartObjectiveSummary(params: {
  chartId: string;
  titleFallback?: string;
}): string | null {
  const def = getSalesBudgetChartDefinition(params.chartId);
  if (!def) return null;
  const title = def.title || params.titleFallback || def.chartId;
  return `**Objetivo (${title}):** ${def.help.objective}`;
}
