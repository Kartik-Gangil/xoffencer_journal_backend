const { config } = require("dotenv");
const pool = require("./Database");

config();

async function migrate() {
    const promisePool = pool.promise(); // convert to promise-based API

    try {
        console.log("🚀 Running migration...");
        await promisePool.query('ALTER TABLE Journal ADD COLUMN total_pages INT NULL,ADD COLUMN start_page INT NULL,ADD COLUMN end_page INT NULL;');
        // 1. Add Year column 
        // await promisePool.query(`
        //     ALTER TABLE Journal ADD COLUMN Year INT GENERATED ALWAYS AS (YEAR(Created_at)) STORED;
        // `);

        // // 2. Add indexes
        // await promisePool.query(`
        //     CREATE INDEX  idx_journal_type_year ON Journal (Journal_Type, Year);
        // `);

        // await promisePool.query(`
        //     CREATE INDEX  idx_journal_type_issue ON Journal (Journal_Type, Issue);
        // `);

        // await promisePool.query(`
        //     CREATE INDEX  idx_journal_type_year_issue ON Journal (Journal_Type, Year, Issue);
        // `);

        console.log("✅ Migration completed successfully!");
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        await promisePool.end(); // close pool after all queries finish
    }
}

migrate();
