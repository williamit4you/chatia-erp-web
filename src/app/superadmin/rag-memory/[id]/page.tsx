import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import RagMemoryForm from "../RagMemoryForm";

export default async function EditRagMemoryPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SUPER_ADMIN") {
        redirect("/superadmin/login");
    }

    // Load actual DB values
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/superadmin/agent-memory`, {
        headers: { Authorization: `Bearer ${(session.user as any).accessToken}` },
        cache: 'no-store'
    });

    let initialData = null;
    if (res.ok) {
        const memories = await res.json();
        initialData = memories.find((m: any) => m.id === params.id);
    }

    if (!initialData) {
        // Fallback or handle not found
        return (
            <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">Memória não encontrada</h2>
                    <p className="text-neutral-500">O registro que você tenta editar não existe ou já foi apagado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 pt-12">
            <RagMemoryForm memoryId={params.id} initialData={initialData} />
        </div>
    );
}
