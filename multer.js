const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')


const GetUploadMiddleWare = (folderPath) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            fs.mkdirSync(folderPath, { recursive: true });
            cb(null, folderPath); // Corrected callback name
        },

        filename: (req, file, cb) => {
            var ext = file.originalname.substring(file.originalname.lastIndexOf("."));
            var fn = `${uuidv4()}${ext}`;
            cb(null, fn); // Corrected callback name
        }
    });
    return multer({ storage: storage });
}

module.exports = GetUploadMiddleWare;
