"use client";

import Link from "next/link";
import { PlusCircle, MessageSquare, LogOut, Settings, MoreVertical, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useSidebar } from "./SidebarContext";

interface ChatSidebarProps {
    sessions: any[];
    user: any;
}

export default function ChatSidebar({ sessions, user }: ChatSidebarProps) {
    const { isOpen, setIsOpen } = useSidebar();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 transform w-72 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full text-neutral-300 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Mobile Header logic - close button */}
                <div className="flex md:hidden justify-between items-center p-4 border-b border-neutral-800">
                    <span className="font-bold text-white tracking-tight">IT4You <span className="text-emerald-500 font-light">ERP</span></span>
                    <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white p-1">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="p-4">
                    <Link
                        href="/chat"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 w-full px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors border border-neutral-700"
                    >
                        <PlusCircle className="h-5 w-5 text-emerald-500" />
                        Nova Conversa
                    </Link>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto mt-2 px-3 pb-4">
                    <h3 className="px-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                        Últimas Conversas
                    </h3>

                    {sessions.length === 0 ? (
                        <div className="px-2 py-4 text-center text-sm text-neutral-600">
                            Nenhuma conversa recente.
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {sessions.map((session) => (
                                <li key={session.id}>
                                    <Link
                                        href={`/chat/${session.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800/50 transition-colors group"
                                    >
                                        <MessageSquare className="h-4 w-4 text-neutral-500 group-hover:text-neutral-400" />
                                        <span className="text-sm font-medium truncate flex-1 text-neutral-300 group-hover:text-white">
                                            {session.title || "Conversa Sem Título"}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* User Profile Section */}
                <div className="p-4 border-t border-neutral-800 bg-neutral-950/30">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-9 w-9 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm border border-emerald-500/30 shrink-0">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="truncate">
                                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-neutral-500 truncate">{user?.role === 'TENANT_ADMIN' ? 'Administrador' : 'Membro'}</p>
                            </div>
                        </div>

                        <div className="flex shrink-0">
                            {user?.role === "TENANT_ADMIN" && (
                                <Link href="/admin" className="p-2 text-neutral-500 hover:text-white transition-colors" title="Configurações da Empresa">
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
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
