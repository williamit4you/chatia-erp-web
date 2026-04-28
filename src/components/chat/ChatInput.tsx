import { useEffect, useRef, useState } from "react";
import { Paperclip, Plus, SendIcon, Sparkles } from "lucide-react";

export default function ChatInput({
    onSend,
    disabled,
    suggestions = [],
    onSuggestionClick,
}: {
    onSend: (text: string) => void;
    disabled: boolean;
    suggestions?: string[];
    onSuggestionClick?: (text: string) => void;
}) {
    const [text, setText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [text]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        const trimmedText = text.trim();
        if (trimmedText && !disabled) {
            onSend(trimmedText);
            setText("");
        }
    };

    return (
        <div className="mx-auto w-full max-w-5xl">
            {suggestions.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                                setText(suggestion);
                                onSuggestionClick?.(suggestion);
                            }}
                            className="rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
                <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(99,102,241,0.08),rgba(16,185,129,0.08))] px-4 py-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        O que voce precisa decidir hoje?
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                        Digite sua pergunta ou use uma sugestao para acelerar a analise.
                    </div>
                </div>

                <div className="flex items-end gap-3 px-3 py-3">
                    <button
                        type="button"
                        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-200 sm:flex"
                        aria-label="Nova ação"
                    >
                        <Plus size={18} />
                    </button>

                    <div className="flex min-w-0 flex-1 items-end rounded-[24px] bg-slate-50 px-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-300">
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={disabled}
                            placeholder="Pergunte sobre contas a receber, faturamento, estoque ou qualquer indicador do seu ERP..."
                            className="min-h-[52px] max-h-[120px] w-full resize-none overflow-y-auto bg-transparent px-1 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50"
                            rows={1}
                        />
                    </div>

                    <button
                        type="button"
                        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 sm:flex"
                        aria-label="Anexar arquivo"
                    >
                        <Paperclip size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!text.trim() || disabled}
                        className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                    >
                        <SendIcon size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
