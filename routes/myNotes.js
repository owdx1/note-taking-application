const router = require('express').Router();
const accessTokenValidator = require('../middlewares/accessTokenValidator');
const pool = require('../db');


router.get('/' , accessTokenValidator , async (req , res) =>{

    const {user}  = req;

    try {
        
        const userQuery = await pool.query('SELECT * FROM notes WHERE user_id = $1' , [user.id]);

        console.log(userQuery.rows);
        

        /*for (let i = 0; i < userQuery.rows.length; i++){
            userNotes.push(userQuery.rows[i].user_note)
        }*/
        const userNotes = userQuery.rows.map((row) => ({
            note_id: row.note_id,
            note: row.user_note,
        }));

          
        
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

router.delete('/delete-a-note/:note_id' , accessTokenValidator , async (req , res) =>{

    const {note_id} = req.params;

    try {

        const note = await pool.query('SELECT * FROM notes WHERE note_id = $1', [note_id]);

        if (note.rows.length === 0) {
            
            return res.status(404).send('Note not found');
        }
        
        await pool.query(`DELETE FROM notes WHERE note_id = $1` , [note_id]);
        return res.status(200).send('Note deleted successfully');
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
})

router.post('/patch-a-note/:note_id' , accessTokenValidator , async(req , res) =>{
    const {note_id} = req.params;
    const {updatedNote} = req.body;

    const note = await pool.query('SELECT * FROM notes where note_id = $1' , [note_id]);

    if(note.rows.length === 0){
        return res.status(404).send('Note not found')
    }

    await pool.query('UPDATE notes SET user_note = $1 WHERE note_id = $2' , [updatedNote , note_id]);

    return res.status(200).send('Updated successfully');
}) 


module.exports = router