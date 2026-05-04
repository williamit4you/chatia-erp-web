export type DashboardThemeKey =
    | "general"
    | "payable"
    | "receivable"
    | "cashflow"
    | "analysis"
    | "efficiency";

export type DashboardTheme = {
    key: DashboardThemeKey;
    badgeClassName: string;
    sectionClassName: string;
    headerClassName: string;
    titleClassName: string;
    dotClassName: string;
    chartPalette: string[];
    primary: string;
    strong: string;
};

export const dashboardThemes: Record<DashboardThemeKey, DashboardTheme> = {
    general: {
        key: "general",
        badgeClassName: "bg-blue-600 text-white",
        sectionClassName: "border-blue-200 bg-blue-50/35",
        headerClassName: "border-blue-200",
        titleClassName: "text-blue-900",
        dotClassName: "bg-blue-600",
        chartPalette: ["#2563eb", "#10b981", "#f59e0b", "#64748b", "#06b6d4"],
        primary: "#2563eb",
        strong: "#1d4ed8",
    },
    payable: {
        key: "payable",
        badgeClassName: "bg-orange-600 text-white",
        sectionClassName: "border-orange-200 bg-orange-50/45",
        headerClassName: "border-orange-200",
        titleClassName: "text-orange-900",
        dotClassName: "bg-orange-600",
        chartPalette: ["#f97316", "#ea580c", "#fb923c", "#f59e0b", "#fdba74"],
        primary: "#f97316",
        strong: "#ea580c",
    },
    receivable: {
        key: "receivable",
        badgeClassName: "bg-green-600 text-white",
        sectionClassName: "border-green-200 bg-green-50/45",
        headerClassName: "border-green-200",
        titleClassName: "text-green-900",
        dotClassName: "bg-green-600",
        chartPalette: ["#16a34a", "#22c55e", "#86efac", "#0f766e", "#10b981"],
        primary: "#16a34a",
        strong: "#15803d",
    },
    cashflow: {
        key: "cashflow",
        badgeClassName: "bg-blue-700 text-white",
        sectionClassName: "border-blue-200 bg-sky-50/45",
        headerClassName: "border-blue-200",
        titleClassName: "text-blue-950",
        dotClassName: "bg-blue-700",
        chartPalette: ["#2563eb", "#0ea5e9", "#38bdf8", "#64748b", "#0891b2"],
        primary: "#2563eb",
        strong: "#1d4ed8",
    },
    analysis: {
        key: "analysis",
        badgeClassName: "bg-violet-600 text-white",
        sectionClassName: "border-violet-200 bg-violet-50/45",
        headerClassName: "border-violet-200",
        titleClassName: "text-violet-950",
        dotClassName: "bg-violet-600",
        chartPalette: ["#7c3aed", "#8b5cf6", "#a78bfa", "#6d28d9", "#c4b5fd"],
        primary: "#7c3aed",
        strong: "#6d28d9",
    },
    efficiency: {
        key: "efficiency",
        badgeClassName: "bg-yellow-700 text-white",
        sectionClassName: "border-yellow-300 bg-yellow-50/60",
        headerClassName: "border-yellow-300",
        titleClassName: "text-yellow-950",
        dotClassName: "bg-yellow-700",
        chartPalette: ["#ca8a04", "#a16207", "#eab308", "#facc15", "#854d0e"],
        primary: "#ca8a04",
        strong: "#a16207",
    },
};

