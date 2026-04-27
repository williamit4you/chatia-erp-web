"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Eye, EyeOff, Home } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered");
    const callbackUrl = searchParams.get("callbackUrl") || "/chat";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
                password,
            });

            if (res?.error) {
                // If it's a specific message we sent from the backend, show it.
                // Otherwise show the generic one.
                if (res.error === "CredentialsSignin") {
                    setError("Email ou senha inválidos.");
                } else {
                    setError(res.error);
                }
            } else {
                router.push(callbackUrl);
            }
        } catch (err) {
            setError("Ocorreu um erro inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white py-10 px-6 shadow-xl shadow-neutral-200/50 sm:rounded-2xl sm:px-12 border border-neutral-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
                {registered && (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm border border-emerald-100 font-medium">
                        Empresa cadastrada com sucesso! Faça login para continuar.
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Email</label>
                    <div className="mt-2">
                        <input
                            name="email"
                            type="email"
                            required
                            className="appearance-none block w-full px-4 py-3 border border-neutral-200 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Senha</label>
                    <div className="mt-2 relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            className="appearance-none block w-full px-4 py-3 border border-neutral-200 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-12"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Link href="/login/forgot-password" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                        Esqueci minha senha
                    </Link>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Entrando..." : "Entrar no Sistema"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center">Carregando...</div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "";

    const isAdminLogin = callbackUrl.includes("/admin");
    const isSuperAdminLogin = callbackUrl.includes("/superadmin");

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
            <Link
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-100 hover:text-neutral-900 transition-all font-medium text-sm shadow-sm"
            >
                <Home className="h-4 w-4" />
                Voltar à Tela Inicial
            </Link>

            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
                <img src="/logo.png" alt="IT4You Logo" className="h-24 w-auto mb-6" />
                <h2 className="text-center text-3xl font-extrabold text-neutral-900 tracking-tight">
                    {isSuperAdminLogin ? "Painel Super Admin" : isAdminLogin ? "Acessar Agente de IA" : "Acesse sua base"}
                </h2>
                <p className="mt-3 text-center text-sm text-neutral-600">
                    {isSuperAdminLogin ? "Acesso restrito ao administrador do sistema" : isAdminLogin ? "Entre para acessar sua inteligência erp" : "Insira suas credenciais da empresa"}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <LoginForm />
            </div>
        </div>
    );
}
