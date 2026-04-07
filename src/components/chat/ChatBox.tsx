"use client";

import { useState } from "react";
import { User, Bot, Server, Star, Database, ChevronDown, ChevronUp } from "lucide-react";

type Message = {
    id: string;
    role: "user" | "model" | "system";
    content: string;
    sqlQueries?: string;
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
