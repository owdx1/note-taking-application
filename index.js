const express = require('express');
const authRouter = require('./routes/auth');
const myNotesRouter = require('./routes/myNotes');
const adminRouter = require('./routes/admin');
const profileRouter = require('./routes/profile');
const shopRouter = require('./routes/shop');

const app = express();

app.use(express.json())

app.use('/auth' , authRouter)
app.use('/admin' , adminRouter);
app.use('/profile', profileRouter)
app.use('/shop' , shopRouter)
// app.use('/myNotes' , myNotesRouter)
app.listen(5000, ()=>{
    console.log("listenin on 5000");
})