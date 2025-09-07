const express = require("express");
const router = express.Router();
const GetUploadMiddleWare = require('../multer');
const pool = require("../Database");
const fs = require('fs')
const upload = GetUploadMiddleWare('./uploads/seminar_conference')

const conference = [
    { name: "uploadAddressProof", maxCount: 1 },
    { name: "uploadArticle", maxCount: 1 },
]


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



router.post("/apply-for-conference", upload.fields(conference), async (req, res) => {
    try {
        const { selectedConference, date, mode, title, name, subject, authorName, email, phone, addressProofType } = req.body;

        const Address = req.files["uploadAddressProof"] ? req.files["uploadAddressProof"][0].path : null;
        const Article = req.files["uploadArticle"] ? req.files["uploadArticle"][0].path : null;


        const query = `Insert into Conference_Application(Conference_Name ,date ,mode ,title ,Participant_Name ,subject ,co_author ,email ,mobile ,address_proof_type,adress_proof ,Paper) values (?,?,?,?,?,?,?,?,?,?,?,?) `;
        const values = [
            selectedConference,
            date,
            mode,
            title,
            name,
            subject,
            authorName,
            email,
            phone,
            addressProofType,
            Address,
            Article,
        ];

        try {
            pool.query(query, values, async (err, results) => {
                if (err) {
                    console.error("Database error:", err);

                    // Delete uploaded files if DB insert fails
                    await deleteFiles([Address, Article]);

                    return res.status(500).json({
                        message: "Database error",
                        status: false,
                        error: err.message,
                    });
                } return res.status(201).json({
                    message: "Files uploaded and data saved successfully!",
                    status: true,
                    submissionId: results.insertId,
                    files: { Address, Article },
                });
            });

        } catch (error) {
            console.error("Database error:", error);

            // Delete uploaded files if database operation fails
            await deleteFiles([Article, Address]);

            return res.status(500).json({
                message: "Database error",
                status: false,
                error: error.message
            });
        }

    }
    catch (error) {
        console.error("Error in form submission:", error);

        // Cleanup uploaded files if any error occurs
        await deleteFiles([Address, Article]);

        return res.status(500).json({
            message: "Internal server error",
            status: false,
            error: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred",
        });
    }
})



module.exports = router