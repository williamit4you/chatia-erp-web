import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ClientManagement from "./ClientManagement";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login?callbackUrl=/admin");
    }

    const userRole = (session.user as any).role;
    const token = (session.user as any).accessToken;
    const isTenantAdmin = userRole === "TENANT_ADMIN" || userRole === "SUPER_ADMIN" || userRole === "ADMIN";

    if (!isTenantAdmin) {
        redirect("/chat"); // User should not be here
    }

    let users = [];
    let settings = { iaToken: "", erpToken: "" };

    try {
        const [usersRes, settingsRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store'
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/admin/settings`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store'
            })
        ]);

        if (usersRes.ok) {
            users = await usersRes.json();
        }
        if (settingsRes.ok) {
            settings = await settingsRes.json();
        }
    } catch (e) {
        console.error("Error fetching admin data", e);
    }

    return <ClientManagement initialUsers={users} initialSettings={settings} currentUser={session.user} isTenantAdmin={isTenantAdmin} />;
}
