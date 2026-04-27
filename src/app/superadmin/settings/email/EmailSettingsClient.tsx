"use client";

import { useEffect, useState } from "react";
import { Mail, Send, Save } from "lucide-react";
import { toast } from "sonner";
import { emailAdminService } from "@/services/email-admin.service";

const initialForm = {
  name: "Configuração principal",
  senderName: "IT4You AI ERP",
  senderEmail: "",
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPassword: "",
  smtpUseSsl: true,
  smtpUseStartTls: true,
  receiveProtocol: "NONE",
  receiveHost: "",
  receivePort: 995,
  receiveUser: "",
  receivePassword: "",
  receiveUseSsl: true,
  timeoutSeconds: 30,
  isActive: true,
};

export default function EmailSettingsClient() {
  const [configId, setConfigId] = useState<string | undefined>();
  const [form, setForm] = useState<any>(initialForm);
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    emailAdminService.getSettings().then((configs) => {
      const active = configs?.[0];
      if (!active) return;
      setConfigId(active.id);
      setForm({
        ...initialForm,
        ...active,
        smtpPassword: "",
        receivePassword: "",
      });
    });
  }, []);

  const setValue = (key: string, value: any) => setForm((current: any) => ({ ...current, [key]: value }));

  const save = async () => {
    setLoading(true);
    try {
      const saved = await emailAdminService.saveSettings(form, configId);
      setConfigId(saved.id);
      toast.success("Configuração de e-mail salva.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar configuração.");
    } finally {
      setLoading(false);
    }
  };

  const test = async () => {
    if (!configId || !testEmail) return;
    setLoading(true);
    try {
      await emailAdminService.testSettings(configId, testEmail);
      toast.success("E-mail de teste enviado.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao testar envio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900">Configuração de e-mail</h1>
        <p className="text-neutral-500 text-sm mt-1">Cadastre SMTP, POP3/IMAP e teste o envio transacional.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Mail className="h-5 w-5 text-emerald-600" />
            <h2 className="font-black text-neutral-900">SMTP</h2>
          </div>
          <div className="space-y-3">
            {[
              ["name", "Nome"],
              ["senderName", "Nome do remetente"],
              ["senderEmail", "E-mail do remetente"],
              ["smtpHost", "Host SMTP"],
              ["smtpUser", "Usuário SMTP"],
              ["smtpPassword", "Senha SMTP"],
            ].map(([key, label]) => (
              <input key={key} type={key.includes("Password") ? "password" : "text"} value={form[key] || ""} onChange={(e) => setValue(key, e.target.value)} placeholder={label} className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm" />
            ))}
            <input type="number" value={form.smtpPort} onChange={(e) => setValue("smtpPort", Number(e.target.value))} placeholder="Porta SMTP" className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm" />
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={form.smtpUseSsl} onChange={(e) => setValue("smtpUseSsl", e.target.checked)} />
              Usar SSL/TLS
            </label>
          </div>
        </section>

        <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-black text-neutral-900 mb-5">Recebimento POP3/IMAP</h2>
          <div className="space-y-3">
            <select value={form.receiveProtocol} onChange={(e) => setValue("receiveProtocol", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm">
              <option value="NONE">Nenhum</option>
              <option value="POP3">POP3</option>
              <option value="IMAP">IMAP</option>
            </select>
            {[
              ["receiveHost", "Host"],
              ["receiveUser", "Usuário"],
              ["receivePassword", "Senha"],
            ].map(([key, label]) => (
              <input key={key} type={key.includes("Password") ? "password" : "text"} value={form[key] || ""} onChange={(e) => setValue(key, e.target.value)} placeholder={label} className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm" />
            ))}
            <input type="number" value={form.receivePort || ""} onChange={(e) => setValue("receivePort", Number(e.target.value))} placeholder="Porta" className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm" />
            <input type="number" value={form.timeoutSeconds} onChange={(e) => setValue("timeoutSeconds", Number(e.target.value))} placeholder="Timeout" className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm" />
          </div>
        </section>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button onClick={save} disabled={loading} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-60">
          <Save className="h-4 w-4" />
          Salvar configuração
        </button>
        <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} type="email" placeholder="destino@empresa.com" className="flex-1 px-4 py-3 rounded-xl border border-neutral-200" />
        <button onClick={test} disabled={loading || !configId || !testEmail} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white font-bold disabled:opacity-60">
          <Send className="h-4 w-4" />
          Testar envio
        </button>
      </div>
    </div>
  );
}

