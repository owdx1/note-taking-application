const pool = require('../db');
const jwt = require('jsonwebtoken');

const refreshTokenValidator = async (req , res , next) => {

    const {customer} = req;
    const {id} = customer;

    const refreshtoken = await pool.query('SELECT * from refresh_tokens WHERE customer_id = $1' , [id]);

    if (refreshtoken.rows.length === 0 ){
        return res.send('refresh token not found');
    }



    const newAccessToken = jwt.sign({customer} , process.env.ACCESS_TOKEN_SECRET , {expiresIn: "1hr"});
    const newRefreshToken = jwt.sign({customer} , process.env.REFRESH_TOKEN_SECRET);

    await pool.query('DELETE FROM refresh_tokens where customer_id = $1' , [id]);
    await pool.query('INSERT INTO refresh_tokens (id , refreshtoken) values ($1 , $2)' , [id , newRefreshToken]);

    req.accessToken = newAccessToken;

    next();

}

module.exports = refreshTokenValidator;