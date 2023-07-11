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
        const {email , id} = customer;
        const {accessToken} = req; // bunu neden aldım hatırlamıyorum
        console.log(customer); // bu silinecek

        // kullanıcı profile girdikten sonra, siparişlerim, kartım diye iki buton olacak

        return res.status(200).json({customer , accessToken:accessToken});

        
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
        const orders = await pool.query('SELECT * FROM orders WHERE customer_id = $1' , [customer_id]);
        const cartFeatures = orders.rows;

        return res.status(200).json({customer , cartFeatures , accessToken:accessToken}); // bunu bu şekilde kullanmak kafa karışıklığına yol açabilir ama düzeltiriz

        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
})

profileRouter.get('/siparislerim' , accessTokenValidator , refreshTokenValidator , async (req , res) => {

    const {customer} = req;
    const {accessToken} = req;
    

})




module.exports = profileRouter;