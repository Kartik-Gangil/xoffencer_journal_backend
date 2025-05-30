const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");
function date(dt) {
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


async function mergePdfs(outputPath, staticPdfPath, pdfData, vol, issue) {
    let MonthAndYear = null;
    try {
        const mergedPdf = await PDFDocument.create();
        let staticPageCount = 0;
        // ✅ Ensure the directory for merged PDFs exists
        const outputDir = path.dirname(outputPath);
        fs.mkdirSync(outputDir, { recursive: true });

        if (staticPdfPath && fs.existsSync(staticPdfPath)) {
            const staticPdfBytes = fs.readFileSync(staticPdfPath);
            const staticPdfDoc = await PDFDocument.load(staticPdfBytes);
            const staticPages = await mergedPdf.copyPages(staticPdfDoc, staticPdfDoc.getPageIndices());
            staticPages.forEach(page => mergedPdf.addPage(page));
            staticPageCount = staticPages.length;
            console.log(`✅ Added static PDF: ${staticPdfPath}`);
        }
        for (const { file, date } of pdfData) {

            if (!MonthAndYear && date) {
                MonthAndYear = date; // Save the first available date
                console.log(date instanceof Date)
            }
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
        const { monthName, year } = MonthAndYear ? date(MonthAndYear.toString()) : { monthName: "Unknown", year: "Unknown" };
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
            page.drawText(`Volume ${vol} , Issue ${issue}`, {
                x: 93.5,
                y: height - 55,
                size: 8,
                color: rgb(0, 0, 0),
            });
            // January 2025, ISSN: XXXX – XXXX
            page.drawText(`${monthName} ${year}`, {
                x: 93.5,
                y: height - 68,
                size: 8,
                color: rgb(0, 0, 0),
            });
            // Impact Factor: 0.75 – 0.25
            page.drawText(`Impact Factor: 0.75 – 2.75`, {
                x: 93.5,
                y: height - 81.5,
                size: 8,
                color: rgb(0, 0, 0),
            });

            if (index > staticPageCount + 1) {
                const pageNumber = index - staticPageCount - 1;
                page.drawText(`${pageNumber}`, {
                    x: (width / 1.65) - 15,
                    y: 52,
                    size: 10,
                    color: rgb(0, 0, 0),
                });
            }
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
