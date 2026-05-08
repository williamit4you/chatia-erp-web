"use client";

type MapLoadingStateProps = {
    svgPaths: string[];
    viewBoxWidth: number;
    viewBoxHeight: number;
    accentColor?: string;
    displayMode?: "default" | "detail";
    label?: string;
};

export default function MapLoadingState({
    svgPaths,
    viewBoxWidth,
    viewBoxHeight,
    accentColor = "#f97316",
    displayMode = "default",
    label = "Carregando mapa",
}: MapLoadingStateProps) {
    const isDetailMode = displayMode === "detail";

    return (
        <div
            className={`grid w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-[radial-gradient(circle_at_top_left,rgba(255,237,213,0.9),transparent_38%),linear-gradient(180deg,#fff7ed,#ffffff)] ${
                isDetailMode ? "h-[260px] grid-cols-[minmax(0,1fr)_72px] gap-3 p-4" : "h-[300px] grid-cols-[minmax(0,1fr)_92px] gap-4 p-5"
            }`}
        >
            <div className="relative min-w-0 overflow-hidden rounded-[20px] border border-orange-100/80 bg-white/80">
                <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.15)_30%,rgba(255,255,255,0.75)_45%,rgba(255,255,255,0.15)_60%,transparent_100%)]" />
                <div className="absolute left-3 top-3 rounded-full border border-orange-200/80 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-orange-700 shadow-sm">
                    {label}
                </div>
                <div className="absolute inset-x-4 bottom-4 flex items-end gap-2">
                    {[0.45, 0.7, 0.55, 0.82, 0.6].map((height, index) => (
                        <div
                            key={index}
                            className="flex-1 rounded-full bg-gradient-to-t from-orange-200 via-amber-100 to-white/80 animate-pulse"
                            style={{ height: `${Math.round(height * 42)}px`, animationDelay: `${index * 140}ms` }}
                        />
                    ))}
                </div>
                <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="relative z-[1] h-full w-full p-4 opacity-90" aria-hidden="true">
                    <g>
                        {svgPaths.map((path, index) => (
                            <path
                                key={`${index}-${path.slice(0, 12)}`}
                                d={path}
                                fill={index % 3 === 0 ? "#fed7aa" : index % 3 === 1 ? "#fdba74" : "#ffedd5"}
                                stroke="#ffffff"
                                strokeWidth={1}
                                className="animate-pulse"
                                style={{ animationDelay: `${index * 45}ms` }}
                            />
                        ))}
                    </g>
                </svg>
            </div>

            <div className={`flex flex-col items-center justify-center font-bold text-neutral-500 ${isDetailMode ? "gap-1.5 text-[9px]" : "gap-2 text-[10px]"}`}>
                <span className="text-center">Intensidade</span>
                <div className={`${isDetailMode ? "h-20 w-4" : "h-24 w-5"} overflow-hidden rounded-full bg-neutral-100`}>
                    <div className="h-full w-full animate-pulse" style={{ background: `linear-gradient(180deg, ${accentColor} 0%, #fb923c 38%, #fdba74 68%, #ffedd5 100%)` }} />
                </div>
                <span className="text-center text-neutral-400">processando</span>
            </div>
        </div>
    );
}
