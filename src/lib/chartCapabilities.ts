export type FinanceChartDimension = "empresa" | "cliente" | "fornecedor";

export type ChartCapabilities = {
    supportsPeriod: true;
    dimensions?: FinanceChartDimension[];
    supportsDrilldown?: boolean;
    supportsExport?: boolean;
};

export const chartCapabilities: Record<string, ChartCapabilities> = {
    // Entity-filterable charts (analysis view)
    liq_empresa: { supportsPeriod: true, dimensions: ["empresa"], supportsExport: true },
    dist_rec_cliente: { supportsPeriod: true, dimensions: ["cliente"], supportsDrilldown: true, supportsExport: true },
    pm_rec_cli: { supportsPeriod: true, dimensions: ["cliente"], supportsExport: true },
    tm_rec_cli: { supportsPeriod: true, dimensions: ["cliente"], supportsExport: true },
    docs_cli: { supportsPeriod: true, dimensions: ["cliente"], supportsExport: true, supportsDrilldown: true },

    dist_pag_fornecedor: { supportsPeriod: true, dimensions: ["fornecedor"], supportsDrilldown: true, supportsExport: true },
    pm_pag_for: { supportsPeriod: true, dimensions: ["fornecedor"], supportsExport: true },
    tm_pag_for: { supportsPeriod: true, dimensions: ["fornecedor"], supportsExport: true },
    docs_for: { supportsPeriod: true, dimensions: ["fornecedor"], supportsExport: true, supportsDrilldown: true },

    // Drilldown MVP list from ChartAnalysisView
    dist_tipo_pag: { supportsPeriod: true, supportsDrilldown: true, supportsExport: true },
    dist_cond_pag: { supportsPeriod: true, supportsDrilldown: true, supportsExport: true },
    aging: { supportsPeriod: true, supportsDrilldown: true, supportsExport: true },
    dist_faixa_prazo: { supportsPeriod: true, supportsDrilldown: true, supportsExport: true },
    geo_pagar: { supportsPeriod: true, supportsDrilldown: true, supportsExport: true },
    geo_receber: { supportsPeriod: true, supportsDrilldown: true, supportsExport: true },
    top_pag: { supportsPeriod: true, supportsDrilldown: true, supportsExport: true },
    top_rec: { supportsPeriod: true, supportsDrilldown: true, supportsExport: true },
};

export function getChartCapabilities(chartId: string): ChartCapabilities {
    return chartCapabilities[chartId] ?? { supportsPeriod: true };
}

