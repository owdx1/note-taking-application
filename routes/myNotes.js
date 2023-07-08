const router = require('express').Router();
const accessTokenValidator = require('../middlewares/accessTokenValidator');
const pool = require('../db');


router.get('/' , accessTokenValidator , async (req , res) =>{

    const {user}  = req;

    try {
        
        const userQuery = await pool.query('SELECT * FROM notes WHERE user_id = $1' , [user.id]);

        userNotes = [];

        for (let i = 0; i < userQuery.rows.length; i++){
            userNotes.push(userQuery.rows[i].user_note)
        }

        return res.status(200).json(userNotes);
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
    
})
router.post('/add-new-note' , accessTokenValidator , async (req , res) =>{
    const {user} = req;
    const {note} = req.body;
    try {
        await pool.query("INSERT INTO notes (user_id , user_note) values ($1 , $2)",  [user.id , note])

        return res.status(200).send('Note added successfully: ');
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
})

module.exports = router