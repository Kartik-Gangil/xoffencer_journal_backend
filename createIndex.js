const fs = require("fs");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fontkit = require("fontkit");

function isHindi(text) {
    return /[\u0900-\u097F]/.test(text);
}

const splitTextIntoLines = (text, font, fontSize, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width <= maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
};

async function CreateIndex(inputPath, outputPath, transactions) {
    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = fs.readFileSync('./fonts/NotoSansDevanagari-Regular.ttf');
    const hindiFont = await pdfDoc.embedFont(fontBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.getPages()[0];

    // 🧮 Layout
    const leftMargin = 50;
    const spacingBetweenCols = 20;

    const colWidths = {
        sr: 25,
        title: 280,
        author: 160
    };

    const colX = {
        sr: leftMargin,
        title: leftMargin + colWidths.sr + spacingBetweenCols,
        author: leftMargin + colWidths.sr + colWidths.title + spacingBetweenCols * 2
    };

    let currentY = 640; // 📉 Moved table near the bottom

    const lineHeight = 12;
    const fontSize = 10;

    // 🏷️ Draw Header
    page.drawText("Sr.", {
        x: colX.sr,
        y: currentY,
        font: helveticaBoldFont,
        size: 12,
        color: rgb(0, 0, 0),
    });
    page.drawText("Title", {
        x: colX.title,
        y: currentY,
        font: helveticaBoldFont,
        size: 12,
        color: rgb(0, 0, 0),
    });
    page.drawText("Scholar", {
        x: colX.author,
        y: currentY,
        font: helveticaBoldFont,
        size: 12,
        color: rgb(0, 0, 0),
    });

    currentY -= 12;

    // 📏 Line under headers
    page.drawLine({
        start: { x: leftMargin, y: currentY },
        end: { x: leftMargin + colWidths.sr + colWidths.title + colWidths.author + spacingBetweenCols * 2, y: currentY },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    currentY -= 15;

    // 🧾 Table Rows
    for (let i = 0; i < transactions.length; i++) {
        const txn = transactions[i];
        const fontTitle = isHindi(txn.title) ? hindiFont : helveticaFont;
        const fontAuthor = isHindi(txn.author) ? hindiFont : helveticaFont;

        const titleLines = splitTextIntoLines(txn.title, fontTitle, fontSize, colWidths.title - 5);
        const authorLines = splitTextIntoLines(txn.author, fontAuthor, fontSize, colWidths.author - 5);

        const numLines = Math.max(titleLines.length, authorLines.length);
        const rowHeight = numLines * lineHeight + 4;

        // 🎨 Alternating background (optional)
        // if (i % 2 === 0) {
        //     page.drawRectangle({
        //         x: leftMargin,
        //         y: currentY - rowHeight + 2,
        //         width: colWidths.sr + colWidths.title + colWidths.author + spacingBetweenCols * 2,
        //         height: rowHeight,
        //         color: rgb(0.95, 0.95, 0.95),
        //     });
        // }

        // Sr. No
        page.drawText(String(i + 1), {
            x: colX.sr,
            y: currentY,
            font: helveticaFont,
            size: fontSize,
            color: rgb(0, 0, 0),
        });

        // Title
        titleLines.forEach((line, j) => {
            page.drawText(line, {
                x: colX.title,
                y: currentY - j * lineHeight,
                font: fontTitle,
                size: fontSize,
                color: rgb(0, 0, 0),
            });
        });

        // Author
        authorLines.forEach((line, j) => {
            page.drawText(line, {
                x: colX.author,
                y: currentY - j * lineHeight,
                font: fontAuthor,
                size: fontSize,
                color: rgb(0, 0, 0),
            });
        });

        currentY -= rowHeight + 5;
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    console.log("✅ Table added to PDF:", outputPath);
}

module.exports = CreateIndex;

// ✅ Example Usage (uncomment to test)
// CreateIndex(
//     "./uploads/index.pdf",
//     "./uploads/temp/updated_output.pdf",
//     [
//         { title: "AI in Healthcare", author: "Dr. A. Sharma" },
//         { title: "कृत्रिम बुद्धिमत्ता", author: "डा. वर्मा" },
//         { title: "Quantum Computing", author: "डॉ. कुमार" },
//     ]
// );
