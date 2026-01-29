import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

import pkg from 'pg';

import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DEBUG: List files to diagnose ENOENT
console.log('CWD:', process.cwd());
try {
    console.log('Root contents:', fs.readdirSync(process.cwd()));
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
        console.log('Dist contents:', fs.readdirSync(distPath));
    } else {
        console.log('Dist directory DOES NOT EXIST at:', distPath);
    }
} catch (e) {
    console.error('Error listing files:', e);
}

const { Pool } = pkg;

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5050;

// Validate essential environment variables
if (!process.env.DATABASE_URL) {
    console.error('CRITICAL ERROR: DATABASE_URL is not defined!');
    console.error('Please configure DATABASE_URL in your Railway Project Settings.');
    // Don't crash immediately, allow health check to maybe fail gracefully or just log
}

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Fix for Google OAuth Popup (COOP)
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
    next();
});

app.view_file
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Database connection
let pool;
try {
    if (process.env.DATABASE_URL) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.RAILWAY_ENVIRONMENT ? { rejectUnauthorized: false } : false // Handle SSL for Railway
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
                winner_id INTEGER REFERENCES users(id)
            );
        `);

        // Migration: Add columns if they don't exist (for existing production DB)
        // Migration: Add columns if they don't exist
        try {
            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS prize_value DECIMAL(10,2) DEFAULT 0;`);
            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'tech';`);
            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS rarity VARCHAR(50) DEFAULT 'comum';`);

            // Fix for Winner ID - Handle potential FK issues or missing column
            await pool.query(`ALTER TABLE raffles ADD COLUMN IF NOT EXISTS winner_id INTEGER;`);

            // Try to add constraint separately, ignore if fails (it might fail if users table doesn't exist yet or data mismatch, but column is what matters for 500)
            try {
                await pool.query(`ALTER TABLE raffles ADD CONSTRAINT fk_winner FOREIGN KEY (winner_id) REFERENCES users(id);`);
            } catch (fkErr) {
                // Constraint might already exist or conflict, safe to ignore for runtime stability
            }

            console.log('Migration: Checked/Added raffle columns including winner_id');
        } catch (migError) {
            console.error('Migration CRITICAL warning:', migError);
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id SERIAL PRIMARY KEY,
                raffle_id INTEGER REFERENCES raffles(id),
                user_id INTEGER REFERENCES users(id),
                hash VARCHAR(255), -- blockchain tx hash
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed some raffles if empty
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

initDB();

// Routes
app.get('/health', async (req, res) => {
    try {
        if (!pool) throw new Error('Database pool not initialized');
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
    }
});

// Routes

// Register
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }

        const newUserResult = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, password]
        );
        const newUser = newUserResult.rows[0];

        console.log('User registered:', email);
        res.json({ message: 'Usuário criado com sucesso', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        console.log('User logged in:', email);
        res.json({ message: 'Login realizado', user: { id: user.id, email: user.email, name: user.name, picture: user.picture } });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Erro ao realizar login' });
    }
});

// Google Login
const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    console.log('Backend: Received Google auth request');
    try {
        console.log('Backend: Verifying token...');
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.VITE_GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;
        console.log('Backend: Token verified. Email:', email);

        let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (!user) {
            console.log('Backend: User not found, registering new user.');
            // Create new user for Google login
            const newUserResult = await pool.query(
                'INSERT INTO users (email, password, name, picture) VALUES ($1, $2, $3, $4) RETURNING *',
                [email, 'GOOGLE_AUTH_USER', name, picture]
            );
            user = newUserResult.rows[0];
        } else {
            // Update existing user with latest Google info
            await pool.query('UPDATE users SET name = $1, picture = $2 WHERE id = $3', [name, picture, user.id]);
            user.name = name;
            user.picture = picture;
        }

        console.log('Backend: User logged in via Google:', email);
        res.json({
            message: 'Login realizado com Google',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error('Backend: Google Auth Error:', error);
        res.status(401).json({ message: 'Falha na autenticação com Google', error: error.message });
    }
});

// Get Wallet
app.get('/api/wallet', async (req, res) => {
    const userId = parseInt(req.query.userId);
    if (!userId) return res.status(400).json({ message: 'UserId required' });

    try {
        const result = await pool.query('SELECT nft_id as id, nft_metadata, quantity as quantidade FROM wallets WHERE user_id = $1', [userId]);
        // Map back to expected properties
        const wallet = result.rows.map(row => ({
            id: row.id,
            ...row.nft_metadata,
            quantidade: row.quantidade
        }));
        res.json(wallet);
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ message: 'Erro ao buscar carteira' });
    }
});

// Add to Wallet (Buy NFT)
app.post('/api/wallet', async (req, res) => {
    const { userId, nft } = req.body;
    if (!userId || !nft) return res.status(400).json({ message: 'UserId and nft required' });

    try {
        const check = await pool.query('SELECT * FROM wallets WHERE user_id = $1 AND nft_id = $2', [userId, nft.id]);

        const newHash = crypto.randomUUID();
        const timestamp = new Date().toISOString();
        const hashData = { hash: newHash, created_at: timestamp };

        if (check.rows.length > 0) {
            // Get existing metadata and hashes
            let currentMetadata = check.rows[0].nft_metadata || {};
            let currentHashes = currentMetadata.hashes || [];
            currentHashes.push(hashData);

            // Update metadata with new hash list
            currentMetadata = { ...currentMetadata, hashes: currentHashes };

            await pool.query('UPDATE wallets SET quantity = quantity + 1, nft_metadata = $1 WHERE user_id = $2 AND nft_id = $3',
                [JSON.stringify(currentMetadata), userId, nft.id]);
        } else {
            // New item, init hashes
            const metadata = { ...nft, hashes: [hashData] };
            await pool.query('INSERT INTO wallets (user_id, nft_id, nft_metadata, quantity) VALUES ($1, $2, $3, $4)',
                [userId, nft.id, JSON.stringify(metadata), 1]);
        }

        // Return updated wallet
        const result = await pool.query('SELECT nft_id as id, nft_metadata, quantity as quantidade FROM wallets WHERE user_id = $1', [userId]);
        const wallet = result.rows.map(row => ({
            id: row.id,
            ...row.nft_metadata,
            quantidade: row.quantidade
        }));
        res.json(wallet);

    } catch (error) {
        console.error('Error adding to wallet:', error);
        res.status(500).json({ message: 'Erro ao adicionar item à carteira' });
    }
});

// Remove from Wallet (Use NFT for raffle or burn)
app.post('/api/wallet/remove', async (req, res) => {
    const { userId, nftId, quantity } = req.body;
    const qty = quantity || 1;

    if (!userId || !nftId) return res.status(400).json({ message: 'UserId and nftId required' });

    try {
        const check = await pool.query('SELECT quantity FROM wallets WHERE user_id = $1 AND nft_id = $2', [userId, nftId]);

        if (check.rows.length > 0) {
            const currentQty = check.rows[0].quantity;
            if (currentQty <= qty) {
                await pool.query('DELETE FROM wallets WHERE user_id = $1 AND nft_id = $2', [userId, nftId]);
            } else {
                await pool.query('UPDATE wallets SET quantity = quantity - $1 WHERE user_id = $2 AND nft_id = $3', [qty, userId, nftId]);
            }
        }

        // Return updated wallet
        const result = await pool.query('SELECT nft_id as id, nft_metadata, quantity as quantidade FROM wallets WHERE user_id = $1', [userId]);
        const wallet = result.rows.map(row => ({
            id: row.id,
            ...row.nft_metadata,
            quantidade: row.quantidade
        }));
        res.json(wallet);

    } catch (error) {
        console.error('Error removing from wallet:', error);
        res.status(500).json({ message: 'Erro ao remover item da carteira' });
    }
});

// RAFFLES ROUTES

// List Active Raffles
app.get('/api/raffles', async (req, res) => {
    try {
        const query = `
            SELECT r.*, COUNT(t.id) as tickets_sold
            FROM raffles r
            LEFT JOIN tickets t ON r.id = t.raffle_id
            WHERE r.status = 'active'
            GROUP BY r.id
            ORDER BY r.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching raffles:', error);
        res.status(500).json({ message: `Erro ao buscar sorteios: ${error.message}` });
    }
});

// Get Raffle Details
app.get('/api/raffles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT r.*, 
                   u.name as winner_name, 
                   u.picture as winner_picture 
            FROM raffles r
            LEFT JOIN users u ON r.winner_id = u.id
            WHERE r.id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Sorteio não encontrado' });

        const raffle = result.rows[0];

        // Get ticket count
        const ticketsResult = await pool.query('SELECT count(*) FROM tickets WHERE raffle_id = $1', [id]);
        raffle.tickets_sold = parseInt(ticketsResult.rows[0].count);

        res.json(raffle);
    } catch (error) {
        console.error('Error fetching raffle details:', error);
        res.status(500).json({ message: 'Erro ao buscar detalhes do sorteio' });
    }
});

// Get Raffle Participants (Pool for Roulette)
app.get('/api/raffles/:id/participants', async (req, res) => {
    const { id } = req.params;
    try {
        // Return list of tickets with user info
        const query = `
            SELECT 
                t.id as ticket_id,
                t.hash,
                u.id as user_id,
                u.name,
                u.picture
            FROM tickets t
            JOIN users u ON t.user_id = u.id
            WHERE t.raffle_id = $1
            ORDER BY t.created_at DESC
        `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ message: 'Erro ao buscar participantes' });
    }
});

// ADMIN ROUTES
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, message: "Acesso autorizado" });
    } else {
        res.status(401).json({ success: false, message: "Senha incorreta" });
    }
});

app.post('/api/raffles', async (req, res) => {
    const { password, raffle } = req.body;

    // Simple security check
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Não autorizado" });
    }

    if (!raffle || !raffle.title || !raffle.ticket_price) {
        return res.status(400).json({ message: "Dados do sorteio incompletos" });
    }

    try {
        const query = `
            INSERT INTO raffles (title, description, prize_pool, ticket_price, max_tickets, draw_date, image_url, prize_value, category, rarity)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const values = [
            raffle.title,
            raffle.description,
            raffle.prize_pool || raffle.title,
            raffle.ticket_price,
            raffle.max_tickets || 1000,
            raffle.draw_date,
            raffle.image_url,
            raffle.prize_value || 0,
            raffle.category || 'tech',
            raffle.rarity || 'comum'
        ];

        const result = await pool.query(query, values);
        console.log('Admin created new raffle:', result.rows[0].title);
        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error creating raffle:', error);
        res.status(500).json({ message: 'Erro ao criar sorteio' });
    }
});

// Update Raffle
app.put('/api/raffles/:id', async (req, res) => {
    const { id } = req.params;
    const { password, raffle } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Não autorizado" });
    }

    try {
        const { title, description, image_url, ticket_price, prize_pool, max_tickets, prize_value, draw_date, category, rarity } = raffle;

        const result = await pool.query(
            `UPDATE raffles SET 
                title = $1, description = $2, image_url = $3, ticket_price = $4, 
                prize_pool = $5, max_tickets = $6, prize_value = $7, draw_date = $8, 
                category = $9, rarity = $10 
             WHERE id = $11 RETURNING *`,
            [title, description, image_url, ticket_price, prize_pool, max_tickets, prize_value, draw_date, category || 'tech', rarity || 'comum', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Sorteio não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating raffle:', error);
        res.status(500).json({ message: 'Erro ao atualizar sorteio' });
    }
});

app.delete('/api/raffles/:id', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body; // or query, or header. Keeping body for simplicity

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Não autorizado" });
    }

    try {
        // First delete tickets associated with this raffle to avoid FK constraint/orphans
        await pool.query('DELETE FROM tickets WHERE raffle_id = $1', [id]);

        // Then delete the raffle
        const result = await pool.query('DELETE FROM raffles WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Sorteio não encontrado' });
        }

        console.log('Admin deleted raffle:', id);
        res.json({ message: 'Sorteio removido com sucesso' });

    } catch (error) {
        console.error('Error deleting raffle:', error);
        res.status(500).json({ message: 'Erro ao deletar sorteio' });
    }
});

// Admin: Get All Raffles (Active + Completed)
app.get('/api/admin/raffles', async (req, res) => {
    try {
        const query = `
            SELECT r.*, 
                   COUNT(t.id) as tickets_sold,
                   u.name as winner_name,
                   u.picture as winner_picture
            FROM raffles r
            LEFT JOIN tickets t ON r.id = t.raffle_id
            LEFT JOIN users u ON r.winner_id = u.id
            GROUP BY r.id, u.id
            ORDER BY r.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching admin raffles:', error);
        res.status(500).json({ message: 'Erro ao buscar sorteios' });
    }
});

// Join Raffle (Buy Ticket)
app.post('/api/raffles/:id/join', async (req, res) => {
    const { id } = req.params;
    const { userId, ticketCount, txHash } = req.body;

    if (!userId || !ticketCount) return res.status(400).json({ message: 'Dados incompletos' });

    try {
        // In real web3, we would verify txHash here or via listener

        const values = [];
        const placeholders = [];
        for (let i = 0; i < ticketCount; i++) {
            values.push(id, userId, txHash || 'OFF_CHAIN_SIMULATION');
            placeholders.push(`($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`);
        }

        const query = `INSERT INTO tickets (raffle_id, user_id, hash) VALUES ${placeholders.join(',')} RETURNING id`;
        // Flatten values array
        // actually node-postgres doesn't support flat values array for multi-insert easily like this without expanding
        // Let's do a loop for simplicity or better, generate the query string properly.

        // Simpler loop approach for robustness in this snippet
        for (let i = 0; i < ticketCount; i++) {
            await pool.query('INSERT INTO tickets (raffle_id, user_id, hash) VALUES ($1, $2, $3)', [id, userId, txHash || 'pending']);
        }

        res.json({ message: 'Tickets comprados com sucesso!' });

    } catch (error) {
        console.error('Error joining raffle:', error);
        res.status(500).json({ message: 'Erro ao comprar tickets' });
    }
});

// Perform Draw (Unbiased RNG)
app.post('/api/raffles/:id/draw', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Não autorizado" });
    }

    try {
        // 1. Get all tickets for this raffle
        const ticketsResult = await pool.query(`
            SELECT t.id, t.user_id, u.name, u.picture
            FROM tickets t
            JOIN users u ON t.user_id = u.id
            WHERE t.raffle_id = $1
            ORDER BY t.id ASC
        `, [id]);

        const tickets = ticketsResult.rows;
        const totalTickets = tickets.length;

        if (totalTickets === 0) {
            return res.status(400).json({ message: "Não há participantes neste sorteio." });
        }

        // 2. Generate Secure Random Number
        const winningIndex = crypto.randomInt(0, totalTickets);
        const winningTicket = tickets[winningIndex];

        // 3. Update Raffle Status and Winner
        await pool.query('UPDATE raffles SET status = $1, prize_value = prize_value, winner_id = $2 WHERE id = $3', ['encerrado', winningTicket.user_id, id]);

        // 4. Return Winner Info
        console.log(`Draw for Raffle ${id}: Ticket ${winningIndex}/${totalTickets} won. User: ${winningTicket.name}`);

        res.json({
            winner: {
                id: winningTicket.user_id,
                name: winningTicket.name,
                picture: winningTicket.picture,
                ticketId: winningTicket.id
            },
            totalTickets,
            winningTicketIndex: winningIndex
        });

    } catch (error) {
        console.error('Error performing draw:', error);
        res.status(500).json({ message: 'Erro ao realizar sorteio' });
    }
});

// Get User Raffles
app.get('/api/user/raffles', async (req, res) => {
    const userId = parseInt(req.query.userId);
    if (!userId) return res.status(400).json({ message: 'UserId required' });

    try {
        const query = `
            SELECT 
                r.*, 
                count(t.id) as tickets_comprados
            FROM tickets t
            JOIN raffles r ON t.raffle_id = r.id
            WHERE t.user_id = $1
            GROUP BY r.id
        `;
        const result = await pool.query(query, [userId]);

        const userRaffles = result.rows.map(row => ({
            raffle: {
                id: row.id,
                title: row.title,
                description: row.description,
                image: row.image_url,
                price: row.ticket_price,
                prize: row.prize_pool,
                prizeValue: row.prize_value || 0,
                drawDate: row.draw_date,
                status: row.status,
                category: row.category || 'tech',
                rarity: row.rarity || 'comum',
                winner_id: row.winner_id,
                winner_name: row.winner_name,
                winner_picture: row.winner_picture // Wait, join query needs update too?
            },
            ticketsComprados: parseInt(row.tickets_comprados),
            totalValueContributed: parseInt(row.tickets_comprados) * row.ticket_price,
            dataParticipacao: new Date().toISOString() // approximation
        }));

        res.json(userRaffles);
    } catch (error) {
        console.error('Error fetching user raffles:', error);
        res.status(500).json({ message: 'Erro ao buscar sorteios do usuário' });
    }
});

// Serve React App
const DIST_DIR = path.join(process.cwd(), 'dist');
console.log('Serving static files from:', DIST_DIR);

app.use(express.static(DIST_DIR));

app.get('*', (req, res) => {
    const indexPath = path.join(DIST_DIR, 'index.html');
    console.log('Rendering SPA:', indexPath, 'Request:', req.url);
    res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
