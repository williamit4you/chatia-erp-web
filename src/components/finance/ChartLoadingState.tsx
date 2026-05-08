"use client";

type ChartLoadingVariant = "bar" | "line" | "pie";

type ChartLoadingStateProps = {
    heightClass?: string;
    variant?: ChartLoadingVariant;
    title?: string;
};

function LoadingDots({ accent = "bg-indigo-500" }: { accent?: string }) {
    return (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-bold text-neutral-500 shadow-sm ring-1 ring-neutral-200/80">
            <span className="relative flex h-2.5 w-2.5">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-45 ${accent}`} />
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${accent}`} />
            </span>
            <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-300 opacity-45 [animation-delay:180ms]" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neutral-300" />
            </span>
            <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-200 opacity-45 [animation-delay:360ms]" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neutral-200" />
            </span>
            Carregando grafico
        </div>
    );
}

function BarSkeleton() {
    return (
        <div className="flex h-full items-end gap-4 px-6 pb-8 pt-10">
            {[0.35, 0.72, 0.5, 0.86, 0.62, 0.44].map((height, index) => (
                <div key={index} className="flex flex-1 flex-col justify-end gap-2">
                    <div className="w-full rounded-t-2xl bg-gradient-to-t from-indigo-200 via-indigo-100 to-white/90 animate-pulse" style={{ height: `${Math.round(height * 140)}px`, animationDelay: `${index * 80}ms` }} />
                    <div className="mx-auto h-2 w-10 rounded-full bg-neutral-200" />
                </div>
            ))}
        </div>
    );
}

function LineSkeleton() {
    return (
        <div className="relative h-full w-full overflow-hidden px-5 pb-8 pt-10">
            <div className="absolute inset-x-5 top-12 grid gap-10">
                {[0, 1, 2].map((row) => (
                    <div key={row} className="h-px w-full border-t border-dashed border-neutral-200" />
                ))}
            </div>
            <svg viewBox="0 0 320 180" className="h-full w-full">
                <defs>
                    <linearGradient id="loadingLineFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
                <path d="M18 132 C42 126, 55 94, 82 98 S128 146, 158 118 S214 46, 242 62 S286 98, 304 38" fill="none" stroke="#818cf8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
                <path d="M18 180 L18 132 C42 126, 55 94, 82 98 S128 146, 158 118 S214 46, 242 62 S286 98, 304 38 L304 180 Z" fill="url(#loadingLineFill)" className="animate-pulse" />
                {[18, 82, 158, 242, 304].map((cx, index) => (
                    <circle key={cx} cx={cx} cy={[132, 98, 118, 62, 38][index]} r="6" fill="#6366f1" className="animate-pulse" style={{ animationDelay: `${index * 100}ms` }} />
                ))}
            </svg>
        </div>
    );
}

function PieSkeleton() {
    return (
        <div className="flex h-full items-center justify-center gap-8 px-6 py-6">
            <div className="relative h-44 w-44 shrink-0 rounded-full bg-[conic-gradient(#818cf8_0_35%,#a5b4fc_35%_58%,#c7d2fe_58%_76%,#e0e7ff_76%_100%)] animate-pulse">
                <div className="absolute inset-[26px] rounded-full bg-white" />
                <div className="absolute inset-0 flex items-center justify-center text-center">
                    <div>
                        <div className="h-3 w-10 rounded-full bg-neutral-200 mx-auto" />
                        <div className="mt-2 h-4 w-16 rounded-full bg-neutral-300 mx-auto" />
                    </div>
                </div>
            </div>
            <div className="flex min-w-[140px] flex-col gap-3">
                {[0, 1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                        <div className="h-3.5 w-3.5 rounded-sm bg-indigo-200" />
                        <div className="h-3 w-full rounded-full bg-neutral-200" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ChartLoadingState({ heightClass = "h-[300px]", variant = "bar", title }: ChartLoadingStateProps) {
    return (
        <div className={`${heightClass} w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),rgba(248,250,252,0.94)),linear-gradient(180deg,#ffffff,#fafaf9)]`}>
            <div className="relative h-full">
                <div className="absolute inset-0 animate-pulse bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0)_28%,rgba(255,255,255,0.85)_44%,rgba(255,255,255,0)_58%,transparent_100%)]" />
                {title ? (
                    <div className="absolute left-4 top-4 rounded-full border border-neutral-200 bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-neutral-600 shadow-sm">
                        {title}
                    </div>
                ) : null}
                {variant === "bar" ? <BarSkeleton /> : variant === "pie" ? <PieSkeleton /> : <LineSkeleton />}
                <LoadingDots />
            </div>
        </div>
    );
}
