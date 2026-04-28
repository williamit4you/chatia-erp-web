"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import FavoritesModal from "./FavoritesModal";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";

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
  const {
    isOpen,
    isCollapsed,
    isDesktop,
    setIsOpen,
    setIsCollapsed,
    closeSidebar,
  } = useSidebar();
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
      alert("Erro de conexao ao remover conversa.");
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
    closeSidebar();
    setTimeout(
      () => recentRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  };

  const showCompact = isDesktop && isCollapsed;

  const navItemClass = `flex items-center rounded-xl py-2.5 transition-colors hover:bg-white/5 ${
    showCompact ? "h-11 w-11 justify-center px-0 mx-auto" : "w-full gap-3 px-3"
  }`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

        <div
        className={`fixed inset-y-0 left-0 z-50 flex h-full transform flex-col border-r border-neutral-800 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-200 transition-[transform,width] duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${showCompact ? "w-72 md:w-20" : "w-72"}`}
      >
        <div
          className={`${
            showCompact ? "flex flex-col items-center px-3 pt-4 pb-6" : "px-5 pt-4 pb-4"
          }`}
        >
          <div
            className={`flex items-center ${
              showCompact ? "justify-center" : "justify-between gap-3"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                if (isDesktop) {
                  setIsCollapsed(!isCollapsed);
                  return;
                }
                setIsOpen(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-300 transition hover:bg-white/10 hover:text-white"
              title={showCompact ? "Expandir menu" : "Recolher menu"}
            >
              {showCompact ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>

            {!showCompact && (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-violet-600 to-indigo-600 shadow-lg shadow-indigo-900/30">
                  <img src="/logo.png" alt="IT4You" className="h-6 w-6" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-black tracking-tight text-white">
                    IT4You AI ERP
                  </p>
                  <p className="text-[11px] font-semibold text-neutral-400">
                    Assistente Conversacional
                  </p>
                </div>
              </div>
            )}
          </div>

          {showCompact && (
            <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-violet-600 to-indigo-600 shadow-lg shadow-indigo-900/30">
              <img src="/logo.png" alt="IT4You" className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-b border-neutral-800 p-4 md:hidden">
          <span className="font-bold tracking-tight text-white">
            IT4You <span className="font-light text-emerald-500">ERP</span>
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-neutral-400 hover:text-white"
            title="Fechar menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className={showCompact ? "flex justify-center px-3 pt-2" : "px-5"}>
          <Link
            href="/chat/new"
            onClick={closeSidebar}
            className={`flex w-full items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-r from-violet-600 to-indigo-600 font-bold text-white shadow-lg shadow-indigo-900/30 transition hover:from-violet-500 hover:to-indigo-500 ${
              showCompact ? "h-11 w-11 px-0" : "gap-2 px-4 py-3"
            }`}
            title="Nova conversa"
          >
            <Plus className="h-5 w-5" />
            {!showCompact && "Nova Conversa"}
          </Link>
        </div>

        <div
          className={`${
            showCompact ? "flex flex-col items-center px-3" : "px-5"
          } space-y-1 pt-5`}
        >
          <Link
            href="/chat"
            onClick={closeSidebar}
            className={navItemClass}
            title="Inicio"
          >
            <Home className="h-5 w-5 text-violet-300" />
            {!showCompact && <span className="text-sm font-semibold">Inicio</span>}
          </Link>

          <Link
            href={canSeeDashboards ? "/chat/finance-analytics" : "/chat"}
            onClick={closeSidebar}
            className={`${navItemClass} ${canSeeDashboards ? "" : "opacity-60"}`}
            title="Dashboards"
          >
            <LayoutDashboard className="h-5 w-5 text-violet-300" />
            {!showCompact && (
              <span className="text-sm font-semibold">Dashboards</span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => {
              closeSidebar();
              setIsFavoritesOpen(true);
            }}
            className={navItemClass}
            title="Favoritos"
          >
            <Star className="h-5 w-5 text-violet-300" />
            {!showCompact && (
              <span className="text-sm font-semibold">Favoritos</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleScrollToRecent}
            className={navItemClass}
            title="Historico"
          >
            <History className="h-5 w-5 text-violet-300" />
            {!showCompact && (
              <span className="text-sm font-semibold">Historico</span>
            )}
          </button>
        </div>

        <div
          className={`my-4 h-px bg-neutral-800/80 ${
            showCompact ? "mx-auto w-10" : "mx-5"
          }`}
        />

        <div
          className={`mt-2 flex-1 overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-800 ${
            showCompact ? "px-2" : "px-3"
          }`}
        >
          <div ref={recentRef} />

          {!showCompact && (
            <>
              <h3 className="mt-2 mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Conversas Recentes
              </h3>
              {recentSessions.length === 0 ? (
                <div className="px-2 py-3 text-center text-xs text-neutral-600">
                  Nenhuma conversa.
                </div>
              ) : (
                <ul className="mb-4 space-y-1">
                  {recentSessions.map((session) => (
                    <li key={session.id} className="group relative">
                      <Link
                        href={`/chat/${session.id}`}
                        onClick={closeSidebar}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-neutral-800/50"
                      >
                        <MessageSquare className="h-4 w-4 shrink-0 text-neutral-500 transition-colors group-hover:text-emerald-400" />
                        <div className="mr-6 flex flex-1 flex-col truncate">
                          <span className="text-sm font-medium text-neutral-300 transition-colors group-hover:text-white">
                            {formatSessionDate(session.createdAt)}
                          </span>
                          <span className="truncate text-xs text-neutral-500 transition-colors group-hover:text-neutral-400">
                            {session.title || "Conversa Sem Titulo"}
                          </span>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSessionToDelete(session.id);
                        }}
                        className="absolute top-1/2 right-2 z-10 p-2 text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-400"
                        title="Ocultar"
                      >
                        <Trash2 className="h-4 w-4 -translate-y-1/2" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div
          className={`border-t border-neutral-800 bg-neutral-950/30 ${
            showCompact ? "p-3" : "p-4"
          }`}
        >
          <div
            className={`flex items-center ${
              showCompact ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-sm font-bold text-emerald-400">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              {!showCompact && (
                <div className="truncate">
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    {user?.role === "TENANT_ADMIN" ? "Administrador" : "Membro"}
                  </p>
                </div>
              )}
            </div>

            {!showCompact && (
              <div className="flex shrink-0 items-center">
                {user?.role === "TENANT_ADMIN" && (
                  <Link
                    href="/admin"
                    className="p-2 text-neutral-500 transition-colors hover:text-white"
                    title="Configuracoes da empresa"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 text-neutral-500 transition-colors hover:text-red-400"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </button>
                <ChevronDown className="ml-1 h-4 w-4 text-neutral-600" />
              </div>
            )}
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
            className="absolute inset-0 animate-in fade-in bg-black/60 backdrop-blur-sm duration-300"
            onClick={() => !isDeleting && setSessionToDelete(null)}
          />
          <div className="relative w-full max-w-sm animate-in zoom-in-95 rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-center shadow-2xl fade-in duration-300">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <Trash2 className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">
              Ocultar Conversa?
            </h3>
            <p className="mb-8 text-sm leading-relaxed text-neutral-400">
              Esta conversa sera ocultada do seu historico. Os dados sao mantidos
              internamente e podem ser acessados pela gestao para analise futura.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full rounded-2xl bg-rose-600 py-4 font-bold text-white shadow-lg shadow-rose-900/20 transition-all hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "OCULTANDO..." : "SIM, OCULTAR AGORA"}
              </button>
              <button
                onClick={() => setSessionToDelete(null)}
                disabled={isDeleting}
                className="w-full rounded-2xl bg-neutral-800 py-4 font-bold text-neutral-300 transition-all hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50"
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
