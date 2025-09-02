const express = require("express");
const router = express.Router();
const pool = require("../Database");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const TokenVerification = require("../middleware/TokenVerification");

const jwt_secret = "varsharesearchorganization"

router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    console.log({name, email, password})
    try {
        const query = `Insert INTO Users (Name , Email ,Password) values (? , ? , ?)`;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const result = pool.query(query, [name, email, hash]);
        return res.status(201).json({ submissionId: result.insertId, message: "signup successfully" });
    } catch (error) {
        return res.status(500).json({
            message: "Auth Error",
            status: false,
            error: error.message
        });
    }
})
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    // 1. Validate request body
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const query = `SELECT id, Password FROM Users WHERE Email = ?`;

    // 2. Run query with callback
    pool.query(query, [email], async (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "DB Error", error: err.message });
        }

        // 3. Check if user exists
        if (rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = rows[0];

        try {
            // 4. Compare password with bcrypt
            const isMatch = await bcrypt.compare(password, user.Password);
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid email or password" });
            }

            // 5. Generate JWT token
            const token = jwt.sign(
                { id: user.id },
                jwt_secret,
            );

            // 6. Send response
            return res.status(200).json({
                message: "Login successful",
                token
            });

        } catch (error) {
            return res.status(500).json({
                message: "Auth Error",
                status: false,
                error: error.message,
            });
        }
    });
});


router.post("/getdetails", TokenVerification, (req, res) => {
    const id = req.user.id;

    try {
        const query = `SELECT Name FROM Users WHERE id = ?`;

        pool.query(query, [id], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    message: "DB Error",
                    status: false,
                    error: err.message
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            // return only the name
            return res.status(200).json({ name: rows[0].Name });
        });
    } catch (err) {
        return res.status(500).json({
            message: "Auth Error",
            status: false,
            error: err.message
        });
    }
});





module.exports = router