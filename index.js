const express = require('express');
const authRouter = require('./routes/auth');
//const myNotesRouter = require('./routes/myNotes');
const adminRouter = require('./routes/admin');
const profileRouter = require('./routes/profile');
const shopRouter = require('./routes/shop');
const cors = require('cors');
const pool = require('./db');
const accessTokenValidator = require('./middlewares/accessTokenValidator');
const refreshTokenValidator = require('./middlewares/refreshTokenValidator');
const bcrypt = require('bcrypt');
const photoRouter=require('./routes/foto')

const app = express();

app.use(cors())
app.use(express.json())

app.use('/auth' , authRouter);
app.use('/admin' , adminRouter);
app.use('/profile', profileRouter);
app.use('/shop' , shopRouter);
app.use('/foto',photoRouter);



app.post('/cart-control', accessTokenValidator , refreshTokenValidator , async (req, res) => {
    const data = 3;
    return res.status(200).json({data})
});

app.post('/reset-password' , accessTokenValidator , refreshTokenValidator , async(req ,res) => {
    const {customer} = req;
    console.log('suanki customer', customer);
    const {accessToken} = req;
    console.log('yeni access token' , accessToken);
    const {id} = customer;
    console.log('kullanıcının idsi' , id);
    const {oldPassword , newPassword , newPasswordRepeat} = req.body;

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

    console.log('gelen istekteki bilgiler:' , oldPassword , newPassword , newPasswordRepeat);
    console.log('sifre uzunluk' , newPassword.length);

    if (newPassword !== newPasswordRepeat ) {
        return res.status(400).json({message: 'Şifreler eşleşmiyor.'});
    }
    else if (newPassword.length < 6){
        return res.status(400).json({message: 'Şifre uzunluğu 6 dan büyük olmalıdır.'});
    }
    else if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({message: 'Şifre en az 6 karakter uzunluğunda , en az 1 harf ve rakam içermelidir.'});
    }


    const response = await pool.query('SELECT password from customers where customer_id = $1' , [id]);
    console.log('suanki response rows' , response.rows);
    if(response.rows.length === 0){
        return res.status(500).json({message: 'Server Error'});
    }
    
    const hashedPassword = response.rows[0].password;
    

    const isValid = await bcrypt.compare(oldPassword,hashedPassword);
    console.log("isValid objesi" , isValid);

    if(!isValid){

        return res.status(409).json({message: 'Girilen eski şifre yanlış!'});
    } 
    const genRound = 10;
    const genSalt = await bcrypt.genSalt(genRound)
    const recryptedPassword = await bcrypt.hash(newPassword , genSalt);
    await pool.query('UPDATE customers SET password = $1 WHERE customer_id = $2' , [recryptedPassword , id]);
    return res.status(200).json({message: 'Şifre başarıyla değiştirildi!', accessToken: accessToken});
})

// app.use('/myNotes' , myNotesRouter)
app.get('/product-num',accessTokenValidator,async(req,res) => {
    try {
        const{customer}=req;
        const newestOrder = await pool.query('SELECT * FROM orders  WHERE customer_id=$1 ORDER BY order_date DESC' , [customer.id]);
        const newOrderId = newestOrder.rows[0].order_id;//en son siparişin idsi
    
        const productNumResult = await pool.query("SELECT SUM(quantity) FROM order_items WHERE order_id = $1", [newOrderId]);
        let productNum=productNumResult.rows[0].sum;

        
        if(productNum === null){
            productNum=0;
        }
        

        return res.status(200).json({productNum});

        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});
     






app.listen(5000, ()=>{
    console.log("listenin on 5000");
})

 