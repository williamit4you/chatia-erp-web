import { getSalesBudgetChartDefinition } from "@/lib/salesBudgetChartDefinitions";

export type SalesBudgetChartHint = {
  description: string;
  suggestedQuestions: string[];
  relatedInsights: string[];
};

const DIMENSION_LABELS: Record<string, string> = {
  period: "período",
  status: "status",
  seller: "vendedor",
  customer: "cliente",
  product: "produto",
  origin: "origem",
  uf: "UF",
  city: "cidade",
  region: "região",
  payment: "condição de pagamento",
  freight_type: "tipo de frete",
  company: "empresa",
};

const VISUALIZATION_QUESTIONS: Record<string, string[]> = {
  kpi: [
    "O valor atual deste indicador está saudável ou exige atenção?",
    "Qual decisão prática este KPI sugere agora?",
  ],
  bar: [
    "Quais barras mais se destacam e por quê?",
    "Existe diferença relevante entre os primeiros e os últimos itens?",
  ],
  horizontal_bar: [
    "Quais itens lideram este ranking e qual a distância para os demais?",
    "Existe concentração forte nos primeiros colocados?",
  ],
  line: [
    "A tendência está melhorando, piorando ou oscilando?",
    "Em quais pontos houve mudança mais brusca no comportamento?",
  ],
  area: [
    "Existe aceleração ou perda de ritmo ao longo do período?",
    "Quais trechos da curva merecem mais atenção?",
  ],
  combo: [
    "Como os indicadores deste gráfico se relacionam entre si?",
    "Existe divergência importante entre as séries comparadas?",
  ],
  pie: [
    "Quais fatias concentram a maior parte do total?",
    "A distribuição está equilibrada ou muito concentrada?",
  ],
  ranking: [
    "Quais itens lideram este ranking e o que explica essa liderança?",
    "Quanto os primeiros colocados representam em relação ao restante?",
  ],
  table: [
    "Quais linhas desta tabela exigem ação imediata?",
    "Existe algum padrão importante escondido nos dados listados?",
  ],
  heatmap: [
    "Onde estão os pontos de maior intensidade neste mapa de calor?",
    "Existe padrão de concentração recorrente neste recorte?",
  ],
  map: [
    "Quais regiões aparecem mais fortes neste mapa e por quê?",
    "Existe concentração geográfica relevante neste resultado?",
  ],
  funnel: [
    "Em qual etapa do funil existe maior concentração ou perda?",
    "Qual estágio parece mais crítico neste fluxo?",
  ],
  scatter: [
    "Existe algum agrupamento ou outlier relevante neste gráfico?",
    "Quais pontos fogem do padrão principal?",
  ],
};

function stripPunctuation(text: string) {
  return text.trim().replace(/[.?!:;]+$/g, "");
}

function toQuestionFromStatement(text: string) {
  const normalized = stripPunctuation(text);
  if (!normalized) return null;
  return `${normalized}?`;
}

function buildChartSpecificQuestions(params: {
  chartTitle: string;
  dimensionLabel: string;
  primaryVisualization: string;
  objective: string;
  question: string;
  howToRead: string[];
  cautions: string[];
}) {
  const {
    chartTitle,
    dimensionLabel,
    primaryVisualization,
    objective,
    question,
    howToRead,
    cautions,
  } = params;

  const objectiveQuestion = objective
    ? `O que o gráfico "${chartTitle}" revela sobre ${stripPunctuation(objective).toLowerCase()}?`
    : null;

  const readQuestion = howToRead[0]
    ? `Como interpretar este gráfico para tomar decisão sobre ${dimensionLabel}?`
    : null;

  const cautionQuestion = cautions[0]
    ? `Qual cuidado principal eu devo ter ao analisar este gráfico?`
    : null;

  const vizQuestions = VISUALIZATION_QUESTIONS[primaryVisualization] ?? [];

  return uniq([
    question,
    objectiveQuestion,
    ...vizQuestions,
    readQuestion,
    cautionQuestion,
    `Qual insight mais acionável este gráfico traz sobre ${dimensionLabel}?`,
  ]).slice(0, 5);
}

function uniq(items: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      items
        .map((item) => item?.trim())
        .filter((item): item is string => Boolean(item))
    )
  );
}

export function getSalesBudgetChartHint(chartId: string, title?: string): SalesBudgetChartHint {
  const definition = getSalesBudgetChartDefinition(chartId);

  if (!definition) {
    return {
      description: `Este gráfico ajuda a analisar ${title ?? chartId} no período selecionado.`,
      suggestedQuestions: [
        "Qual o principal insight deste gráfico?",
        "O que mais merece atenção neste período?",
        "Existe alguma concentração ou desvio relevante aqui?",
      ],
      relatedInsights: [
        "Compare os maiores valores com o restante da distribuição.",
        "Valide se o resultado está coerente com o período filtrado.",
        "Cruze este gráfico com volume e conversão antes de concluir tendência.",
      ],
    };
  }

  const dimensionLabel = DIMENSION_LABELS[definition.dimension] ?? "grupo";

  const suggestedQuestions = buildChartSpecificQuestions({
    chartTitle: definition.title,
    dimensionLabel,
    primaryVisualization: definition.primaryVisualization,
    objective: definition.help.objective,
    question: definition.question,
    howToRead: definition.help.howToRead,
    cautions: definition.help.cautions,
  });

  const relatedInsights = uniq([
    ...definition.help.howToRead.slice(0, 2),
    ...definition.help.cautions.slice(0, 2),
  ]).slice(0, 4);

  return {
    description: definition.help.objective,
    suggestedQuestions,
    relatedInsights,
  };
}
