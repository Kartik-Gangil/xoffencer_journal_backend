const fs = require("fs");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fontkit = require("fontkit"); // ✅ Required for custom font

// 🧠 Detect if text contains Hindi characters
function isHindi(text) {
    return /[\u0900-\u097F]/.test(text);
}

const splitTextIntoLines = (text, font, fontSize, maxWidth) => {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    for (let word of words) {
        const width = font.widthOfTextAtSize(currentLine + ' ' + word, fontSize);
        if (width <= maxWidth) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
};



async function CreateIndex(inputPath,outputPath , transactions) {
    // Load existing PDF
    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // ✅ Register fontkit before embedding any custom font
    pdfDoc.registerFontkit(fontkit);

    // Load fonts
    const fontBytes = fs.readFileSync('./fonts/NotoSansDevanagari-Regular.ttf'); // Hindi font
    const hindiFont = await pdfDoc.embedFont(fontBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica); // English font
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const startY = 650; // Adjust based on logo position
    const rowHeight = 20;
    const leftMargin = 50;

    const colWidths = [30, 250, 250];
    const colPositions = [
        leftMargin,
        leftMargin + colWidths[0],
        leftMargin + colWidths[0] + colWidths[1],
    ];

    let currentY = startY;

    // 🏷️ Draw Headers
    firstPage.drawText("Sr.", {
        x: colPositions[0],
        y: currentY,
        font: helveticaBoldFont,
        size: 12,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText("Title", {
        x: colPositions[1],
        y: currentY,
        font: helveticaBoldFont,
        size: 12,
        color: rgb(0, 0, 0),
    });
    firstPage.drawText("Scholar", {
        x: colPositions[2],
        y: currentY,
        font: helveticaBoldFont,
        size: 12,
        color: rgb(0, 0, 0),
    });

    currentY -= 10;

    // Draw line under headers
    firstPage.drawLine({
        start: { x: 50, y: currentY },
        end: { x: 550, y: currentY },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    currentY -= 15;

    // 📋 Draw Rows
    transactions.forEach((txn, index) => {
        const fontToUseTitle = isHindi(txn.title) ? hindiFont : helveticaFont;
        const fontToUseAuthor = isHindi(txn.author) ? hindiFont : helveticaFont;
        const rowX = [50, 80, 320]; // Sr.No, Title, Scholar
        const colWidths = [30, 240, 230]; // You can tweak these values

        const fontSize = 11;
        const titleLines = splitTextIntoLines(txn.title, fontToUseTitle, fontSize, colWidths[1]);
        const authorLines = splitTextIntoLines(txn.author, fontToUseAuthor, fontSize, colWidths[2]);

        const numLines = Math.max(titleLines.length, authorLines.length);
        const lineHeight = 14;
        const heightForRow = numLines * lineHeight;

        // Draw alternating background
        if (index % 2 === 0) {
            firstPage.drawRectangle({
                x: rowX[0],
                y: currentY - 3,
                width: colWidths.reduce((a, b) => a + b),
                height: heightForRow,
                color: rgb(0.95, 0.95, 0.95),
            });
        }

        // Sr. No
        firstPage.drawText(String(index + 1), {
            x: rowX[0],
            y: currentY,
            font: helveticaFont,
            size: fontSize,
            color: rgb(0, 0, 0),
        });

        // Title
        titleLines.forEach((line, i) => {
            firstPage.drawText(line, {
                x: rowX[1],
                y: currentY - i * lineHeight,
                font: fontToUseTitle,
                size: fontSize,
                color: rgb(0, 0, 0),
            });
        });

        // Author
        authorLines.forEach((line, i) => {
            firstPage.drawText(line, {
                x: rowX[2],
                y: currentY - i * lineHeight,
                font: fontToUseAuthor,
                size: fontSize,
                color: rgb(0, 0, 0),
            });
        });

        currentY -= heightForRow;
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    console.log("✅ Table added to PDF:", outputPath);
}

module.exports = CreateIndex;

// 👇 Example usage:
// CreateIndex(
//     "./uploads/index.pdf",
//     "./uploads/temp/updated_output.pdf",
//     [
//         { title: "AI in Healthcare", author: "Dr. A. Sharma" },
//         { title: "कृत्रिम बुद्धिमत्ता", author: "डा. वर्मा" },
//         { title: "Quantum Computing", author: "डॉ. कुमार" },
//     ]
// );
