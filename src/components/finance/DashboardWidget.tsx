import { ReactNode, forwardRef } from "react";
import { X, GripVertical } from "lucide-react";

interface DashboardWidgetProps {
    id: string;
    title: string;
    children: ReactNode;
    onRemove?: (id: string) => void;
    showControls?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onTouchEnd?: React.TouchEventHandler;
}

const DashboardWidget = forwardRef<HTMLDivElement, DashboardWidgetProps>(
    ({ id, title, children, onRemove, showControls = false, className, style, onMouseDown, onMouseUp, onTouchEnd }, ref) => {
        return (
            <div
                ref={ref}
                className={`group relative h-full bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col ${className || ''}`}
                style={style}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onTouchEnd={onTouchEnd}
            >
                {/* Header/Drag Handle Area */}
                <div className={`flex items-center justify-between px-4 py-2 border-b border-neutral-50 ${showControls ? 'cursor-grab active:cursor-grabbing' : ''} drag-handle`}>
                    <div className="flex items-center gap-2">
                        {showControls && <GripVertical className="w-4 h-4 text-neutral-400 shrink-0" />}
                        <h3 className="text-sm font-bold text-neutral-700 truncate">{title}</h3>
                    </div>
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

                {/* Content Area */}
                <div className="flex-1 overflow-auto">
                    {children}
                </div>

                {/* Resize Handle Hint (Optional Visual) */}
                {showControls && (
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-neutral-300 pointer-events-none"></div>
                )}
            </div>
        );
    }
);

DashboardWidget.displayName = "DashboardWidget";

export default DashboardWidget;

