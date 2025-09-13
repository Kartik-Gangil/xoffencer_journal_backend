const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();
// Function to send email with PDF attachment

const sendEmail = async (recipientEmail , Name) => {
    try {
        // Configure Nodemailer transport
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.APP_MAIL, // Replace with your email
                pass: process.env.APP_PASSWORD // Use an App Password if using Gmail
            }
        });

        // Email options
        const mailOptions = {
            from: process.env.APP_MAIL,
            to: recipientEmail,
            subject: "Your paper is subbmitted successfully",
            text: ` dear,${Name} ,
            this mail is system generated, please do not reply to this mail.
            this mail is to inform you that your paper is subbmitted successfully`,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log("✅Email sent successfully!");
    } catch (error) {
        console.error("❌Error sending email:", error);
    }
};

module.exports =  sendEmail