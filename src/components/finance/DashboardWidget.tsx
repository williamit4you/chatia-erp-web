import { ReactNode, forwardRef } from "react";
import { BookOpenText, X, Search } from "lucide-react";
import type { ChartMetricsItem } from "@/services/finance-analytics.service";
import { formatPercent } from "@/lib/formatters/financeFormat";

interface DashboardWidgetProps {
    id: string;
    title: string;
    children: ReactNode;
    onRemove?: (id: string) => void;
    onAnalyze?: (id: string) => void;
    onDetails?: (id: string) => void;
    showControls?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onTouchEnd?: React.TouchEventHandler;
    metrics?: ChartMetricsItem | null;
}

const DashboardWidget = forwardRef<HTMLDivElement, DashboardWidgetProps>(
    ({ id, title, children, onRemove, onAnalyze, onDetails, showControls = false, className, style, onMouseDown, onMouseUp, onTouchEnd, metrics }, ref) => {
        const deltaPct = metrics?.deltaPct ?? null;
        const direction = metrics?.direction ?? "flat";
        const showDelta = deltaPct !== null && Number.isFinite(deltaPct);
        const deltaColor =
            direction === "up" ? "text-emerald-700" : direction === "down" ? "text-red-700" : "text-neutral-500";
        const deltaArrow = direction === "up" ? "▲" : direction === "down" ? "▼" : "•";

        return (
            <div
                ref={ref}
                className={`group relative h-full bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col ${className || ''}`}
                style={style}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onTouchEnd={onTouchEnd}
            >
                {/* Header Area */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-50">
                    <div className="flex items-center gap-2">
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-neutral-700 truncate">{title}</h3>
                            {showDelta ? (
                                <div className={`text-[10px] font-black uppercase tracking-wider ${deltaColor}`}>
                                    {deltaArrow} {formatPercent(deltaPct, { maximumFractionDigits: 0 })} <span className="font-bold normal-case tracking-normal text-neutral-400">vs per. anterior</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {!showControls && onDetails && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDetails(id);
                                }}
                                className="p-1 hover:bg-blue-50 rounded text-neutral-400 hover:text-blue-600 transition-colors"
                                title="Entender este gráfico"
                            >
                                <BookOpenText className="w-4 h-4" />
                            </button>
                        )}
                        {!showControls && onAnalyze && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAnalyze(id);
                                }}
                                className="p-1 hover:bg-indigo-50 rounded text-neutral-400 hover:text-indigo-600 transition-colors"
                                title="Analisar com IA"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        )}
                        {showControls && onRemove && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(id);
                                }}
                                className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-0 flex-1 overflow-hidden">
                    {children}
                </div>
            </div>
        );
    }
);

DashboardWidget.displayName = "DashboardWidget";

export default DashboardWidget;

