import type { DashboardThemeKey } from "@/components/finance/dashboardThemes";
import { dashboardThemes } from "@/components/finance/dashboardThemes";

export type SemanticTone = "positive" | "negative" | "neutral" | "warning" | "info";

export const semanticColors: Record<SemanticTone, string> = {
    positive: "#16a34a", // green-600
    negative: "#ef4444", // red-500
    warning: "#f59e0b", // amber-500
    info: "#2563eb", // blue-600
    neutral: "#64748b", // slate-500
};

// Theme-level colors that do not necessarily map 1:1 to semantic tones.
export const payableColors = {
    outflow: "#f97316", // orange-500 (pagar)
};

export function getSemanticColor(tone: SemanticTone): string {
    return semanticColors[tone];
}

export function getThemePalette(themeKey: DashboardThemeKey): string[] {
    return dashboardThemes[themeKey]?.chartPalette ?? dashboardThemes.general.chartPalette;
}

export function getSeriesColor(params: { themeKey: DashboardThemeKey; tone?: SemanticTone; index?: number }): string {
    if (params.tone) return getSemanticColor(params.tone);
    const palette = getThemePalette(params.themeKey);
    const index = params.index ?? 0;
    return palette[index % palette.length];
}
