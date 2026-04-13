"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Save, Loader2, BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function RagMemoryForm({ initialData, memoryId }: { initialData?: any, memoryId?: string }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [content, setContent] = useState(initialData?.content || "");
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const isEditing = !!memoryId;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            setErrorMsg("O texto da regra não pode ser vazio.");
            return;
        }

        setIsSaving(true);
        setErrorMsg("");

        try {
            const url = isEditing 
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/superadmin/agent-memory/${memoryId}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/superadmin/agent-memory`;
                
            const res = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${(session?.user as any)?.accessToken}`
                },
                body: JSON.stringify({ content })
            });

            if (res.ok) {
                router.push("/superadmin/rag-memory");
                router.refresh();
            } else {
                const data = await res.json();
                setErrorMsg(data.message || "Falha ao salvar a regra. Certifique-se de que há um Tenant com IA Token válido no sistema.");
            }
        } catch (error) {
            console.error(error);
            setErrorMsg("Ocorreu um erro de conexão.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <Link href="/superadmin/rag-memory" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-neutral-800 px-3 py-1.5 rounded-lg">
                    <ArrowLeft className="h-5 w-5" />
                    Voltar para Lista
                </Link>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-5 border-b border-neutral-800 flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <BrainCircuit className="h-5 w-5 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                        {isEditing ? "Editar Regra RAG" : "Nova Regra do RAG Global"}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    {errorMsg && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                            {errorMsg}
                        </div>
                    )}
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Regra de Negócio Sistêmica ou Base de Conhecimento
                            </label>
                            <p className="text-sm text-neutral-500 mb-3">
                                Escreva detalhadamente a regra ou o contexto semântico que o agente deve respeitar. 
                                Quando o usuário digitar algo referente a este assunto, o texto abaixo será recuperado e injetado nos bastidores da IA.
                            </p>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-48 px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-sm leading-relaxed"
                                placeholder="Ex: Quando um usuário utilizar o termo 'empresa', você DEVE obrigatoriamente parar a execução e perguntar se ele está falando sobre Cliente, Fornecedor ou Empresa do Sistema SaaS."
                                required
                            />
                            <div className="mt-2 flex justify-end text-xs text-neutral-500">
                                Total de caracteres: {content.length}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800/50">
                            <Link 
                                href="/superadmin/rag-memory"
                                className="px-5 py-2.5 rounded-xl font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={isSaving || !content.trim()}
                                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/20 border border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Geração de Vetores...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Salvar e Vetorizar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
