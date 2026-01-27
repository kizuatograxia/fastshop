import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config({ path: '../.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@db:5432/fastshop'
});

const rafflesData = [
    {
        title: "iPhone 15 Pro Max",
        description: "Concorra a um iPhone 15 Pro Max 256GB novinho!",
        prize_pool: "iPhone 15 Pro Max 256GB",
        prize_value: 8499,
        image_url: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1000&auto=format&fit=crop",
        draw_date: "2026-01-15",
        max_tickets: 1000,
        ticket_price: 1,
        status: "active",
        category: "tech"
    },
    {
        title: "PlayStation 5 Slim",
        description: "O console dos sonhos pode ser seu!",
        prize_pool: "PS5 Slim 1TB Digital Edition",
        prize_value: 3499,
        image_url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
        draw_date: "2026-01-20",
        max_tickets: 800,
        ticket_price: 1,
        status: "active",
        category: "games"
    },
    {
        title: "MacBook Pro M3",
        description: "O notebook mais poderoso da Apple!",
        prize_pool: "MacBook Pro 14\" M3 Pro 512GB",
        prize_value: 15999,
        image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
        draw_date: "2026-01-25",
        max_tickets: 2000,
        ticket_price: 2,
        status: "active",
        category: "tech"
    },
    {
        title: "R$ 5.000 em PIX",
        description: "Dinheiro na conta! Use como quiser.",
        prize_pool: "PIX de R$ 5.000",
        prize_value: 5000,
        image_url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=400&fit=crop",
        draw_date: "2026-01-10",
        max_tickets: 2500,
        ticket_price: 1,
        status: "active",
        category: "dinheiro"
    },
    {
        title: "AirPods Pro 2",
        description: "Os melhores fones da Apple com cancelamento de ruído!",
        prize_pool: "AirPods Pro 2ª Geração",
        prize_value: 1849,
        image_url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop",
        draw_date: "2026-01-08",
        max_tickets: 500,
        ticket_price: 1,
        status: "active",
        category: "tech"
    },
    {
        title: "Smart TV 65\" 4K",
        description: "Uma TV gigante para sua casa!",
        prize_pool: "Smart TV Samsung 65\" QLED",
        prize_value: 4299,
        image_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
        draw_date: "2026-01-30",
        max_tickets: 1000,
        ticket_price: 1,
        status: "active",
        category: "tech"
    }
];

const seedFull = async () => {
    try {
        console.log('Starting full seed...');

        // Verify connection
        const res = await pool.query('SELECT NOW()');
        console.log('Connected to DB at:', res.rows[0].now);

        // Add columns if not exist (Migration)
        console.log('Migrating schema...');
        try {
            await pool.query('ALTER TABLE raffles ADD COLUMN IF NOT EXISTS prize_value INTEGER DEFAULT 0');
            await pool.query('ALTER TABLE raffles ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT \'tech\'');
            await pool.query('ALTER TABLE raffles ADD COLUMN IF NOT EXISTS rarity VARCHAR(50) DEFAULT \'comum\'');
        } catch (e) {
            console.log('Schema update skipped or failed (columns might exist):', e.message);
        }

        // Clear existing raffles? 
        // WARNING: This deletes tickets too due to FK if cascade, or fails.
        // Let's try to trunc cascade.
        console.log('Clearing existing raffles...');
        await pool.query('TRUNCATE TABLE tickets, raffles RESTART IDENTITY CASCADE');

        // Insert new data
        console.log('Inserting new raffles...');
        for (const raffle of rafflesData) {
            await pool.query(
                `INSERT INTO raffles (title, description, prize_pool, prize_value, image_url, draw_date, max_tickets, ticket_price, status, category)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    raffle.title,
                    raffle.description,
                    raffle.prize_pool,
                    raffle.prize_value,
                    raffle.image_url,
                    raffle.draw_date,
                    raffle.max_tickets,
                    raffle.ticket_price,
                    raffle.status,
                    raffle.category
                ]
            );
        }

        console.log(`Seeded ${rafflesData.length} raffles.`);

    } catch (e) {
        console.error('Seed error:', e);
    } finally {
        await pool.end();
    }
};

seedFull();
