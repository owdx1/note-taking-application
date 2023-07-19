const pool = require('../db');
const jwt = require('jsonwebtoken');

const refreshTokenValidator = async (req, res, next) => {
    const customer = req.customer;
    const { id, email } = customer;
    console.log("id: ", id);
    console.log(email);
    
    const resp1 = await pool.query('SELECT * FROM refresh_tokens WHERE customer_id = $1', [id]);
    if (resp1.rows.length === 0) {
        return res.send('refresh token not found');
    }
    const newTokenPayload = { id, email }; // Create a new payload without iat and exp fields
    const newAccessToken = jwt.sign(newTokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign(newTokenPayload, process.env.REFRESH_TOKEN_SECRET);

    await pool.query('DELETE FROM refresh_tokens where customer_id = $1', [id]);
    await pool.query('INSERT INTO refresh_tokens (customer_id , refreshtoken) values ($1 , $2)', [id, newRefreshToken]);

    req.accessToken = newAccessToken;
    
    next();
}
module.exports = refreshTokenValidator;
