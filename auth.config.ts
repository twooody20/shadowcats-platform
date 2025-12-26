import type { NextAuthConfig } from "next-auth"
import { NextResponse } from "next/server"

export const authConfig = {
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnLogin = nextUrl.pathname.startsWith("/login")

            if (isOnLogin) {
                if (isLoggedIn) return NextResponse.redirect(new URL("/", nextUrl))
                return true // Allow access to login page
            }

            return isLoggedIn
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig
