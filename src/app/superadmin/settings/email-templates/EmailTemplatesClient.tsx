"use client";

import { useEffect, useState } from "react";
import { Edit2, Save } from "lucide-react";
import { toast } from "sonner";
import { emailAdminService } from "@/services/email-admin.service";

export default function EmailTemplatesClient() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => setTemplates(await emailAdminService.getTemplates());

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    try {
      await emailAdminService.saveTemplate(editing, editing.id);
      toast.success("Template salvo.");
      setEditing(null);
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar template.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900">Templates de e-mail</h1>
        <p className="text-sm text-neutral-500 mt-1">Edite os modelos usados para recuperação, confirmação e testes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
          {templates.map((template) => (
            <button key={template.id} onClick={() => setEditing(template)} className="w-full text-left px-5 py-4 border-b border-neutral-100 hover:bg-neutral-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-neutral-900">{template.name}</p>
                <p className="text-xs text-neutral-500">{template.key}</p>
              </div>
              <Edit2 className="h-4 w-4 text-neutral-400" />
            </button>
          ))}
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          {editing ? (
            <div className="space-y-4">
              <input value={editing.key} onChange={(e) => setEditing({ ...editing, key: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl" placeholder="Chave" />
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl" placeholder="Nome" />
              <input value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl" placeholder="Assunto" />
              <textarea value={editing.htmlBody} onChange={(e) => setEditing({ ...editing, htmlBody: e.target.value })} className="w-full min-h-52 px-4 py-3 border border-neutral-200 rounded-xl font-mono text-sm" placeholder="HTML" />
              <textarea value={editing.textBody || ""} onChange={(e) => setEditing({ ...editing, textBody: e.target.value })} className="w-full min-h-24 px-4 py-3 border border-neutral-200 rounded-xl text-sm" placeholder="Texto alternativo" />
              <p className="text-xs text-neutral-500">Variáveis: {editing.allowedVariables}</p>
              <button onClick={save} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold">
                <Save className="h-4 w-4" />
                Salvar template
              </button>
            </div>
          ) : (
            <div className="h-full min-h-72 flex items-center justify-center text-neutral-500 text-sm">
              Selecione um template para editar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

