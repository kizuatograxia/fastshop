import { initDB } from './db.js';

(async () => {
    try {
        console.log("Running DB init manually...");
        await initDB();
        console.log("Done.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
