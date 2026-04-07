import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    // adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("---- NEXTAUTH AUTHORIZE CALLED ----");
                console.log("Credentials received for email:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing email or password");
                    return null;
                }

                try {
                    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/auth/login`;
                    const fs = require('fs');
                    fs.appendFileSync('auth_log.txt', `\n[${new Date().toISOString()}] Attempting login for ${credentials.email} at ${apiUrl}\n`);

                    const res = await fetch(apiUrl, {
                        method: "POST",
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                        headers: { "Content-Type": "application/json" }
                    });

                    fs.appendFileSync('auth_log.txt', `[${new Date().toISOString()}] API Response Status: ${res.status}\n`);

                    const user = await res.json();
                    fs.appendFileSync('auth_log.txt', `[${new Date().toISOString()}] API Response Body: ${JSON.stringify(user)}\n`);

                    if (res.ok && user) {
                        return {
                            id: user.userId || user.id, // Ensure we have the ID correctly
                            name: user.name,
                            email: user.email,
                            tenantId: user.tenantId,
                            role: user.role,
                            hasPayableChatAccess: user.hasPayableChatAccess,
                            hasPayableDashboardAccess: user.hasPayableDashboardAccess,
                            hasReceivableChatAccess: user.hasReceivableChatAccess,
                            hasReceivableDashboardAccess: user.hasReceivableDashboardAccess,
                            hasBankingChatAccess: user.hasBankingChatAccess,
                            hasBankingDashboardAccess: user.hasBankingDashboardAccess,
                            accessToken: user.token, // Store the C# JWT
                        };
                    }
                    return null;
                } catch (error: any) {
                    const fs = require('fs');
                    fs.appendFileSync('auth_log.txt', `[${new Date().toISOString()}] NEXTAUTH FETCH ERROR: ${error.message}\n${error.stack}\n`);
                    console.error("NextAuth Auth Error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                // Enforce tenant isolation in session context
                (session.user as any).id = token.id;
                (session.user as any).tenantId = token.tenantId;
                (session.user as any).role = token.role;
                (session.user as any).hasPayableChatAccess = token.hasPayableChatAccess;
                (session.user as any).hasPayableDashboardAccess = token.hasPayableDashboardAccess;
                (session.user as any).hasReceivableChatAccess = token.hasReceivableChatAccess;
                (session.user as any).hasReceivableDashboardAccess = token.hasReceivableDashboardAccess;
                (session.user as any).hasBankingChatAccess = token.hasBankingChatAccess;
                (session.user as any).hasBankingDashboardAccess = token.hasBankingDashboardAccess;
                (session.user as any).currentSessionId = token.currentSessionId;
                (session.user as any).accessToken = token.accessToken;
                console.log("NextAuth Session Callback - accessToken payload:", (token.accessToken as string) ? (token.accessToken as string).substring(0, 30) + "..." : "missing");
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.tenantId = (user as any).tenantId;
                token.role = (user as any).role;
                token.hasPayableChatAccess = (user as any).hasPayableChatAccess;
                token.hasPayableDashboardAccess = (user as any).hasPayableDashboardAccess;
                token.hasReceivableChatAccess = (user as any).hasReceivableChatAccess;
                token.hasReceivableDashboardAccess = (user as any).hasReceivableDashboardAccess;
                token.hasBankingChatAccess = (user as any).hasBankingChatAccess;
                token.hasBankingDashboardAccess = (user as any).hasBankingDashboardAccess;
                token.currentSessionId = (user as any).currentSessionId;
                token.accessToken = (user as any).accessToken;
            }
            return token;
        }
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
