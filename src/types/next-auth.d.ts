import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user?: {
            id: string;
            tenantId: string | null;
            role: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        tenantId: string | null;
        role: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        uid: string;
        tenantId: string | null;
        role: string;
    }
}
