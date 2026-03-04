import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Temporary direct instantiation for setup; recommend extracting to a lib later
const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { cnpj, companyName, email, password, name } = await req.json();

        if (!cnpj || !companyName || !email || !password || !name) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if CNPJ already exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { cnpj },
        });

        if (existingTenant) {
            return NextResponse.json(
                { message: "Company with this CNPJ already registered" },
                { status: 409 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Email already registered" },
                { status: 409 }
            );
        }

        const salt = 10;
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the Tenant and the Super Admin User in a transaction
        const newTenant = await prisma.tenant.create({
            data: {
                cnpj,
                name: companyName,
                users: {
                    create: {
                        email,
                        name,
                        password: hashedPassword, // Store in plain text for the mock scaffolding. In production, HASH THIS!
                        role: "TENANT_ADMIN",
                    },
                },
            },
        });

        return NextResponse.json(
            { message: "Company registered successfully", tenantId: newTenant.id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
