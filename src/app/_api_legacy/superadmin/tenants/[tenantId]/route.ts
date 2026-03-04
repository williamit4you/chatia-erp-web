import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const tenantId = resolvedParams.tenantId;

        const body = await req.json();
        const { iaToken, erpToken } = body;

        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                iaToken,
                erpToken
            }
        });

        return NextResponse.json({ success: true, tenant: updatedTenant });
    } catch (error) {
        console.error("Failed to update tenant:", error);
        return NextResponse.json({ error: "Failed to update tenant" }, { status: 500 });
    }
}
