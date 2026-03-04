import { NextRequest, NextResponse } from 'next/server';
import { genAI, SYSTEM_PROMPT } from '@/lib/gemini';
import { toolDefinitions } from '@/lib/erp-tools';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        console.log("SERVER SESSION AT CHAT ROUTE:", session);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const tenantId = (session.user as any).tenantId;

        if (!userId || !tenantId) {
            console.error("400 ERROR: Invalid Session. UserId:", userId, "TenantId:", tenantId);
            return NextResponse.json({ error: "Invalid session" }, { status: 400 });
        }

        const { message, history, sessionId } = await req.json();

        if (!message) {
            console.error("400 ERROR: Missing Message field.");
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { iaToken: true, erpToken: true },
        });

        if (!tenant?.iaToken) {
            return NextResponse.json({ error: 'Token IA não configurado pela sua empresa. Por favor, acesse a área Administrativa.' }, { status: 403 });
        }

        console.log(tenant);

        // --- MANAGE OR CREATE DATABASE SESSION ---
        let currentSessionId = sessionId;

        if (!currentSessionId) {
            // First message! Let's build a new session.
            const newSession = await prisma.chatSession.create({
                data: {
                    userId: userId,
                    tenantId: tenantId,
                    title: message.substring(0, 30) + (message.length > 30 ? "..." : "")
                }
            });
            currentSessionId = newSession.id;
        }

        // Save User Message to DB
        await prisma.chatMessage.create({
            data: {
                sessionId: currentSessionId,
                role: "user",
                content: message
            }
        });

        // Use custom token if available
        let aiClient = new GoogleGenerativeAI(tenant.iaToken);

        // Increment user's query count
        await prisma.user.update({
            where: { id: userId },
            data: { queryCount: { increment: 1 } },
        });

        // Initialize Gemini model with tools
        const model = aiClient.getGenerativeModel({
            model: 'gemini-3-flash-preview',
            systemInstruction: SYSTEM_PROMPT,
            tools: [{ functionDeclarations: toolDefinitions }],
        });

        // Fetch DB history explicitly to keep it consistent 
        // Or we can just use the provided UI `history` (excluding system).
        // UI history is fast and avoids DB delays on generation.
        const filteredHistory = (history || []).filter((msg: { role: string }) => msg.role !== 'system');
        const formattedHistory = filteredHistory.map((msg: { role: string, content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history: formattedHistory });

        // Build the text properly to reply back
        let finalModelText = "";

        const result = await chat.sendMessage(message);
        const call = result.response.functionCalls();

        if (call && call.length > 0) {
            const toolCall = call[0];
            let functionResponseData = {};

            if (toolCall.name === 'getFinancialSummary') {
                functionResponseData = {
                    notice: `Financial Data Context. ERP Token used: ${tenant?.erpToken ? 'Yes' : 'No'}`,
                    revenue: 1250000,
                    expenses: 850000,
                    netIncome: 400000
                };
            } else if (toolCall.name === 'getInventoryStatus') {
                functionResponseData = {
                    notice: `Inventory Data Context.`,
                    itemsLowStock: [{ product: "Steel Beams", qty: 45, reorder: 50 }]
                };
            } else if (toolCall.name === 'getSalesPerformance') {
                functionResponseData = {
                    notice: `Sales Data.`,
                    totalWon: 500000,
                    dealsInProgress: 12
                };
            }

            const finalResult = await chat.sendMessage([{
                functionResponse: {
                    name: toolCall.name,
                    response: functionResponseData
                }
            }]);

            finalModelText = finalResult.response.text();
            console.log("FINAL MODEL TEXT FROM TOOL CALL:", finalModelText);
        } else {
            finalModelText = result.response.text();
            console.log("FINAL MODEL TEXT FROM DIRECT TEXT:", finalModelText);
        }

        if (!finalModelText) {
            console.error("WARNING: finalModelText is empty! Full response:", JSON.stringify(result.response, null, 2));
            finalModelText = "Desculpe, não consegui processar a resposta corretamente. O modelo retornou vazio.";
        }

        // Save model's message in DB
        await prisma.chatMessage.create({
            data: {
                sessionId: currentSessionId,
                role: "model",
                content: finalModelText
            }
        });

        console.log("SENDING REPLY:", finalModelText);
        return NextResponse.json({ reply: finalModelText, sessionId: currentSessionId });

    } catch (error: any) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Error communicating with AI.' },
            { status: 500 }
        );
    }
}
