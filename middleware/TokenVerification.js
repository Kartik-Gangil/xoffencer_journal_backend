const jwt = require('jsonwebtoken');
// require('dotenv').config();

const TokenVerification = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Expect format: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    // console.log(token)
    if (!token) {
        return res.status(401).json({ error: 'Token missing after Bearer' });
    }
    try {

        const decoded = jwt.verify(token, "varsharesearchorganization");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json(err);
    }
}
module.exports = TokenVerification;