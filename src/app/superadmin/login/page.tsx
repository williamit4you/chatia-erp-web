"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Home } from "lucide-react";

function SuperAdminLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const errorParam = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password
            });

            if (res?.error) {
                setError("Credenciais inválidas para Super Admin.");
            } else {
                router.push("/superadmin");
            }
        } catch (err) {
            setError("Ocorreu um erro inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-neutral-900 py-10 px-6 shadow-2xl shadow-black/50 sm:rounded-2xl sm:px-12 border border-neutral-800">
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm border border-red-500/20 font-medium">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-neutral-300">Email Administrativo</label>
                    <div className="mt-2">
                        <input
                            name="email"
                            type="email"
                            required
                            className="appearance-none block w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl shadow-sm placeholder-neutral-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-300">Senha Master</label>
                    <div className="mt-2">
                        <input
                            name="password"
                            type="password"
                            required
                            className="appearance-none block w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl shadow-sm placeholder-neutral-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Autenticando..." : "Acessar Painel Central"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function SuperAdminLoginPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-xl hover:bg-neutral-800 hover:text-white transition-all font-medium text-sm shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
                <Home className="h-4 w-4" />
                Voltar à Tela Inicial
            </Link>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
                    Super Admin IT4You
                </h2>
                <p className="mt-3 text-center text-sm text-neutral-400">
                    Acesso restrito à diretoria.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Suspense fallback={<div className="text-center p-8 bg-neutral-900 border border-neutral-800 text-white rounded-2xl shadow-xl">Carregando...</div>}>
                    <SuperAdminLoginForm />
                </Suspense>
            </div>
        </div>
    );
}
