/* Bu routta , kullanıcı giriş yapmışsa (access tokeni varsa gerçekleşecek işlemler bulunuyor)

- kullanıcı profiline girmek isterse
- kullanıcı siparişlerini görmek isterse
- kullanıcı sepetini görmek isterse


*/
const pool = require('../db');
const accessTokenValidator = require('../middlewares/accessTokenValidator');
const refreshTokenValidator = require('../middlewares/refreshTokenValidator');



const profileRouter = require('express').Router();

profileRouter.get('/' , accessTokenValidator, refreshTokenValidator , async (req , res) => {

    try {
        
        const {customer} = req;
        const {id} = customer;

        const user = await pool.query('SELECT * FROM customers WHERE customer_id = $1' , [id]);

        const {accessToken} = req;
        console.log(customer); 

        return res.status(200).json({customer:user.rows[0] , accessToken:accessToken});
    
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

profileRouter.get('/cart' , accessTokenValidator , refreshTokenValidator , async (req , res) => {

    try {
        
        const {customer} = req;
        const customer_id = customer.id;
        const {accessToken} = req;
        
        const orders = await pool.query('SELECT * FROM orders WHERE customer_id = $1' , [customer_id]);//siparişleri listeler
        const cartFeatures = orders.rows;

        return res.status(200).json({customer , cartFeatures , accessToken:accessToken}); // bunu bu şekilde kullanmak kafa karışıklığına yol açabilir ama düzeltiriz

        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
})

profileRouter.get('/products-mine' , accessTokenValidator , refreshTokenValidator , async (req , res) => {
    try {
    
        const {customer} = req;
        const {accessToken} = req;

        const newestOrder = await pool.query('SELECT * FROM orders ORDER BY order_date DESC WHERE customer_id=$1' , [customer.customer_id]);//en son siparişi listeler
        const newOrderId = newestOrder.rows[0].order_id;
        const productsInCart=await pool.query("SELECT * FROM order_items WHERE order_id=$1",[newOrderId]);
         return res.status(200).json(productsInCart.rows);
    
    }   catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }

});





module.exports = profileRouter;