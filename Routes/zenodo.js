const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config()

const token = process.env.TOKEN; // Replace with token value
const ZENODO_API = "https://zenodo.org/api";



async function createDeposition() {
    const response = await axios.post(
        `${ZENODO_API}/deposit/depositions`,
        {},
        {
            params: { access_token: token },
            headers: { "Content-Type": "application/json" }
        }
    );
    return response.data;
}


const Zenodo = async (filePath, bucketURL, fileName) => {
    try {

        const stats = fs.statSync(filePath);
        // console.log("FILE PATH:", filePath);
        // console.log("FILE SIZE:", stats.size);
        const fileSize = stats.size;
        if (stats.size === 0) {
            throw new Error("ZERO BYTE FILE - ABORTING UPLOAD");
        }

        const stream = fs.createReadStream(filePath);

        const url = `${bucketURL}/${fileName}?access_token=${token}`;

        const response = await axios.put(
            url,
            stream,
            {
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Content-Length": fileSize
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        console.log("Upload Success:", response.status);
        return response.data;

    } catch (error) {
        console.error(
            "Zenodo Upload Error:",
            error?.response?.data || error.message
        );
        throw error;
    }
};


const attachMetadata = async (id, data) => {
    await axios.put(
        `https://zenodo.org/api/deposit/depositions/${id}`,
        {
            metadata: {
                title: data.paper,
                upload_type: "publication",
                publication_type: "article",
                description: data.abstract,
                creators: [
                    { name: data.author }
                ],
                access_right: "open",
                license: "cc-by-4.0"
            }
        },
        {
            params: { access_token: process.env.TOKEN },
            headers: { "Content-Type": "application/json" }
        }
    );
};



const publishDeposition = async (id) => {
    const res = await axios.post(
        `https://zenodo.org/api/deposit/depositions/${id}/actions/publish`,
        {},
        {
            params: { access_token: process.env.TOKEN }
        }
    );
    return res.data;
};

const waitForFileReady = async (filePath, timeout = 3000) => {
    const start = Date.now();
    let lastSize = -1;

    while (true) {
        if (fs.existsSync(filePath)) {
            const { size } = fs.statSync(filePath);

            if (size > 0 && size === lastSize) {
                return true; // file finished writing
            }

            lastSize = size;
        }

        if (Date.now() - start > timeout) {
            throw new Error("File not ready for upload");
        }

        await new Promise(r => setTimeout(r, 300));
    }
};


module.exports = { createDeposition, Zenodo, attachMetadata, publishDeposition, waitForFileReady };