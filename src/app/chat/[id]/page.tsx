import ChatCompanyDropdown from "@/components/chat/ChatCompanyDropdown";
import ChatContainer from "@/components/chat/ChatContainer";
import MiaAvatar from "@/components/chat/MiaAvatar";
import SidebarToggle from "@/components/chat/SidebarToggle";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
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
    `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5217"}/api/chat/messages/${sessionId}`,
    {
      headers: { Authorization: `Bearer ${(session.user as any).accessToken}` },
      cache: "no-store",
    }
  );
  const messages = chatRes.ok ? await chatRes.json() : [];

  const mappedMessages = messages.map((m: any) => ({
    id: m.id,
    role: (m.role === "assistant" ? "model" : m.role) as "user" | "model" | "system",
    content: m.content,
    sqlQueries: m.sqlQueries || undefined,
  }));

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="sticky top-0 z-10 shrink-0 border-b border-neutral-200 bg-white px-4 py-3 shadow-sm sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarToggle />
            <div className="hidden sm:block">
              <MiaAvatar
                size={52}
                className="rounded-2xl border-neutral-200 bg-neutral-50"
                imageClassName="scale-[1.12]"
                alt="Avatar da MIA"
              />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold leading-tight tracking-tight text-neutral-800">
                Conversa salva
              </h1>
              <p className="text-xs font-medium text-neutral-500">Sessão salva</p>
            </div>
          </div>

          <ChatCompanyDropdown />
        </div>
      </header>

      <div className="mx-auto flex-1 w-full max-w-7xl overflow-hidden">
        <ChatContainer
          key={sessionId}
          sessionId={sessionId}
          initialMessages={mappedMessages}
        />
      </div>
    </div>
  );
}
