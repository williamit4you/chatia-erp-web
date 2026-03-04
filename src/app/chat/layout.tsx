import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ChatSidebar from "@/components/chat/ChatSidebar";

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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/chat/sessions`, {
        headers: { Authorization: `Bearer ${(session.user as any).accessToken}` },
        cache: 'no-store'
    });
    const sessions = res.ok ? await res.json() : [];

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
