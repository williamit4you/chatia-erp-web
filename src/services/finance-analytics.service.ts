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
}

export interface AdvancedDashboard {
    aging: Aging[];
    geografico: Geographic[];
    distribuicaoReceber: Distribution[];
    performanceRecebimento: Performance[];
    previsaoCaixa: CashProjection[];
    saudeFinanceira: FinancialHealth;
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
