import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        const tenantId = (session.user as any).tenantId;

        if (userRole !== "TENANT_ADMIN" && userRole !== "SUPER_ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { iaToken, erpToken } = await req.json();

        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                iaToken,
                erpToken,
            },
        });

        return NextResponse.json({ message: "Settings updated successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Settings update error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
