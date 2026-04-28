"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Mail, Send, Save } from "lucide-react";
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

type EmailSettings = typeof initialForm & { id?: string };

function maskEmail(value?: string) {
  if (!value) return "";
  const [localPart, domain] = value.split("@");
  if (!domain) return "••••";
  const maskedLocal = localPart.length <= 2 ? "••" : `${localPart.slice(0, 2)}•••`;
  return `${maskedLocal}@${domain}`;
}

function LabeledInput(props: {
  id: string;
  label: string;
  value: string | number;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  name?: string;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
}) {
  const { id, label, value, type = "text", placeholder, onChange, inputMode, name, autoComplete = "off", rightSlot } = props;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-neutral-600">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || label}
          inputMode={inputMode}
          autoComplete={autoComplete}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className={`w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm ${rightSlot ? "pr-11" : ""}`}
        />
        {rightSlot && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightSlot}</div>}
      </div>
    </div>
  );
}

function LabeledSelect(props: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const { id, label, value, onChange, children } = props;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-neutral-600">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm"
      >
        {children}
      </select>
    </div>
  );
}

export default function EmailSettingsClient() {
  const [configId, setConfigId] = useState<string | undefined>();
  const [form, setForm] = useState<EmailSettings>(initialForm);
  const [testEmail, setTestEmail] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [existingConfig, setExistingConfig] = useState<EmailSettings | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const configs = await emailAdminService.getSettings();
        if (cancelled) return;
        const active = configs?.[0] as EmailSettings | undefined;
        if (!active) return;
        setConfigId(active.id);
        setExistingConfig({
          ...initialForm,
          ...active,
          smtpPassword: "",
          receivePassword: "",
        });
      } catch (error: any) {
        if (cancelled) return;
        toast.error(error.response?.data?.message || "Erro ao carregar configurações.");
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setValue = (key: string, value: any) => setForm((current) => ({ ...current, [key]: value }));

  const existingSummary = useMemo(() => {
    if (!existingConfig) return null;
    return {
      smtpHost: existingConfig.smtpHost || "",
      smtpPort: existingConfig.smtpPort || "",
      smtpUser: maskEmail(existingConfig.smtpUser),
    };
  }, [existingConfig]);

  const loadForEditing = () => {
    if (!existingConfig) return;
    setForm(existingConfig);
    setEditMode(true);
    toast.message("Configuração carregada para edição.");
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditMode(false);
    toast.message("Campos limpos.");
  };

  const buildPartialPayload = (data: EmailSettings) => {
    // Backend expects a full `EmailConfigurationRequest` (not partial updates).
    // Keep the full payload and only omit optional password fields when empty so we don't clear secrets.
    const payload: Record<string, any> = { ...data };
    if (!payload.smtpPassword) delete payload.smtpPassword;
    if (!payload.receivePassword) delete payload.receivePassword;
    return payload;
  };

  const save = async () => {
    const personalDomains = new Set([
      "gmail.com",
      "hotmail.com",
      "outlook.com",
      "live.com",
      "icloud.com",
      "yahoo.com",
    ]);
    const senderDomain = (form.senderEmail || "").split("@")[1]?.toLowerCase();
    const smtpUserDomain = (form.smtpUser || "").split("@")[1]?.toLowerCase();
    const looksPersonal = Boolean(
      (senderDomain && personalDomains.has(senderDomain)) || (smtpUserDomain && personalDomains.has(smtpUserDomain))
    );

    if (looksPersonal && typeof window !== "undefined") {
      const message =
        `ATENÇÃO: parece e-mail pessoal (ex: Gmail/Hotmail/Outlook).\n\n` +
        `Confirma salvar mesmo assim?\n\n` +
        `E-mail do remetente: ${form.senderEmail || "(vazio)"}\n` +
        `Usuário SMTP: ${form.smtpUser || "(vazio)"}`;
      if (!window.confirm(message)) return;
    }

    setLoading(true);
    try {
      const saved = await emailAdminService.saveSettings(buildPartialPayload(form) as any, configId);
      setConfigId(saved.id);
      setExistingConfig({ ...form, id: saved.id, smtpPassword: "", receivePassword: "" });
      setEditMode(false);
      setForm(initialForm);
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

      {existingConfig && !editMode && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-amber-900">
              <div className="font-bold">Configuração já existe</div>
              <div className="text-amber-800">
                Por segurança, os dados não são carregados automaticamente. Clique em “Carregar para editar”.
                {existingSummary && (
                  <span className="ml-1 text-amber-800/90">
                    (SMTP: {existingSummary.smtpHost || "—"}:{existingSummary.smtpPort || "—"} • Usuário:{" "}
                    {existingSummary.smtpUser || "—"})
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadForEditing}
                disabled={initialLoading || loading}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-bold disabled:opacity-60"
              >
                Carregar para editar
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={initialLoading || loading}
                className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-900 text-sm font-bold disabled:opacity-60"
              >
                Novo / Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {existingConfig && editMode && (
        <div className="mb-6 text-xs text-neutral-500">
          Salvamento parcial: campos vazios e senhas vazias não sobrescrevem o que já existe.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Mail className="h-5 w-5 text-emerald-600" />
            <h2 className="font-black text-neutral-900">SMTP</h2>
          </div>
          <div className="space-y-3">
            <LabeledInput id="smtp-name" name="email_settings_profile_name" label="Nome" value={form.name || ""} onChange={(v) => setValue("name", v)} />
            <LabeledInput id="smtp-senderName" name="email_settings_sender_name" label="Nome do remetente" value={form.senderName || ""} onChange={(v) => setValue("senderName", v)} />
            <LabeledInput id="smtp-senderEmail" name="email_settings_sender_email" autoComplete="off" label="E-mail do remetente" value={form.senderEmail || ""} onChange={(v) => setValue("senderEmail", v)} type="email" inputMode="email" placeholder="ex: no-reply@empresa.com" />
            <LabeledInput id="smtp-host" name="email_settings_smtp_host" label="Host SMTP" value={form.smtpHost || ""} onChange={(v) => setValue("smtpHost", v)} placeholder="ex: smtp.gmail.com" />
            <LabeledInput id="smtp-user" name="email_settings_smtp_login" autoComplete="off" label="Usuário SMTP" value={form.smtpUser || ""} onChange={(v) => setValue("smtpUser", v)} placeholder="ex: usuario@empresa.com" />
            <LabeledInput
              id="smtp-password"
              name="email_settings_smtp_password"
              autoComplete="new-password"
              label="Senha SMTP"
              value={form.smtpPassword || ""}
              onChange={(v) => setValue("smtpPassword", v)}
              type={showSmtpPassword ? "text" : "password"}
              placeholder="••••••••"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowSmtpPassword((v) => !v)}
                  className="text-neutral-500 hover:text-neutral-900"
                  aria-label={showSmtpPassword ? "Ocultar senha SMTP" : "Mostrar senha SMTP"}
                >
                  {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <LabeledInput id="smtp-port" name="email_settings_smtp_port" label="Porta SMTP" value={form.smtpPort} onChange={(v) => setValue("smtpPort", Number(v))} type="number" inputMode="numeric" placeholder="587" />
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={form.smtpUseSsl} onChange={(e) => setValue("smtpUseSsl", e.target.checked)} />
              Usar SSL/TLS
            </label>
          </div>
        </section>

        <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-black text-neutral-900 mb-5">Recebimento POP3/IMAP</h2>
          <div className="space-y-3">
            <LabeledSelect id="receive-protocol" label="Protocolo" value={form.receiveProtocol} onChange={(v) => setValue("receiveProtocol", v)}>
              <option value="NONE">Nenhum</option>
              <option value="POP3">POP3</option>
              <option value="IMAP">IMAP</option>
            </LabeledSelect>
            <LabeledInput id="receive-host" name="email_settings_receive_host" label="Host" value={form.receiveHost || ""} onChange={(v) => setValue("receiveHost", v)} placeholder="ex: imap.gmail.com" />
            <LabeledInput id="receive-user" name="email_settings_receive_login" autoComplete="off" label="Usuário" value={form.receiveUser || ""} onChange={(v) => setValue("receiveUser", v)} placeholder="ex: usuario@empresa.com" />
            <LabeledInput id="receive-password" name="email_settings_receive_password" autoComplete="new-password" label="Senha" value={form.receivePassword || ""} onChange={(v) => setValue("receivePassword", v)} type="password" placeholder="••••••••" />
            <LabeledInput id="receive-port" name="email_settings_receive_port" label="Porta" value={form.receivePort || ""} onChange={(v) => setValue("receivePort", Number(v))} type="number" inputMode="numeric" placeholder="995" />
            <LabeledInput id="timeout" name="email_settings_timeout" label="Timeout (segundos)" value={form.timeoutSeconds} onChange={(v) => setValue("timeoutSeconds", Number(v))} type="number" inputMode="numeric" placeholder="30" />
          </div>
        </section>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={save}
          disabled={loading || initialLoading || (Boolean(existingConfig) && !editMode)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          Salvar configuração
        </button>
        <div className="flex-1">
          <LabeledInput id="test-email" name="email_settings_test_email" autoComplete="off" label="E-mail de teste" value={testEmail} onChange={setTestEmail} type="email" inputMode="email" placeholder="destino@empresa.com" />
        </div>
        <button onClick={test} disabled={loading || initialLoading || !configId || !testEmail} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white font-bold disabled:opacity-60">
          <Send className="h-4 w-4" />
          Testar envio
        </button>
      </div>
    </div>
  );
}

