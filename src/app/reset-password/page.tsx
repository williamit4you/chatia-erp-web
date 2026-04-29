"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { passwordService } from "@/services/password.service";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [reason, setReason] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const validate = async () => {
      setValidating(true);
      setMessage("");

      if (!token) {
        setIsValid(false);
        setReason("TOKEN_INVALID");
        setValidating(false);
        return;
      }

      try {
        const result = await passwordService.validateResetToken(token);
        setIsValid(result.valid);
        setReason(result.reason || "");
      } catch {
        setIsValid(false);
        setReason("TOKEN_INVALID");
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const liveToken = new URLSearchParams(window.location.search).get("token")?.trim() || "";
      const validation = await passwordService.validateResetToken(liveToken);

      if (!validation.valid) {
        setIsValid(false);
        setReason(validation.reason || "TOKEN_INVALID");
        setMessage(
          validation.reason === "TOKEN_EXPIRED"
            ? "Este link expirou. Solicite uma nova recuperacao de senha."
            : "Este link e invalido ou ja foi utilizado."
        );
        return;
      }

      await passwordService.resetPassword(liveToken, newPassword, confirmPassword);
      setMessage("Senha alterada com sucesso. Voce ja pode voltar ao login.");
      setIsValid(false);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Nao foi possivel alterar a senha.");
    } finally {
      setLoading(false);
    }
  };

  const invalidText = reason === "TOKEN_EXPIRED"
    ? "Este link expirou. Solicite uma nova recuperacao de senha."
    : "Este link e invalido ou ja foi utilizado.";

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-black text-neutral-900">Alterar senha</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Este link de redefinicao e valido por apenas 30 minutos.
        </p>

        {validating ? (
          <p className="mt-4 text-sm text-neutral-500">Validando link...</p>
        ) : isValid ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nova senha"
            />
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Confirmar nova senha"
            />
            {message && <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{message}</div>}
            <button disabled={loading} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-60">
              {loading ? "Alterando..." : "Alterar senha"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
              {message || invalidText}
            </div>
            <Link href="/login/forgot-password" className="block text-center py-3 rounded-xl bg-neutral-900 text-white font-bold">
              Solicitar novo link
            </Link>
          </div>
        )}

        <Link href="/login" className="block mt-5 text-center text-sm font-semibold text-neutral-500 hover:text-neutral-900">
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center">Carregando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
