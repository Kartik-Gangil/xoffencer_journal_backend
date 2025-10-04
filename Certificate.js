const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('fontkit');
const path = require('path');

const fontBytes = fs.readFileSync('./fonts/Tangerine-Bold.ttf');

async function CreateCertificate(name, id, Title) {
    try {
        const certificatePDF = fs.readFileSync('./uploads/certificate_credentials/blank_certificate.pdf')
        const pdfDoc = await PDFDocument.load(certificatePDF);
        const pages = pdfDoc.getPages();


        // font
        pdfDoc.registerFontkit(fontkit);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const cursiveFont = await pdfDoc.embedFont(fontBytes);


        pages.forEach((page, index) => {
            const { width, height } = page.getSize();


            const textWidth = cursiveFont.widthOfTextAtSize(name, 80);

            // center X
            const centerX = (width - textWidth) / 2;
            // keep Y the same as before
            const Author_name = height - 318;
            const Paper_title = height - 368;

            page.drawText(name, {
                x: centerX,
                y: Author_name,
                size: 80,
                font: cursiveFont,
                color: rgb(0.52, 0.36, 0.20),
            });

            const maxWidth = width - 200; // leave some margin
            const words = Title.split(" ");
            let line = "";
            let lines = [];
            const fontSize = words.length > 9 ? 15 : words.length > 4 ? 20 : 40;// Adjust font size based on title length

            words.forEach(word => {
                const testLine = line + word + " ";
                const testWidth = boldFont.widthOfTextAtSize(testLine, fontSize);

                if (testWidth > maxWidth && line !== "") {
                    lines.push(line.trim());
                    line = word + " ";
                } else {
                    line = testLine;
                }
            });
            if (line.trim() !== "") lines.push(line.trim());

            // Draw each line centered
            lines.forEach((lineText, i) => {
                const lineWidth = boldFont.widthOfTextAtSize(lineText, fontSize);
                const lineX = (width - lineWidth) / 2;
                const lineY = Paper_title - (i * (fontSize + 10)); // 10px gap between lines

                page.drawText(lineText, {
                    x: lineX,
                    y: lineY,
                    size: fontSize,
                    font: boldFont,
                    color: rgb(0.52, 0.36, 0.20),
                });
            });



        });
        const dirPath = path.join(__dirname, 'uploads', 'JournalCertificate');

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        const outputPath = path.join(dirPath, `${id}.pdf`);
        const editedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, editedPdfBytes);
        console.log(`✅ Edited PDF saved at: ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error("❌ Error editing PDF:", error);
    }
}

module.exports = CreateCertificate;