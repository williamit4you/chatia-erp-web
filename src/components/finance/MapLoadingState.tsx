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
            className={`grid w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),rgba(248,250,252,0.94)),linear-gradient(180deg,#ffffff,#fafaf9)] ${
                isDetailMode ? "h-[260px] grid-cols-[minmax(0,1fr)_72px] gap-3 p-4" : "h-[300px] grid-cols-[minmax(0,1fr)_92px] gap-4 p-5"
            }`}
        >
            <div className="relative min-w-0 overflow-hidden rounded-[20px] border border-neutral-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))]">
                <div className="absolute inset-0 animate-pulse bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0)_28%,rgba(255,255,255,0.85)_44%,rgba(255,255,255,0)_58%,transparent_100%)]" />
                <div className="absolute left-3 top-3 rounded-full border border-neutral-200 bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-neutral-600 shadow-sm">
                    {label}
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-bold text-neutral-500 shadow-sm ring-1 ring-neutral-200/80">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-45" style={{ backgroundColor: accentColor }} />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                    </span>
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-300 opacity-45 [animation-delay:180ms]" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neutral-300" />
                    </span>
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-200 opacity-45 [animation-delay:360ms]" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neutral-200" />
                    </span>
                    Processando distribuicao
                </div>
                <div className="relative z-[1] flex h-full items-center justify-center p-4">
                    <svg
                        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                        className="block h-auto w-auto max-h-full max-w-full opacity-80"
                        aria-hidden="true"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <g>
                            {svgPaths.map((path, index) => (
                                <path
                                    key={`${index}-${path.slice(0, 12)}`}
                                    d={path}
                                    fill={index % 3 === 0 ? "#f5f5f4" : index % 3 === 1 ? "#e7e5e4" : "#fafaf9"}
                                    stroke="#d6d3d1"
                                    strokeWidth={0.9}
                                    className="animate-pulse"
                                    style={{ animationDelay: `${index * 45}ms` }}
                                />
                            ))}
                        </g>
                    </svg>
                </div>
            </div>

            <div className={`flex flex-col items-center justify-center font-bold text-neutral-500 ${isDetailMode ? "gap-1.5 text-[9px]" : "gap-2 text-[10px]"}`}>
                <span className="text-center">Escala</span>
                <div className={`${isDetailMode ? "h-20 w-4" : "h-24 w-5"} overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-200`}>
                    <div className="h-full w-full animate-pulse" style={{ background: `linear-gradient(180deg, ${accentColor} 0%, #fb923c 40%, #fdba74 72%, #fff7ed 100%)` }} />
                </div>
                <span className="text-center text-neutral-400">aguarde</span>
            </div>
        </div>
    );
}
