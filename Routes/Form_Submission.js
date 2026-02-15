const express = require("express");
const router = express.Router();
const fs = require("fs");
const send = require("../Vol_Issue");
const pool = require("../Database");
const GetUploadMiddleWare = require('../multer');
const sendEmail = require("../Mail");
const mergePDFs = require("../MergePDF");
const editSinglePdf = require('../EditSinglepdf');
const path = require("path");
const CreateIndex = require("../createIndex");
const CreateCertificate = require("../Certificate");
const createOrder = require('../Payment_Service')
const crypto = require('crypto')
// const Fixing = require("../Fixing");
// const Zenodo = require("./zenodo");

// File fields for multer
const JournalFormFields = [
    { name: "paperIcon", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "marksheet", maxCount: 1 },
];

const uploadJournal = GetUploadMiddleWare('./uploads/Journal')

// API Route
router.post("/verify-payment", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        res.json({ success: true, message: "Payment verified successfully" });
    } else {
        res.status(400).json({ success: false, message: "Invalid signature" });
    }
});



console.log(new Date().getDate())

// ask for api of razor pay and integrate it here and make seperate route for admin to add journal entry or find a way to use same route for form submission and admin entry

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
        const { journal, author, name, subject, branch, education, abstract, address, contact, email, paper, secondauthor, date, amount } = req.body;

        const order = await createOrder(amount); //integrate the payment in this route
        const { volume, issue } = send(date)
        // console.log({ volume, issue })
        try {
            await sendEmail(email, author); // assuming sendEmail is async
        } catch (emailError) {
            console.error("❌Email sending failed:", emailError);
            await deleteFiles([paperPath, photoPath, certificatePath]);
            return res.status(500).json({
                message: "❌Failed to send email notification",
                status: false,
                error: emailError.message
            });
        }
        // Insert data into database
        const query = `INSERT INTO Journal (
            Journal_Type, Title_of_paper, Author_Name, Fathers_Husbands_name,
            subject, Branch, Education, Second_Author_Guide_Name,
            Abstract, Address, Contact, Email, Paper, Photo, Certificate,Created_at , Volume , Issue
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ? , ? , ?)`;

        try {
            const results = pool.query(query, [
                journal, paper, author, name, subject, branch, education, secondauthor,
                abstract, address, contact, email, paperPath, photoPath, certificatePath, date, volume, issue
            ]);
            // if (results) await Fixing() // fix this for updating the start and end page number in the database of the entry just added
            return res.status(201).json({
                message: "Files uploaded and data saved successfully!",
                status: true,
                submissionId: results.insertId,
                files: { paper: paperPath, photo: photoPath, certificate: certificatePath },
                orderId: order.id,
                currency: order.currency,
                amount: order.amount
            });

        } catch (dbError) {
            console.error("Database error:", dbError);

            // Delete uploaded files if database operation fails
            await deleteFiles([paperPath, photoPath, certificatePath]);

            return res.status(500).json({
                message: "Database error",
                status: false,
                error: dbError.message
            });
        }

    } catch (error) {
        console.error("Error in form submission:", error);

        // Cleanup uploaded files if any error occurs
        await deleteFiles([paperPath, photoPath, certificatePath]);

        return res.status(500).json({
            message: "Internal server error",
            status: false,
            error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred",
        });
    }
});


router.post("/form-for-publication-admin", uploadJournal.fields(JournalFormFields), async (req, res) => {

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
        const { journal, author, name, subject, branch, education, abstract, address, contact, email, paper, secondauthor, date } = req.body;

        // const order = await createOrder(amount); //integrate the payment in this route
        const { volume, issue } = send(date)
        // console.log({ volume, issue })

        // Insert data into database
        const query = `
            INSERT INTO Journal (
                Journal_Type,
                Title_of_paper,
                Author_Name,
                Fathers_Husbands_name,
                subject,
                Branch,
                Education,
                Second_Author_Guide_Name,
                \`Abstract\`,
                Address,
                Contact,
                Email,
                Paper,
                Photo,
                Certificate,
                Created_at,
                Volume,
                Issue,
                isPublished,
                Publication_date 
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

        try {
            const results = pool.query(query, [
                journal,          // Journal_Type
                paper,            // Title_of_paper
                author,           // Author_Name
                name,             // Fathers_Husbands_name
                subject,
                branch,
                education,
                secondauthor,
                abstract,
                address,
                contact,
                email,
                paperPath,
                photoPath,
                certificatePath,
                date,
                volume,
                issue,
                true,         // boolean instead of "true"
                date          // Publication_date same as Created_at
            ]);
            // await Zenodo(paperPath, "https://zenodo.org/api/files/your_bucket_id", path.basename(paperPath))
            // if (results) await Fixing() // fix this for updating the start and end page number in the database of the entry just added
            try {
                await sendEmail(email, author); // assuming sendEmail is async
            } catch (emailError) {
                console.error("❌Email sending failed:", emailError);
                await deleteFiles([paperPath, photoPath, certificatePath]);
                return res.status(500).json({
                    message: "❌Failed to send email notification",
                    status: false,
                    error: emailError.message
                });
            }
            return res.status(201).json({
                message: "Files uploaded and data saved successfully!",
                status: true,
                submissionId: results.insertId,
                files: { paper: paperPath, photo: photoPath, certificate: certificatePath },
            });

        } catch (dbError) {
            console.error("Database error:", dbError);

            // Delete uploaded files if database operation fails
            await deleteFiles([paperPath, photoPath, certificatePath]);

            return res.status(500).json({
                message: "Database error",
                status: false,
                error: dbError.message
            });
        }

    } catch (error) {
        console.error("Error in form submission:", error);

        // Cleanup uploaded files if any error occurs
        await deleteFiles([paperPath, photoPath, certificatePath]);

        return res.status(500).json({
            message: "Internal server error",
            status: false,
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
                status: true,
                submissionId: results.insertId,
                files: { DOB: datebirthPath, photo: photoPath, marksheet: MarksheetPath },
            });

        } catch (dbError) {
            console.error("Database error:", dbError);

            // Delete uploaded files if database operation fails
            await deleteFiles([datebirthPath, photoPath, MarksheetPath]);

            return res.status(500).json({
                message: "Database error",
                status: false,
                error: dbError.message
            });
        }

    } catch (error) {
        console.error("Error in form submission:", error);

        // Cleanup uploaded files if any error occurs
        await deleteFiles([datebirthPath, photoPath, MarksheetPath]);

        return res.status(500).json({
            message: "Internal server error",
            status: false,
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
        const { name, fathername, subject, branch, education, link, paper, abstract, address, email, contact, amount } = req.body;
        const order = await createOrder(amount); //integrate the payment in this route
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
                status: true,
                submissionId: results.insertId,
                files: { photo: photoPath },
                orderId: order.id,
                currency: order.currency,
                amount: order.amount
            });

        } catch (dbError) {
            console.error("Database error:", dbError);

            // Delete uploaded files if database operation fails
            await deleteFiles([datebirthPath, photoPath, MarksheetPath]);

            return res.status(500).json({
                message: "Database error",
                status: false,
                error: dbError.message
            });
        }

    } catch (error) {
        console.error("Error in form submission:", error);

        // Cleanup uploaded files if any error occurs
        await deleteFiles([datebirthPath, photoPath, MarksheetPath]);

        return res.status(500).json({
            message: "Internal server error",
            status: false,
            error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred",
        });
    }
});



// fetching data
// getting year
router.get('/:type', (req, res) => {
    const type = req.params.type; // Get the type from the URL parameter

    // Validate type
    if (!['National Journal', 'International Journal'].includes(type)) {
        return res.status(400).json({ message: "Invalid type" });
    }

    // Use database to get unique years directly
    const query = `
        SELECT DISTINCT Year
        FROM Journal
        WHERE Journal_Type = ? AND isPublished = true
        ORDER BY Year ASC
    `;

    pool.query(query, [type], (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({
                message: "Database error",
                status: false,
                error: error.message
            });
        }

        // results already contains unique, sorted years
        const years = results.map(row => row.Year);
        res.status(200).json(years);
    });
});


// contact from api

router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        console.log({ name, email, phone, message })
        if (!name || !email || !phone || !message) {
            return res.status(400).json({ message: "All fields are required", status: false });
        }
        const query = `Insert into Contact_us (Name, Email, PhoneNo, Message) values (?, ?, ?, ?)`;
        pool.query(query, [name, email, phone, message], (error, results) => {
            if (error) {
                console.error("Database error:", error);
                return res.status(500).json({ message: "Database error", status: false, error: error.message });
            }
        })
        return res.status(200).json({ message: "Your message has been sent successfully", status: true });

    }
    catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ message: 'Server Error', status: false, error: err.message });
    }
})



// getting volume

// router.get('/:type/:year', (req, res) => {

//     const { type, year } = req.params; // Get the type from the URL parameter
//     // Define the SQL query based on the type
//     let query = '';
//     if (type === 'National Journal') {
//         query = `SELECT Volume FROM Journal where Journal_Type = "National Journal" AND Year = ? `;
//     } else if (type === 'International Journal') {
//         query = `SELECT Volume FROM Journal where Journal_Type = "International Journal" AND Year = ? `;
//     }
//     else {
//         return res.status(400).json({ message: "Invalid type" });
//     }

//     // Execute the query
//     pool.query(query, [year], (error, results) => {
//         if (error) {
//             console.error("Database error:", error);
//             return res.status(500).json({ message: "Database error", error: error.message });
//         }
//         const uniqueVolumes = [...new Set(results.map(item => item.Volume))];
//         const sortVolume = uniqueVolumes.sort((a, b) => a - b); // Sort the years in ascending order
//         const updatedVolume = sortVolume.map(num => `Volume ${num}`);
//         res.status(200).json(updatedVolume); // Send the results as JSON response
//     });
// })

// getting issue
router.get('/:type/:year', (req, res) => {

    const { type, year } = req.params; // Get the type from the URL parameter
    // const number = vol.split(" ")[1]; // Gets the second part after splitting by space
    // console.log(Number(number))
    // Define the SQL query based on the type

    if (!['National Journal', 'International Journal'].includes(type)) {
        return res.status(400).json({ message: "Invalid type" });
    }
    let query = ` SELECT DISTINCT Issue
            FROM Journal
            WHERE Journal_Type = "National Journal"  AND Year = ? And isPublished = true
            ORDER BY Issue ASC `;

    // Execute the query
    pool.query(query, [year], (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Database error", error: error.message });
        }
        // const uniqueIssue = [...new Set(results.map(item => item.Issue))];
        // const sortIssue = uniqueIssue.sort((a, b) => a - b); // Sort the years in ascending order
        // const updatedIssue = sortIssue.map(num => `Issue ${num}`);
        res.status(200).json(results.map(row => `Issue ${row.Issue}`)); // Send the results as JSON response
        // res.status(200).json(results); // Send the results as JSON response
    });
})

// getting entries
router.get('/:type/:year/:issue', async (req, res) => {
    try {
        const { type, year, issue } = req.params;
        const Issue = issue.split(" ")[1]; // assuming Issue is like "Issue 5"

        // Validate type
        if (!['National Journal', 'International Journal'].includes(type)) {
            return res.status(400).json({ message: "Invalid type" });
        }

        // Pagination
        const page = parseInt(req.query.page);
        const limit = 5;
        const offset = (page - 1) * limit;

        // Optimized query (uses composite index: Journal_Type, Year, Issue)
        const query = `
            SELECT SQL_CALC_FOUND_ROWS 
                  id, Title_of_paper, Author_Name, subject, Created_at
            FROM Journal
            WHERE Journal_Type = ? AND Year = ? AND Issue = ? And isPublished = true
            ORDER BY id
            LIMIT ? OFFSET ?;
        `;

        const [rows] = await pool.promise().query(query, [type, year, Issue, limit, offset]);

        // Get total count (without LIMIT)
        const [[{ total }]] = await pool.promise().query("SELECT FOUND_ROWS() as total;");

        return res.status(200).json({
            data: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: "Database error", error: error.message });
    }
});



router.post('/:id', (req, res) => {

    const { id } = req.params;
    const ID = parseInt(id)
    query = `SELECT Abstract , Author_Name,Branch,Created_at,Journal_Type,Second_Author_Guide_Name,Title_of_paper,id,subject,Volume,Issue FROM Journal where id = ?`;

    // Execute the query
    pool.query(query, [ID], (error, results) => {
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

        pool.query(query, [id], async (error, results) => {
            if (error) {
                console.error("Database error:", error);
                return res.status(500).json({ message: "Database error", error: error.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "File not found" });
            }

            // 1️⃣ Clean up the file path from DB
            let filePathFromDB = results[0].Paper;

            const cleanedFilePath = filePathFromDB.replace(/\\/g, '/'); // Replace all backslashes with forward slashes

            // 2️⃣ Resolve the absolute original file path
            const originalPath = path.resolve(process.cwd(), cleanedFilePath);
            console.log("Resolved File Path:", originalPath);

            // 3️⃣ Prepare the output path safely
            const safeFilename = 'edited_' + path.basename(cleanedFilePath);  // it gives the name of the file by appending edited_ to the file name 
            const tempDir = path.resolve(process.cwd(), 'uploads', 'temp');
            const outputPath = path.resolve(tempDir, safeFilename);

            // 4️⃣ Ensure temp directory exists
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // 5️⃣ Edit the PDF with your utility
            await editSinglePdf(
                originalPath,
                outputPath,
                start_page = results[0].start_page,
                end_page = results[0].end_page,
                {
                    publish: results[0].Created_at,
                    vol: results[0].Volume,
                    issue: results[0].Issue
                }
            );

            // 6️⃣ Set headers for download
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);

            // 7️⃣ Send the file
            res.download(outputPath, (err) => {
                if (err) {
                    console.error("File download error:", err);
                    res.status(500).send('Error downloading file');
                } else {
                    // Clean up the temporary file after sending
                    fs.unlinkSync(outputPath);
                }
            });
        });
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

router.post("/downloadMagzine/:year/:issue", async (req, res) => {
    try {
        const { year, issue } = req.params;
        console.log({ year, issue })
        // const Volume = vol.includes(" ") ? vol.split(" ")[1] : vol;
        const Issue = issue.includes(" ") ? issue.split(" ")[1] : issue;
        const query = `SELECT Title_of_paper,Author_Name , Paper , Created_at FROM Journal WHERE Year = ? AND issue = ?`;
        const title = `Magazine_of_year_${year}_Issue_${Issue}`;
        const filePath = path.resolve(process.cwd(), 'uploads', 'Magazine', `${title}.pdf`);


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
                } else {
                    // Delete file after download
                    fs.unlinkSync(filePath);
                    fs.unlinkSync(StaticPdf);
                }

            });
        }

        // If file doesn't exist, fetch data from DB
        const results = await new Promise((resolve, reject) => {
            pool.query(query, [year, Issue], (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

        if (results.length === 0) {
            return res.status(404).json({ message: "File not found" });
        }

        const pdfData = results
            .filter(item => item.Paper)
            .map(item => ({
                // Convert to clean, safe, absolute paths
                file: path.resolve(process.cwd(), item.Paper.replace(/\\/g, '/')),
                date: item.Created_at,
            })); // Ensure valid paths

        const pdf = results
            .map(item => ({
                title: item.Title_of_paper,
                author: item.Author_Name,
            }));


        if (pdfData.length === 0) {
            return res.status(404).json({ message: "No valid PDF files found to merge" });
        }
        await CreateIndex('./uploads/index.pdf', './uploads/temp/updated_output.pdf', pdf)
        const StaticPdf = './uploads/temp/updated_output.pdf'
        await mergePDFs(filePath, StaticPdf, pdfData, Issue);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);
        res.download(filePath, (err) => {
            if (err) {
                console.error("File download error:", err);
                res.status(500).send('Error downloading file');
            } else {
                // Delete file after download
                fs.unlinkSync(filePath);
                fs.unlinkSync(StaticPdf);
            }
        });

    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});



// download the certificate
router.post('/downloadCertificate/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Requested ID:", id);

        const query = `SELECT Author_Name , Title_of_paper FROM Journal WHERE id = ?`;
        pool.query(query, [id], async (error, result) => {
            if (error) {
                console.error("Database error:", error);
                return res.status(500).json({ message: "Database error", error: error.message });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "File not found" });
            }

            const name = result[0].Author_Name;
            const Title = result[0].Title_of_paper;
            console.log("Author:", name);

            // Paths
            const dirPath = path.join(__dirname, "..", "uploads", "JournalCertificate");
            const outputPath = path.join(dirPath, `${id}.pdf`);

            // Ensure directory exists
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // Generate certificate if not already present
            if (!fs.existsSync(outputPath)) {
                await CreateCertificate(name, id, Title);
            }

            // Safe file name for download
            const safeFileName = `${name.replace(/[^a-z0-9]/gi, "_")}_certificate.pdf`;

            return res.download(outputPath, safeFileName, (err) => {
                if (err) {
                    console.error("File download error:", err);
                    return res.status(500).send("Error downloading file");
                }
            });
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});








// delete specific data "DANGER ZONE"

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const ID = parseInt(id, 10);

    if (isNaN(ID)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    const data = `select Paper , Photo , Certificate FROM Journal WHERE id = ?`;
    pool.query(data, [ID], (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Database error", error: error.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "No record found with this ID" });
        }

        const filePaths = results[0];
        console.log(filePaths)
        deleteFiles([filePaths.Paper, filePaths.Photo, filePaths.Certificate])

    });

    const query = `DELETE FROM Journal WHERE id = ?`;

    pool.query(query, [ID], (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Database error", error: error.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "No record found with this ID" });
        }

        res.status(200).json({ message: "Record deleted successfully" });
    });
});








module.exports = router;
