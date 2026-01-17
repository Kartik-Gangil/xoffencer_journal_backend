const path = require('path');
const pool = require('./Database');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function getPageCount(filePath) {
    try {
        const bytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        return pdfDoc.getPageCount();

    } catch (error) {
        console.error("PDF parse failed:", filePath);
        return null;
    }
}

const isValidPDF = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return false;

        const stats = fs.statSync(filePath);
        if (stats.size === 0) return false;

        const buffer = fs.readFileSync(filePath);
        return buffer.slice(0, 5).toString() === "%PDF-";
    } catch (err) {
        return false;
    }
};

const Fixing = async () => {
    try {
        const query = 'SELECT id, Paper FROM Journal ORDER BY Created_at ASC';
        pool.query(query, async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return;
            }
            // results.forEach(element => {
            //     const Path = path.join(__dirname, element.Paper);
            //     getPageCount(Path).then(count => {
            //         const data = {
            //             pageCount: count,
            //             startPage: count,
            //             endPage: count
            //         }
            //         console.log(data)
            //     }).catch(err => {
            //         console.error("Error getting page count:", err);
            //     })

            // });

            let currentPage = 1;
            for (const element of results) {
                try {

                    const Path = path.join(__dirname, element.Paper);
                    if (!isValidPDF(Path)) {
                        console.error("❌ Invalid PDF:", Path);
                        continue;
                    }
                    const count = await getPageCount(Path);

                    if (!count) continue;

                    const startPage = currentPage;
                    const endPage = currentPage + count - 1;

                    const data = {
                        // paper: element.Paper,
                        count,
                        startPage,
                        endPage
                    };
                    console.log(data)

                    pool.query('UPDATE Journal SET total_pages = ?, start_page = ?, end_page = ? WHERE id = ?', [count, startPage, endPage, element.id], (updateErr) => {
                        if (updateErr) {
                            console.error("Database update error:", updateErr);
                        }
                    });


                    currentPage = endPage + 1;
                } catch (error) {
                    console.error(error)
                }
            }

        })
    } catch (error) {
        console.error(error)
    }
}


module.exports = Fixing