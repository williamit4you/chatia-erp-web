"use client";

import ChatContainer from "@/components/chat/ChatContainer";
import ChatCompanyDropdown from "@/components/chat/ChatCompanyDropdown";
import SidebarToggle from "@/components/chat/SidebarToggle";
import { useEffect, useState } from "react";

export default function ChatNewClient() {
  const [prompt, setPrompt] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getQueryPrompt = () => {
      if (typeof window === "undefined") return undefined;
      const raw = new URLSearchParams(window.location.search).get("prompt");
      return raw || undefined;
    };

    try {
      const fromQuery = getQueryPrompt();
      if (fromQuery) {
        sessionStorage.removeItem("pendingChatPrompt");
        setPrompt(fromQuery);
        return;
      }

      const pending = sessionStorage.getItem("pendingChatPrompt") || undefined;
      if (pending) {
        sessionStorage.removeItem("pendingChatPrompt");
        setPrompt(pending);
      } else {
        setPrompt(undefined);
      }
    } catch {
      const fallback = getQueryPrompt();
      setPrompt(fallback);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="bg-white border-b border-neutral-200 py-4 px-4 sm:px-6 shadow-sm z-10 sticky top-0 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <SidebarToggle />
            <div className="bg-emerald-100 p-2 rounded-lg border border-emerald-200 hidden sm:block">
              <span className="text-xl">🤖</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-emerald-800 tracking-tight leading-tight truncate">
                Nova Conversa
              </h1>
              <p className="text-xs text-neutral-500 font-medium">
                Faça sua pergunta ao ERP
              </p>
            </div>
          </div>

          <ChatCompanyDropdown />
        </div>
      </header>

      <div className="flex-1 w-full max-w-5xl mx-auto overflow-hidden">
        <ChatContainer key={prompt || "new"} initialPrompt={prompt} />
      </div>
    </div>
  );
}
