const { config } = require("dotenv");
const sql = require("mysql2")
config();

const pool = sql.createPool({
    host: process.env.host,   // Change this if using remote DB
    user: process.env.user,        // Your MySQL username
    password:process.env.Pass, // Your MySQL password
    database: process.env.DB, // Your MySQL database name
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// const DisConnect_DB = (connection) => {
//     if (connection) {
//         connection.end();
//         console.log('✅ MySQL connection released back to pool.');
//    }
// }


module.exports =  pool 