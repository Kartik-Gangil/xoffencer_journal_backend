const express = require("express");
const router = express.Router();
const fs = require("fs");
const send = require("../Vol_Issue");
const pool = require("../Database");
const GetUploadMiddleWare = require('../multer');

// File fields for multer
const JournalFormFields = [
    { name: "paperIcon", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "marksheet", maxCount: 1 },
];

const uploadJournal = GetUploadMiddleWare('./uploads/Journal')

// API Route
console.log(new Date().getDate())
router.post("/form-for-publication", uploadJournal.fields(JournalFormFields), async (req, res) => {


    try {
        const paperPath = req.files["paperIcon"] ? req.files["paperIcon"][0].path : null;
        const photoPath = req.files["photo"] ? req.files["photo"][0].path : null;
        const certificatePath = req.files["marksheet"] ? req.files["marksheet"][0].path : null;


        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Extract fields from request
        const { journal, author, name, subject, branch, education, abstract, address, contact, email, paper, secondauthor } = req.body;
        const { volume, issue } = send()
        // Insert data into database
        const query = `INSERT INTO Journal (
            Journal_Type, Title_of_paper, Author_Name, Fathers_Husbands_name,
            subject, Branch, Education, Second_Author_Guide_Name,
            Abstract, Address, Contact, Email, Paper, Photo, Certificate , Volume , Issue
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ? , ?)`;

        try {
            const results = pool.query(query, [
                journal, paper, author, name, subject, branch, education, secondauthor,
                abstract, address, contact, email, paperPath, photoPath, certificatePath, volume, issue
            ]);

            return res.status(201).json({
                message: "Files uploaded and data saved successfully!",
                submissionId: results.insertId,
                files: { paper: paperPath, photo: photoPath, certificate: certificatePath },
            });

        } catch (dbError) {
            console.error("Database error:", dbError);

            // Delete uploaded files if database operation fails
            await deleteFiles([paperPath, photoPath, certificatePath]);

            return res.status(500).json({
                message: "Database error",
                error: dbError.message
            });
        }

    } catch (error) {
        console.error("Error in form submission:", error);

        // Cleanup uploaded files if any error occurs
        await deleteFiles([paperPath, photoPath, certificatePath]);

        return res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred",
        });
    }
});

// Function to delete uploaded files if an error occurs
async function deleteFiles(paths) {
    for (const filePath of paths) {
        if (filePath && fs.existsSync(filePath)) {
            try {
                await fs.promises.unlink(filePath);
                console.log(`Deleted file: ${filePath}`);
            } catch (err) {
                console.error(`Error deleting file ${filePath}:`, err);
            }
        }
    }
}



//  member board api

const MemberBoardFormFields = [
    { name: "datebirth", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "marksheet", maxCount: 1 },
];
const uploadMemberBoard = GetUploadMiddleWare('./uploads/MemberBoard')

// API Route
router.post("/form-for-MemberBoard", uploadMemberBoard.fields(MemberBoardFormFields), async (req, res) => {

    try {

        const datebirthPath = req.files["datebirth"] ? req.files["datebirth"][0].path : null;
        const photoPath = req.files["photo"] ? req.files["photo"][0].path : null;
        const MarksheetPath = req.files["marksheet"] ? req.files["marksheet"][0].path : null;


        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Extract fields from request
        const { name, designation, fathername, status, branch, education, experience, abstract, address, email, contact } = req.body;

        // Insert data into database
        const query = `INSERT INTO Members_of_Editorial (
           Name, designation, Occupation, Gurdian_name, Qualification, Education_Experience, Branch, Abstract, Email, Contact, Address, Date_of_Birth, Photo,Last_Educational_Qualification  
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        try {
            const results = pool.query(query, [
                name, designation, status, fathername, education, experience, branch, abstract, email, contact, address, datebirthPath, photoPath, MarksheetPath]);
            // console.log(results)
            return res.status(201).json({
                message: "Files uploaded and data saved successfully!",
                submissionId: results.insertId,
                files: { DOB: datebirthPath, photo: photoPath, marksheet: MarksheetPath },
            });

        } catch (dbError) {
            console.error("Database error:", dbError);

            // Delete uploaded files if database operation fails
            await deleteFiles([datebirthPath, photoPath, MarksheetPath]);

            return res.status(500).json({
                message: "Database error",
                error: dbError.message
            });
        }

    } catch (error) {
        console.error("Error in form submission:", error);

        // Cleanup uploaded files if any error occurs
        await deleteFiles([datebirthPath, photoPath, MarksheetPath]);

        return res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred",
        });
    }
});


//  member board api

const JournalCertificationFormFields = [
    { name: "photo", maxCount: 1 }
];
const uploadJournalCertification = GetUploadMiddleWare('./uploads/JournalCertification')

// API Route
router.post("/form-for-JournalCertification", uploadJournalCertification.fields(JournalCertificationFormFields), async (req, res) => {

    try {

        // const datebirthPath = req.files["datebirth"] ? req.files["datebirth"][0].path : null;
        const photoPath = req.files["photo"] ? req.files["photo"][0].path : null;
        // const MarksheetPath = req.files["marksheet"] ? req.files["marksheet"][0].path : null;


        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Extract fields from request
        const { name, fathername, subject, branch, education, link, paper, abstract, address, email, contact } = req.body;

        // Insert data into database
        const query = `INSERT INTO Journal_Certification (
           Name,Gurdian_name, subject, Branch, Education, link_of_publication , paper,Abstract,  Address,Email, Contact, Photo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        try {
            const results = pool.query(query, [
                name, fathername, subject, branch, education, link, paper, abstract, address, email, contact, photoPath]);
            // console.log(results)
            return res.status(201).json({
                message: "Files uploaded and data saved successfully!",
                submissionId: results.insertId,
                files: { photo: photoPath }
            });

        } catch (dbError) {
            console.error("Database error:", dbError);

            // Delete uploaded files if database operation fails
            await deleteFiles([datebirthPath, photoPath, MarksheetPath]);

            return res.status(500).json({
                message: "Database error",
                error: dbError.message
            });
        }

    } catch (error) {
        console.error("Error in form submission:", error);

        // Cleanup uploaded files if any error occurs
        await deleteFiles([datebirthPath, photoPath, MarksheetPath]);

        return res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred",
        });
    }
});



// fetching data

router.get('/:type', (req, res) => {

    const type = req.params.type; // Get the type from the URL parameter

    // Define the SQL query based on the type
    let query = '';
    if (type === 'National') {
        query = 'SELECT Created_at FROM Journal where Journal_Type = "National Journal" ORDER BY ID';
    } else if (type === 'International') {
        query = 'SELECT Created_at FROM Journal where Journal_Type = "International" ORDER BY ID';
    }
    else {
        return res.status(400).json({ message: "Invalid type" });
    }

    // Execute the query
    pool.query(query, (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Database error", error: error.message });
        }
        res.status(200).json(results); // Send the results as JSON response
    });
})

















module.exports = router;
