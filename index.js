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

const app = express();

app.use(cors())
app.use(express.json())

app.use('/auth' , authRouter)
app.use('/admin' , adminRouter);
app.use('/profile', profileRouter)
app.use('/shop' , shopRouter)




app.post('/cart-control', accessTokenValidator , refreshTokenValidator , async (req, res) =>{
    const data = 3;
    return res.status(200).json({data})
});







// app.use('/myNotes' , myNotesRouter)
app.get('/product-num',accessTokenValidator,async(req,res)=>{
    try {
        const{customer}=req;
        const newestOrder = await pool.query('SELECT * FROM orders  WHERE customer_id=$1 ORDER BY order_date DESC' , [customer.id]);
        const newOrderId = newestOrder.rows[0].order_id;//en son siparişin idsi
    
        const productNumResult = await pool.query("SELECT SUM(quantity) FROM order_items WHERE order_id = $1", [newOrderId]);
        let productNum=productNumResult.rows[0].sum;
        return res.status(200).json({productNum});

        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});
app.listen(5000, ()=>{
    console.log("listenin on 5000");
})

