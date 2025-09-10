const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');

async function editSinglePdf(inputPath, outputPath, { vol, issue, publish }) {
    try {
        const imageBytes = fs.readFileSync('./public/LOGO 3.png');
        const existingPdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
        const { monthName, year } = publish ? formatDate(publish.toString()) : { monthName: "Unknown", year: "Unknown" }; // Using your custom formatter

        const image = await pdfDoc.embedPng(imageBytes);

        // const imgWidth = 100; // desired width

        // const imgHeight = (image.height / image.width) * imgWidth; // maintain aspect ratio
        const { width, height } = image.scale(1);
        const newWidth = width / 5; // example: make it smaller
        const newHeight = height / 5;
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
            // a35eb42d-c640-4199-b67a-bf522e28ac9e
            page.drawText(`${monthName} ${year}, ISSN: 3107-5185`, {
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
            //  adding logo to each page
            page.drawImage(image, {
                x: width - newWidth - 90, // 20 units padding from right
                y: height - 84.5, // 20 units padding from top
                width: newWidth,
                height: newHeight
            })

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