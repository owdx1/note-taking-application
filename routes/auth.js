const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const accessTokenValidator = require('../middlewares/accessTokenValidator');
require('dotenv');

router.post('/register' , async (req , res) => {

    try {

        const {email , password1 , password2 , username} = req.body;

        if(password1 !== password2 ) {
            return res.send('Passwords are not matching.');
        }
        if(password1.length < 6){{
            return res.send('Password length should be over 6');
        }}

        const user = await pool.query('SELECT * FROM USERS WHERE user_name = $1' , [username]);
        if(user.rows.length !== 0){
            return res.status(409).json({message : "There is already a user exists with the same email or username"});
        }

        const genRound = 10;
        const genSalt = await bcrypt.genSalt(genRound)

        const bcryptPassword = await bcrypt.hash(password1 , genSalt);

        await pool.query('INSERT INTO users (user_name , user_email , user_password) values ($1 , $2 , $3)' , [username , email , bcryptPassword]);
        const newUser = await pool.query('SELECT * FROM USERS WHERE user_password = $1' , [bcryptPassword]);

        const payload = {
                email: newUser.rows[0].user_email,
                id: newUser.rows[0].user_id,
                username: newUser.rows[0].user_name
        }

        const token = jwt.sign(payload , "miyav" , {expiresIn: "1h"});
        console.log(token);
        return res.redirect(`/auth/auto-login?token=${token}`);
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});

router.get('/auto-login' , (req , res) =>{
    const {token} = req.query;

    console.log("token is auto-login is" , token);

    if (!token) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    jwt.verify(token , "miyav" , (err , user) =>{
        if (err) {
            console.log(err);
            // if the error is because of token expiration, return 401, else return 400
            const statusCode = err.name === 'TokenExpiredError' ? 401 : 400;
            return res.status(statusCode).json({ err });
        }
        
        req.user = user;

    })

    return res.status(200).json({message: 'After register , login is successfull too..', token: token})
});


router.post('/login' , async (req , res) =>{


    try {
        const {email , password1} = req.body;
    
        const user = await pool.query(`SELECT * FROM users WHERE user_email = $1` , [email]);


        if(user.rows.length !== 0){
            const isValid = await bcrypt.compare(password1 , user.rows[0].user_password);
            

            if(!isValid){
            
                return res.status(401).send('Incorrect password');
            }
        }

        const payload = {
            email: user.rows[0].user_email,
            id: user.rows[0].user_id,
            username: user.rows[0].user_name
    }
        
        const token = jwt.sign(payload , "miyav" , {expiresIn: "1d"});

        return res.status(200).json({message: 'Logged in successfully' , token: token});
        

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
        
    }
})

router.get('/logout', accessTokenValidator , (req , res) =>{
    
    try {
        console.log("before" , req.headers);
        delete req.headers.authorization;
        console.log("after" , req.headers);

        return res.status(200).send('Logged out successfully');
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }

})




module.exports = router;