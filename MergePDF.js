const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");

async function mergePdfs(outputPath, files) {
    try {
        const mergedPdf = await PDFDocument.create();

        // ✅ Ensure the directory for merged PDFs exists
        const outputDir = path.dirname(outputPath);
        fs.mkdirSync(outputDir, { recursive: true });

        for (const file of files) {
            try {
                // ✅ Check if file exists before reading
                if (!fs.existsSync(file)) {
                    console.warn(`Warning: Skipping missing file - ${file}`);
                    continue;
                }

                const pdfBytes = fs.readFileSync(file);
                const pdfDoc = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

                copiedPages.forEach((page) => mergedPdf.addPage(page));
            } catch (fileError) {
                console.error(`Error processing file ${file}:`, fileError);
            }
        }

        // ✅ Add page numbers
        const pages = mergedPdf.getPages();
        pages.forEach((page, index) => {
            const { width, height } = page.getSize();


            // VARSHA RESEARCH ORGANIZATION
            page.drawText(`VARSHA RESEARCH ORGANIZATION`, {
                x: 93.5,
                y: height - 42.5,
                size: 8,
                color: rgb(0, 0, 0),
            });
            // volume and issue
            page.drawText(`volume 1 , issue 1`, {
                x: 93.5,
                y: height - 55,
                size: 8,
                color: rgb(0, 0, 0),
            });
            // January 2025, ISSN: XXXX – XXXX
            page.drawText(`January 2025, ISSN: XXXX – XXXX`, {
                x: 93.5,
                y: height - 68,
                size: 8,
                color: rgb(0, 0, 0),
            });
            // Impact Factor: 0.75 – 0.25
            page.drawText(`Impact Factor: 0.75 – 0.25`, {
                x: 93.5,
                y: height - 81.5,
                size: 8,
                color: rgb(0, 0, 0),
            });


            page.drawText(`${index + 1}`, {
                x: width / 1.65,
                y: 37,
                size: 10,
                color: rgb(0, 0, 0),
            });
        });

        // ✅ Save the merged PDF
        const pdfBytes = await mergedPdf.save();
        fs.writeFileSync(outputPath, pdfBytes);
        console.log(`✅ Merged PDF saved at: ${outputPath}`);
    } catch (err) {
        console.error("❌ Error merging PDFs:", err);
        throw err; // Re-throw to allow higher-level handling
    }
}

module.exports = mergePdfs;
