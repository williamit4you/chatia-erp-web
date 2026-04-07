export interface ChartHint {
    description: string;
    suggestedQuestions: string[];
}

export const CHART_HINTS: Record<string, ChartHint> = {
    'aging': {
        description: "Mostra a distribuição das contas em atraso por faixas de dias. Quanto mais à direita, mais crítica é a inadimplência e o tempo de espera pelo recurso.",
        suggestedQuestions: [
            "Qual a faixa de atraso mais crítica?",
            "Quais clientes estão na faixa de mais de 90 dias?",
            "Qual o valor total de inadimplência hoje?"
        ]
    },
    'flow': {
        description: "Compara os recebimentos versus pagamentos ao longo dos meses. A diferença entre as linhas indica se a empresa teve superávit ou déficit no período.",
        suggestedQuestions: [
            "Qual mês teve o maior déficit financeiro?",
            "Como está a tendência do fluxo para os próximos meses?",
            "Tivemos algum mês com saldo negativo?"
        ]
    },
    'projection': {
        description: "Projeta as entradas e saídas previstas para os próximos 30 dias, permitindo antecipar necessidades de caixa.",
        suggestedQuestions: [
            "Teremos saldo positivo nos próximos 30 dias?",
            "Qual a previsão de caixa para a próxima semana?",
            "Quais são os maiores pagamentos previstos no curto prazo?"
        ]
    },
    'top_pag': {
        description: "Lista os documentos com os maiores valores pendentes de pagamento. Foca nos títulos que mais impactam o seu caixa.",
        suggestedQuestions: [
            "Qual o total das 10 maiores contas listadas?",
            "Alguma dessas contas de alto valor está vencida?",
            "Pode detalhar o vencimento da maior conta?"
        ]
    },
    'top_rec': {
        description: "Lista os maiores valores a receber. Essencial para priorizar cobranças de alto impacto no fluxo de caixa.",
        suggestedQuestions: [
            "Qual o total listado nestes principais recebíveis?",
            "Algum destes clientes está com o pagamento em atraso?",
            "Detalhe os documentos do cliente com maior valor."
        ]
    },
    'evolucao_pag': {
        description: "Demonstra a curva das despesas pagas mês a mês, permitindo visualizar o crescimento ou redução dos custos operacionais.",
        suggestedQuestions: [
            "Qual foi o mês com maior volume de pagamentos?",
            "Os pagamentos estão apresentando tendência de crescimento?",
            "Qual o valor médio pago por mês no período?"
        ]
    },
    'evolucao_rec': {
        description: "Mostra a curva dos valores efetivamente recebidos. Essencial para identificar sazonalidade e épocas de maior entrada de recursos.",
        suggestedQuestions: [
            "Qual mês teve o melhor desempenho em recebimentos?",
            "Houve crescimento real em relação ao início do período?",
            "Compare o volume de recebimento com o mês anterior."
        ]
    },
    'dist_pag_fornecedor': {
        description: "Identifica a concentração de pagamentos por fornecedor. Útil para verificar dependência ou negociar prazos com parceiros estratégicos.",
        suggestedQuestions: [
            "Quem é o nosso maior fornecedor em valor?",
            "Quanto representam os 3 maiores fornecedores no total?",
            "Temos muita concentração de pagamentos em algum fornecedor?"
        ]
    },
    'dist_rec_cliente': {
        description: "Mostra como sua receita está distribuída entre os clientes, evidenciando onde está o maior volume de faturamento.",
        suggestedQuestions: [
            "Quem é o nosso cliente número 1 em faturamento?",
            "Existe uma concentração perigosa em poucos clientes?",
            "Qual o percentual que os top 5 clientes representam?"
        ]
    },
    'dist_tipo_pag': {
        description: "Analisa os métodos de pagamento mais utilizados, ajudando a entender as preferências de pagamento e custos de taxas.",
        suggestedQuestions: [
            "Qual a forma de pagamento predominante?",
            "Quanto o PIX representou proporcionalmente no período?",
            "Houve mudança nos meios de pagamento ao longo do tempo?"
        ]
    },
    'performance': {
        description: "Mede a pontualidade histórica dos recebimentos, dividindo entre o que foi pago no prazo e o que foi pago com atraso.",
        suggestedQuestions: [
            "Qual é o percentual de recebimento dentro do prazo?",
            "Qual o tempo médio de atraso nos recebimentos?",
            "Quem são os clientes mais pontuais?"
        ]
    },
    'saldo_acumulado': {
        description: "Demonstra o saldo disponível dia a dia, permitindo ver visualmente a 'saúde' do caixa ao longo do tempo.",
        suggestedQuestions: [
            "Em quais datas o saldo ficou mais baixo?",
            "Qual foi o saldo médio diário registrado?",
            "O saldo final do período é maior que o inicial?"
        ]
    },
    'kpis': {
        description: "Visão consolidada dos principais indicadores de performance financeira (KPIs), como Score, DSO e Prazos Médios.",
        suggestedQuestions: [
            "Como está o nosso Score de saúde financeira?",
            "O que o nosso DSO atual indica sobre a cobrança?",
            "Nossos prazos de pagamento estão maiores que os de recebimento?"
        ]
    }
};

export const getChartHint = (id: string): ChartHint => {
    return CHART_HINTS[id] || {
        description: "Esta análise permite visualizar o comportamento dos dados financeiros através deste indicador.",
        suggestedQuestions: [
            "O que este gráfico representa?",
            "Como posso interpretar estes dados?",
            "Existem tendências relevantes aqui?"
        ]
    };
};
