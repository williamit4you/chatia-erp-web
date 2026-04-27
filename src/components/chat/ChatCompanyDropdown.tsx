"use client";

import { Bell, ChevronDown, CircleHelp, Building2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ChatCompanyDropdown() {
  const { data: session } = useSession();
  const tenantName =
    (session?.user as any)?.tenantName ||
    (session?.user as any)?.companyName ||
    "—";

  return (
    <div className="flex items-center gap-3 shrink-0">
      <button
        type="button"
        className="hidden sm:flex items-center justify-center h-9 w-9 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition"
        title="Notificações"
      >
        <Bell className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="hidden sm:flex items-center justify-center h-9 w-9 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition"
        title="Ajuda"
      >
        <CircleHelp className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
        <div className="hidden sm:flex h-9 w-9 rounded-xl bg-neutral-50 border border-neutral-200 items-center justify-center text-neutral-700">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-neutral-500 leading-none">
            Empresa
          </p>
          <p className="text-sm font-bold text-neutral-900 truncate max-w-[220px]">
            {tenantName}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-neutral-400" />
      </div>
    </div>
  );
}

