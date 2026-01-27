import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@db:5432/fastshop'
});

const fixImages = async () => {
    try {
        console.log('Fixing images...');

        await pool.query(`
            UPDATE raffles 
            SET image_url = 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80' 
            WHERE title LIKE '%iPhone%'
        `);

        await pool.query(`
            UPDATE raffles 
            SET image_url = 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80' 
            WHERE title LIKE '%PlayStation%'
        `);

        console.log('Images fixed.');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
};

fixImages();
