const jwt = require('jsonwebtoken');

const adminTokenValidator = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Admin not logged in' });
    }

    jwt.verify(token, process.env.ADMIN_TOKEN_SECRET, (err, admin) => {
        if (err) {
            console.log(err);
            //  token süresi geçtiyse, return 401, else return 400
            const statusCode = err.name === 'TokenExpiredError' ? 401 : 400;
            return res.status(statusCode).json({ err });
        }

        console.log("HERE IS THE admin AFTER JWT VERIFY" , admin); // bu silinecek

        req.admin = admin; // token geçerli ise, kullanıcının tüm bilgilerini req.admine'e yolluyoruz
        next();
    });
}

module.exports = adminTokenValidator;
