export type ChartDetail = {
    objective: string;
    calculation: string[];
    dataSources: string[];
    interpretation: string[];
    cautions?: string[];
};

const DETAILS: Record<string, ChartDetail> = {
    kpis: {
        objective: "Resume a saúde financeira com indicadores executivos como score, prazos médios e equilíbrio entre pagar e receber.",
        calculation: [
            "Consolida indicadores calculados sobre o conjunto financeiro carregado no período selecionado.",
            "Compara recebimentos, pagamentos, prazos e composição da carteira para gerar os KPIs exibidos.",
        ],
        dataSources: [
            "Resumo financeiro do dashboard avançado.",
            "Indicadores consolidados de pagar, receber e fluxo de caixa.",
        ],
        interpretation: [
            "Use como leitura inicial do período antes de entrar nos gráficos detalhados.",
            "Mudanças fortes nesses indicadores costumam justificar abrir os grupos de receber, pagar e fluxo.",
        ],
    },
    summary: {
        objective: "Mostra os totais principais do período: pagar, receber e saldo consolidado.",
        calculation: [
            "Soma os valores financeiros retornados para o intervalo de datas selecionado.",
            "Apresenta os agregados mais importantes para uma leitura rápida do caixa.",
        ],
        dataSources: [
            "Resumo financeiro consolidado da empresa.",
        ],
        interpretation: [
            "Serve para validar volume geral antes de analisar distribuições ou tendências.",
            "Se o saldo ou os totais parecerem fora do esperado, vale revisar o filtro de datas e os gráficos de evolução.",
        ],
    },
    flow: {
        objective: "Compara entradas e saídas ao longo do tempo para mostrar a dinâmica mensal do caixa.",
        calculation: [
            "Agrupa os movimentos por mês dentro do período filtrado.",
            "Compara recebimentos, pagamentos e variações consolidadas por competência.",
        ],
        dataSources: [
            "Histórico mensal de valores recebidos e pagos.",
        ],
        interpretation: [
            "Picos ou quedas ajudam a identificar sazonalidade ou eventos pontuais.",
            "Meses com descolamento entre entradas e saídas merecem investigação nas visões de pagar e receber.",
        ],
    },
    projection: {
        objective: "Projeta o comportamento do caixa para os próximos 30 dias.",
        calculation: [
            "Considera a agenda futura de títulos previstos dentro da janela de projeção.",
            "Evolui o saldo dia a dia com base nas entradas e saídas previstas.",
        ],
        dataSources: [
            "Títulos futuros a pagar e a receber.",
            "Projeção diária de caixa do dashboard avançado.",
        ],
        interpretation: [
            "Use para antecipar falta de caixa ou folga financeira no curto prazo.",
            "Vale olhar em conjunto com top contas e curva de vencimento para entender concentrações.",
        ],
    },
    aging: {
        objective: "Mostra quanto da carteira está vencido e há quanto tempo.",
        calculation: [
            "Classifica os documentos em aberto por faixas de atraso.",
            "Soma a quantidade ou valor dentro de cada faixa de vencimento.",
        ],
        dataSources: [
            "Títulos em aberto da carteira de receber.",
        ],
        interpretation: [
            "Quanto mais a carteira migra para faixas longas, maior o risco de atraso estrutural.",
            "Faixas recentes podem indicar questões pontuais; faixas antigas sugerem necessidade de cobrança mais forte.",
        ],
    },
    performance: {
        objective: "Avalia a pontualidade histórica dos recebimentos.",
        calculation: [
            "Separa os recebimentos por categorias de comportamento, como no prazo e com atraso.",
            "Calcula a distribuição do volume dentro dessas categorias.",
        ],
        dataSources: [
            "Histórico de liquidez e comportamento de recebimento.",
        ],
        interpretation: [
            "Quanto maior a parcela no prazo, mais previsível tende a ser o caixa.",
            "Uma degradação nessa distribuição normalmente aparece junto de aging pior e prazo médio maior.",
        ],
    },
    dist_pag_fornecedor: {
        objective: "Mostra quais fornecedores concentram mais valor a pagar.",
        calculation: [
            "Agrupa os documentos de pagar por fornecedor.",
            "Soma os valores de cada fornecedor e ordena pelos maiores montantes.",
        ],
        dataSources: [
            "Titulos em aberto de contas a pagar.",
        ],
        interpretation: [
            "Alta concentração pode aumentar dependência de poucos parceiros.",
            "Os maiores fornecedores devem ser avaliados junto com prazo médio e top contas.",
        ],
    },
    geo_pagar: {
        objective: "Distribui os valores a pagar por estado.",
        calculation: [
            "Normaliza a localização do documento ou parceiro para UF.",
            "Soma os valores financeiros por estado e colore o mapa pela intensidade relativa.",
        ],
        dataSources: [
            "Títulos de pagar com referência geográfica.",
        ],
        interpretation: [
            "Ajuda a perceber concentração regional das obrigações financeiras.",
            "Estados muito destacados podem indicar polos operacionais ou concentração de fornecedores.",
        ],
    },
    dist_tipo_pag: {
        objective: "Mostra os meios de pagamento predominantes.",
        calculation: [
            "Agrupa os movimentos por tipo ou método de pagamento.",
            "Calcula a participação de cada grupo no volume do período.",
        ],
        dataSources: [
            "Títulos com classificação de método de pagamento.",
        ],
        interpretation: [
            "Ajuda a entender perfil operacional e possiveis custos financeiros indiretos.",
            "Mudanças bruscas de mix podem refletir negociação, risco ou estratégia de caixa.",
        ],
    },
    dist_cond_pag: {
        objective: "Explica como as condições de pagamento estão distribuídas.",
        calculation: [
            "Agrupa os títulos por condição de pagamento negociada.",
            "Soma o volume de cada condição dentro do período.",
        ],
        dataSources: [
            "Títulos de pagar com campo de condição de pagamento.",
        ],
        interpretation: [
            "Concentrações em prazos curtos aumentam pressão no caixa.",
            "Distribuicao mais alongada pode indicar maior folego financeiro.",
        ],
    },
    evolucao_pag: {
        objective: "Mostra a evolução mensal do volume pago.",
        calculation: [
            "Agrupa os pagamentos por mês.",
            "Plota a soma mensal para leitura de tendencia.",
        ],
        dataSources: [
            "Histórico mensal de pagamentos.",
        ],
        interpretation: [
            "Crescimento sustentado pode refletir aumento de operação ou pressão de custos.",
            "Vale comparar com evolução de recebimentos para entender equilíbrio.",
        ],
    },
    curva_pag: {
        objective: "Mostra em quais períodos o contas a pagar se concentra.",
        calculation: [
            "Agrupa os títulos por janelas de vencimento ou referência temporal.",
            "Soma os valores de cada faixa para revelar a curva futura.",
        ],
        dataSources: [
            "Agenda de vencimentos a pagar.",
        ],
        interpretation: [
            "Picos mostram quando o caixa sera mais exigido.",
            "Ajuda a priorizar negociações ou necessidade de reforço de saldo.",
        ],
    },
    top_pag: {
        objective: "Lista os maiores títulos a pagar com maior impacto no caixa.",
        calculation: [
            "Ordena os documentos de pagar por valor decrescente.",
            "Seleciona os itens mais relevantes do período.",
        ],
        dataSources: [
            "Titulos individuais de contas a pagar.",
        ],
        interpretation: [
            "Serve para identificar rapidamente os pagamentos criticos.",
            "Cruze com fornecedor, vencimento e condição para priorizar ação.",
        ],
    },
    faixa_pag: {
        objective: "Distribui as contas a pagar por faixa de valor.",
        calculation: [
            "Classifica cada titulo em buckets de valor.",
            "Conta ou soma quantos documentos caem em cada faixa.",
        ],
        dataSources: [
            "Titulos em aberto do contas a pagar.",
        ],
        interpretation: [
            "Mostra se a carteira e pulverizada ou concentrada em poucos valores altos.",
            "Uma carteira muito concentrada tende a ter maior volatilidade de caixa.",
        ],
    },
    dist_rec_cliente: {
        objective: "Mostra quais clientes concentram mais receita ou mais recebíveis.",
        calculation: [
            "Agrupa os documentos por cliente.",
            "Soma os valores por cliente e ordena os mais representativos.",
        ],
        dataSources: [
            "Titulos da carteira de receber.",
        ],
        interpretation: [
            "Ajuda a medir dependencia de poucos clientes.",
            "Clientes muito relevantes merecem análise conjunta com prazo médio, ticket e aging.",
        ],
    },
    geo_receber: {
        objective: "Distribui os recebíveis por estado.",
        calculation: [
            "Padroniza a UF relacionada ao cliente ou documento.",
            "Soma os valores por estado para leitura geografica.",
        ],
        dataSources: [
            "Titulos de receber com referencia geografica.",
        ],
        interpretation: [
            "Destaca mercados regionais mais importantes para a receita.",
            "Também ajuda a detectar exposição regional excessiva.",
        ],
    },
    evolucao_rec: {
        objective: "Mostra a evolução mensal dos recebimentos.",
        calculation: [
            "Agrupa os valores recebidos por mês.",
            "Plota a serie para leitura de tendencia e sazonalidade.",
        ],
        dataSources: [
            "Histórico mensal de recebimentos.",
        ],
        interpretation: [
            "Serve para identificar crescimento, queda e meses atípicos.",
            "Vale comparar com o fluxo consolidado e performance de recebimento.",
        ],
    },
    curva_rec: {
        objective: "Mostra quando os recebimentos futuros estão concentrados.",
        calculation: [
            "Agrupa os títulos a receber por período de vencimento.",
            "Soma os valores por faixa para revelar a distribuicao temporal.",
        ],
        dataSources: [
            "Agenda futura da carteira de receber.",
        ],
        interpretation: [
            "Picos revelam dependencia de datas ou janelas especificas para entrada de caixa.",
            "Concentracao excessiva aumenta risco caso haja atraso nessas datas.",
        ],
    },
    top_rec: {
        objective: "Lista os maiores recebíveis do período.",
        calculation: [
            "Ordena os títulos a receber por valor decrescente.",
            "Destaca os documentos com maior impacto potencial no caixa.",
        ],
        dataSources: [
            "Titulos individuais de contas a receber.",
        ],
        interpretation: [
            "Bom para priorizar cobrança e acompanhamento de clientes relevantes.",
            "Também ajuda a medir risco de concentração em poucos documentos.",
        ],
    },
    faixa_rec: {
        objective: "Distribui a carteira de receber por faixa de valor.",
        calculation: [
            "Classifica cada documento em buckets de valor.",
            "Consolida quantidade ou volume em cada faixa.",
        ],
        dataSources: [
            "Titulos em aberto da carteira de receber.",
        ],
        interpretation: [
            "Mostra se a receita está pulverizada ou concentrada em poucos títulos altos.",
            "Concentração maior pede mais atenção à inadimplência dos principais clientes.",
        ],
    },
    efficiency_kpis: {
        objective: "Apresenta indicadores avançados de eficiência, risco e concentração.",
        calculation: [
            "Consolida KPIs derivados de operação, liquidez, concentração e comportamento financeiro.",
            "Resume em cards para leitura executiva de desempenho.",
        ],
        dataSources: [
            "Indicadores avançados do dashboard financeiro.",
        ],
        interpretation: [
            "Use como painel gerencial para detectar sinais de alerta rápido.",
            "Quando um KPI foge do esperado, aprofunde no gráfico ligado ao tema.",
        ],
    },
    vol_dia_mes: {
        objective: "Mostra como o volume financeiro se distribui ao longo dos dias do mês.",
        calculation: [
            "Agrupa os movimentos pelo dia do mês.",
            "Soma o volume total de cada dia para identificar picos operacionais.",
        ],
        dataSources: [
            "Movimentações diárias consolidadas.",
        ],
        interpretation: [
            "Ajuda a enxergar concentração de trabalho ou caixa em datas específicas.",
            "Picos recorrentes podem indicar rotina operacional ou política de vencimento.",
        ],
    },
    vol_dia_semana: {
        objective: "Mostra o volume financeiro por dia da semana.",
        calculation: [
            "Reclassifica os movimentos diários para o dia da semana correspondente.",
            "Soma os valores para comparar comportamento semanal.",
        ],
        dataSources: [
            "Movimentações diárias consolidadas.",
        ],
        interpretation: [
            "Ajuda a identificar padrões de operação e carga ao longo da semana.",
            "Pode ser útil para planejar equipe, cobrança ou rotina de pagamentos.",
        ],
    },
    liq_empresa: {
        objective: "Compara a liquidez por empresa, filial ou unidade.",
        calculation: [
            "Agrupa os indicadores de liquidez pela entidade organizacional retornada.",
            "Compara o índice calculado entre as unidades.",
        ],
        dataSources: [
            "Indicadores de liquidez por empresa ou filial.",
        ],
        interpretation: [
            "Mostra quais unidades sustentam melhor seu próprio ciclo de caixa.",
            "Unidades com liquidez baixa merecem leitura junto de receber, pagar e saldo acumulado.",
        ],
    },
    fluxo_diario_proj: {
        objective: "Mostra a projeção diária do caixa no curto prazo.",
        calculation: [
            "Evolui o saldo dia a dia usando a agenda prevista de entradas e saídas.",
            "Permite ver os pontos de maior tensão ou folga no horizonte futuro.",
        ],
        dataSources: [
            "Fluxo diário projetado do dashboard avançado.",
        ],
        interpretation: [
            "Ideal para identificar dias críticos antes que o problema aconteça.",
            "Use em conjunto com top contas e curva de vencimento.",
        ],
    },
    vol_cpf_cnpj: {
        objective: "Mostra o volume financeiro por documento identificador.",
        calculation: [
            "Agrupa os movimentos pelo CPF ou CNPJ relacionado.",
            "Soma os valores para identificar concentrações relevantes.",
        ],
        dataSources: [
            "Movimentações consolidadas por documento fiscal.",
        ],
        interpretation: [
            "Ajuda a detectar concentração em poucos grupos econômicos.",
            "Pode revelar clientes ou fornecedores relacionados operando com múltiplos cadastros.",
        ],
    },
    saldo_acumulado: {
        objective: "Mostra a trajetória acumulada do saldo ao longo do período.",
        calculation: [
            "Ordena os movimentos por data.",
            "Acumula o saldo progressivamente para mostrar a curva da saúde do caixa.",
        ],
        dataSources: [
            "Evolução diária de saldo acumulado.",
        ],
        interpretation: [
            "Quedas prolongadas sugerem consumo de caixa acima da reposicao.",
            "Recuperações sustentadas sinalizam melhora de equilíbrio financeiro.",
        ],
    },
    dist_faixa_prazo: {
        objective: "Mostra a distribuição dos documentos por faixa de prazo até o vencimento.",
        calculation: [
            "Classifica os documentos conforme a distância para o vencimento.",
            "Consolida a carteira dentro de cada faixa temporal.",
        ],
        dataSources: [
            "Títulos com informação de vencimento.",
        ],
        interpretation: [
            "Ajuda a enxergar o perfil temporal da carteira.",
            "Concentração em janelas curtas pode gerar pressão operacional e de caixa.",
        ],
    },
    pm_rec_cli: {
        objective: "Mostra o prazo médio de recebimento por cliente.",
        calculation: [
            "Calcula o tempo médio entre emissão e recebimento por cliente.",
            "Ordena os clientes conforme o prazo observado.",
        ],
        dataSources: [
            "Histórico de documentos e recebimentos por cliente.",
        ],
        interpretation: [
            "Clientes com prazo alto tendem a alongar o ciclo de caixa.",
            "Compare com ticket médio e inadimplência para avaliar risco.",
        ],
    },
    pm_pag_for: {
        objective: "Mostra o prazo médio de pagamento por fornecedor.",
        calculation: [
            "Calcula o tempo médio entre obrigação e pagamento para cada fornecedor.",
            "Compara os fornecedores com maior impacto no ciclo de caixa.",
        ],
        dataSources: [
            "Histórico de pagamentos por fornecedor.",
        ],
        interpretation: [
            "Prazos maiores podem aliviar o caixa, desde que sustentáveis comercialmente.",
            "Vale cruzar com concentração por fornecedor e top contas.",
        ],
    },
    tm_rec_cli: {
        objective: "Mostra o ticket médio por cliente.",
        calculation: [
            "Divide o volume total pelo número de documentos de cada cliente.",
            "Compara o valor médio operacional entre clientes.",
        ],
        dataSources: [
            "Documentos e volume financeiro por cliente.",
        ],
        interpretation: [
            "Ajuda a diferenciar clientes de alto volume por recorrência versus valor médio.",
            "Tickets altos com pouca pulverização elevam risco de concentração.",
        ],
    },
    tm_pag_for: {
        objective: "Mostra o ticket médio por fornecedor.",
        calculation: [
            "Divide o volume total pelo número de documentos por fornecedor.",
            "Compara o valor médio das operações com cada parceiro.",
        ],
        dataSources: [
            "Documentos e volume financeiro por fornecedor.",
        ],
        interpretation: [
            "Ajuda a entender perfil de compra e concentração operacional.",
            "Fornecedores com ticket alto pedem acompanhamento mais próximo.",
        ],
    },
    docs_cli: {
        objective: "Mostra a quantidade de documentos por cliente.",
        calculation: [
            "Conta os documentos associados a cada cliente.",
            "Ordena os clientes pelo volume operacional.",
        ],
        dataSources: [
            "Documentos financeiros por cliente.",
        ],
        interpretation: [
            "Separa clientes de alta recorrência de clientes de alto valor pontual.",
            "Use junto com ticket médio e prazo médio para leitura mais completa.",
        ],
    },
    docs_for: {
        objective: "Mostra a quantidade de documentos por fornecedor.",
        calculation: [
            "Conta os documentos associados a cada fornecedor.",
            "Ordena os fornecedores pelo volume operacional.",
        ],
        dataSources: [
            "Documentos financeiros por fornecedor.",
        ],
        interpretation: [
            "Ajuda a entender recorrência operacional com cada parceiro.",
            "Fornecedores com muitos documentos podem demandar revisão de processo ou negociação.",
        ],
    },
};

export function getChartDetail(id: string, title: string, description?: string): ChartDetail {
    const detail = DETAILS[id];
    if (detail) return detail;

    return {
        objective: description || `Explica o objetivo e a leitura do gráfico ${title}.`,
        calculation: [
            "Usa os dados consolidados do período filtrado para montar a visualização.",
            "Agrupa, soma ou compara os registros conforme o tipo do gráfico selecionado.",
        ],
        dataSources: [
            "Dados financeiros retornados pelo dashboard avançado para o tenant logado.",
        ],
        interpretation: [
            "Use a visualização para localizar concentrações, tendência e desvios.",
            "Se algo parecer fora do esperado, compare com os demais gráficos do mesmo grupo.",
        ],
    };
}
