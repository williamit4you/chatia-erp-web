import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import RagMemoryForm from "../RagMemoryForm";

export default async function NewRagMemoryPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SUPER_ADMIN") {
        redirect("/superadmin/login");
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 pt-12">
            <RagMemoryForm />
        </div>
    );
}
