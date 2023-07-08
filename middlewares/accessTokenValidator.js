const jwt = require('jsonwebtoken');

const accessTokenValidator = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    jwt.verify(token, "miyav", (err, user) => {
        if (err) {
            console.log(err);
            // if the error is because of token expiration, return 401, else return 400
            const statusCode = err.name === 'TokenExpiredError' ? 401 : 400;
            return res.status(statusCode).json({ err });
        }

        console.log("HERE IS THE USER AFTER JWT VERIFY" , user) ;

        req.user = user;
        next();
    });
}

module.exports = accessTokenValidator;
