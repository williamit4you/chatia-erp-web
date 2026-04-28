"use client";

import { Building2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ChatCompanyDropdown() {
  const { data: session } = useSession();
  const tenantName =
    (session?.user as any)?.tenantName ||
    (session?.user as any)?.companyName ||
    "--";

  return (
    <div className="flex items-center shrink-0">
      <div className="flex min-w-[360px] items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-1.5 shadow-sm sm:min-w-[420px]">
        <div className="hidden sm:flex h-9 w-9 rounded-xl border border-neutral-200 bg-neutral-50 items-center justify-center text-neutral-700">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold leading-none text-neutral-500">
            Empresa
          </p>
          <p className="truncate text-sm font-bold text-neutral-900">
            {tenantName}
          </p>
        </div>
      </div>
    </div>
  );
}
