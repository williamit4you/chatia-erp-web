import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import EmailLogsClient from "./EmailLogsClient";
import Link from "next/link";

export default async function EmailLogsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const callbackUrl = encodeURIComponent("/superadmin/email-logs");
    redirect(`/superadmin/login?callbackUrl=${callbackUrl}`);
  }
  if ((session.user as any).role !== "SUPER_ADMIN") redirect("/chat");

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/superadmin" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900">
            ← Voltar para Super Admin
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/superadmin/settings/email" className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-800 text-sm font-semibold hover:bg-neutral-50">
              Config E-mail
            </Link>
            <Link href="/superadmin/settings/email-templates" className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-800 text-sm font-semibold hover:bg-neutral-50">
              Templates
            </Link>
            <Link href="/superadmin/email-logs" className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-sm font-semibold">
              Logs
            </Link>
          </div>
        </div>
      </div>
      <EmailLogsClient />
    </div>
  );
}
