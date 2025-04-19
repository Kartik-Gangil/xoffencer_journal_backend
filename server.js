const express = require("express");
const cors = require("cors");
const Form_Submission = require("./Routes/Form_Submission");
const pool = require("./Database");
const { config } = require("dotenv");
const https = require('https');
const http = require('http');
const fs = require('fs');
config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: "*"
}));

const sslOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/varsharesearchorganization.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/varsharesearchorganization.com/fullchain.pem')
};


const PORT = process.env.PORT || 8000;

pool.query(`
   CREATE TABLE IF NOT EXISTS Journal (
    id INT PRIMARY KEY AUTO_INCREMENT,
    Journal_Type VARCHAR(100) NOT NULL,
    Title_of_paper VARCHAR(100) NOT NULL,
    Author_Name VARCHAR(100) NOT NULL,
    Fathers_Husbands_name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    Branch VARCHAR(200),
    Education VARCHAR(100) NOT NULL,
    Second_Author_Guide_Name VARCHAR(100),
    Abstract TEXT NOT NULL,
    Address VARCHAR(200) NOT NULL,
    Contact VARCHAR(20) NOT NULL,  -- Changed from NUMERIC to VARCHAR(20)
    Email VARCHAR(100) NOT NULL,   -- Increased length for better email support
    Paper VARCHAR(100) NOT NULL,
    Photo VARCHAR(100) NOT NULL,
    Certificate VARCHAR(100) NOT NULL,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Changed DATE to DATETIME
    Volume int,
    Issue int ,
    isPublished boolean DEFAULT false,
    Publication_date DATE DEFAULT NULL
);
` , (err, results) => {
    if (err) {
        console.error("Error executing query:", err);
    } else {
        console.log(results)
        console.log("Table created or already exists");
    }
});

pool.query(`
    
  create table if not exists Members_of_Editorial(
    id int primary key auto_increment,
    Name varchar(50) not null,
    designation varchar(255) not null,
    Occupation varchar(255) not null,
    Gurdian_name varchar(255) ,
    Qualification varchar(255) not null,
    Education_Experience varchar(255) not null,
    Branch varchar(255) ,
    Abstract text not null,
    Email varchar(255) not null,
	Contact numeric not null,
	Address text not null,
	Date_of_Birth varchar(100) not null,
	Photo varchar(100) not null,
	Last_Educational_Qualification varchar(100) not null
    );
    ` , (err, results) => {
    if (err) {
        console.error("Error executing query:", err);
    } else {
        console.log(results)
        console.log("Table created or already exists");
    }
});

pool.query(`
    create table if not exists Journal_Certification(
    id int primary key auto_increment,
	Name varchar(50) not null,
    Gurdian_name varchar(255) ,
    subject varchar(255) not null,
    Branch varchar(255) ,
    Education varchar(255) not null,
    link_of_publication varchar(100) not null,
    paper varchar(100) not null,
    Abstract text not null,
	Address text not null,
    Email varchar(255) not null,
	Contact numeric not null,
	Photo varchar(100) not null
    );
    ` , (err, results) => {
    if (err) {
        console.error("Error executing query:", err);
    } else {
        console.log(results)
        console.log("Table created or already exists");
    }
});

pool.query(`
   create table if not exists Contact_us(
    id int primary key auto_increment,
    Name varchar(100) not null,
    Email varchar(225) not null,
    PhoneNo varchar(20) not null,
    Message Text not null,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    ` , (err, results) => {
    if (err) {
        console.error("Error executing query:", err);
    } else {
        console.log(results)
        console.log("Table created or already exists");
    }
});



app.use("/api/v1", Form_Submission);

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log('✅ HTTPS Server running on https://varsharesearchorganization.com');
});

http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
    res.end();
}).listen(80, () => {
    console.log('🌐 Redirecting HTTP traffic to HTTPS');
});