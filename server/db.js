import pkg from 'pg';
import dotenv from 'dotenv';

// Fix timezone handling: Ensure TIMESTAMP WITHOUT TIMEZONE (type 1114)
// is returned as a raw ISO string, not a Date object that could be
// misinterpreted by the client's local timezone.
const { types } = pkg;
types.setTypeParser(1114, (stringValue) => {
    return stringValue ? new Date(stringValue + 'Z').toISOString() : null;
});

const { Pool } = pkg;

dotenv.config({ path: '../.env' });

// Validate essential environment variables
if (!process.env.DATABASE_URL) {
    console.error('CRITICAL ERROR: DATABASE_URL is not defined!');
    console.error('Please configure DATABASE_URL in your Railway Project Settings.');
}

// Database connection
let pool;
try {
    if (process.env.DATABASE_URL) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.RAILWAY_ENVIRONMENT ? { rejectUnauthorized: false } : false
        });
    } else {
        console.warn('Database pool not initialized due to missing DATABASE_URL');
    }
} catch (err) {
    console.error('Failed to create database pool:', err);
}

// Initialize Database
const initDB = async () => {
    if (!pool) {
        console.warn('Skipping DB initialization: Pool not ready');
        return;
    }
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                picture TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS wallets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                nft_id VARCHAR(255) NOT NULL,
                nft_metadata JSONB,
                quantity INTEGER DEFAULT 1,
                UNIQUE(user_id, nft_id)
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                external_reference VARCHAR(255) UNIQUE NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                description VARCHAR(255),
                items JSONB,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS raffles (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                prize_pool VARCHAR(255),
                ticket_price DECIMAL(10,2) NOT NULL,
                max_tickets INTEGER DEFAULT 1000,
                draw_date TIMESTAMP,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'active',
                prize_value DECIMAL(10,2) DEFAULT 0,
                category VARCHAR(50) DEFAULT 'tech',
                rarity VARCHAR(50) DEFAULT 'comum',
                winner_id INTEGER REFERENCES users(id),
                tracking_code VARCHAR(255),
                carrier VARCHAR(100),
                shipped_at TIMESTAMP
            );
        `);

        // Migrations: Add columns if they don't exist
        try {
            await pool.query(`ALTER TABLE raffles ALTER COLUMN draw_date TYPE TIMESTAMPTZ USING draw_date AT TIME ZONE 'UTC';`);
            console.log('Migration: draw_date column upgraded to TIMESTAMPTZ');

            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS prize_value DECIMAL(10,2) DEFAULT 0;`);
            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'tech';`);
            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS rarity VARCHAR(50) DEFAULT 'comum';`);
            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS shipping_status VARCHAR(50) DEFAULT 'preparing';`);
            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS winner_id INTEGER;`);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS notifications (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            try {
                await pool.query(`ALTER TABLE raffles ADD CONSTRAINT fk_winner FOREIGN KEY (winner_id) REFERENCES users(id);`);
            } catch (fkErr) {
                // Constraint might already exist, safe to ignore
            }

            // User Profile Columns
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf VARCHAR(20);`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date VARCHAR(20);`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(50);`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS cep VARCHAR(20);`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS number VARCHAR(20);`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100);`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(50) DEFAULT 'brasil';`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;`);
            console.log('Migration: Added user profile columns');

            // Tracking columns
            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(255);`);
            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS carrier VARCHAR(100);`);
            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP;`);
            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS shipping_status VARCHAR(50) DEFAULT 'preparing';`);
            console.log('Migration: Added tracking columns to raffles');

            // Testimonials Table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS testimonials (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    user_name VARCHAR(255),
                    user_avatar TEXT,
                    raffle_name VARCHAR(255),
                    prize_name VARCHAR(255),
                    rating INTEGER DEFAULT 5,
                    comment TEXT,
                    photo_url TEXT,
                    status VARCHAR(50) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            console.log('Migration: Checked/Added raffle columns including winner_id and testimonials table');
        } catch (migError) {
            console.error('Migration CRITICAL warning:', migError);
        }

        // Purchases Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS purchases (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                status VARCHAR(50) DEFAULT 'pending',
                items JSONB NOT NULL,
                total_cost DECIMAL(10,2) NOT NULL,
                txid VARCHAR(255),
                pix_code TEXT,
                spedy_nfe_id VARCHAR(255),
                nfe_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id SERIAL PRIMARY KEY,
                raffle_id INTEGER REFERENCES raffles(id),
                user_id INTEGER REFERENCES users(id),
                hash VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Coupons Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS coupons (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                type VARCHAR(20) DEFAULT 'percent',
                value DECIMAL(10,2) NOT NULL,
                min_purchase DECIMAL(10,2) DEFAULT 0,
                usage_limit INTEGER,
                used_count INTEGER DEFAULT 0,
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Messages Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id INTEGER REFERENCES users(id),
                receiver_id INTEGER REFERENCES users(id),
                content TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // RBAC
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';`);
        console.log('Migration: Checked/Added role column and messages table');

        // Seed Admins
        const admins = ['brunofpguerra@hotmail.com', 'hedgehogdilemma1851@gmail.com', 'alexanderbeanzllli@gmail.com'];
        for (const email of admins) {
            await pool.query(`UPDATE users SET role = 'admin' WHERE email = $1`, [email]);
            console.log(`Seeded admin role for ${email}`);
        }

        // Seed initial coupon
        await pool.query(`
            INSERT INTO coupons (code, type, value, usage_limit)
            VALUES ('BEMVINDO10', 'percent', 10, 100)
            ON CONFLICT (code) DO NOTHING;
        `);

        const rafflesCheck = await pool.query('SELECT count(*) FROM raffles');
        if (parseInt(rafflesCheck.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO raffles (title, description, prize_pool, ticket_price, max_tickets, draw_date, image_url)
                VALUES 
                ('Sorteio iPhone 15 Pro Max', 'Concorra a um iPhone 15 Pro Max novinho!', 'iPhone 15 Pro Max', 10, 1000, NOW() + INTERVAL '7 days', 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80'),
                ('Sorteio PlayStation 5', 'Leve para casa o console mais desejado do momento.', 'PlayStation 5', 5, 2000, NOW() + INTERVAL '14 days', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80');
            `);
            console.log('Seeded initial raffles');
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

export { pool, initDB };
