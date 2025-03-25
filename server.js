const express = require("express");
const cors = require("cors");
const Form_Submission = require("./Routes/Form_Submission");
const pool = require("./Database");

const app = express();
app.use(express.json());
app.use(cors({
    origin: "*"
}));


pool.query(`
    
create table if not exists Journal (
   id int primary key auto_increment,
    Journal_Type varchar(100) not null,
    Title_of_paper varchar(100) not null,
    Author_Name varchar(100) not null,
    Fathers_Husbands_name varchar(100) not null,
    subject varchar(100) not null,
    Branch varchar(200),
    Education varchar(100) not null,
    Second_Author_Guide_Name varchar(100),
    Abstract text not null,
    Address varchar(200) not null,
    Contact numeric not null,
    Email varchar(30) not null,
    Paper varchar(100) not null,
	Photo varchar(100) not null,
	Certificate varchar(100) not null
    ); ` , (err, results) => {
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



app.use("/api/v1", Form_Submission);

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});



