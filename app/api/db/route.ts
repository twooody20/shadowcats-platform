import { NextResponse } from 'next/server';
import { db, sql } from '@vercel/postgres';
import { auth } from "@/auth"
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const USE_DATABASE = process.env.USE_DATABASE === 'true';

// --- Local File Handlers ---
const DB_PATH = path.join(process.cwd(), 'data/db.json');

const readLocalDb = () => {
    if (!fs.existsSync(DB_PATH)) {
        return {};
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
};

// --- Postgres Handlers ---
async function fetchCollection(table: string) {
    try {
        const result = await sql.query(`SELECT * FROM ${table}`);
        return result.rows;
    } catch (e) {
        return [];
    }
}

// GET handler
export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        if (USE_DATABASE) {
            // Postgres Mode
            const [users, players, deals, seasonTicketHolders, singleGameSales, inventory, sponsors, games, staff, timeline] = await Promise.all([
                fetchCollection('users'),
                fetchCollection('players'),
                fetchCollection('deals'),
                fetchCollection('season_ticket_holders'),
                fetchCollection('single_game_sales'),
                fetchCollection('inventory'),
                fetchCollection('sponsors'),
                fetchCollection('games'),
                fetchCollection('staff'),
                fetchCollection('timeline'),
            ]);

            return NextResponse.json({
                users,
                players,
                deals,
                seasonTicketHolders,
                singleGameSales,
                inventory,
                sponsors,
                games,
                staff,
                timeline,
                categories: ["Signage", "Digital", "Hospitality", "Experiences"]
            });
        } else {
            // Local Mode
            const data = readLocalDb();
            return NextResponse.json(data);
        }
    } catch (error) {
        console.error("DB READ ERROR:", error);
        return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
    }
}

// POST handler
export async function POST(request: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const body = await request.json();
        const { key, data } = body;

        if (USE_DATABASE) {
            const client = await db.connect();
            if (key === 'players') {
                await client.sql`DELETE FROM players`;
                for (const p of data) {
                    await client.sql`
                        INSERT INTO players (id, name, email, phone, seasonType, paymentType, paymentMethod, amountDue, paidAmount, fees, balance, status, notes, paymentLink)
                        VALUES (${p.id}, ${p.name}, ${p.email}, ${p.phone}, ${p.seasonType}, ${p.paymentType}, ${p.paymentMethod}, ${p.amountDue}, ${p.paidAmount}, ${p.fees}, ${p.balance}, ${p.status}, ${p.notes}, ${p.paymentLink})
                    `;
                }
            } else if (key === 'deals') {
                await client.sql`DELETE FROM deals`;
                for (const d of data) {
                    await client.sql`
                        INSERT INTO deals (id, sponsor, assets, start_date, end_date, budget, actualValue, paymentMethod, processingFee, fulfillmentFee, paymentStatus, status, invoiceId)
                        VALUES (${d.id}, ${d.sponsor}, ${d.assets}, ${d.start}, ${d.end}, ${d.budget}, ${d.actualValue}, ${d.paymentMethod}, ${d.processingFee}, ${d.fulfillmentFee}, ${d.paymentStatus}, ${d.status}, ${d.invoiceId})
                    `;
                }
            } else if (key === 'seasonTicketHolders') {
                await client.sql`DELETE FROM season_ticket_holders`;
                for (const s of data) {
                    await client.sql`
                        INSERT INTO season_ticket_holders (id, name, contact, phone, email, status, section, seatCount, value, year, unitPrice, subtotal, tax, ccFee, ticketFee, paymentMethod)
                        VALUES (${s.id}, ${s.name}, ${s.contact}, ${s.phone}, ${s.email}, ${s.status}, ${s.section}, ${s.seatCount}, ${s.value}, ${s.year}, ${s.unitPrice}, ${s.subtotal}, ${s.tax}, ${s.ccFee}, ${s.ticketFee}, ${s.paymentMethod})
                    `;
                }
            } else if (key === 'singleGameSales') {
                await client.sql`DELETE FROM single_game_sales`;
                for (const s of data) {
                    await client.sql`
                        INSERT INTO single_game_sales (id, gameId, customer, quantity, section, price, fees, status, subtotal, tax, ccFee, ticketFee, paymentMethod)
                        VALUES (${s.id}, ${s.gameId}, ${s.customer}, ${s.quantity}, ${s.section}, ${s.price}, ${s.fees}, ${s.status}, ${s.subtotal}, ${s.tax}, ${s.ccFee}, ${s.ticketFee}, ${s.paymentMethod})
                    `;
                }
            } else if (key === 'inventory') {
                await client.sql`DELETE FROM inventory`;
                for (const i of data) {
                    await client.sql`
                        INSERT INTO inventory (id, name, category, status, sponsor, value)
                        VALUES (${i.id}, ${i.name}, ${i.category}, ${i.status}, ${i.sponsor}, ${i.value})
                    `;
                }
            } else if (key === 'sponsors') {
                await client.sql`DELETE FROM sponsors`;
                for (const s of data) {
                    await client.sql`
                        INSERT INTO sponsors (id, name, contact, phone, email, status, totalValue)
                        VALUES (${s.id}, ${s.name}, ${s.contact}, ${s.phone}, ${s.email}, ${s.status}, ${s.totalValue})
                    `;
                }
            } else if (key === 'games') {
                await client.sql`DELETE FROM games`;
                for (const g of data) {
                    await client.sql`
                        INSERT INTO games (id, date, time, opponent, location, status)
                        VALUES (${g.id}, ${g.date}, ${g.time}, ${g.opponent}, ${g.location}, ${g.status})
                    `;
                }
            } else if (key === 'staff') {
                await client.sql`DELETE FROM staff`;
                for (const s of data) {
                    await client.sql`
                        INSERT INTO staff (id, name, role, status)
                        VALUES (${s.id}, ${s.name}, ${s.role}, ${s.status})
                    `;
                }
            } else if (key === 'users') {
                await client.sql`DELETE FROM users`;
                for (const u of data) {
                    await client.sql`
                        INSERT INTO users (id, name, email, password, role)
                        VALUES (${u.id}, ${u.name}, ${u.email}, ${u.password}, ${u.role})
                    `;
                }
            } else if (key === 'timeline') {
                await client.sql`DELETE FROM timeline`;
                for (const t of data) {
                    await client.sql`
                        INSERT INTO timeline (id, time, activity, assigned, status)
                        VALUES (${t.id}, ${t.time}, ${t.activity}, ${t.assigned}, ${t.status})
                    `;
                }
            }
            // ... Add other mappings if strictly needed, or warn user.
        } else {
            // Local Mode
            if (!key || data === undefined) return NextResponse.json({ error: 'Missing key or data' }, { status: 400 });
            const currentDb = readLocalDb();
            currentDb[key] = data;
            fs.writeFileSync(DB_PATH, JSON.stringify(currentDb, null, 2));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DB SAVE ERROR:", error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
