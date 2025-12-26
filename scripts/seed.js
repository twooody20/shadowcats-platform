const fs = require('fs');
const path = require('path');

// Determine API URL
const API_URL = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/db` : 'http://localhost:3000/api/db';

async function seed() {
    const dbPath = path.join(__dirname, '../data/db.json');

    if (!fs.existsSync(dbPath)) {
        console.error('db.json not found at', dbPath);
        return;
    }

    console.log('Reading data from', dbPath);
    const rawData = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(rawData);

    // Keys supported by route.ts
    const keys = [
        'players',
        'deals',
        'seasonTicketHolders',
        'singleGameSales',
        'inventory',
        'sponsors',
        'games',
        'staff',
        'users',
        'timeline'
    ];

    console.log(`Starting migration to ${API_URL}...`);

    for (const key of keys) {
        if (data[key] && Array.isArray(data[key])) {
            console.log(`Migrating ${key} (${data[key].length} items)...`);
            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, data: data[key] })
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Status ${res.status}: ${text}`);
                }

                const json = await res.json();
                console.log(`✓ ${key}: Success`);
            } catch (e) {
                console.error(`✗ ${key}: Failed -`, e.message);
            }
        } else {
            console.log(`- ${key}: No data found`);
        }
    }
    console.log('Migration complete.');
}

seed();
