"use client";

import Link from "next/link";
import {
  Home,
  LayoutDashboard,
  Star,
  History,
  MessageSquare,
  Plus,
  Trash2,
  LogOut,
  Settings,
  ChevronDown,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "./SidebarContext";
import FavoritesModal from "./FavoritesModal";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ChatSidebarProps {
  sessions: any[];
  user: any;
}

function formatSessionDate(createdAt?: string) {
  if (!createdAt) return "Recente";
  const value = createdAt.endsWith("Z") ? createdAt : createdAt + "Z";
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

export default function ChatSidebar({ sessions, user }: ChatSidebarProps) {
  const { isOpen, setIsOpen } = useSidebar();
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [localSessions, setLocalSessions] = useState(sessions);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: sessionData } = useSession();
  const router = useRouter();
  const recentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalSessions(sessions);
  }, [sessions]);

  const recentSessions = useMemo(() => {
    const sorted = [...(localSessions || [])].sort((a: any, b: any) => {
      const aTime = a?.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b?.createdAt ? Date.parse(b.createdAt) : 0;
      return bTime - aTime;
    });
    return sorted.slice(0, 8);
  }, [localSessions]);

  const handleDelete = async () => {
    if (!sessionToDelete || !sessionData?.user) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5217"
        }/api/chat/sessions/${sessionToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${(sessionData.user as any).accessToken}`,
          },
        }
      );

      if (res.ok) {
        setLocalSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));
        setSessionToDelete(null);

        if (window.location.pathname.includes(sessionToDelete)) {
          router.push("/chat");
        }
      } else {
        alert("Erro ao remover conversa.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Erro de conexão ao remover conversa.");
    } finally {
      setIsDeleting(false);
    }
  };

  const canSeeDashboards =
    user?.role === "TENANT_ADMIN" ||
    user?.role === "SUPER_ADMIN" ||
    user?.hasPayableDashboardAccess ||
    user?.hasReceivableDashboardAccess ||
    user?.hasBankingDashboardAccess;

  const handleScrollToRecent = () => {
    setIsOpen(false);
    setTimeout(
      () => recentRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform w-72 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border-r border-neutral-800 flex flex-col h-full text-neutral-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="px-5 pt-5 pb-4">
          <Link
            href="/chat"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-b from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/30 border border-white/10">
              <img src="/logo.png" alt="IT4You" className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-black text-white tracking-tight">
                IT4You AI ERP
              </p>
              <p className="text-[11px] text-neutral-400 font-semibold">
                Assistente Conversacional
              </p>
            </div>
          </Link>
        </div>

        <div className="flex md:hidden justify-between items-center p-4 border-b border-neutral-800">
          <span className="font-bold text-white tracking-tight">
            IT4You <span className="text-emerald-500 font-light">ERP</span>
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* New chat */}
        <div className="px-5">
          <Link
            href="/chat/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-indigo-900/30 border border-white/10"
          >
            <Plus className="h-5 w-5" />
            Nova Conversa
          </Link>
        </div>

        {/* Menu */}
        <div className="px-5 pt-5 space-y-1">
          <Link
            href="/chat"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Home className="h-5 w-5 text-violet-300" />
            <span className="text-sm font-semibold">Início</span>
          </Link>

          <Link
            href={canSeeDashboards ? "/chat/finance-analytics" : "/chat"}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors ${
              canSeeDashboards ? "" : "opacity-60"
            }`}
          >
            <LayoutDashboard className="h-5 w-5 text-violet-300" />
            <span className="text-sm font-semibold">Dashboards</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsFavoritesOpen(true);
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
          >
            <Star className="h-5 w-5 text-violet-300" />
            <span className="text-sm font-semibold">Favoritos</span>
          </button>

          <button
            type="button"
            onClick={handleScrollToRecent}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
          >
            <History className="h-5 w-5 text-violet-300" />
            <span className="text-sm font-semibold">Histórico</span>
          </button>
        </div>

        <div className="mx-5 my-4 h-px bg-neutral-800/80" />

        <div className="flex-1 overflow-y-auto mt-2 px-3 pb-4 scrollbar-thin scrollbar-thumb-neutral-800">
          <div ref={recentRef} />
          <h3 className="px-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 mt-2">
            Conversas Recentes
          </h3>
          {recentSessions.length === 0 ? (
            <div className="px-2 py-3 text-center text-xs text-neutral-600">
              Nenhuma conversa.
            </div>
          ) : (
            <ul className="space-y-1 mb-4">
              {recentSessions.map((session) => (
                <li key={session.id} className="relative group">
                  <Link
                    href={`/chat/${session.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800/50 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 text-neutral-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                    <div className="flex flex-col flex-1 truncate mr-6">
                      <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
                        {formatSessionDate(session.createdAt)}
                      </span>
                      <span className="text-xs text-neutral-500 truncate group-hover:text-neutral-400 transition-colors">
                        {session.title || "Conversa Sem Título"}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSessionToDelete(session.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Ocultar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-neutral-800 bg-neutral-950/30">
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm border border-emerald-500/30 shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {user?.role === "TENANT_ADMIN" ? "Administrador" : "Membro"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center">
              {user?.role === "TENANT_ADMIN" && (
                <Link
                  href="/admin"
                  className="p-2 text-neutral-500 hover:text-white transition-colors"
                  title="Configurações da Empresa"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <ChevronDown className="h-4 w-4 text-neutral-600 ml-1" />
            </div>
          </div>
        </div>
      </div>

      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
      />

      {sessionToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isDeleting && setSessionToDelete(null)}
          />
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 fade-in duration-300">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Ocultar Conversa?
            </h3>
            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
              Esta conversa será ocultada do seu histórico. Os dados são mantidos
              internamente e podem ser acessados pela gestão para análise futura.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-rose-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "OCULTANDO..." : "SIM, OCULTAR AGORA"}
              </button>
              <button
                onClick={() => setSessionToDelete(null)}
                disabled={isDeleting}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
