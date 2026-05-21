import apiClient from "@/lib/api-client";

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

export type SalesBudgetCategory = {
  id: string;
  name: string;
  description: string;
  plannedCount: number;
  availableNowCount: number;
  needsNewViewCount: number;
  color?: string;
  highlights: SalesBudgetChartPreview[];
};

export type SalesBudgetCatalogResponse = {
  categories: SalesBudgetCategory[];
};

export type SalesBudgetFilter = {
  startDate?: string;
  endDate?: string;
};

export type SalesBudgetKpiItem = {
  kpiId: string;
  label: string;
  value?: number | null;
  textValue?: string | null;
  format: "currency" | "number" | "percentage" | "text" | string;
  warning?: string | null;
};

export type SalesBudgetKpiResponse = {
  items: SalesBudgetKpiItem[];
};

export type SalesBudgetChartPoint = {
  label: string;
  value?: number | null;
  amount?: number | null;
  count?: number | null;
  percentage?: number | null;
  date?: string | null;
};

export type SalesBudgetChartMeta = {
  source: string;
  dateField: string;
  generatedAt: string;
  warnings: string[];
};

export type SalesBudgetChartDataset = {
  chartId: string;
  title: string;
  visualization: string;
  data: SalesBudgetChartPoint[];
  totals: Record<string, number>;
  meta: SalesBudgetChartMeta;
};

export type SalesBudgetChartBatchResponse = {
  items: SalesBudgetChartDataset[];
};

export type SalesBudgetChartQueryDetailsItem = {
  chartId: string;
  sqlQueries: string[];
  rules: string[];
};

export type SalesBudgetChartQueryDetailsResponse = {
  items: SalesBudgetChartQueryDetailsItem[];
};

const normalizeFilter = (filters?: SalesBudgetFilter) => ({
  startDate: filters?.startDate ? new Date(filters.startDate).toISOString() : null,
  endDate: filters?.endDate ? new Date(filters.endDate).toISOString() : null,
});

export const salesBudgetAnalyticsService = {
  getCatalog: async (): Promise<SalesBudgetCatalogResponse> => {
    const response = await apiClient.get("/api/sales-budget-analytics/catalog");
    return response.data;
  },

  getKpis: async (params?: {
    filters?: SalesBudgetFilter;
    kpiIds?: string[];
  }): Promise<SalesBudgetKpiResponse> => {
    const response = await apiClient.post("/api/sales-budget-analytics/kpis", {
      filters: normalizeFilter(params?.filters),
      kpiIds: params?.kpiIds ?? null,
    });
    return response.data;
  },

  getChartsBatch: async (params: {
    chartIds: string[];
    filters?: SalesBudgetFilter;
  }): Promise<SalesBudgetChartBatchResponse> => {
    const response = await apiClient.post("/api/sales-budget-analytics/charts/batch", {
      chartIds: params.chartIds,
      filters: normalizeFilter(params.filters),
    });
    return response.data;
  },

  getChartQueryDetails: async (params: {
    chartIds: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<SalesBudgetChartQueryDetailsResponse> => {
    const response = await apiClient.post("/api/sales-budget-analytics/chart-query-details", {
      chartIds: params.chartIds,
      startDate: params.startDate ? new Date(params.startDate).toISOString() : null,
      endDate: params.endDate ? new Date(params.endDate).toISOString() : null,
    });
    return response.data;
  },

  analyzeChart: async (params: { 
    message: string; 
    history: { role: string; content: string }[]; 
    chartId: string; 
    chartTitle: string; 
    chartDescription: string; 
    chartData: any;
    startDate?: string;
    endDate?: string;
    sessionId?: string;
  }): Promise<{
    reply: string;
    sessionId: string;
    sqlQueries?: string;
    contextUsageScore?: number;
    exportId?: string;
    exportTotalLinhas?: number;
    exportValorTotal?: number;
    metricsTotalLinhas?: number;
    metricsValorTotal?: number;
  }> => {
    const response = await apiClient.post('/api/chat/analyze-chart', params);
    return response.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/api/chat/sessions/${sessionId}`);
  },

  getSessions: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/chat/sessions');
    return response.data;
  }
};

export default salesBudgetAnalyticsService;
