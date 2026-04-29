"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
    Bot,
    ChevronDown,
    ChevronUp,
    Database,
    Download,
    FileSpreadsheet,
    FileText,
    Loader2,
    Server,
    Sparkles,
    Star,
    User,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Message, ResponseAction, ResponseListItem, ResponseMetric, ResponseSection } from "@/services/chat.service";

async function downloadExport(exportId: string, onStart: () => void, onEnd: () => void) {
    onStart();
    try {
        const response = await apiClient.get(`/api/chat/export/${exportId}`, {
            responseType: "blob",
        });
        const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const disposition = response.headers["content-disposition"] ?? "";
        const match = disposition.match(/filename[^;=\n]*=(['"]?)([^'"\n;]+)\1/);
        link.download = match ? match[2] : `relatorio_${exportId.slice(0, 8)}.xlsx`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
        console.error("[download] Erro ao baixar export:", err);
        alert("Erro ao baixar o relatorio. O arquivo pode ter expirado (30 min). Solicite novamente.");
    } finally {
        onEnd();
    }
}

async function downloadExportPdf(exportId: string, onStart: () => void, onEnd: () => void) {
    onStart();
    try {
        const response = await apiClient.get(`/api/chat/export/${exportId}/pdf`, {
            responseType: "blob",
        });
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const disposition = response.headers["content-disposition"] ?? "";
        const match = disposition.match(/filename[^;=\n]*=(['"]?)([^'"\n;]+)\1/);
        link.download = match ? match[2] : `relatorio_${exportId.slice(0, 8)}.pdf`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
        console.error("[download-pdf] Erro ao baixar PDF:", err);
        alert("Erro ao gerar o PDF. O arquivo pode ter expirado (30 min). Solicite novamente.");
    } finally {
        onEnd();
    }
}

function toneClasses(tone?: string) {
    switch (tone) {
        case "positive":
            return "text-emerald-700 bg-emerald-50 border-emerald-200";
        case "warning":
            return "text-amber-700 bg-amber-50 border-amber-200";
        case "danger":
            return "text-rose-700 bg-rose-50 border-rose-200";
        default:
            return "text-slate-700 bg-slate-50 border-slate-200";
    }
}

function renderInlineMarkdown(text: string): ReactNode[] {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g).filter(Boolean);

    return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }

        if (part.startsWith("`") && part.endsWith("`")) {
            return <code key={index} className="rounded bg-slate-100 px-1 py-0.5 text-[0.95em] text-slate-800">{part.slice(1, -1)}</code>;
        }

        return <span key={index}>{part}</span>;
    });
}

function isTableSeparatorLine(line: string) {
    const normalized = line.trim();
    return /^\|?[\s:-]+(\|[\s:-]+)+\|?$/.test(normalized);
}

function isTableContentLine(line: string) {
    return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function parseTableRow(line: string) {
    return line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim());
}

function MarkdownLite({ content, tone = "default" }: { content: string; tone?: "default" | "soft" }) {
    const lines = content.split("\n");
    const blocks: ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const rawLine = lines[i];
        const line = rawLine.trim();

        if (!line) {
            i++;
            continue;
        }

        if (
            isTableContentLine(line) &&
            i + 1 < lines.length &&
            isTableSeparatorLine(lines[i + 1])
        ) {
            const header = parseTableRow(lines[i]);
            const rows: string[][] = [];
            i += 2;

            while (i < lines.length && isTableContentLine(lines[i].trim())) {
                rows.push(parseTableRow(lines[i]));
                i++;
            }

            blocks.push(
                <div key={`table-${blocks.length}`} className="-mx-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
                    <table className="min-w-full border-collapse text-left text-sm text-slate-700">
                        <thead className="bg-slate-100">
                            <tr>
                                {header.map((cell, index) => (
                                    <th key={index} className="px-4 py-3 font-semibold text-slate-800">
                                        {renderInlineMarkdown(cell)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-t border-slate-100">
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-4 py-3 align-top">
                                            {renderInlineMarkdown(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

            continue;
        }

        if (/^[-*]\s+/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
                i++;
            }

            blocks.push(
                <ul key={`list-${blocks.length}`} className="space-y-2 pl-5 text-sm leading-7 text-slate-700">
                    {items.map((item, index) => (
                        <li key={index} className="list-disc">
                            {renderInlineMarkdown(item)}
                        </li>
                    ))}
                </ul>
            );

            continue;
        }

        const paragraphLines = [line];
        i++;
        while (i < lines.length) {
            const nextLine = lines[i].trim();
            if (!nextLine) {
                i++;
                break;
            }
            if (/^[-*]\s+/.test(nextLine)) break;
            if (isTableContentLine(nextLine) && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1])) break;
            paragraphLines.push(nextLine);
            i++;
        }

        blocks.push(
            <p
                key={`p-${blocks.length}`}
                className={`text-sm leading-7 ${tone === "soft" ? "text-slate-700" : "text-slate-700"}`}
            >
                {renderInlineMarkdown(paragraphLines.join(" "))}
            </p>
        );
    }

    return <div className="space-y-4">{blocks}</div>;
}

function buildFallbackSections(message: Message): ResponseSection[] {
    const sections: ResponseSection[] = [];
    const paragraphs = message.content
        .split(/\n{2,}/)
        .map((chunk) => chunk.trim())
        .filter(Boolean);

    if (paragraphs.length > 0) {
        sections.push({
            type: "summary",
            title: "Leitura executiva",
            content: paragraphs[0],
        });
    }

    if (message.exportValor || message.exportTotal) {
        const metricItems: ResponseMetric[] = [];
        if (message.exportValor) {
            metricItems.push({
                label: "Valor analisado",
                value: message.exportValor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }),
                tone: "positive",
            });
        }
        if (message.exportTotal) {
            metricItems.push({
                label: "Registros",
                value: message.exportTotal.toLocaleString("pt-BR"),
                tone: "neutral",
            });
        }
        sections.push({
            type: "metrics",
            title: "Indicadores da resposta",
            items: metricItems,
        });
    }

    const listLines = message.content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line));

    if (listLines.length > 0) {
        sections.push({
            type: "list",
            title: "Pontos destacados",
            items: listLines.slice(0, 5).map((line) => ({
                title: line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""),
            })),
        });
    }

    if (paragraphs.length > 1) {
        sections.push({
            type: "recommendation",
            title: "Proxima leitura",
            content: paragraphs.slice(1).join("\n\n"),
        });
    }

    return sections;
}

function SqlViewer({ sqlQueries }: { sqlQueries: string }) {
    const [isOpen, setIsOpen] = useState(false);

    let queries: string[] = [];
    try {
        queries = JSON.parse(sqlQueries);
    } catch {
        queries = [sqlQueries];
    }

    return (
        <div className="mt-4 border-t border-slate-200/80 pt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
            >
                <Database className="h-3.5 w-3.5" />
                {isOpen ? "Ocultar SQL" : "Ver SQL"}
                {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                <span className="font-normal text-slate-400">({queries.length} {queries.length === 1 ? "query" : "queries"})</span>
            </button>
            {isOpen && (
                <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    {queries.map((query, index) => (
                        <pre key={index} className="overflow-x-auto rounded-2xl bg-slate-950 p-3 text-[11px] leading-relaxed text-emerald-300 whitespace-pre-wrap break-all">
                            {query}
                        </pre>
                    ))}
                </div>
            )}
        </div>
    );
}

function ExportButtons({ exportId, exportTotal }: { exportId: string; exportTotal?: number }) {
    const [loadingXlsx, setLoadingXlsx] = useState(false);
    const [loadingPdf, setLoadingPdf] = useState(false);

    return (
        <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
                onClick={() => downloadExport(exportId, () => setLoadingXlsx(true), () => setLoadingXlsx(false))}
                disabled={loadingXlsx || loadingPdf}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
            >
                {loadingXlsx ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                <span>{loadingXlsx ? "Gerando download..." : "Baixar Excel"}</span>
                {exportTotal && !loadingXlsx && (
                    <span className="rounded-lg bg-emerald-500 px-2 py-0.5 text-[10px] font-bold">
                        {exportTotal.toLocaleString("pt-BR")} reg.
                    </span>
                )}
                {!loadingXlsx && <Download size={12} className="ml-0.5" />}
            </button>

            <button
                onClick={() => downloadExportPdf(exportId, () => setLoadingPdf(true), () => setLoadingPdf(false))}
                disabled={loadingXlsx || loadingPdf}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all duration-150 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
            >
                {loadingPdf ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                <span>{loadingPdf ? "Gerando PDF..." : "Baixar PDF"}</span>
                {!loadingPdf && <Download size={12} className="ml-0.5" />}
            </button>
        </div>
    );
}

function MetricsSection({ items }: { items: ResponseMetric[] }) {
    return (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
                <div key={`${item.label}-${item.value}`} className={`rounded-2xl border px-4 py-3 ${toneClasses(item.tone)}`}>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">{item.label}</div>
                    <div className="mt-2 text-lg font-bold tracking-tight">{item.value}</div>
                </div>
            ))}
        </div>
    );
}

function ListSection({ items }: { items: ResponseListItem[] }) {
    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={`${item.title}-${index}`} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3">
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800">{item.title}</div>
                        {item.subtitle && <div className="mt-1 text-xs text-slate-500">{item.subtitle}</div>}
                    </div>
                    {(item.value || item.tone) && (
                        <div className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneClasses(item.tone)}`}>
                            {item.value || "Detalhe"}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function ActionsSection({ items }: { items: ResponseAction[] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
                <button
                    key={`${item.label}-${index}`}
                    type="button"
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        item.variant === "primary"
                            ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    }`}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}

function ModelMessageCard({ message, isAdmin }: { message: Message; isAdmin: boolean }) {
    const sections = message.sections && message.sections.length > 0 ? message.sections : buildFallbackSections(message);

    return (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]">
            <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.94))] px-5 py-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 ring-1 ring-indigo-100">
                            <Sparkles className="h-3.5 w-3.5" />
                            Resposta guiada pela IA
                        </div>
                        <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">Análise pronta para decisão</h3>
                    </div>
                    {message.responseType && (
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {message.responseType.replaceAll("_", " ")}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6">
                {sections.map((section, index) => {
                    const title = "title" in section ? section.title : undefined;

                    return (
                        <section key={`${section.type}-${index}`} className="space-y-3">
                            {title && <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</div>}

                            {section.type === "summary" && (
                                <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                                    <MarkdownLite content={section.content} />
                                </div>
                            )}

                            {section.type === "metrics" && <MetricsSection items={section.items} />}

                            {section.type === "list" && <ListSection items={section.items} />}

                            {section.type === "recommendation" && (
                                <div className="rounded-3xl border border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(240,249,255,0.95))] px-5 py-4">
                                    <MarkdownLite content={section.content} tone="soft" />
                                </div>
                            )}

                            {section.type === "actions" && <ActionsSection items={section.items} />}
                        </section>
                    );
                })}

                {message.suggestions && message.suggestions.length > 0 && (
                    <section className="space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Sugestoes de continuidade</div>
                        <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion) => (
                                <div key={suggestion} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {isAdmin && message.sqlQueries && <SqlViewer sqlQueries={message.sqlQueries} />}
                {message.exportId && <ExportButtons exportId={message.exportId} exportTotal={message.exportTotal} />}
            </div>
        </div>
    );
}

function MessageContent({ message, isAdmin }: { message: Message; isAdmin: boolean }) {
    if (message.role === "model") {
        return <ModelMessageCard message={message} isAdmin={isAdmin} />;
    }

    if (message.role === "system") {
        return (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm italic text-slate-600 shadow-sm">
                {message.content}
            </div>
        );
    }

    return (
        <div className="rounded-[24px] bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] px-5 py-4 text-sm leading-relaxed text-white shadow-[0_18px_50px_-28px_rgba(79,70,229,0.8)]">
            {message.content}
        </div>
    );
}

export default function ChatBox({
    messages,
    isLoading,
    onFavorite,
    isAdmin = false,
}: {
    messages: Message[];
    isLoading: boolean;
    onFavorite?: (text: string) => void;
    isAdmin?: boolean;
}) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col space-y-6">
            {messages.map((message) => (
                <div key={message.id} className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className="shrink-0">
                        {message.role === "user" ? (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-sm ring-1 ring-indigo-200">
                                <User size={19} />
                            </div>
                        ) : message.role === "model" ? (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 shadow-sm ring-1 ring-violet-200">
                                <Bot size={19} />
                            </div>
                        ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 shadow-sm ring-1 ring-slate-200">
                                <Server size={19} />
                            </div>
                        )}
                    </div>

                    <div className={`relative group ${message.role === "model" ? "max-w-[88%]" : "max-w-[72%]"}`}>
                        {message.role === "user" && onFavorite && (
                            <button
                                onClick={() => onFavorite(message.content)}
                                className="absolute -left-10 top-1/2 hidden -translate-y-1/2 p-2 text-slate-300 opacity-0 transition-all hover:text-amber-400 group-hover:opacity-100 sm:block"
                                title="Salvar nos Favoritos"
                            >
                                <Star className="h-5 w-5" />
                            </button>
                        )}
                        <MessageContent message={message} isAdmin={isAdmin} />
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className="flex gap-4">
                    <div className="shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 shadow-sm ring-1 ring-violet-200">
                            <Bot size={19} />
                        </div>
                    </div>
                    <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            Processando analise
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
}
