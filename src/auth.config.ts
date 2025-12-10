import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    secret: process.env.AUTH_SECRET || "shadowcats-secret-key",
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnLogin = nextUrl.pathname.startsWith("/login")

            if (isOnLogin) {
                if (isLoggedIn) return Response.redirect(new URL("/", nextUrl))
                return true // Allow access to login page
            }

            return isLoggedIn
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig
