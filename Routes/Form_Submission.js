const express = require("express");
const router = express.Router();
const fs = require("fs");
const send = require("../Vol_Issue");
const pool = require("../Database");
const GetUploadMiddleWare = require('../multer');
const sendEmail = require("../Mail");
const mergePDFs = require("../MergePDF");
const path = require("path");

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
        // console.log({ volume, issue })
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
            sendEmail(email, author)
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
// getting year
router.get('/:type', (req, res) => {

    const type = req.params.type; // Get the type from the URL parameter

    // Define the SQL query based on the type
    let query = '';
    if (type === 'National Journal') {
        query = 'SELECT Created_at FROM Journal where Journal_Type = "National Journal" ';
    } else if (type === 'International Journal') {
        query = 'SELECT Created_at FROM Journal where Journal_Type = "International Journal" ';
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
        const uniqueYears = [...new Set(results.map(item => new Date(item.Created_at).getFullYear()))];
        const sortYear = uniqueYears.sort((a, b) => a - b); // Sort the years in ascending order
        res.status(200).json(sortYear); // Send the results as JSON response
    });
})



// getting volume

router.get('/:type/:year', (req, res) => {

    const { type, year } = req.params; // Get the type from the URL parameter
    // Define the SQL query based on the type
    let query = '';
    if (type === 'National Journal') {
        query = `SELECT Volume FROM Journal where Journal_Type = "National Journal" AND YEAR(Created_at) = ? `;
    } else if (type === 'International Journal') {
        query = `SELECT Volume FROM Journal where Journal_Type = "International Journal" AND YEAR(Created_at) = ? `;
    }
    else {
        return res.status(400).json({ message: "Invalid type" });
    }

    // Execute the query
    pool.query(query, [year], (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Database error", error: error.message });
        }
        const uniqueVolumes = [...new Set(results.map(item => item.Volume))];
        const sortVolume = uniqueVolumes.sort((a, b) => a - b); // Sort the years in ascending order
        const updatedVolume = sortVolume.map(num => `Volume ${num}`);
        res.status(200).json(updatedVolume); // Send the results as JSON response
    });
})

// getting issue
router.get('/:type/:year/:vol', (req, res) => {

    const { type, year, vol } = req.params; // Get the type from the URL parameter
    const number = vol.split(" ")[1]; // Gets the second part after splitting by space
    // console.log(Number(number))
    // Define the SQL query based on the type
    let query = '';
    if (type === 'National Journal') {
        query = `SELECT Issue FROM Journal where Journal_Type = "National Journal" AND YEAR(Created_at) = ? And Volume = ? `;
    } else if (type === 'International Journal') {
        query = `SELECT Issue FROM Journal where Journal_Type = "International Journal" AND YEAR(Created_at) = ? And Volume = ?  `;
    }
    else {
        return res.status(400).json({ message: "Invalid type" });
    }

    // Execute the query
    pool.query(query, [year, number], (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Database error", error: error.message });
        }
        const uniqueIssue = [...new Set(results.map(item => item.Issue))];
        const sortIssue = uniqueIssue.sort((a, b) => a - b); // Sort the years in ascending order
        const updatedIssue = sortIssue.map(num => `Issue ${num}`);
        res.status(200).json(updatedIssue); // Send the results as JSON response
    });
})

// getting entries

router.get('/:type/:year/:vol/:issue', (req, res) => {

    const { type, year, vol, issue } = req.params; // Get the type from the URL parameter
    const Volume = vol.split(" ")[1]; // Gets the second part after splitting by space
    const Issue = issue.split(" ")[1]; // Gets the second part after splitting by space
    // Define the SQL query based on the type
    let query = '';
    if (type === 'National Journal') {
        query = `SELECT * FROM Journal where Journal_Type = "National Journal" AND YEAR(Created_at) = ? And Volume = ? AND Issue = ?`;
    } else if (type === 'International Journal') {
        query = `SELECT * FROM Journal where Journal_Type = "International Journal" AND YEAR(Created_at) = ? And Volume = ? AND Issue = ? `;
    }
    else {
        return res.status(400).json({ message: "Invalid type" });
    }

    // Execute the query
    pool.query(query, [year, Volume, Issue], (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Database error", error: error.message });
        }

        res.status(200).json(results); // Send the results as JSON response
    });
})


// download the file

router.post('/download/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Requested ID:", id);

        const query = `SELECT * FROM Journal WHERE id = ?`;
        pool.query(query, [id], (error, results) => {
            if (error) {
                console.error("Database error:", error);
                return res.status(500).json({ message: "Database error", error: error.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "File not found" });
            }

            const filePath = results[0].Paper; // Assuming this contains the full file path
            console.log("File Path:", filePath);
            let originalPath = filePath;
            let safeFilename = path.basename(originalPath).replace(/[^\w.-]/g, '_'); // replace unsafe chars

            // Set correct headers for PDF download
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}.pdf"`);

            // Send the file
            res.download(path.resolve(originalPath), safeFilename, (err) => {
                if (err) {
                    console.error("File download error:", err);
                    res.status(500).send('Error downloading file');
                }
            });
        });
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});


router.post("/downloadMagzine/:year/:vol/:issue", async (req, res) => {
    try {
        const { year, vol, issue } = req.params;
        const Volume = vol.includes(" ") ? vol.split(" ")[1] : vol;
        const Issue = issue.includes(" ") ? issue.split(" ")[1] : issue;
        const query = `SELECT Title_of_paper, Paper FROM Journal WHERE YEAR(created_at) = ? AND volume = ? AND issue = ?`;
        const title = `Magazine_of_Volume_${Volume}_Issue_${Issue}`;
        const filePath = `./uploads/Magazine/${title}.pdf`;

        // Check if the file already exists asynchronously
        let fileExists = false;
        try {
            await fs.promises.access(filePath);
            fileExists = true;
        } catch (err) {
            fileExists = false;
        }

        if (fileExists) {
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);
            return res.download(filePath, (err) => {
                if (err) {
                    console.error("File download error:", err);
                    return res.status(500).send('Error downloading file');
                }
            });
        }

        // If file doesn't exist, fetch data from DB
        const results = await new Promise((resolve, reject) => {
            pool.query(query, [year, Volume, Issue], (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

        if (results.length === 0) {
            return res.status(404).json({ message: "File not found" });
        }

        const pdfFiles = results.map(item => item.Paper).filter(file => file); // Ensure valid paths

        if (pdfFiles.length === 0) {
            return res.status(404).json({ message: "No valid PDF files found to merge" });
        }

        await mergePDFs(filePath, pdfFiles);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);
        res.download(filePath, (err) => {
            if (err) {
                console.error("File download error:", err);
                res.status(500).send('Error downloading file');
            }
        });

    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});




module.exports = router;
