import { ReactNode } from "react";

type SectionGridVariant = "cards" | "charts" | "wide" | "compact" | "analysis";

interface SectionChartGridProps {
    children: ReactNode;
    variant?: SectionGridVariant;
}

const variantClasses: Record<SectionGridVariant, string> = {
    cards: "grid-cols-1",
    charts: "grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3",
    wide: "grid-cols-1 xl:grid-cols-2",
    compact: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
    analysis: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
};

export default function SectionChartGrid({ children, variant = "charts" }: SectionChartGridProps) {
    return (
        <div className={`grid gap-4 ${variantClasses[variant]}`}>
            {children}
        </div>
    );
}
