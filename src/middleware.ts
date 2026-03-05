import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Skip auth checks on login pages
        if (path === "/login" || path === "/superadmin/login" || path.startsWith("/api/auth")) {
            return;
        }

        // Route Protection: Super Admin
        if (path.startsWith("/superadmin")) {
            if (token?.role !== "SUPER_ADMIN") {
                return NextResponse.redirect(new URL("/superadmin/login", req.url));
            }
            return;
        }

        // Route Protection: Tenant Admin (Company Settings)
        if (path.startsWith("/admin")) {
            if (!token) {
                return NextResponse.redirect(new URL("/login", req.url));
            }
            if (token?.role !== "TENANT_ADMIN" && token?.role !== "SUPER_ADMIN") {
                return NextResponse.redirect(new URL("/chat", req.url));
            }
            return;
        }

        // Route Protection: Chat/Dashboard
        if (path.startsWith("/chat")) {
            if (!token) {
                return NextResponse.redirect(new URL("/login", req.url));
            }
            if (token?.role === "SUPER_ADMIN") {
                return NextResponse.redirect(new URL("/superadmin", req.url));
            }
        }
    },
    {
        callbacks: {
            authorized: () => true, // Let the middleware logic handle all protects/redirects
        },
    }
);

// Protect all routes
export const config = { matcher: ["/admin/:path*", "/superadmin/:path*", "/chat/:path*", "/", "/login"] };
