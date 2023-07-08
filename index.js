const express = require('express');
const authRouter = require('./routes/auth');
const myNotesRouter = require('./routes/myNotes');

const app = express();

app.use(express.json())

app.use('/auth' , authRouter)
app.use('/myNotes' , myNotesRouter)

app.listen(5000, ()=>{
    console.log("listenin on 5000");
})