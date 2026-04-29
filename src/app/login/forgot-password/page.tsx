"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { passwordService } from "@/services/password.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await passwordService.forgotPassword(email);
      setMessage(response.message || "Se o e-mail estiver cadastrado, enviaremos instrucoes.");
    } catch {
      setMessage("Nao foi possivel processar a solicitacao agora.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>

        <div className="mb-8">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900">Recuperar senha</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Informe seu e-mail para receber um link seguro de redefinicao valido por 30 minutos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="seuemail@empresa.com"
          />

          {message && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar instrucoes"}
          </button>
        </form>
      </div>
    </div>
  );
}
