import { ReactNode, forwardRef } from "react";
import { BookOpenText, X, Search } from "lucide-react";

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
}

const DashboardWidget = forwardRef<HTMLDivElement, DashboardWidgetProps>(
    ({ id, title, children, onRemove, onAnalyze, onDetails, showControls = false, className, style, onMouseDown, onMouseUp, onTouchEnd }, ref) => {
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
                        <h3 className="text-sm font-bold text-neutral-700 truncate">{title}</h3>
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

