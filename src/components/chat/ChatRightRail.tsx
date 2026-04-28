"use client";

import { Bot, ChevronRight, Lightbulb, Sparkles, Star, TrendingUp } from "lucide-react";
import type { ChatRightRail as ChatRightRailData, ChatRightRailInsight, ChatRightRailItem } from "@/services/chat.service";

function toneClasses(tone?: ChatRightRailInsight["tone"]) {
    switch (tone) {
        case "positive":
            return "border-emerald-200 bg-emerald-50/80";
        case "warning":
            return "border-amber-200 bg-amber-50/80";
        case "danger":
            return "border-rose-200 bg-rose-50/80";
        default:
            return "border-slate-200 bg-slate-50/80";
    }
}

function ActionList({
    items,
    emptyText,
    onItemClick,
    compact = false,
}: {
    items: ChatRightRailItem[];
    emptyText: string;
    onItemClick: (item: ChatRightRailItem) => void;
    compact?: boolean;
}) {
    if (items.length === 0) {
        return <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">{emptyText}</div>;
    }

    return (
        <div className={compact ? "space-y-1" : "space-y-1.5"}>
            {items.map((item) => (
                <button
                    key={`${item.label}-${item.action ?? "action"}`}
                    type="button"
                    onClick={() => onItemClick(item)}
                    title={item.label}
                    className={`w-full rounded-2xl border border-slate-200 bg-white text-left text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/40 hover:text-slate-900 ${
                        compact ? "px-2.5 py-1.5" : "px-3.5 py-2.5"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <Sparkles className="h-3.5 w-3.5" />
                        </span>
                        <span className={`min-w-0 flex-1 truncate font-normal ${compact ? "text-[13px] leading-5" : "text-sm leading-6"}`}>
                            {item.label}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>
                    {item.metadata && <div className="mt-1 text-xs text-slate-400">{item.metadata}</div>}
                </button>
            ))}
        </div>
    );
}

export default function ChatRightRail({
    rightRail,
    onAsk,
}: {
    rightRail: ChatRightRailData;
    onAsk: (text: string) => void;
}) {
    return (
        <aside className="space-y-2 xl:sticky xl:top-3">
            <section className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                        <Bot className="h-4 w-4" />
                    </span>
                    Sugestões para você
                </div>
                <div className="mt-2">
                    <ActionList
                        items={rightRail.suggestions.slice(0, 5)}
                        emptyText="As sugestoes aparecerao aqui depois da primeira resposta da IA."
                        onItemClick={(item) => onAsk(item.label)}
                        compact
                    />
                </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    Insights relacionados
                </div>
                <div className="mt-2 space-y-1">
                    {rightRail.insights.length === 0 ? (
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                            Os insights relacionados aparecerao junto com a resposta contextual da IA.
                        </div>
                    ) : (
                        rightRail.insights.slice(0, 3).map((insight) => (
                            <div key={insight.title} className={`rounded-2xl border px-3 py-2.5 ${toneClasses(insight.tone)}`}>
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-slate-900">{insight.title}</div>
                                        <div className="mt-0.5 text-sm leading-6 text-slate-600">{insight.description}</div>
                                        {insight.ctaLabel && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const prompt = insight.ctaAction?.replace(/^chat:ask:/, "") || insight.ctaLabel || insight.title;
                                                    onAsk(prompt);
                                                }}
                                                className="mt-2 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
                                            >
                                                {insight.ctaLabel}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Star className="h-4 w-4 text-amber-500" />
                    Perguntas favoritas
                </div>
                <div className="mt-2">
                    <ActionList
                        items={rightRail.favoriteQuestions.slice(0, 3)}
                        emptyText="O usuario logado ainda nao possui perguntas favoritas cadastradas."
                        onItemClick={(item) => onAsk(item.label)}
                    />
                </div>
            </section>
        </aside>
    );
}
