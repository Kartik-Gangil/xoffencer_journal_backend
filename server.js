// const cluster = require("cluster");
// const os = require("os");
const express = require("express");
const cors = require("cors");
const { config } = require("dotenv");
const cron = require('node-cron');

const Form_Submission = require("./Routes/Form_Submission");
const SeminarConference = require("./Routes/SeminarConfrence");
const User = require("./Routes/User");
const pool = require("./Database");
const Fixing = require("./Fixing");
const path = require("path");

config();

const PORT = process.env.PORT || 8000;

// if (cluster.isMaster) {
//     // Master process
//     const numCPUs = os.cpus().length;
//     console.log(`Master ${process.pid} is running`);
//     console.log(`Forking ${numCPUs} workers...`);

//     // Fork workers
//     for (let i = 0; i < numCPUs; i++) {
//         cluster.fork();
//     }

//     // Restart worker if it crashes
//     cluster.on("exit", (worker, code, signal) => {
//         console.log(`Worker ${worker.process.pid} died. Spawning a new one...`);
//         cluster.fork();
//     });

// } else {
// Worker processes
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads", "Journal")));
// Create tables (only once, to avoid duplicate queries)
// if (cluster.worker.id === 1) {
pool.query(`
            CREATE TABLE IF NOT EXISTS Journal (
                id INT PRIMARY KEY AUTO_INCREMENT,
                Journal_Type VARCHAR(100) NOT NULL,
                Title_of_paper VARCHAR(100) NOT NULL,
                Author_Name VARCHAR(100) NOT NULL,
                Fathers_Husbands_name VARCHAR(100) NOT NULL,
                subject VARCHAR(100) NOT NULL,
                Branch VARCHAR(200),
                Education TEXT NOT NULL,
                Second_Author_Guide_Name VARCHAR(100),
                Abstract TEXT NOT NULL,
                Address VARCHAR(200) NOT NULL,
                Contact VARCHAR(20) NOT NULL,
                Email VARCHAR(100) NOT NULL,
                Paper VARCHAR(100) NOT NULL,
                Photo VARCHAR(100) NOT NULL,
                Certificate VARCHAR(100) NOT NULL,
                Created_at DATETIME ,
                Volume int,
                Issue int,
                isPublished boolean DEFAULT false,
                Publication_date DATE DEFAULT NULL
            );
        `, (err) => {
    if (err) console.error("Error creating Journal table:", err);
    else console.log("Journal table ready");
});

pool.query(`
            CREATE TABLE IF NOT EXISTS Members_of_Editorial(
                id int primary key auto_increment,
                Name varchar(50) not null,
                designation varchar(255) not null,
                Occupation varchar(255) not null,
                Gurdian_name varchar(255),
                Qualification varchar(255) not null,
                Education_Experience varchar(255) not null,
                Branch varchar(255),
                Abstract text not null,
                Email varchar(255) not null,
                Contact numeric not null,
                Address text not null,
                Date_of_Birth varchar(100) not null,
                Photo varchar(100) not null,
                Last_Educational_Qualification varchar(100) not null
            );
        `, (err) => {
    if (err) console.error("Error creating Members_of_Editorial table:", err);
    else console.log("Members_of_Editorial table ready");
});

pool.query(`
            CREATE TABLE IF NOT EXISTS Journal_Certification(
                id int primary key auto_increment,
                Name varchar(50) not null,
                Gurdian_name varchar(255),
                subject varchar(255) not null,
                Branch varchar(255),
                Education varchar(255) not null,
                link_of_publication varchar(100) not null,
                paper varchar(100) not null,
                Abstract text not null,
                Address text not null,
                Email varchar(255) not null,
                Contact numeric not null,
                Photo varchar(100) not null
            );
        `, (err) => {
    if (err) console.error("Error creating Journal_Certification table:", err);
    else console.log("Journal_Certification table ready");
});

pool.query(`
            CREATE TABLE IF NOT EXISTS Contact_us(
                id int primary key auto_increment,
                Name varchar(100) not null,
                Email varchar(225) not null,
                PhoneNo varchar(20) not null,
                Message Text not null,
                Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `, (err) => {
    if (err) console.error("Error creating Contact_us table:", err);
    else console.log("Contact_us table ready");
});

pool.query(`
            CREATE TABLE IF NOT EXISTS Users(
                id int primary key auto_increment,
                Name varchar(100) not null,
                Email varchar(225) not null unique,
                Password Text not null,
                Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `, (err) => {
    if (err) console.error("Error creating Users table:", err);
    else console.log("Users table ready");
});

pool.query(`
            CREATE TABLE IF NOT EXISTS Conference_Application(
                id int primary key auto_increment,
                Conference_Name varchar(300) not null,
                date date,
                mode enum('online','offline') not null,
                title varchar(100) not null,
                Participant_Name varchar(100),
                subject varchar(200),
                co_author varchar(100),
                email varchar(100),
                mobile varchar(10),
                address_proof_type enum('Aadhar','Driving License','Voter ID') not null,
                adress_proof varchar(255),
                TransactionID varchar(500) not null default("null"),
                Paper VARCHAR(100) NOT NULL
            );
        `, (err) => {
    if (err) console.error("Error creating Conference_Application table:", err);
    else console.log("Conference_Application table ready");
});
// }
// Routes
app.use("/api/v1", User);
app.use("/api/v1", SeminarConference);
app.use("/api/v1", Form_Submission);

//  setting an crone job for every day at midnight to set total pages , startpage and endpage in the db

cron.schedule('0 0 * * *', () => {
    try {
        Fixing()
    } catch (error) {
        console.error(error)
    }

});

app.listen(PORT, "127.0.0.1", () => {
    console.log(`server running on port ${PORT}`);
});


// }
