"use client";

import { Mic, Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import SidebarToggle from "@/components/chat/SidebarToggle";
import ChatCompanyDropdown from "@/components/chat/ChatCompanyDropdown";

type ModuleCard = {
  key: string;
  title: string;
  description: string;
  enabled: boolean;
  accent: string;
  bg: string;
};

export default function ChatHome() {
  const router = useRouter();
  const [text, setText] = useState("");

  const modules = useMemo<ModuleCard[]>(
    () => [
      {
        key: "financeiro",
        title: "Financeiro",
        description: "Caixa, contas a pagar/receber, fluxo de caixa e inadimplência.",
        enabled: true,
        accent: "text-emerald-700",
        bg: "from-emerald-50 to-white",
      },
      {
        key: "estoque",
        title: "Estoque",
        description: "Produtos, estoque mínimo, giro, ruptura, compras e necessidades.",
        enabled: false,
        accent: "text-sky-700",
        bg: "from-sky-50 to-white",
      },
      {
        key: "vendas",
        title: "Vendas",
        description: "Vendas, faturamento, clientes, oportunidades e performance.",
        enabled: false,
        accent: "text-violet-700",
        bg: "from-violet-50 to-white",
      },
      {
        key: "producao",
        title: "Produção",
        description: "Ordens, eficiência, apontamentos e custos.",
        enabled: false,
        accent: "text-rose-700",
        bg: "from-rose-50 to-white",
      },
      {
        key: "contrato",
        title: "Contrato",
        description: "Contratos, prazos, renovações e indicadores.",
        enabled: false,
        accent: "text-amber-700",
        bg: "from-amber-50 to-white",
      },
      {
        key: "projetos",
        title: "Projetos",
        description: "Tarefas, status, custos e acompanhamento.",
        enabled: false,
        accent: "text-teal-700",
        bg: "from-teal-50 to-white",
      },
    ],
    []
  );

  const quickSuggestions = useMemo(
    () => [
      "Quanto temos a receber esta semana?",
      "Quais clientes estão inadimplentes?",
      "Qual meu fluxo de caixa para 30 dias?",
      "Produtos com estoque abaixo do mínimo",
      "Maiores compradores do mês",
    ],
    []
  );

  const goToChat = (prompt?: string) => {
    const value = (prompt ?? text).trim();
    if (!value) {
      try {
        sessionStorage.removeItem("pendingChatPrompt");
      } catch {}
      router.push("/chat/new");
      return;
    }
    try {
      sessionStorage.setItem("pendingChatPrompt", value);
    } catch {}
    router.push(`/chat/new?prompt=${encodeURIComponent(value)}`);
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-neutral-50">
      <header className="sticky top-0 z-10 bg-neutral-50/80 backdrop-blur border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SidebarToggle />
          </div>
          <ChatCompanyDropdown />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-b from-violet-100 to-white border border-violet-200 flex items-center justify-center shadow-sm">
            <div className="h-9 w-9 rounded-full bg-violet-600/10 text-violet-700 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900">
            O que você precisa{" "}
            <span className="text-violet-600">decidir</span> hoje?
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-500">
            Converse com sua IA e obtenha respostas inteligentes baseadas nos
            dados do seu ERP.
          </p>
        </div>

        <div className="mt-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-violet-500">
            <div className="hidden sm:flex h-10 w-10 rounded-xl bg-violet-50 border border-violet-100 items-center justify-center text-violet-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  goToChat();
                }
              }}
              placeholder="Pergunte sobre contas a receber, faturamento, estoque ou qualquer indicador do seu ERP..."
              className="flex-1 bg-transparent outline-none text-sm sm:text-base text-neutral-800 placeholder-neutral-400 py-3 px-2"
            />
            <button
              type="button"
              className="h-10 w-10 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 transition hidden sm:flex items-center justify-center"
              title="Microfone (em breve)"
              disabled
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goToChat()}
              className="h-10 w-10 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition flex items-center justify-center"
              title="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-xs text-neutral-500 flex items-center justify-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Segurança e privacidade garantidas. Seus dados permanecem protegidos.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-bold text-neutral-700 mb-4">
            Escolha uma área para começar{" "}
            <span className="text-neutral-400 font-semibold">(opcional)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => goToChat(`Quero ajuda com ${m.title}.`)}
                className={`group relative text-left rounded-2xl border border-neutral-200 bg-gradient-to-b ${m.bg} p-6 shadow-sm hover:shadow-md transition`}
              >
                <div
                  className={`text-lg font-black tracking-tight ${m.accent}`}
                >
                  {m.title}
                </div>
                <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                  {m.description}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      m.enabled ? "text-emerald-600" : "text-neutral-400"
                    }`}
                  >
                    {m.enabled ? "Ativo" : "Desabilitado (por enquanto)"}
                  </span>
                  <span className="h-9 w-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 group-hover:translate-x-0.5 transition">
                    →
                  </span>
                </div>

                {!m.enabled && (
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/40 backdrop-blur-[1px]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-neutral-700">
              Sugestões rápidas
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {quickSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => goToChat(s)}
                className="text-left rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 transition px-4 py-3 text-sm text-neutral-700 shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-10 text-xs text-neutral-400 text-center">
          A IA pode cometer erros. Confirme informações críticas antes de tomar
          decisões.
        </p>
      </div>
    </div>
  );
}
