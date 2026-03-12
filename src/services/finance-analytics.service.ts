import apiClient from "@/lib/api-client";

export interface FinanceSummary {
    totalContasPagarAberto: number;
    totalContasReceberAberto: number;
    totalPago: number;
    totalRecebido: number;
    saldoProjetado: number;
}

export interface MonthlyFlow {
    mes: string;
    valoresRecebidos: number;
    valoresPagos: number;
    valoresAVencer: number;
}

export interface TopDebtor {
    cliente: string;
    valorTotalEmAberto: number;
    quantidadeParcelas: number;
}

export interface AiAnalysisData {
    totalReceberAberto: number;
    totalPagarAberto: number;
    totalRecebidoMes: number;
    totalPagoMes: number;
    topDevedores: TopDebtor[];
}

export interface Aging {
    faixa: string;
    valor: number;
}

export interface Geographic {
    local: string;
    valor: number;
}

export interface Distribution {
    label: string;
    valor: number;
    percentual: number;
}

export interface Performance {
    categoria: string;
    valor: number;
}

export interface BalancePoint {
    data: string;
    valor: number;
    saldoAcumulado: number;
}

export interface CashProjection {
    data: string;
    saldoPrevisto: number;
    recebimentos: number;
    pagamentos: number;
}

export interface FinancialHealth {
    score: number;
    inadimplencia: number;
    dso: number;
    concentracaoReceita: number;
    prazoMedioPagamento: number;
    prazoMedioRecebimento: number;
    ticketMedioPagamento: number;
    ticketMedioRecebimento: number;
    indiceLiquidezOperacional: number;

    // Novos KPIs Fase 2
    indiceCobertura: number;
    gapFinanceiro: number;
    saldoFinanceiro30Dias: number;
    percRecebidoNoPrazo: number;
    percPagoNoPrazo: number;
    diasMedioAtrasoReceber: number;
    diasMedioAtrasoPagar: number;
    indiceDependenciaCliente: number;
    indiceDependenciaFornecedor: number;
    rotacaoFinanceira: number;
    prazoMedioRestanteReceber: number;
    prazoMedioRestantePagar: number;
    percParcelasAtraso: number;
    valorMedioCliente: number;
    valorMedioFornecedor: number;
    indiceLiquidacaoDocumentos: number;
    concentracaoTop5Clientes: number;
    concentracaoTop5Fornecedores: number;
    crescimentoRecebimentos: number;
    crescimentoPagamentos: number;
    percContasProximoVencimento: number;
    mediaDiasEmissaoVencimento: number;
    valorMedioParcelamento: number;

    // Phase 3
    percRecebimentoAntecipado: number;
    percPagamentoAntecipado: number;
    tempoMedioEmissaoPagamento: number;
    percDocumentosParcelados: number;
    mediaParcelasPorDocumento: number;
    percRecebimentos7Dias: number;
    tempoMedioRestanteVencimento: number;
}

export interface MonthlyEvolution {
    ano: number;
    mes: number;
    valor: number;
    mesAno: string;
}

export interface TopAccount {
    documento: string;
    valor: number;
}

export interface AdvancedDashboard {
    aging: Aging[];
    geografico: Geographic[];
    distribuicaoReceber: Distribution[];
    performanceRecebimento: Performance[];
    previsaoCaixa: CashProjection[];
    saudeFinanceira: FinancialHealth;
    evolucaoSaldo: BalancePoint[];
    
    distribuicaoPagarFornecedor: Distribution[];
    distribuicaoReceberCliente: Distribution[];
    geograficoPagar: Geographic[];
    geograficoReceber: Geographic[];
    distribuicaoTipoPagamento: Distribution[];
    distribuicaoCondicaoPagamento: Distribution[];
    evolucaoMensalPagamento: MonthlyEvolution[];
    evolucaoMensalRecebimento: MonthlyEvolution[];
    curvaVencimentoPagar: MonthlyEvolution[];
    curvaVencimentoReceber: MonthlyEvolution[];
    topContasPagar: TopAccount[];
    topContasReceber: TopAccount[];
    distribuicaoFaixaValorPagar: Distribution[];
    distribuicaoFaixaValorReceber: Distribution[];

    // Novas Coleções Fase 2
    volumePorDia: Distribution[];
    indiceLiquidezPorEmpresa: Distribution[];
    fluxoCaixaDiarioProjetado: MonthlyEvolution[];
    volumePorCpfCnpj: Distribution[];
    distribuicaoFaixaPrazoVencimento: Distribution[];

    // Phase 3
    prazoMedioRecebimentoPorCliente: Distribution[];
    prazoMedioPagamentoPorFornecedor: Distribution[];
    ticketMedioPorCliente: Distribution[];
    ticketMedioPorFornecedor: Distribution[];
    documentosPorClienteAtivo: Distribution[];
    documentosPorFornecedorAtivo: Distribution[];
}

const buildQueryParams = (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
};

export const financeAnalyticsService = {
    getSummary: async (startDate?: string, endDate?: string): Promise<FinanceSummary> => {
        const response = await apiClient.get(`/api/finance-analytics/summary${buildQueryParams(startDate, endDate)}`);
        return response.data;
    },

    getMonthlyFlow: async (startDate?: string, endDate?: string): Promise<MonthlyFlow[]> => {
        const response = await apiClient.get(`/api/finance-analytics/monthly-flow${buildQueryParams(startDate, endDate)}`);
        return response.data;
    },

    getTopDebtors: async (startDate?: string, endDate?: string): Promise<TopDebtor[]> => {
        const response = await apiClient.get(`/api/finance-analytics/top-debtors${buildQueryParams(startDate, endDate)}`);
        return response.data;
    },

    getAiAnalysisData: async (startDate?: string, endDate?: string): Promise<AiAnalysisData> => {
        const response = await apiClient.get(`/api/finance-analytics/ai-analysis${buildQueryParams(startDate, endDate)}`);
        return response.data;
    },

    getAdvancedAnalytics: async (startDate?: string, endDate?: string): Promise<AdvancedDashboard> => {
        const response = await apiClient.get(`/api/finance-analytics/advanced-analytics${buildQueryParams(startDate, endDate)}`);
        return response.data;
    }
};

export default financeAnalyticsService;
