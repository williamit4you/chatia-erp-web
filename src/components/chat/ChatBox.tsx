"use client";

import { useState } from "react";
import { User, Bot, Server, Star, Database, ChevronDown, ChevronUp, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

/** Baixa o Excel via apiClient (envia JWT no header) e abre dialog de save no browser */
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
        // Tenta pegar o nome do arquivo do header Content-Disposition
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
        alert("Erro ao baixar o relatório. O arquivo pode ter expirado (30 min). Solicite novamente.");
    } finally {
        onEnd();
    }
}

type Message = {
    id: string;
    role: "user" | "model" | "system";
    content: string;
    sqlQueries?: string;
    exportId?: string;
    exportTotal?: number;
    exportValor?: number;
};

function SqlViewer({ sqlQueries }: { sqlQueries: string }) {
    const [isOpen, setIsOpen] = useState(false);

    let queries: string[] = [];
    try {
        queries = JSON.parse(sqlQueries);
    } catch {
        queries = [sqlQueries];
    }

    return (
        <div className="mt-3 border-t border-neutral-200 pt-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
                <Database className="w-3.5 h-3.5" />
                {isOpen ? "Ocultar SQL" : "Ver SQL"}
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span className="text-neutral-400 font-normal">({queries.length} {queries.length === 1 ? "query" : "queries"})</span>
            </button>
            {isOpen && (
                <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    {queries.map((q, i) => (
                        <pre key={i} className="text-[11px] bg-neutral-900 text-green-400 p-3 rounded-xl overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap break-all">
                            {q}
                        </pre>
                    ))}
                </div>
            )}
        </div>
    );
}

function ExportButton({ exportId, exportTotal }: { exportId: string; exportTotal?: number }) {
    const [loading, setLoading] = useState(false);
    return (
        <button
            onClick={() => downloadExport(exportId, () => setLoading(true), () => setLoading(false))}
            disabled={loading}
            className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-wait active:scale-95 text-white text-xs font-semibold rounded-xl transition-all duration-150 shadow-sm"
        >
            {loading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : (
                <FileSpreadsheet size={14} />
            )}
            <span>{loading ? "Gerando download..." : "Baixar Excel"}</span>
            {exportTotal && !loading && (
                <span className="bg-emerald-500 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    {exportTotal.toLocaleString("pt-BR")} registros
                </span>
            )}
            {!loading && <Download size={12} className="ml-0.5" />}
        </button>
    );
}

export default function ChatBox({ messages, isLoading, onFavorite, isAdmin = false }: { messages: Message[], isLoading: boolean, onFavorite?: (text: string) => void, isAdmin?: boolean }) {
    return (
        <div className="flex flex-col space-y-4">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                    {/* Avatar Area */}
                    <div className="flex-shrink-0">
                        {msg.role === "user" ? (
                            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-200">
                                <User size={20} />
                            </div>
                        ) : msg.role === "model" ? (
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 shadow-sm border border-blue-200">
                                <Bot size={20} />
                            </div>
                        ) : (
                            <div className="h-10 w-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 shadow-sm border border-neutral-200">
                                <Server size={20} />
                            </div>
                        )}
                    </div>

                    {/* Message Bubble Area */}
                    <div className="relative group max-w-[75%]">
                        {msg.role === "user" && onFavorite && (
                            <button
                                onClick={() => onFavorite(msg.content)}
                                className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-neutral-300 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all hidden sm:block"
                                title="Salvar nos Favoritos"
                            >
                                <Star className="w-5 h-5" />
                            </button>
                        )}
                        <div
                            className={`px-5 py-3.5 rounded-2xl ${msg.role === "user"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : msg.role === "model"
                                    ? "bg-white border border-neutral-200 text-neutral-800 shadow-sm whitespace-pre-wrap"
                                    : "bg-neutral-50 border border-neutral-200 text-neutral-600 shadow-sm italic"
                                }`}
                        >
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            {isAdmin && msg.role === "model" && msg.sqlQueries && (
                                <SqlViewer sqlQueries={msg.sqlQueries} />
                            )}
                            {/* Botão de download Excel — aparece quando há export disponível */}
                            {msg.exportId && (
                                <ExportButton exportId={msg.exportId} exportTotal={msg.exportTotal} />
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className="flex gap-4 flex-row">
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 shadow-sm border border-blue-200">
                            <Bot size={20} />
                        </div>
                    </div>
                    <div className="px-5 py-3.5 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            )}
        </div>
    );
}
