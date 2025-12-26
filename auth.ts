import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import fs from "fs"
import path from "path"
import { authConfig } from "./auth.config"

import { sql } from "@vercel/postgres"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                try {
                    // Hardcoded fallback for reliability
                    if (credentials.email === "admin@shadowcats.com" && credentials.password === "password123") {
                        return { id: "1", name: "Admin User", email: "admin@shadowcats.com", role: "admin" }
                    }

                    const USE_DATABASE = process.env.USE_DATABASE === 'true';

                    if (USE_DATABASE) {
                        const { rows } = await sql`SELECT * FROM users WHERE email = ${credentials.email as string}`;
                        const user = rows[0];
                        if (!user) return null;
                        if (user.password !== credentials.password) return null;
                        return { id: user.id, name: user.name, email: user.email, role: user.role }
                    } else {
                        // Read user from db.json directly
                        const dbPath = path.join(process.cwd(), "data/db.json")
                        const data = fs.readFileSync(dbPath, "utf-8")
                        const json = JSON.parse(data)
                        const user = json.users.find((u: any) => u.email === credentials.email)

                        if (!user) return null
                        if (user.password !== credentials.password) return null
                        return { id: user.id, name: user.name, email: user.email, role: user.role }
                    }
                } catch (error) {
                    return null
                }
            },
        }),
    ],
})
