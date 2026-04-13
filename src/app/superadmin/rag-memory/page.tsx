import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain, ArrowLeft, PlusCircle, PencilLine, Trash2, Power, PowerOff } from "lucide-react";
import RagMemoryTableActions from "./RagMemoryTableActions"; // Client Component

export default async function RagMemoryList() {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SUPER_ADMIN") {
        redirect("/superadmin/login");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/superadmin/agent-memory`, {
        headers: { Authorization: `Bearer ${(session.user as any).accessToken}` },
        cache: 'no-store'
    });

    const memories = res.ok ? await res.json() : [];

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header Navbar */}
                <div className="flex items-center justify-between">
                    <Link href="/superadmin" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                        Voltar para Empresas
                    </Link>
                </div>

                {/* Banner RAG Explanatório */}
                <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 opacity-10 blur-xl pointer-events-none">
                        <Brain className="w-64 h-64 text-emerald-500" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-6">
                        <div className="bg-emerald-500/20 p-4 rounded-xl border border-emerald-500/30 h-fit self-start">
                            <Brain className="h-8 w-8 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-emerald-400">Como funciona a Memória RAG (Retrieval-Augmented Generation)?</h2>
                            <p className="text-neutral-300 mt-2 leading-relaxed">
                                Neste painel, você cadastra as <strong>regras sistêmicas e o conhecimento global</strong> da aplicação, conhecidos como <i>Memória RAG</i>.
                                <br/><br/>
                                Sempre que um usuário envia uma mensagem no chat, a IA fará uma busca vetorial super-rápida (via OpenAI) dentro desta lista. O sistema localiza o conhecimento com contexto semântico mais próximo da pergunta do usuário e o injeta "invisivelmente" na instrução do Agente ali mesmo.
                                Isto permite programar comportamentos globais e forçar desambiguações lógicas (Ex: Reagir ativamente como deve lidar se cliente disser a palavra "empresa"), tornando a Inteligência Artificial totalmente calibrada para seu negócio, sem perder os limites do Sistema Base.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">Memórias Semânticas Cadastradas</h3>
                    <Link 
                        href="/superadmin/rag-memory/new"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/20 border border-emerald-500"
                    >
                        <PlusCircle className="h-5 w-5" />
                        Cadastrar Nova Regra RAG
                    </Link>
                </div>

                {/* Table View */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                    {memories.length === 0 ? (
                        <div className="p-12 text-center">
                            <Brain className="h-12 w-12 text-neutral-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-neutral-300">Nenhum conhecimento base cadastrado</h3>
                            <p className="text-neutral-500 mt-1">O agente está rodando apenas com seu System Prompt nativo.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-950/50 text-neutral-400 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold w-24">Status</th>
                                    <th className="px-6 py-4 font-semibold">Conteúdo / Regra de Negócio</th>
                                    <th className="px-6 py-4 font-semibold w-40">Criado em</th>
                                    <th className="px-6 py-4 font-semibold text-right w-40">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {memories.map((m: any) => (
                                    <tr key={m.id} className={`transition-colors ${m.isActive ? 'hover:bg-neutral-800/80 bg-neutral-800/30' : 'bg-neutral-900/50 opacity-60'}`}>
                                        <td className="px-6 py-4">
                                            {m.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 text-xs font-medium">
                                                    Inativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-300 pr-8">
                                            {/* Exibindo string até limite. */}
                                            <p className="line-clamp-3 leading-relaxed">{m.content}</p>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400 text-xs">
                                            {new Date(m.createdAt).toLocaleString("pt-BR")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <RagMemoryTableActions memoryId={m.id} isActive={m.isActive} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </div>
    );
}
