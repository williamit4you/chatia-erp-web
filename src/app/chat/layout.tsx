import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import ChatSidebar from "@/components/chat/ChatSidebar";

const prisma = new PrismaClient();

export default async function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;

    // Fetch the last 10 chat sessions for this user
    const sessions = await prisma.chatSession.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: {
            id: true,
            title: true,
            updatedAt: true
        }
    });

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            {/* Sidebar (Left) */}
            <ChatSidebar sessions={sessions} user={session.user} />

            {/* Main Chat Area (Right) */}
            <main className="flex-1 flex flex-col min-w-0 bg-neutral-50">
                {children}
            </main>
        </div>
    );
}
