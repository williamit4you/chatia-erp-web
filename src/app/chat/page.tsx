import ChatContainer from "@/components/chat/ChatContainer";

export default function ChatPage() {
    return (
        <div className="flex flex-col h-full bg-white">
            <header className="bg-white border-b border-neutral-200 py-4 px-6 shadow-sm z-10 sticky top-0 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg border border-emerald-200">
                        <span className="text-xl">🤖</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-emerald-800 tracking-tight leading-tight">Nova Conversa</h1>
                        <p className="text-xs text-neutral-500 font-medium">Faça sua pergunta ao ERP</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 w-full max-w-5xl mx-auto overflow-hidden">
                <ChatContainer key="new" />
            </div>
        </div>
    );
}
