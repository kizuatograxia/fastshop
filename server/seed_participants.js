import pkg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@db:5432/fastshop'
});

const seedParticipants = async () => {
    try {
        console.log('Seeding participants...');

        // 1. Create Dummy Users
        const users = [
            { name: "Alice Souza", picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80", email: "alice@example.com" },
            { name: "Bruno Lima", picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80", email: "bruno@example.com" },
            { name: "Carla Dias", picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80", email: "carla@example.com" },
            { name: "Diego Alves", picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80", email: "diego@example.com" },
            { name: "Elena Costa", picture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80", email: "elena@example.com" },
            { name: "Fabio Silva", picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80", email: "fabio@example.com" },
            { name: "Gabriela Rocha", picture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80", email: "gabriela@example.com" },
            { name: "Hugo Martins", picture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80", email: "hugo@example.com" },
        ];

        const userIds = [];

        for (const user of users) {
            // Check if exists
            const check = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
            let uid;
            if (check.rows.length > 0) {
                uid = check.rows[0].id;
            } else {
                const res = await pool.query(
                    'INSERT INTO users (name, email, password, picture) VALUES ($1, $2, $3, $4) RETURNING id',
                    [user.name, user.email, 'dummy_pass', user.picture]
                );
                uid = res.rows[0].id;
            }
            userIds.push(uid);
        }

        console.log(`Ensured ${userIds.length} users.`);

        // 2. Get Raffles
        const rafflesRes = await pool.query('SELECT id FROM raffles WHERE status = \'active\'');
        const tasks = [];

        // 3. Create Tickets
        for (const raffle of rafflesRes.rows) {
            const raffleId = raffle.id;
            console.log(`Seeding tickets for Raffle ${raffleId}...`);

            // Randomly assign 5-15 tickets per raffle from random users
            const ticketCount = Math.floor(Math.random() * 10) + 5;

            for (let i = 0; i < ticketCount; i++) {
                const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
                const hash = crypto.randomUUID();

                await pool.query(
                    'INSERT INTO tickets (raffle_id, user_id, hash) VALUES ($1, $2, $3)',
                    [raffleId, randomUser, hash]
                );
            }
            console.log(`Added ${ticketCount} tickets to Raffle ${raffleId}`);
        }

        console.log('Seeding complete.');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
};

seedParticipants();
