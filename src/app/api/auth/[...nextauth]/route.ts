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
                password: { label: "Password", type: "password" },
                scope: { label: "Scope", type: "text" }
            },
            async authorize(credentials) {
                console.log("---- NEXTAUTH AUTHORIZE CALLED ----");
                console.log("Credentials received for email:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing email or password");
                    return null;
                }

                try {
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5217";
                    const isSuperAdminLogin = credentials?.scope === "superadmin";
                    const apiUrl = isSuperAdminLogin ? `${baseUrl}/api/auth/superadmin/login` : `${baseUrl}/api/auth/login`;

                    const res = await fetch(apiUrl, {
                        method: "POST",
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                        headers: { "Content-Type": "application/json" }
                    });

                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        const errorMsg = errorData.error || errorData.message || "Erro de autenticação";
                        console.error("NextAuth authorize failed:", { apiUrl, status: res.status, errorMsg });
                        return null;
                    }

                    const user = await res.json();

                    if (user) {
                        return {
                            id: user.userId || user.id,
                            name: user.name,
                            email: user.email,
                            tenantId: user.tenantId,
                            tenantName: user.tenantName,
                            role: user.role,
                            hasPayableChatAccess: user.hasPayableChatAccess,
                            hasPayableDashboardAccess: user.hasPayableDashboardAccess,
                             hasReceivableChatAccess: user.hasReceivableChatAccess,
                             hasReceivableDashboardAccess: user.hasReceivableDashboardAccess,
                             hasBankingChatAccess: user.hasBankingChatAccess,
                             hasBankingDashboardAccess: user.hasBankingDashboardAccess,
                             showChartDetails: user.showChartDetails,
                             accessToken: user.token,
                         };
                    }
                    return null;
                } catch (error: any) {
                    console.error("NextAuth Auth Error:", error.message);
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
                (session.user as any).tenantName = token.tenantName;
                (session.user as any).role = token.role;
                (session.user as any).hasPayableChatAccess = token.hasPayableChatAccess;
                (session.user as any).hasPayableDashboardAccess = token.hasPayableDashboardAccess;
                (session.user as any).hasReceivableChatAccess = token.hasReceivableChatAccess;
                 (session.user as any).hasReceivableDashboardAccess = token.hasReceivableDashboardAccess;
                 (session.user as any).hasBankingChatAccess = token.hasBankingChatAccess;
                 (session.user as any).hasBankingDashboardAccess = token.hasBankingDashboardAccess;
                 (session.user as any).showChartDetails = token.showChartDetails;
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
                token.tenantName = (user as any).tenantName;
                token.role = (user as any).role;
                token.hasPayableChatAccess = (user as any).hasPayableChatAccess;
                token.hasPayableDashboardAccess = (user as any).hasPayableDashboardAccess;
                token.hasReceivableChatAccess = (user as any).hasReceivableChatAccess;
                 token.hasReceivableDashboardAccess = (user as any).hasReceivableDashboardAccess;
                 token.hasBankingChatAccess = (user as any).hasBankingChatAccess;
                 token.hasBankingDashboardAccess = (user as any).hasBankingDashboardAccess;
                 token.showChartDetails = (user as any).showChartDetails;
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
