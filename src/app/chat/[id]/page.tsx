import ChatContainer from "@/components/chat/ChatContainer";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function ChatSessionPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const resolvedParams = await params;
    const sessionId = resolvedParams.id;
    const userId = (session.user as any).id;

    const chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
            messages: {
                orderBy: { createdAt: "asc" }
            }
        }
    });

    if (!chatSession || chatSession.userId !== userId) {
        redirect("/chat"); // Invalid session or doesn't belong to the user
    }

    // Adapt messages for the UI
    const mappedMessages = chatSession.messages.map(m => ({
        id: m.id,
        role: m.role as "user" | "model" | "system",
        content: m.content
    }));

    return (
        <div className="flex flex-col h-full bg-white">
            <header className="bg-white border-b border-neutral-200 py-4 px-6 shadow-sm z-10 sticky top-0 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-neutral-100 p-2 rounded-lg border border-neutral-200">
                        <span className="text-xl">💬</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-neutral-800 tracking-tight leading-tight truncate">
                            {chatSession.title || "Conversa"}
                        </h1>
                        <p className="text-xs text-neutral-500 font-medium">Sessão Salva</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 w-full max-w-5xl mx-auto overflow-hidden">
                <ChatContainer sessionId={chatSession.id} initialMessages={mappedMessages} />
            </div>
        </div>
    );
}
