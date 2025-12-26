const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

if (!fs.existsSync(dbPath)) {
    console.error('db.json not found');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const { deals, inventory } = data;

console.log(`Analyzing ${deals.length} deals and ${inventory.length} inventory items...`);

let updateCount = 0;

inventory.forEach(item => {
    // Find active deal for this item
    const activeDeal = deals.find(d =>
        (d.status === 'Signed' || d.status === 'Negotiating') &&
        d.assets && d.assets.includes(item.name)
    );

    if (activeDeal) {
        if (item.status !== 'sold' || item.sponsor !== activeDeal.sponsor) {
            console.log(`Updating ${item.name}: ${item.status} -> sold, ${item.sponsor} -> ${activeDeal.sponsor}`);
            item.status = 'sold';
            item.sponsor = activeDeal.sponsor;
            updateCount++;
        }
    }
});

if (updateCount > 0) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    console.log(`Updated ${updateCount} inventory items.`);
} else {
    console.log('No updates needed.');
}
