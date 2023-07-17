const express = require('express');
const authRouter = require('./routes/auth');
//const myNotesRouter = require('./routes/myNotes');
const adminRouter = require('./routes/admin');
const profileRouter = require('./routes/profile');
const shopRouter = require('./routes/shop');
const cors = require('cors');
const accessTokenValidator = require('./middlewares/accessTokenValidator');
const refreshTokenValidator = require('./middlewares/refreshTokenValidator');

const app = express();

app.use(cors())
app.use(express.json())

app.use('/auth' , authRouter)
app.use('/admin' , adminRouter);
app.use('/profile', profileRouter)
app.use('/shop' , shopRouter)


app.get('/cart-control', accessTokenValidator , refreshTokenValidator , async (req, res) =>{
    const {customer} = req;
    //burda işlemler yapılacak, şimdilik herhangi bir sayı döndürüyorum

    const data = 5;
    return res.status(200).json({data});

    
    
})

// app.use('/myNotes' , myNotesRouter)
app.listen(5000, ()=>{
    console.log("listenin on 5000");
})  