const express = require('express');
const authRouter = require('./routes/auth');
const myNotesRouter = require('./routes/myNotes');
const adminRouter = require('./routes/admin');

const app = express();

app.use(express.json())

app.use('/auth' , authRouter)
app.use('/myNotes' , myNotesRouter)
app.use('/admin' , adminRouter);

app.listen(5000, ()=>{
    console.log("listenin on 5000");
})