const pool = require('../db');
const jwt = require('jsonwebtoken');

const refreshTokenValidator = async (req, res, next) => {
    const customer = req.customer;
    const { id, email } = customer;

    const resp1 = await pool.query('SELECT * FROM refresh_tokens WHERE customer_id = $1', [id]);
    if (resp1.rows.length === 0) {
        // If no refresh token exists, create a new one and insert it
        const newTokenPayload = { id, email };
        const newAccessToken = jwt.sign(newTokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign(newTokenPayload, process.env.REFRESH_TOKEN_SECRET);

        await pool.query('INSERT INTO refresh_tokens (customer_id, refreshtoken) values ($1, $2)', [id, newRefreshToken]);

        req.accessToken = newAccessToken;
        req.customer = customer;

        console.log("Current req.customer:", req.customer);

        next();
    } else {
        // If a refresh token exists, update the existing token and return it
        const newTokenPayload = { id, email };
        const newAccessToken = jwt.sign(newTokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        await pool.query('UPDATE refresh_tokens SET refreshtoken = $1 WHERE customer_id = $2', [newAccessToken, id]);

        req.accessToken = newAccessToken;
        req.customer = customer;

        console.log("Current req.customer:", req.customer);

        next();
    }
};

module.exports = refreshTokenValidator;
