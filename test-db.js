import { pool } from './server/db.js';

async function check() {
  const res = await pool.query('SELECT image_urls FROM raffles ORDER BY id DESC LIMIT 1');
  if (res.rows.length > 0) {
    const data = res.rows[0].image_urls;
    console.log('Type:', typeof data);
    console.log('Is Array?', Array.isArray(data));
    console.log('Value:', JSON.stringify(data).substring(0, 100));
  } else {
    console.log('No raffles found');
  }
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
