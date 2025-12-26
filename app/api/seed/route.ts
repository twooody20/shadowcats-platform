import { db, sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await db.connect();

    // 1. Create Tables
    await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50)
      );
    `;

    await client.sql`
      CREATE TABLE IF NOT EXISTS players (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        seasonType VARCHAR(50),
        paymentType VARCHAR(50),
        paymentMethod VARCHAR(50),
        amountDue VARCHAR(50),
        paidAmount VARCHAR(50),
        fees VARCHAR(50),
        balance VARCHAR(50),
        status VARCHAR(50),
        notes TEXT,
        paymentLink TEXT
      );
    `;

    // Create other tables generically or explicitly? 
    // Explicit is safer for types.
    // ... For brevity, I will use a generic JSONB approach for complex nested data if needed, 
    // but relational is better.
    // However, to save time, I will create tables for the main entities.

    await client.sql`
      CREATE TABLE IF NOT EXISTS deals (
        id VARCHAR(255) PRIMARY KEY,
        sponsor VARCHAR(255),
        assets TEXT[], 
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        budget VARCHAR(50),
        actualValue VARCHAR(50),
        paymentMethod VARCHAR(50),
        processingFee VARCHAR(50),
        fulfillmentFee VARCHAR(50),
        paymentStatus VARCHAR(50),
        status VARCHAR(50),
        invoiceId VARCHAR(50)
      );
    `;

    // ... (More tables for seasonTicketHolders, etc.)
    // Let's create a generic "collections" table for flexible storage if we want to mimic db.json exactly?
    // User wants "PostgreSQL", implies relational.
    // But refactoring the entire frontend to use proper relational constraints might be too big.
    // Let's try to map 1:1.

    // Better strategy for "fast migration" without breaking frontend:
    // Store each "collection" as a JSON blob in a key-value table?
    // No, that defeats the purpose of "secure database".

    // Let's do Real Tables.

    // Read JSON
    const dbPath = path.join(process.cwd(), 'data/db.json');
    const dbJson = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

    // Insert Users
    for (const user of dbJson.users || []) {
      await client.sql`
            INSERT INTO users (id, name, email, password, role)
            VALUES (${user.id}, ${user.name}, ${user.email}, ${user.password}, ${user.role})
            ON CONFLICT (id) DO NOTHING;
        `;
    }

    // Insert Players
    for (const p of dbJson.players || []) {
      await client.sql`
            INSERT INTO players (id, name, email, phone, seasonType, paymentType, paymentMethod, amountDue, paidAmount, fees, balance, status, notes, paymentLink)
            VALUES (${p.id}, ${p.name}, ${p.email}, ${p.phone}, ${p.seasonType}, ${p.paymentType}, ${p.paymentMethod}, ${p.amountDue}, ${p.paidAmount}, ${p.fees}, ${p.balance}, ${p.status}, ${p.notes}, ${p.paymentLink})
            ON CONFLICT (id) DO NOTHING;
        `;
    }

    // ... (Users, Players, Deals tables exist)

    // Season Ticket Holders
    await client.sql`
            CREATE TABLE IF NOT EXISTS season_ticket_holders (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255),
                contact VARCHAR(255),
                phone VARCHAR(50),
                email VARCHAR(255),
                status VARCHAR(50),
                section VARCHAR(50),
                seatCount VARCHAR(50),
                value VARCHAR(50),
                year VARCHAR(10),
                unitPrice VARCHAR(50),
                subtotal VARCHAR(50),
                tax VARCHAR(50),
                ccFee VARCHAR(50),
                ticketFee VARCHAR(50),
                paymentMethod VARCHAR(50)
            );
        `;

    for (const s of dbJson.seasonTicketHolders || []) {
      await client.sql`
                INSERT INTO season_ticket_holders (id, name, contact, phone, email, status, section, seatCount, value, year, unitPrice, subtotal, tax, ccFee, ticketFee, paymentMethod)
                VALUES (${s.id}, ${s.name}, ${s.contact}, ${s.phone}, ${s.email}, ${s.status}, ${s.section}, ${s.seatCount}, ${s.value}, ${s.year}, ${s.unitPrice}, ${s.subtotal}, ${s.tax}, ${s.ccFee}, ${s.ticketFee}, ${s.paymentMethod})
                ON CONFLICT (id) DO NOTHING;
            `;
    }

    // Single Game Sales
    await client.sql`
            CREATE TABLE IF NOT EXISTS single_game_sales (
                id VARCHAR(255) PRIMARY KEY,
                gameId VARCHAR(255),
                customer VARCHAR(255),
                quantity INTEGER,
                section VARCHAR(50),
                price VARCHAR(50),
                fees VARCHAR(50),
                status VARCHAR(50),
                subtotal VARCHAR(50),
                tax VARCHAR(50),
                ccFee VARCHAR(50),
                ticketFee VARCHAR(50),
                paymentMethod VARCHAR(50)
            );
        `;

    for (const s of dbJson.singleGameSales || []) {
      await client.sql`
                INSERT INTO single_game_sales (id, gameId, customer, quantity, section, price, fees, status, subtotal, tax, ccFee, ticketFee, paymentMethod)
                VALUES (${s.id}, ${s.gameId}, ${s.customer}, ${s.quantity}, ${s.section}, ${s.price}, ${s.fees}, ${s.status}, ${s.subtotal}, ${s.tax}, ${s.ccFee}, ${s.ticketFee}, ${s.paymentMethod})
                ON CONFLICT (id) DO NOTHING;
            `;
    }

    // Inventory
    await client.sql`
             CREATE TABLE IF NOT EXISTS inventory (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255),
                category VARCHAR(255),
                status VARCHAR(50),
                sponsor VARCHAR(255),
                value VARCHAR(50)
             );
        `;
    for (const i of dbJson.inventory || []) {
      await client.sql`
                INSERT INTO inventory (id, name, category, status, sponsor, value)
                VALUES (${i.id}, ${i.name}, ${i.category}, ${i.status}, ${i.sponsor}, ${i.value})
                ON CONFLICT (id) DO NOTHING;
             `;
    }

    // Sponsors
    await client.sql`
             CREATE TABLE IF NOT EXISTS sponsors (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255),
                contact VARCHAR(255),
                phone VARCHAR(50),
                email VARCHAR(255),
                status VARCHAR(50),
                totalValue VARCHAR(50)
             );
        `;
    for (const s of dbJson.sponsors || []) {
      await client.sql`
                INSERT INTO sponsors (id, name, contact, phone, email, status, totalValue)
                VALUES (${s.id}, ${s.name}, ${s.contact}, ${s.phone}, ${s.email}, ${s.status}, ${s.totalValue})
                ON CONFLICT (id) DO NOTHING;
             `;
    }

    // Games
    await client.sql`
            CREATE TABLE IF NOT EXISTS games (
                id VARCHAR(255) PRIMARY KEY,
                date VARCHAR(50),
                time VARCHAR(50),
                opponent VARCHAR(255),
                location VARCHAR(50),
                status VARCHAR(50)
            );
        `;
    for (const g of dbJson.games || []) {
      await client.sql`
                INSERT INTO games (id, date, time, opponent, location, status)
                VALUES (${g.id}, ${g.date}, ${g.time}, ${g.opponent}, ${g.location}, ${g.status})
                ON CONFLICT (id) DO NOTHING;
            `;
    }

    // Staff
    await client.sql`
            CREATE TABLE IF NOT EXISTS staff (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255),
                role VARCHAR(255),
                status VARCHAR(50)
            );
        `;
    for (const s of dbJson.staff || []) {
      await client.sql`
                INSERT INTO staff (id, name, role, status)
                VALUES (${s.id}, ${s.name}, ${s.role}, ${s.status})
                ON CONFLICT (id) DO NOTHING;
        `;
    }

    // Season Ticket Holders
    await client.sql`
            CREATE TABLE IF NOT EXISTS season_ticket_holders (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255),
                contact VARCHAR(255),
                phone VARCHAR(50),
                email VARCHAR(255),
                status VARCHAR(50),
                section VARCHAR(50),
                seatCount VARCHAR(50),
                value VARCHAR(50),
                year VARCHAR(10),
                unitPrice VARCHAR(50),
                subtotal VARCHAR(50),
                tax VARCHAR(50),
                ccFee VARCHAR(50),
                ticketFee VARCHAR(50),
                paymentMethod VARCHAR(50)
            );
        `;

    for (const s of dbJson.seasonTicketHolders || []) {
      await client.sql`
                INSERT INTO season_ticket_holders (id, name, contact, phone, email, status, section, seatCount, value, year, unitPrice, subtotal, tax, ccFee, ticketFee, paymentMethod)
                VALUES (${s.id}, ${s.name}, ${s.contact}, ${s.phone}, ${s.email}, ${s.status}, ${s.section}, ${s.seatCount}, ${s.value}, ${s.year}, ${s.unitPrice}, ${s.subtotal}, ${s.tax}, ${s.ccFee}, ${s.ticketFee}, ${s.paymentMethod})
                ON CONFLICT (id) DO NOTHING;
            `;
    }

    // Single Game Sales
    await client.sql`
            CREATE TABLE IF NOT EXISTS single_game_sales (
                id VARCHAR(255) PRIMARY KEY,
                gameId VARCHAR(255),
                customer VARCHAR(255),
                quantity INTEGER,
                section VARCHAR(50),
                price VARCHAR(50),
                fees VARCHAR(50),
                status VARCHAR(50),
                subtotal VARCHAR(50),
                tax VARCHAR(50),
                ccFee VARCHAR(50),
                ticketFee VARCHAR(50),
                paymentMethod VARCHAR(50)
            );
        `;

    for (const s of dbJson.singleGameSales || []) {
      await client.sql`
                INSERT INTO single_game_sales (id, gameId, customer, quantity, section, price, fees, status, subtotal, tax, ccFee, ticketFee, paymentMethod)
                VALUES (${s.id}, ${s.gameId}, ${s.customer}, ${s.quantity}, ${s.section}, ${s.price}, ${s.fees}, ${s.status}, ${s.subtotal}, ${s.tax}, ${s.ccFee}, ${s.ticketFee}, ${s.paymentMethod})
                ON CONFLICT (id) DO NOTHING;
            `;
    }

    // Inventory
    await client.sql`
             CREATE TABLE IF NOT EXISTS inventory (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255),
                category VARCHAR(255),
                status VARCHAR(50),
                sponsor VARCHAR(255),
                value VARCHAR(50)
             );
        `;
    for (const i of dbJson.inventory || []) {
      await client.sql`
                INSERT INTO inventory (id, name, category, status, sponsor, value)
                VALUES (${i.id}, ${i.name}, ${i.category}, ${i.status}, ${i.sponsor}, ${i.value})
                ON CONFLICT (id) DO NOTHING;
             `;
    }

    // Sponsors
    await client.sql`
             CREATE TABLE IF NOT EXISTS sponsors (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255),
                contact VARCHAR(255),
                phone VARCHAR(50),
                email VARCHAR(255),
                status VARCHAR(50),
                totalValue VARCHAR(50)
             );
        `;
    for (const s of dbJson.sponsors || []) {
      await client.sql`
                INSERT INTO sponsors (id, name, contact, phone, email, status, totalValue)
                VALUES (${s.id}, ${s.name}, ${s.contact}, ${s.phone}, ${s.email}, ${s.status}, ${s.totalValue})
                ON CONFLICT (id) DO NOTHING;
             `;
    }

    // Games
    await client.sql`
            CREATE TABLE IF NOT EXISTS games (
                id VARCHAR(255) PRIMARY KEY,
                date VARCHAR(50),
                time VARCHAR(50),
                opponent VARCHAR(255),
                location VARCHAR(50),
                status VARCHAR(50)
            );
        `;
    for (const g of dbJson.games || []) {
      await client.sql`
                INSERT INTO games (id, date, time, opponent, location, status)
                VALUES (${g.id}, ${g.date}, ${g.time}, ${g.opponent}, ${g.location}, ${g.status})
                ON CONFLICT (id) DO NOTHING;
            `;
    }

    // Staff
    await client.sql`
            CREATE TABLE IF NOT EXISTS staff (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255),
                role VARCHAR(255),
                status VARCHAR(50)
            );
        `;
    for (const s of dbJson.staff || []) {
      await client.sql`
                INSERT INTO staff (id, name, role, status)
                VALUES (${s.id}, ${s.name}, ${s.role}, ${s.status})
                ON CONFLICT (id) DO NOTHING;
            `;
    }

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
