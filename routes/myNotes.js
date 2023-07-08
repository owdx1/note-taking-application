const router = require('express').Router();
const accessTokenValidator = require('../middlewares/accessTokenValidator');
const pool = require('../db');


router.get('/' , accessTokenValidator , async (req , res) =>{

    const {user}  = req;

    try {
        
        const notes = await pool.query('SELECT * FROM notes WHERE user_id = $1' , [user.id]);

        return res.status(200).json(notes);
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
    
})

module.exports = router