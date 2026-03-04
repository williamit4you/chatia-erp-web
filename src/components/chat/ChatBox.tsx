import { User, Bot, Server } from "lucide-react";

type Message = {
    id: string;
    role: "user" | "model" | "system";
    content: string;
};

export default function ChatBox({ messages, isLoading }: { messages: Message[], isLoading: boolean }) {
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
                    <div
                        className={`max-w-[75%] px-5 py-3.5 rounded-2xl ${msg.role === "user"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : msg.role === "model"
                                    ? "bg-white border border-neutral-200 text-neutral-800 shadow-sm whitespace-pre-wrap"
                                    : "bg-neutral-50 border border-neutral-200 text-neutral-600 shadow-sm italic"
                            }`}
                    >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
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
