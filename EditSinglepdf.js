const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');

async function editSinglePdf(inputPath, outputPath, { vol, issue, publish }) {
    try {
        const existingPdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
        const { monthName, year } = publish ? formatDate(publish.toString()) : { monthName: "Unknown", year: "Unknown" }; // Using your custom formatter

        pages.forEach((page, index) => {
            const { width, height } = page.getSize();

            // Add header info
            page.drawText(`VARSHA RESEARCH ORGANIZATION`, {
                x: 93.5,
                y: height - 42.5,
                size: 8,
                color: rgb(0, 0, 0),
            });

            page.drawText(`Volume ${vol} , Issue ${issue}`, {
                x: 93.5,
                y: height - 55,
                size: 8,
                color: rgb(0, 0, 0),
            });

            page.drawText(`${monthName} ${year}, ISSN: XXXX – XXXX`, {
                x: 93.5,
                y: height - 68,
                size: 8,
                color: rgb(0, 0, 0),
            });

            page.drawText(`Impact Factor: 0.75 – 2.75`, {
                x: 93.5,
                y: height - 81.5,
                size: 8,
                color: rgb(0, 0, 0),
            });

            // Page number
            page.drawText(`${index + 1}`, {
                x: (width / 1.65) - 15,
                y: 52,
                size: 10,
                color: rgb(0, 0, 0),
            });
        });

        const editedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, editedPdfBytes);
        console.log(`✅ Edited PDF saved at: ${outputPath}`);
    } catch (err) {
        console.error("❌ Error editing PDF:", err);
    }
}

// Reuse your fixed date formatter
function formatDate(dt) {
    try {
        const dateObj = new Date(dt); // Handles both Date objects and valid date strings
        if (isNaN(dateObj.getTime())) {
            throw new Error("Invalid date input");
        }

        const year = dateObj.getFullYear();
        // const monthIndex = dateObj.getMonth(); // 0-based
        const monthName = dateObj.toLocaleString('default', { month: 'long' });

        return { monthName, year };
    } catch (err) {
        console.error("❌ Failed to parse date:", dt);
        return { monthName: 'Invalid', year: 'Invalid' };
    }
}


module.exports = editSinglePdf;