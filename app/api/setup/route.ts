import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Creating tables...");

        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS players (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT,
                phone TEXT,
                seasonType TEXT,
                paymentType TEXT,
                paymentMethod TEXT,
                amountDue TEXT,
                paidAmount TEXT,
                fees TEXT,
                balance TEXT,
                status TEXT,
                notes TEXT,
                paymentLink TEXT
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS deals (
                id TEXT PRIMARY KEY,
                sponsor TEXT,
                assets TEXT, 
                start_date TEXT,
                end_date TEXT,
                budget TEXT,
                actualValue TEXT,
                paymentMethod TEXT,
                processingFee TEXT,
                fulfillmentFee TEXT,
                paymentStatus TEXT,
                status TEXT,
                invoiceId TEXT
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS season_ticket_holders (
                id TEXT PRIMARY KEY,
                name TEXT,
                contact TEXT,
                phone TEXT,
                email TEXT,
                status TEXT,
                section TEXT,
                seatCount TEXT,
                value TEXT,
                year TEXT,
                unitPrice TEXT,
                subtotal TEXT,
                tax TEXT,
                ccFee TEXT,
                ticketFee TEXT,
                paymentMethod TEXT
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS single_game_sales (
                id TEXT PRIMARY KEY,
                gameId TEXT,
                customer TEXT,
                quantity INTEGER,
                section TEXT,
                price TEXT,
                fees TEXT,
                status TEXT,
                subtotal TEXT,
                tax TEXT,
                ccFee TEXT,
                ticketFee TEXT,
                paymentMethod TEXT
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS inventory (
                id TEXT PRIMARY KEY,
                name TEXT,
                category TEXT,
                status TEXT,
                sponsor TEXT,
                value TEXT
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS sponsors (
                id TEXT PRIMARY KEY,
                name TEXT,
                contact TEXT,
                phone TEXT,
                email TEXT,
                status TEXT,
                totalValue TEXT
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS games (
                id TEXT PRIMARY KEY,
                date TEXT,
                time TEXT,
                opponent TEXT,
                location TEXT,
                status TEXT
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS staff (
                id TEXT PRIMARY KEY,
                name TEXT,
                role TEXT,
                status TEXT
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS timeline (
                id TEXT PRIMARY KEY,
                time TEXT,
                activity TEXT,
                assigned TEXT,
                status TEXT
            );
        `;

        return NextResponse.json({ message: "Tables created successfully" });
    } catch (error) {
        console.error("SETUP ERROR:", error);
        return NextResponse.json({ error: (error as any).message }, { status: 500 });
    }
}
