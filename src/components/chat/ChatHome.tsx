"use client";

import {
  BarChart3,
  Box,
  ClipboardList,
  DollarSign,
  Factory,
  FileText,
  Mic,
  Send,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import SidebarToggle from "@/components/chat/SidebarToggle";
import ChatCompanyDropdown from "@/components/chat/ChatCompanyDropdown";
import type { LucideIcon } from "lucide-react";

type ModuleCard = {
  key: string;
  title: string;
  description: string;
  enabled: boolean;
  accent: string; // text color
  border: string;
  bg: string; // card background
  iconBg: string;
  Icon: LucideIcon;
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
        border: "border-emerald-200/60",
        bg: "from-emerald-50 to-white",
        iconBg: "from-emerald-600 to-emerald-500",
        Icon: DollarSign,
      },
      {
        key: "estoque",
        title: "Estoque",
        description: "Produtos, estoque mínimo, giro, ruptura, compras e necessidades.",
        enabled: false,
        accent: "text-blue-700",
        border: "border-blue-200/60",
        bg: "from-blue-50 to-white",
        iconBg: "from-blue-600 to-blue-500",
        Icon: Box,
      },
      {
        key: "vendas",
        title: "Vendas",
        description: "Vendas, faturamento, clientes, oportunidades e performance.",
        enabled: false,
        accent: "text-violet-700",
        border: "border-violet-200/60",
        bg: "from-violet-50 to-white",
        iconBg: "from-violet-600 to-violet-500",
        Icon: BarChart3,
      },
      {
        key: "producao",
        title: "Produção",
        description: "Ordens, eficiência, apontamentos e custos.",
        enabled: false,
        accent: "text-rose-700",
        border: "border-rose-200/60",
        bg: "from-rose-50 to-white",
        iconBg: "from-rose-600 to-rose-500",
        Icon: Factory,
      },
      {
        key: "contrato",
        title: "Contrato",
        description: "Contratos, prazos, renovações e indicadores.",
        enabled: false,
        accent: "text-amber-700",
        border: "border-amber-200/60",
        bg: "from-amber-50 to-white",
        iconBg: "from-amber-600 to-amber-500",
        Icon: FileText,
      },
      {
        key: "projetos",
        title: "Projetos",
        description: "Tarefas, status, custos e acompanhamento.",
        enabled: false,
        accent: "text-teal-700",
        border: "border-teal-200/60",
        bg: "from-teal-50 to-white",
        iconBg: "from-teal-600 to-teal-500",
        Icon: ClipboardList,
      },
    ],
    []
  );

  const quickSuggestions = useMemo<
    { text: string; Icon: LucideIcon; iconClass: string; iconBg: string }[]
  >(
    () => [
      {
        text: "Quanto temos a receber esta semana?",
        Icon: DollarSign,
        iconClass: "text-emerald-700",
        iconBg: "bg-emerald-50 border-emerald-100",
      },
      {
        text: "Quais clientes estão inadimplentes?",
        Icon: BarChart3,
        iconClass: "text-violet-700",
        iconBg: "bg-violet-50 border-violet-100",
      },
      {
        text: "Qual meu fluxo de caixa para 30 dias?",
        Icon: BarChart3,
        iconClass: "text-blue-700",
        iconBg: "bg-blue-50 border-blue-100",
      },
      {
        text: "Produtos com estoque abaixo do mínimo",
        Icon: Box,
        iconClass: "text-amber-700",
        iconBg: "bg-amber-50 border-amber-100",
      },
      {
        text: "Maiores compradores do mês",
        Icon: BarChart3,
        iconClass: "text-violet-700",
        iconBg: "bg-violet-50 border-violet-100",
      },
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
                className={`group relative text-left rounded-2xl border ${m.border} bg-gradient-to-b ${m.bg} p-6 shadow-sm hover:shadow-md transition`}
              >
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-lg opacity-25 bg-current" />
                    <div
                      className={`h-14 w-14 rounded-full bg-gradient-to-b ${m.iconBg} text-white flex items-center justify-center shadow-sm`}
                    >
                      <m.Icon className="h-7 w-7" />
                    </div>
                  </div>
                </div>

                <div className={`mt-4 text-lg font-black tracking-tight text-center ${m.accent}`}>
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
                  <span
                    className={`h-9 w-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center group-hover:translate-x-0.5 transition ${m.accent}`}
                    aria-hidden
                  >
                    <ArrowRight className="h-5 w-5" />
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
                key={s.text}
                type="button"
                onClick={() => goToChat(s.text)}
                className="text-left rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 transition px-4 py-3 text-sm text-neutral-700 shadow-sm flex items-center gap-3"
              >
                <span
                  className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${s.iconBg}`}
                  aria-hidden
                >
                  <s.Icon className={`h-5 w-5 ${s.iconClass}`} />
                </span>
                <span className="leading-snug">{s.text}</span>
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
