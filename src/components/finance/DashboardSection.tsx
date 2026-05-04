import { ReactNode } from "react";
import { dashboardThemes, DashboardThemeKey } from "./dashboardThemes";

interface DashboardSectionProps {
    number: number;
    title: string;
    description?: string;
    theme: DashboardThemeKey;
    children: ReactNode;
}

export default function DashboardSection({ number, title, description, theme, children }: DashboardSectionProps) {
    const currentTheme = dashboardThemes[theme];

    return (
        <section className={`rounded-2xl border shadow-sm overflow-hidden ${currentTheme.sectionClassName}`}>
            <div className={`flex flex-col gap-2 border-b bg-white/80 px-4 py-3 sm:px-5 ${currentTheme.headerClassName}`}>
                <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-black ${currentTheme.badgeClassName}`}>
                        {number}. VISAO
                    </span>
                    <div className={`h-2 w-2 rounded-full ${currentTheme.dotClassName}`} />
                    <h2 className={`text-base font-black uppercase tracking-tight sm:text-lg ${currentTheme.titleClassName}`}>
                        {title}
                    </h2>
                </div>
                {description && (
                    <p className="text-xs font-medium text-neutral-500 sm:text-sm">
                        {description}
                    </p>
                )}
            </div>
            <div className="p-4 sm:p-5">
                {children}
            </div>
        </section>
    );
}

