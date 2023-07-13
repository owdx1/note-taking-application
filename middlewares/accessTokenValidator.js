const jwt = require('jsonwebtoken');

const accessTokenValidator = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, customer) => {
        if (err) {
            console.log(err);
            //  token süresi geçtiyse, return 401, else return 400
            const statusCode = err.name === 'TokenExpiredError' ? 401 : 400;
            return res.status(statusCode).json({ err });
        }

        console.log("HERE IS THE customer AFTER JWT VERIFY" , customer); 

        req.customer = customer; 
        next();
    });
}

module.exports = accessTokenValidator;
