import { useState, useRef, useEffect } from "react";
import { SendIcon } from "lucide-react";

export default function ChatInput({ onSend, disabled }: { onSend: (text: string) => void, disabled: boolean }) {
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
        if (text.trim() && !disabled) {
            onSend(text);
            setText("");
        }
    };

    return (
        <div className="relative flex items-end w-full max-w-4xl mx-auto border border-neutral-200 bg-neutral-50 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder="Pergunte sobre contas a receber, faturamento, estoque ou qualquer indicador do seu ERP..."
                className="w-full bg-transparent max-h-[120px] min-h-[44px] resize-none overflow-y-auto outline-none py-2.5 px-3 text-sm text-neutral-800 placeholder-neutral-400 disabled:opacity-50"
                rows={1}
            />
            <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim() || disabled}
                className="ml-2 mb-1 p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed shadow-sm flex flex-shrink-0 cursor-pointer"
            >
                <SendIcon size={18} />
            </button>
        </div>
    );
}
