const { config } = require("dotenv");
const pool = require("./Database");

config();

async function migrate() {
    const promisePool = pool.promise(); // convert to promise-based API

    try {
        console.log("🚀 Running migration...");

        await promisePool.query(`ALTER TABLE Journal ADD COLUMN DOI VARCHAR(255) NOT NULL DEFAULT '';`);
        // await promisePool.query(` ALTER TABLE Journal ADD COLUMN Year INT GENERATED ALWAYS AS (YEAR(Created_at)) STORED;`)
        console.log("✅ Migration completed successfully!");
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        await promisePool.end(); // close pool after all queries finish
    }
}

migrate();
