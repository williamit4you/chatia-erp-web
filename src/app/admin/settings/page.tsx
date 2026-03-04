import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const userRole = (session.user as any).role;
    const tenantId = (session.user as any).tenantId;

    if (userRole !== "TENANT_ADMIN" && userRole !== "SUPER_ADMIN") {
        redirect("/dashboard");
    }

    const req = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${(session.user as any).accessToken}` },
        cache: 'no-store'
    });
    const tenant = req.ok ? await req.json() : { iaToken: "", erpToken: "" };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-8">Configurações da Empresa</h1>
            <SettingsForm initialIaToken={tenant?.iaToken || ""} initialErpToken={tenant?.erpToken || ""} />
        </div>
    );
}
