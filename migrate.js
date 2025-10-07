const { config } = require("dotenv");
const pool = require("./Database");

config();

async function migrate() {
    const promisePool = pool.promise(); // convert to promise-based API

    try {
        console.log("🚀 Running migration...");
        await promisePool.query('Alter table Journal modify column Created_at DATETIME Not NULL;');


        console.log("✅ Migration completed successfully!");
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        await promisePool.end(); // close pool after all queries finish
    }
}

migrate();
