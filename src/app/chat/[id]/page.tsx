import ChatCompanyDropdown from "@/components/chat/ChatCompanyDropdown";
import ChatContainer from "@/components/chat/ChatContainer";
import SidebarToggle from "@/components/chat/SidebarToggle";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ChatSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  const chatRes = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5217"
    }/api/chat/messages/${sessionId}`,
    {
      headers: { Authorization: `Bearer ${(session.user as any).accessToken}` },
      cache: "no-store",
    }
  );
  const messages = chatRes.ok ? await chatRes.json() : [];

  const mappedMessages = messages.map((m: any) => ({
    id: m.id,
    role: (m.role === "assistant" ? "model" : m.role) as
      | "user"
      | "model"
      | "system",
    content: m.content,
    sqlQueries: m.sqlQueries || undefined,
  }));

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="bg-white border-b border-neutral-200 py-4 px-4 sm:px-6 shadow-sm z-10 sticky top-0 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <SidebarToggle />
            <div className="bg-neutral-100 p-2 rounded-lg border border-neutral-200 hidden sm:block">
              <span className="text-xl">💬</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-neutral-800 tracking-tight leading-tight truncate">
                {"Conversa " + sessionId}
              </h1>
              <p className="text-xs text-neutral-500 font-medium">
                Sessão Salva
              </p>
            </div>
          </div>

          <ChatCompanyDropdown />
        </div>
      </header>

      <div className="flex-1 w-full max-w-5xl mx-auto overflow-hidden">
        <ChatContainer
          key={sessionId}
          sessionId={sessionId}
          initialMessages={mappedMessages}
        />
      </div>
    </div>
  );
}

