const router = require('express').Router();
const accessTokenValidator = require('../middlewares/accessTokenValidator');
const pool = require('../db');
const refreshTokenValidator = require('../middlewares/refreshTokenValidator');


router.get('/' , accessTokenValidator, refreshTokenValidator,  async (req , res) =>{

    const {customer}  = req;
    const {accessToken} = req;

    try {
        
        const customerQuery = await pool.query('SELECT * FROM notes WHERE customer_id = $1' , [customer.id]);

        console.log(customerQuery.rows);
        

        /*for (let i = 0; i < userQuery.rows.length; i++){
            userNotes.push(userQuery.rows[i].user_note)
        }*/
        const userNotes = customerQuery.rows.map((row) => ({
            note_id: row.note_id,
            note: row.user_note,
        }));

          
        
        return res.status(200).json({userNotes : userNotes , accessToken : accessToken});
        
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

router.delete('/delete-a-note/:note_id' , accessTokenValidator , async (req , res) => {

    const {note_id} = req.params;
    const validUUIDv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!validUUIDv4Regex.test(note_id)) {
    return res.status(400).json({ error: 'Invalid note_id parameter' });
    
    }

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
    const validUUIDv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!validUUIDv4Regex.test(note_id)) {
    return res.status(400).json({ error: 'Invalid note_id parameter' });
    }
    const {updatedNote} = req.body;

    const note = await pool.query('SELECT * FROM notes where note_id = $1' , [note_id]);

    if(note.rows.length === 0){
        return res.status(404).send('Note not found')
    }

    await pool.query('UPDATE notes SET user_note = $1 WHERE note_id = $2' , [updatedNote , note_id]);

    return res.status(200).send('Updated successfully');
}) 


module.exports = router;