export type ChartDetail = {
    objective: string;
    calculation: string[];
    dataSources: string[];
    interpretation: string[];
    cautions?: string[];
};

const DETAILS: Record<string, ChartDetail> = {
    kpis: {
        objective: "Resume a saude financeira com indicadores executivos como score, prazos medios e equilibrio entre pagar e receber.",
        calculation: [
            "Consolida indicadores calculados sobre o conjunto financeiro carregado no periodo selecionado.",
            "Compara recebimentos, pagamentos, prazos e composicao da carteira para gerar os KPIs exibidos.",
        ],
        dataSources: [
            "Resumo financeiro do dashboard avancado.",
            "Indicadores consolidados de pagar, receber e fluxo de caixa.",
        ],
        interpretation: [
            "Use como leitura inicial do periodo antes de entrar nos graficos detalhados.",
            "Mudancas fortes nesses indicadores costumam justificar abrir os grupos de receber, pagar e fluxo.",
        ],
    },
    summary: {
        objective: "Mostra os totais principais do periodo: pagar, receber e saldo consolidado.",
        calculation: [
            "Soma os valores financeiros retornados para o intervalo de datas selecionado.",
            "Apresenta os agregados mais importantes para uma leitura rapida do caixa.",
        ],
        dataSources: [
            "Resumo financeiro consolidado da empresa.",
        ],
        interpretation: [
            "Serve para validar volume geral antes de analisar distribuicoes ou tendencias.",
            "Se o saldo ou os totais parecerem fora do esperado, vale revisar o filtro de datas e os graficos de evolucao.",
        ],
    },
    flow: {
        objective: "Compara entradas e saidas ao longo do tempo para mostrar a dinamica mensal do caixa.",
        calculation: [
            "Agrupa os movimentos por mes dentro do periodo filtrado.",
            "Compara recebimentos, pagamentos e variacoes consolidadas por competencia.",
        ],
        dataSources: [
            "Historico mensal de valores recebidos e pagos.",
        ],
        interpretation: [
            "Picos ou quedas ajudam a identificar sazonalidade ou eventos pontuais.",
            "Meses com descolamento entre entradas e saidas merecem investigacao nas visoes de pagar e receber.",
        ],
    },
    projection: {
        objective: "Projeta o comportamento do caixa para os proximos 30 dias.",
        calculation: [
            "Considera a agenda futura de titulos previstos dentro da janela de projecao.",
            "Evolui o saldo dia a dia com base nas entradas e saidas previstas.",
        ],
        dataSources: [
            "Titulos futuros a pagar e a receber.",
            "Projecao diaria de caixa do dashboard avancado.",
        ],
        interpretation: [
            "Use para antecipar falta de caixa ou folga financeira no curto prazo.",
            "Vale olhar em conjunto com top contas e curva de vencimento para entender concentracoes.",
        ],
    },
    aging: {
        objective: "Mostra quanto da carteira esta vencido e ha quanto tempo.",
        calculation: [
            "Classifica os documentos em aberto por faixas de atraso.",
            "Soma a quantidade ou valor dentro de cada faixa de vencimento.",
        ],
        dataSources: [
            "Titulos em aberto da carteira de receber.",
        ],
        interpretation: [
            "Quanto mais a carteira migra para faixas longas, maior o risco de atraso estrutural.",
            "Faixas recentes podem indicar questoes pontuais; faixas antigas sugerem necessidade de cobranca mais forte.",
        ],
    },
    performance: {
        objective: "Avalia a pontualidade historica dos recebimentos.",
        calculation: [
            "Separa os recebimentos por categorias de comportamento, como no prazo e com atraso.",
            "Calcula a distribuicao do volume dentro dessas categorias.",
        ],
        dataSources: [
            "Historico de liquidez e comportamento de recebimento.",
        ],
        interpretation: [
            "Quanto maior a parcela no prazo, mais previsivel tende a ser o caixa.",
            "Uma degradacao nessa distribuicao normalmente aparece junto de aging pior e prazo medio maior.",
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
            "Alta concentracao pode aumentar dependencia de poucos parceiros.",
            "Os maiores fornecedores devem ser avaliados junto com prazo medio e top contas.",
        ],
    },
    geo_pagar: {
        objective: "Distribui os valores a pagar por estado.",
        calculation: [
            "Normaliza a localizacao do documento ou parceiro para UF.",
            "Soma os valores financeiros por estado e colore o mapa pela intensidade relativa.",
        ],
        dataSources: [
            "Titulos de pagar com referencia geografica.",
        ],
        interpretation: [
            "Ajuda a perceber concentracao regional das obrigacoes financeiras.",
            "Estados muito destacados podem indicar polos operacionais ou concentracao de fornecedores.",
        ],
    },
    dist_tipo_pag: {
        objective: "Mostra os meios de pagamento predominantes.",
        calculation: [
            "Agrupa os movimentos por tipo ou metodo de pagamento.",
            "Calcula a participacao de cada grupo no volume do periodo.",
        ],
        dataSources: [
            "Titulos com classificacao de metodo de pagamento.",
        ],
        interpretation: [
            "Ajuda a entender perfil operacional e possiveis custos financeiros indiretos.",
            "Mudancas bruscas de mix podem refletir negociacao, risco ou estrategia de caixa.",
        ],
    },
    dist_cond_pag: {
        objective: "Explica como as condicoes de pagamento estao distribuidas.",
        calculation: [
            "Agrupa os titulos por condicao de pagamento negociada.",
            "Soma o volume de cada condicao dentro do periodo.",
        ],
        dataSources: [
            "Titulos de pagar com campo de condicao de pagamento.",
        ],
        interpretation: [
            "Concentracoes em prazos curtos aumentam pressao no caixa.",
            "Distribuicao mais alongada pode indicar maior folego financeiro.",
        ],
    },
    evolucao_pag: {
        objective: "Mostra a evolucao mensal do volume pago.",
        calculation: [
            "Agrupa os pagamentos por mes.",
            "Plota a soma mensal para leitura de tendencia.",
        ],
        dataSources: [
            "Historico mensal de pagamentos.",
        ],
        interpretation: [
            "Crescimento sustentado pode refletir aumento de operacao ou pressao de custos.",
            "Vale comparar com evolucao de recebimentos para entender equilibrio.",
        ],
    },
    curva_pag: {
        objective: "Mostra em quais periodos o contas a pagar se concentra.",
        calculation: [
            "Agrupa os titulos por janelas de vencimento ou referencia temporal.",
            "Soma os valores de cada faixa para revelar a curva futura.",
        ],
        dataSources: [
            "Agenda de vencimentos a pagar.",
        ],
        interpretation: [
            "Picos mostram quando o caixa sera mais exigido.",
            "Ajuda a priorizar negociacoes ou necessidade de reforco de saldo.",
        ],
    },
    top_pag: {
        objective: "Lista os maiores titulos a pagar com maior impacto no caixa.",
        calculation: [
            "Ordena os documentos de pagar por valor decrescente.",
            "Seleciona os itens mais relevantes do periodo.",
        ],
        dataSources: [
            "Titulos individuais de contas a pagar.",
        ],
        interpretation: [
            "Serve para identificar rapidamente os pagamentos criticos.",
            "Cruze com fornecedor, vencimento e condicao para priorizar acao.",
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
        objective: "Mostra quais clientes concentram mais receita ou mais recebiveis.",
        calculation: [
            "Agrupa os documentos por cliente.",
            "Soma os valores por cliente e ordena os mais representativos.",
        ],
        dataSources: [
            "Titulos da carteira de receber.",
        ],
        interpretation: [
            "Ajuda a medir dependencia de poucos clientes.",
            "Clientes muito relevantes merecem analise conjunta com prazo medio, ticket e aging.",
        ],
    },
    geo_receber: {
        objective: "Distribui os recebiveis por estado.",
        calculation: [
            "Padroniza a UF relacionada ao cliente ou documento.",
            "Soma os valores por estado para leitura geografica.",
        ],
        dataSources: [
            "Titulos de receber com referencia geografica.",
        ],
        interpretation: [
            "Destaca mercados regionais mais importantes para a receita.",
            "Tambem ajuda a detectar exposicao regional excessiva.",
        ],
    },
    evolucao_rec: {
        objective: "Mostra a evolucao mensal dos recebimentos.",
        calculation: [
            "Agrupa os valores recebidos por mes.",
            "Plota a serie para leitura de tendencia e sazonalidade.",
        ],
        dataSources: [
            "Historico mensal de recebimentos.",
        ],
        interpretation: [
            "Serve para identificar crescimento, queda e meses atipicos.",
            "Vale comparar com o fluxo consolidado e performance de recebimento.",
        ],
    },
    curva_rec: {
        objective: "Mostra quando os recebimentos futuros estao concentrados.",
        calculation: [
            "Agrupa os titulos a receber por periodo de vencimento.",
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
        objective: "Lista os maiores recebiveis do periodo.",
        calculation: [
            "Ordena os titulos a receber por valor decrescente.",
            "Destaca os documentos com maior impacto potencial no caixa.",
        ],
        dataSources: [
            "Titulos individuais de contas a receber.",
        ],
        interpretation: [
            "Bom para priorizar cobranca e acompanhamento de clientes relevantes.",
            "Tambem ajuda a medir risco de concentracao em poucos documentos.",
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
            "Mostra se a receita esta pulverizada ou concentrada em poucos titulos altos.",
            "Concentracao maior pede mais atencao a inadimplencia dos principais clientes.",
        ],
    },
    efficiency_kpis: {
        objective: "Apresenta indicadores avancados de eficiencia, risco e concentracao.",
        calculation: [
            "Consolida KPIs derivados de operacao, liquidez, concentracao e comportamento financeiro.",
            "Resume em cards para leitura executiva de desempenho.",
        ],
        dataSources: [
            "Indicadores avancados do dashboard financeiro.",
        ],
        interpretation: [
            "Use como painel gerencial para detectar sinais de alerta rapido.",
            "Quando um KPI foge do esperado, aprofunde no grafico ligado ao tema.",
        ],
    },
    vol_dia_mes: {
        objective: "Mostra como o volume financeiro se distribui ao longo dos dias do mes.",
        calculation: [
            "Agrupa os movimentos pelo dia do mes.",
            "Soma o volume total de cada dia para identificar picos operacionais.",
        ],
        dataSources: [
            "Movimentacoes diarias consolidadas.",
        ],
        interpretation: [
            "Ajuda a enxergar concentracao de trabalho ou caixa em datas especificas.",
            "Picos recorrentes podem indicar rotina operacional ou politica de vencimento.",
        ],
    },
    vol_dia_semana: {
        objective: "Mostra o volume financeiro por dia da semana.",
        calculation: [
            "Reclassifica os movimentos diaros para o dia da semana correspondente.",
            "Soma os valores para comparar comportamento semanal.",
        ],
        dataSources: [
            "Movimentacoes diarias consolidadas.",
        ],
        interpretation: [
            "Ajuda a identificar padroes de operacao e carga ao longo da semana.",
            "Pode ser util para planejar equipe, cobranca ou rotina de pagamentos.",
        ],
    },
    liq_empresa: {
        objective: "Compara a liquidez por empresa, filial ou unidade.",
        calculation: [
            "Agrupa os indicadores de liquidez pela entidade organizacional retornada.",
            "Compara o indice calculado entre as unidades.",
        ],
        dataSources: [
            "Indicadores de liquidez por empresa ou filial.",
        ],
        interpretation: [
            "Mostra quais unidades sustentam melhor seu proprio ciclo de caixa.",
            "Unidades com liquidez baixa merecem leitura junto de receber, pagar e saldo acumulado.",
        ],
    },
    fluxo_diario_proj: {
        objective: "Mostra a projecao diaria do caixa no curto prazo.",
        calculation: [
            "Evolui o saldo dia a dia usando a agenda prevista de entradas e saidas.",
            "Permite ver os pontos de maior tensao ou folga no horizonte futuro.",
        ],
        dataSources: [
            "Fluxo diario projetado do dashboard avancado.",
        ],
        interpretation: [
            "Ideal para identificar dias criticos antes que o problema aconteca.",
            "Use em conjunto com top contas e curva de vencimento.",
        ],
    },
    vol_cpf_cnpj: {
        objective: "Mostra o volume financeiro por documento identificador.",
        calculation: [
            "Agrupa os movimentos pelo CPF ou CNPJ relacionado.",
            "Soma os valores para identificar concentracoes relevantes.",
        ],
        dataSources: [
            "Movimentacoes consolidadas por documento fiscal.",
        ],
        interpretation: [
            "Ajuda a detectar concentracao em poucos grupos economicos.",
            "Pode revelar clientes ou fornecedores relacionados operando com multiplos cadastros.",
        ],
    },
    saldo_acumulado: {
        objective: "Mostra a trajetoria acumulada do saldo ao longo do periodo.",
        calculation: [
            "Ordena os movimentos por data.",
            "Acumula o saldo progressivamente para mostrar a curva da saude do caixa.",
        ],
        dataSources: [
            "Evolucao diaria de saldo acumulado.",
        ],
        interpretation: [
            "Quedas prolongadas sugerem consumo de caixa acima da reposicao.",
            "Recuperacoes sustentadas sinalizam melhora de equilibrio financeiro.",
        ],
    },
    dist_faixa_prazo: {
        objective: "Mostra a distribuicao dos documentos por faixa de prazo ate o vencimento.",
        calculation: [
            "Classifica os documentos conforme a distancia para o vencimento.",
            "Consolida a carteira dentro de cada faixa temporal.",
        ],
        dataSources: [
            "Titulos com informacao de vencimento.",
        ],
        interpretation: [
            "Ajuda a enxergar o perfil temporal da carteira.",
            "Concentracao em janelas curtas pode gerar pressao operacional e de caixa.",
        ],
    },
    pm_rec_cli: {
        objective: "Mostra o prazo medio de recebimento por cliente.",
        calculation: [
            "Calcula o tempo medio entre emissao e recebimento por cliente.",
            "Ordena os clientes conforme o prazo observado.",
        ],
        dataSources: [
            "Historico de documentos e recebimentos por cliente.",
        ],
        interpretation: [
            "Clientes com prazo alto tendem a alongar o ciclo de caixa.",
            "Compare com ticket medio e inadimplencia para avaliar risco.",
        ],
    },
    pm_pag_for: {
        objective: "Mostra o prazo medio de pagamento por fornecedor.",
        calculation: [
            "Calcula o tempo medio entre obrigacao e pagamento para cada fornecedor.",
            "Compara os fornecedores com maior impacto no ciclo de caixa.",
        ],
        dataSources: [
            "Historico de pagamentos por fornecedor.",
        ],
        interpretation: [
            "Prazos maiores podem aliviar o caixa, desde que sustentaveis comercialmente.",
            "Vale cruzar com concentracao por fornecedor e top contas.",
        ],
    },
    tm_rec_cli: {
        objective: "Mostra o ticket medio por cliente.",
        calculation: [
            "Divide o volume total pelo numero de documentos de cada cliente.",
            "Compara o valor medio operacional entre clientes.",
        ],
        dataSources: [
            "Documentos e volume financeiro por cliente.",
        ],
        interpretation: [
            "Ajuda a diferenciar clientes de alto volume por recorrencia versus valor medio.",
            "Tickets altos com pouca pulverizacao elevam risco de concentracao.",
        ],
    },
    tm_pag_for: {
        objective: "Mostra o ticket medio por fornecedor.",
        calculation: [
            "Divide o volume total pelo numero de documentos por fornecedor.",
            "Compara o valor medio das operacoes com cada parceiro.",
        ],
        dataSources: [
            "Documentos e volume financeiro por fornecedor.",
        ],
        interpretation: [
            "Ajuda a entender perfil de compra e concentracao operacional.",
            "Fornecedores com ticket alto pedem acompanhamento mais proximo.",
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
            "Separa clientes de alta recorrencia de clientes de alto valor pontual.",
            "Use junto com ticket medio e prazo medio para leitura mais completa.",
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
            "Ajuda a entender recorrencia operacional com cada parceiro.",
            "Fornecedores com muitos documentos podem demandar revisao de processo ou negociacao.",
        ],
    },
};

export function getChartDetail(id: string, title: string, description?: string): ChartDetail {
    const detail = DETAILS[id];
    if (detail) return detail;

    return {
        objective: description || `Explica o objetivo e a leitura do grafico ${title}.`,
        calculation: [
            "Usa os dados consolidados do periodo filtrado para montar a visualizacao.",
            "Agrupa, soma ou compara os registros conforme o tipo do grafico selecionado.",
        ],
        dataSources: [
            "Dados financeiros retornados pelo dashboard avancado para o tenant logado.",
        ],
        interpretation: [
            "Use a visualizacao para localizar concentracoes, tendencia e desvios.",
            "Se algo parecer fora do esperado, compare com os demais graficos do mesmo grupo.",
        ],
    };
}

