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

  overview_total_amount_period: {
    chartId: "overview_total_amount_period",
    groupId: "overview_period_totals",
    categoryId: "overview",
    title: "Valor total de orcamentos por periodo",
    question: "Como o valor total orcado evolui ao longo do periodo filtrado?",
    metric: "amount",
    dimension: "period",
    grain: "budget",
    primaryVisualization: "line",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Mostrar a evolucao do valor total de orcamentos ao longo do periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por faixa de tempo (dia/semana/mes) conforme o dataset.",
        "Soma o valor total de orcamentos em cada faixa.",
      ],
      howToRead: [
        "Use para identificar tendencia (alta/queda) e sazonalidade.",
        "Picos indicam dias/semanas com concentracao de valor orcado.",
        "Compare com 'Quantidade por periodo' para separar volume vs valor.",
      ],
      cautions: [
        "Mudancas de campanha/feriados podem causar picos pontuais; compare periodos equivalentes.",
        "Valores muito altos podem vir de poucos orcamentos grandes (outliers).",
      ],
    },
  },

  overview_total_count_period: {
    chartId: "overview_total_count_period",
    groupId: "overview_period_totals",
    categoryId: "overview",
    title: "Quantidade de orcamentos por periodo",
    question: "Como o volume de orcamentos evolui ao longo do periodo filtrado?",
    metric: "count",
    dimension: "period",
    grain: "budget",
    primaryVisualization: "line",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Mostrar a evolucao da quantidade de orcamentos ao longo do periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por faixa de tempo (dia/semana/mes) conforme o dataset.",
        "Conta orcamentos em cada faixa de tempo.",
      ],
      howToRead: [
        "Use para ver volume e identificar semanas/dias mais fortes.",
        "Compare com valor total para entender se o volume esta trazendo valor.",
        "Quedas persistentes sinalizam perda de demanda ou problema no canal de entrada.",
      ],
      cautions: [
        "Mudancas no horario de captura/integrações podem alterar o volume reportado.",
        "Considere o tamanho do periodo: janelas curtas variam mais.",
      ],
    },
  },

  overview_avg_ticket: {
    chartId: "overview_avg_ticket",
    groupId: "overview_period_totals",
    categoryId: "overview",
    title: "Ticket medio dos orcamentos",
    question: "O valor medio por orcamento esta subindo ou caindo no periodo?",
    metric: "avg_ticket",
    dimension: "period",
    grain: "derived",
    primaryVisualization: "kpi",
    secondaryVisualizations: ["line", "table"],
    help: {
      objective: "Mostrar o ticket medio (valor total / quantidade) dos orcamentos no periodo filtrado.",
      calculation: [
        "Calcula o valor total de orcamentos no periodo.",
        "Calcula a quantidade de orcamentos no periodo.",
        "Divide valor total por quantidade para obter o ticket medio.",
      ],
      howToRead: [
        "Use para entender se os orcamentos estao ficando maiores ou menores.",
        "Combine com conversao para ver se ticket mais alto afeta fechamento.",
        "Se o ticket subir e o volume cair, pode haver mudanca de mix.",
      ],
      cautions: [
        "Tickets podem ser distorcidos por poucos orcamentos grandes (outliers).",
        "Compare periodos equivalentes para conclusoes de tendencia.",
      ],
    },
  },

  overview_amount_by_company: {
    chartId: "overview_amount_by_company",
    categoryId: "overview",
    title: "Valor total por empresa/filial",
    question: "Qual empresa/filial concentra mais valor orcado no periodo?",
    metric: "amount",
    dimension: "company",
    grain: "budget",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Comparar o valor total de orcamentos por empresa/filial no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por empresa/filial.",
        "Soma o valor total por empresa/filial.",
      ],
      howToRead: [
        "Use para identificar concentracao de receita potencial por filial.",
        "Diferenças grandes podem indicar distribuicao desigual de leads/time.",
        "Cruze com conversao para separar volume de qualidade.",
      ],
      cautions: [
        "Empresas com pouca amostra podem variar mais; valide quantidade.",
        "Mudancas de cadastro podem mover orcamentos entre filiais.",
      ],
    },
  },

  overview_count_by_company: {
    chartId: "overview_count_by_company",
    categoryId: "overview",
    title: "Quantidade de orcamentos por empresa/filial",
    question: "Qual empresa/filial gera mais volume de orcamentos no periodo?",
    metric: "count",
    dimension: "company",
    grain: "budget",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Comparar o volume (quantidade) de orcamentos por empresa/filial no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por empresa/filial.",
        "Conta orcamentos por empresa/filial.",
      ],
      howToRead: [
        "Use para entender distribuicao de demanda por filial.",
        "Compare com valor total por filial para ver onde ha volume vs valor.",
      ],
      cautions: [
        "Volatilidade aumenta em periodos curtos; compare janelas equivalentes.",
        "Considere orcamentos duplicados/retrabalhos dependendo do processo.",
      ],
    },
  },

  overview_monthly_evolution: {
    chartId: "overview_monthly_evolution",
    categoryId: "overview",
    title: "Evolucao mensal de orcamentos",
    question: "Como o volume de orcamentos se comporta mes a mes?",
    metric: "count",
    dimension: "period",
    grain: "budget",
    primaryVisualization: "line",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Mostrar a evolucao mensal da quantidade de orcamentos no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por mes.",
        "Conta orcamentos em cada mes.",
      ],
      howToRead: [
        "Use para enxergar sazonalidade mensal e tendencia de medio prazo.",
        "Picos sugerem campanhas/periodos fortes; vales sugerem baixa demanda.",
      ],
      cautions: [
        "Meses incompletos (inicio/fim do filtro) podem subestimar valores.",
        "Compare sempre com o mesmo mes do ano anterior quando possivel.",
      ],
    },
  },

  overview_weekly_evolution: {
    chartId: "overview_weekly_evolution",
    categoryId: "overview",
    title: "Evolucao semanal de orcamentos",
    question: "Como o volume de orcamentos varia semana a semana?",
    metric: "count",
    dimension: "period",
    grain: "budget",
    primaryVisualization: "line",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Mostrar a evolucao semanal da quantidade de orcamentos no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por semana.",
        "Conta orcamentos em cada semana.",
      ],
      howToRead: [
        "Use para acompanhar variacao de curto/medio prazo e efeito de campanhas.",
        "Quedas consecutivas podem indicar problema de canal ou time comercial.",
      ],
      cautions: [
        "Semanas com feriados tendem a ter volume menor; compare com semanas equivalentes.",
        "Periodos curtos podem aumentar ruido; use janelas maiores quando necessario.",
      ],
    },
  },

  overview_daily_evolution: {
    chartId: "overview_daily_evolution",
    categoryId: "overview",
    title: "Evolucao diaria de orcamentos",
    question: "Como o volume de orcamentos varia dia a dia?",
    metric: "count",
    dimension: "period",
    grain: "budget",
    primaryVisualization: "line",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Mostrar a evolucao diaria da quantidade de orcamentos no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por dia.",
        "Conta orcamentos em cada dia.",
      ],
      howToRead: [
        "Use para detectar picos e quedas diarias (acoes pontuais, campanhas, instabilidades).",
        "A variacao diaria costuma ser alta; observe tendencias com medias/semana.",
      ],
      cautions: [
        "Instabilidades de sistema/integracao podem reduzir captacao em dias especificos.",
        "Dias incompletos (hoje) podem subestimar volume.",
      ],
    },
  },

  overview_current_vs_previous_month: {
    chartId: "overview_current_vs_previous_month",
    groupId: "overview_comparisons",
    categoryId: "overview",
    title: "Comparativo mes atual x mes anterior",
    question: "Como o desempenho do mes atual compara com o mes anterior?",
    metric: "amount",
    dimension: "period",
    grain: "derived",
    primaryVisualization: "kpi",
    secondaryVisualizations: ["table"],
    help: {
      objective: "Comparar os principais indicadores do mes atual contra o mes anterior.",
      calculation: [
        "Calcula indicadores do mes atual (valor, quantidade, ticket, conversao).",
        "Calcula os mesmos indicadores para o mes anterior.",
        "Exibe variacao (delta) entre os dois periodos.",
      ],
      howToRead: [
        "Use para acompanhar ganho/perda recente de performance.",
        "Variacoes grandes pedem investigacao por canal, vendedor, UF ou produto.",
      ],
      cautions: [
        "Se o mes atual estiver incompleto, a comparacao pode ser enviesada.",
        "Compare janelas equivalentes (ex.: ate o dia X) quando necessario.",
      ],
    },
  },

  overview_current_year_vs_previous_year: {
    chartId: "overview_current_year_vs_previous_year",
    groupId: "overview_comparisons",
    categoryId: "overview",
    title: "Comparativo ano atual x ano anterior",
    question: "Como o desempenho do ano atual compara com o ano anterior?",
    metric: "amount",
    dimension: "period",
    grain: "derived",
    primaryVisualization: "kpi",
    secondaryVisualizations: ["table"],
    help: {
      objective: "Comparar os principais indicadores do ano atual contra o ano anterior.",
      calculation: [
        "Calcula indicadores do ano atual (valor, quantidade, ticket, conversao).",
        "Calcula os mesmos indicadores para o ano anterior.",
        "Exibe variacao (delta) entre os dois anos.",
      ],
      howToRead: [
        "Use para avaliar crescimento/queda anual e efeito de estrategia.",
        "Quebre por UF/produto/origem para explicar diferencas.",
      ],
      cautions: [
        "Se o ano atual estiver incompleto, compare YTD (ano ate a data).",
        "Mudancas de mix (produto/canal) podem alterar ticket e conversao.",
      ],
    },
  },

  overview_top_days_by_volume: {
    chartId: "overview_top_days_by_volume",
    categoryId: "overview",
    title: "Top dias com maior volume de orcamentos",
    question: "Quais dias tiveram maior volume de orcamentos no periodo?",
    metric: "count",
    dimension: "period",
    grain: "budget",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Listar os dias com maior quantidade de orcamentos no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por dia.",
        "Conta orcamentos por dia e ordena do maior para o menor.",
      ],
      howToRead: [
        "Use para identificar dias fora da curva (campanhas, eventos, instabilidade).",
        "Compare com origem/canal para explicar os picos.",
      ],
      cautions: [
        "Dias com campanhas pontuais podem dominar o ranking.",
        "Dias incompletos podem subestimar volume.",
      ],
    },
  },

  overview_top_months_by_amount: {
    chartId: "overview_top_months_by_amount",
    categoryId: "overview",
    title: "Top meses com maior valor orcado",
    question: "Quais meses concentraram maior valor total orcado no periodo?",
    metric: "amount",
    dimension: "period",
    grain: "budget",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Listar os meses com maior valor total orcado no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por mes.",
        "Soma o valor total por mes e ordena do maior para o menor.",
      ],
      howToRead: [
        "Use para identificar meses fortes e sazonalidade por valor.",
        "Combine com quantidade para ver se o valor vem de volume ou ticket.",
      ],
      cautions: [
        "Meses incompletos (inicio/fim do filtro) podem subestimar valores.",
        "Outliers (orcamentos grandes) podem inflar um mes especifico.",
      ],
    },
  },

  overview_month_seasonality: {
    chartId: "overview_month_seasonality",
    categoryId: "overview",
    title: "Sazonalidade por mês",
    question: "Existe padrão de sazonalidade por mês no volume de orçamentos?",
    metric: "count",
    dimension: "period",
    grain: "budget",
    primaryVisualization: "bar",
    secondaryVisualizations: ["table"],
    help: {
      objective: "Mostrar a distribuição de orçamentos por mês para identificar sazonalidade.",
      calculation: [
        "Agrupa orçamentos por mês do ano.",
        "Conta orçamentos por mês (agregado).",
      ],
      howToRead: [
        "Use para planejar campanhas e capacidade (meses historicamente fortes/fracos).",
        "Cruze com valor e conversão para entender a qualidade do volume.",
      ],
      cautions: [
        "Sazonalidade depende do histórico; períodos curtos podem enganar.",
        "Mudanças de estratégia/canal mudam o padrão ao longo do tempo.",
      ],
    },
  },

  overview_weekday_heatmap: {
    chartId: "overview_weekday_heatmap",
    categoryId: "overview",
    title: "Mapa de calor por dia da semana",
    question: "Quais dias da semana concentram mais orcamentos?",
    metric: "count",
    dimension: "period",
    grain: "budget",
    primaryVisualization: "heatmap",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Mostrar concentracao de orcamentos por dia da semana (heatmap).",
      calculation: [
        "Extrai o dia da semana a partir da data do orcamento.",
        "Conta orcamentos por dia da semana e converte em intensidade de cor.",
      ],
      howToRead: [
        "Use para ver rapidamente quais dias performam melhor.",
        "A cor mais forte indica maior volume relativo.",
      ],
      cautions: [
        "Feriados e sazonalidade podem distorcer semanas especificas.",
        "Pode haver diferenca de volume entre canais (ex.: online vs presencial).",
      ],
    },
  },

  overview_month_year_heatmap: {
    chartId: "overview_month_year_heatmap",
    categoryId: "overview",
    title: "Mapa de calor por mes e ano",
    question: "Como o volume varia por mes ao longo dos anos (sazonalidade)?",
    metric: "count",
    dimension: "period",
    grain: "budget",
    primaryVisualization: "heatmap",
    secondaryVisualizations: ["line", "table"],
    help: {
      objective: "Mostrar volume por mes/ano em formato de heatmap para enxergar sazonalidade e tendencia.",
      calculation: [
        "Agrupa orcamentos por mes e ano.",
        "Conta orcamentos por combinacao e converte em intensidade de cor.",
      ],
      howToRead: [
        "Use para identificar meses recorrentes de alta/baixa ao longo dos anos.",
        "A cor mais forte indica maior volume relativo naquela celula (mes/ano).",
      ],
      cautions: [
        "Meses incompletos (periodo atual) podem aparecer mais fracos.",
        "Mudancas de mix/canal podem mudar o padrao entre anos.",
      ],
    },
  },

  funnel_by_status: {
    chartId: "funnel_by_status",
    groupId: "funnel_by_status_family",
    categoryId: "funnel",
    title: "Distribuicao por status do orcamento",
    question: "Como os orcamentos se distribuem entre Projeto, Aberto, Parcial, Fechado, Pedido e Perdeu?",
    metric: "count",
    dimension: "status",
    grain: "budget_status",
    primaryVisualization: "bar",
    secondaryVisualizations: ["ranking", "table"],
    help: {
      objective: "Mostrar a distribuicao de orcamentos por status atual no periodo filtrado, usando os seis status padronizados.",
      calculation: [
        "Padroniza o STATUS em: Projeto, Aberto, Parcial, Fechado, Pedido e Perdeu.",
        "Conta orcamentos em cada status.",
      ],
      howToRead: [
        "Use para entender em qual status existe maior concentracao de orcamentos.",
        "Compare com valor e participacao para separar volume, impacto financeiro e mix.",
      ],
      cautions: [
        "Status fora desse conjunto aparecem com o texto original e devem ser revisados na origem.",
        "Mudancas na operacao podem alterar a distribuicao historica entre os seis status.",
      ],
    },
  },

  funnel_amount_by_status: {
    chartId: "funnel_amount_by_status",
    groupId: "funnel_by_status_family",
    categoryId: "funnel",
    title: "Valor total por status",
    question: "Em quais status existe maior valor total orcado no periodo?",
    metric: "amount",
    dimension: "status",
    grain: "budget_status",
    primaryVisualization: "bar",
    secondaryVisualizations: ["ranking", "table"],
    help: {
      objective: "Comparar o valor total orcado por status no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por status atual.",
        "Soma valor total por status.",
      ],
      howToRead: [
        "Use para localizar valor concentrado em cada status comercial.",
        "Combine com quantidade por status para separar volume vs valor.",
      ],
      cautions: [
        "Valores altos em Projeto, Aberto ou Parcial podem indicar pipeline concentrado antes do fechamento.",
        "Outliers (orcamentos grandes) podem inflar um status especifico.",
      ],
    },
  },

  funnel_count_by_status: {
    chartId: "funnel_count_by_status",
    groupId: "funnel_by_status_family",
    categoryId: "funnel",
    title: "Quantidade de orcamentos por status",
    question: "Em quais status existe maior volume de orcamentos no periodo?",
    metric: "count",
    dimension: "status",
    grain: "budget_status",
    primaryVisualization: "bar",
    secondaryVisualizations: ["ranking", "table"],
    help: {
      objective: "Comparar o volume de orcamentos por status no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por status atual.",
        "Conta orcamentos por status.",
      ],
      howToRead: [
        "Use para detectar concentracao excessiva em Projeto, Aberto ou Parcial.",
        "Compare com valor por status para entender onde ha volume com maior impacto financeiro.",
      ],
      cautions: [
        "Status fora do conjunto esperado devem ser tratados na origem para nao distorcer a leitura.",
        "Mudancas de processo podem alterar a distribuicao por status.",
      ],
    },
  },

  funnel_conversion_percent_by_status: {
    chartId: "funnel_conversion_percent_by_status",
    groupId: "funnel_by_status_family",
    categoryId: "funnel",
    title: "Participacao por status",
    question: "Qual a participacao de cada status na quantidade total de orcamentos?",
    metric: "share",
    dimension: "status",
    grain: "budget_status",
    primaryVisualization: "bar",
    secondaryVisualizations: ["table"],
    help: {
      objective: "Mostrar a participacao percentual de cada status no total de orcamentos do periodo.",
      calculation: [
        "Padroniza o STATUS em seis categorias fixas.",
        "Calcula a participacao percentual de cada status sobre o total de orcamentos.",
      ],
      howToRead: [
        "Use para entender o mix percentual dos status no periodo.",
        "Combine com quantidade e valor por status para priorizar a leitura.",
      ],
      cautions: [
        "O acumulado aparece no label para facilitar a leitura do mix.",
        ...PERCENT_NORMALIZATION_CAUTION,
      ],
    },
  },

  funnel_open_approved_lost: {
    chartId: "funnel_open_approved_lost",
    groupId: "funnel_by_status_family",
    categoryId: "funnel",
    title: "Resumo por macrostatus",
    question: "Como os seis status se consolidam em aberto, convertido e perdido?",
    metric: "count",
    dimension: "status",
    grain: "budget_status",
    primaryVisualization: "bar",
    secondaryVisualizations: ["pie", "table"],
    help: {
      objective: "Comparar rapidamente os macrogrupos comerciais do periodo: Projeto/Aberto/Parcial, Fechado/Pedido e Perdeu.",
      calculation: [
        "Agrupa Projeto, Aberto e Parcial como pipeline em aberto.",
        "Agrupa Fechado e Pedido como status convertidos.",
        "Mantem Perdeu como grupo de perda.",
        "Conta orcamentos em cada categoria.",
      ],
      howToRead: [
        "Use para medir o equilibrio entre pipeline, conversao e perda.",
        "Combine com valor por status para entender o impacto financeiro de cada macrogrupo.",
      ],
      cautions: [
        "Projeto, Aberto e Parcial continuam sendo etapas diferentes; use a distribuicao detalhada quando precisar diagnostico fino.",
        "Fechado e Pedido foram consolidados como convertidos nesta visao-resumo.",
      ],
    },
  },

  funnel_pending_amount: {
    chartId: "funnel_pending_amount",
    groupId: "funnel_status_summary",
    categoryId: "funnel",
    title: "Valor parado em orcamentos pendentes",
    question: "Quanto valor esta travado em orcamentos pendentes no periodo?",
    metric: "amount",
    dimension: "status",
    grain: "budget_status",
    primaryVisualization: "kpi",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Evidenciar o montante de valor orcado que esta parado em status pendentes no periodo filtrado.",
      calculation: [
        "Filtra orcamentos em status pendentes (conforme definicao do dataset).",
        "Soma o valor total desses orcamentos.",
      ],
      howToRead: [
        "Use para priorizar follow-up em orcamentos com valor travado.",
        "Se o valor pendente subir, pode indicar gargalo ou ciclo de venda maior.",
      ],
      cautions: [
        "A definicao de 'pendente' depende do conjunto de status configurado.",
        "Poucos orcamentos grandes podem dominar o montante pendente; valide a lista.",
      ],
    },
  },

  funnel_approval_rate: {
    chartId: "funnel_approval_rate",
    groupId: "funnel_rates",
    categoryId: "funnel",
    title: "Taxa de aprovacao de orcamentos",
    question: "Qual a taxa de aprovacao no periodo filtrado?",
    metric: "conversion",
    dimension: "status",
    grain: "derived",
    primaryVisualization: "kpi",
    secondaryVisualizations: ["line", "table"],
    help: {
      objective: "Mostrar a taxa de aprovacao (conversao para aprovado) no periodo filtrado.",
      calculation: [
        "Define o conjunto de orcamentos considerados (base).",
        "Calcula percentual aprovado (aprovados / base).",
      ],
      howToRead: [
        "Use para acompanhar eficiencia do funil ao longo do tempo.",
        "Se cair, investigue por vendedor/origem/UF/produto para achar a causa.",
      ],
      cautions: [
        ...GEO_CONVERSION_CAUTION,
        ...PERCENT_NORMALIZATION_CAUTION,
      ],
    },
  },

  funnel_loss_cancel_rate: {
    chartId: "funnel_loss_cancel_rate",
    groupId: "funnel_rates",
    categoryId: "funnel",
    title: "Taxa de perda/cancelamento",
    question: "Qual a taxa de perda/cancelamento no periodo filtrado?",
    metric: "conversion",
    dimension: "status",
    grain: "derived",
    primaryVisualization: "kpi",
    secondaryVisualizations: ["line", "table"],
    help: {
      objective: "Mostrar a taxa de perda/cancelamento no periodo filtrado.",
      calculation: [
        "Define o conjunto de orcamentos considerados (base).",
        "Calcula percentual perdido/cancelado (perdidos / base).",
      ],
      howToRead: [
        "Use para monitorar aumento de perdas e acionar correcoes (preco, prazo, produto).",
        "Combine com motivos de perda (se houver) e com desconto/markup.",
      ],
      cautions: [
        ...GEO_CONVERSION_CAUTION,
        ...PERCENT_NORMALIZATION_CAUTION,
      ],
    },
  },

  funnel_conversion_evolution: {
    chartId: "funnel_conversion_evolution",
    groupId: "funnel_rates",
    categoryId: "funnel",
    title: "Evolucao da conversao ao longo do tempo",
    question: "A conversao esta melhorando ou piorando ao longo do tempo?",
    metric: "conversion",
    dimension: "period",
    grain: "derived",
    primaryVisualization: "line",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Mostrar a evolucao da conversao ao longo do periodo filtrado.",
      calculation: [
        "Calcula taxa de conversao por faixa de tempo (dia/semana/mes).",
        "Exibe a serie temporal da taxa.",
      ],
      howToRead: [
        "Use para ver tendencia e impacto de mudancas de processo/campanhas.",
        "Picos/vales sugerem mudancas pontuais; valide com volume no mesmo periodo.",
      ],
      cautions: [
        ...GEO_CONVERSION_CAUTION,
        "Conversao pode oscilar muito com volume baixo; considere janelas maiores.",
      ],
    },
  },

  funnel_conversion_by_seller: {
    chartId: "funnel_conversion_by_seller",
    groupId: "funnel_conversion_segments",
    categoryId: "funnel",
    title: "Conversao por vendedor",
    question: "Quais vendedores tem melhor desempenho de conversao?",
    metric: "conversion",
    dimension: "seller",
    grain: "derived",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Comparar a taxa de conversao por vendedor no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por vendedor.",
        "Calcula taxa de conversao com base no status atual para cada vendedor.",
      ],
      howToRead: [
        "Use para identificar melhores praticas (alta conversao) e gaps de treinamento.",
        "Combine com quantidade para evitar conclusoes com base em poucos casos.",
      ],
      cautions: [...GEO_CONVERSION_CAUTION],
    },
  },

  funnel_conversion_by_customer: {
    chartId: "funnel_conversion_by_customer",
    groupId: "funnel_conversion_segments",
    categoryId: "funnel",
    title: "Conversao por cliente",
    question: "Quais clientes/contas convertem melhor no periodo?",
    metric: "conversion",
    dimension: "customer",
    grain: "derived",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["table"],
    help: {
      objective: "Comparar a taxa de conversao por cliente no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por cliente.",
        "Calcula taxa de conversao com base no status atual para cada cliente.",
      ],
      howToRead: [
        "Use para identificar contas com maior propensao de fechamento.",
        "Combine com ticket/valor para priorizar contas mais relevantes.",
      ],
      cautions: [...GEO_CONVERSION_CAUTION],
    },
  },

  funnel_conversion_by_origin: {
    chartId: "funnel_conversion_by_origin",
    groupId: "funnel_conversion_segments",
    categoryId: "funnel",
    title: "Conversao por origem",
    question: "Quais canais/origens convertem melhor no periodo?",
    metric: "conversion",
    dimension: "origin",
    grain: "derived",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Comparar a taxa de conversao por origem/canal no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por origem.",
        "Calcula taxa de conversao por origem com base no status atual.",
      ],
      howToRead: [
        "Use para medir qualidade dos canais (alta conversao).",
        "Combine com volume para entender impacto total do canal.",
      ],
      cautions: [...GEO_CONVERSION_CAUTION],
    },
  },

  funnel_conversion_by_geo: {
    chartId: "funnel_conversion_by_geo",
    groupId: "funnel_conversion_segments",
    categoryId: "funnel",
    title: "Conversao por cidade/UF",
    question: "Quais regioes/UFs convertem melhor no periodo?",
    metric: "conversion",
    dimension: "uf",
    grain: "derived",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["map", "table"],
    help: {
      objective: "Comparar a taxa de conversao por cidade/UF no periodo filtrado.",
      calculation: [
        "Normaliza a localizacao (UF/cidade) dos orcamentos.",
        "Calcula taxa de conversao por local com base no status atual.",
      ],
      howToRead: [
        "Use para identificar regioes com melhor desempenho de fechamento.",
        "No modo Mapa, a cor mais forte indica maior conversao relativa no periodo (agregado por UF).",
      ],
      cautions: [...GEO_UF_COMMON_CAUTION, ...GEO_CONVERSION_CAUTION],
    },
  },

  funnel_conversion_by_payment: {
    chartId: "funnel_conversion_by_payment",
    groupId: "funnel_conversion_segments",
    categoryId: "funnel",
    title: "Conversao por condicao de pagamento",
    question: "Quais condicoes de pagamento convertem melhor no periodo?",
    metric: "conversion",
    dimension: "payment",
    grain: "derived",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Comparar a taxa de conversao por condicao de pagamento no periodo filtrado.",
      calculation: [
        "Agrupa orcamentos por condicao de pagamento.",
        "Calcula taxa de conversao por condicao com base no status atual.",
      ],
      howToRead: [
        "Use para entender se prazos/condicoes afetam fechamento.",
        "Combine com ticket/valor para avaliar impacto financeiro.",
      ],
      cautions: [...GEO_CONVERSION_CAUTION],
    },
  },

  funnel_blocking_status_ranking: {
    chartId: "funnel_blocking_status_ranking",
    categoryId: "funnel",
    title: "Ranking de status que mais travam vendas",
    question: "Quais status concentram mais orcamentos parados (gargalos)?",
    metric: "count",
    dimension: "status",
    grain: "budget_status",
    primaryVisualization: "ranking",
    secondaryVisualizations: ["bar", "table"],
    help: {
      objective: "Listar os status com maior concentracao de orcamentos que tendem a travar o fluxo de vendas.",
      calculation: [
        "Agrupa orcamentos por status atual.",
        "Conta volume (ou mede idade media, dependendo do dataset) e ordena do maior para o menor.",
      ],
      howToRead: [
        "Use para priorizar melhorias de processo nos status mais problemáticos.",
        "Combine com tempo medio no status (se houver) e com valor parado.",
      ],
      cautions: [
        "O ranking pode ser influenciado por status muito usados; valide com tempo/valor para confirmar gargalo real.",
        "Mudancas de fluxo/status podem alterar o ranking historico.",
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
