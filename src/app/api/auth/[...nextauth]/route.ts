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
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/auth/login`, {
                        method: "POST",
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                        headers: { "Content-Type": "application/json" }
                    });

                    const user = await res.json();

                    if (res.ok && user) {
                        return {
                            id: user.userId || user.id, // Ensure we have the ID correctly
                            name: user.name,
                            email: user.email,
                            tenantId: user.tenantId,
                            role: user.role,
                            accessToken: user.token, // Store the C# JWT
                        };
                    }
                    return null;
                } catch (error) {
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
                (session.user as any).accessToken = token.accessToken;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.tenantId = (user as any).tenantId;
                token.role = (user as any).role;
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
