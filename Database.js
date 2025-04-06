const sql = require("mysql2")


const pool = sql.createPool({
    host: 'localhost',   // Change this if using remote DB
    user: 'root',        // Your MySQL username
    password: '123', // Your MySQL password
    database: 'journal_Database',
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