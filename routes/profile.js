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
        const { id} = customer;
        const {accessToken} = req; // bunu neden aldım hatırlamıyorum
        console.log(customer); // bu silinecek

        const response = await pool.query('SELECT * FROM customers WHERE customer_id = $1' , [id]);
        const sendResponse = response.rows[0];
        return res.status(200).json({customer:sendResponse , accessToken:accessToken});
        
        
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

        const newestOrder = await pool.query('SELECT * FROM orders  DESC WHERE customer_id=$1 ORDER BY order_date' , [customer.customer_id]);//en son siparişi listeler
        const newOrderId = newestOrder.rows[0].order_id;
        const productsInCart=await pool.query("SELECT * FROM order_items WHERE order_id=$1",[newOrderId]);
         return res.status(200).json(productsInCart.rows);
    
    }   catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }

});
profileRouter.get('/orders',accessTokenValidator,refreshTokenValidator,async(req,res)=>{//önceki siparişleri gösterir
    try {
        const {customer} = req;
        const ordered=await pool.query('SELECT * FROM orders WHERE isOrdered = true ORDER BY order_date DESC');
        console.log(ordered);

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
})

profileRouter.post('/update-info' , accessTokenValidator, refreshTokenValidator, async (req , res) =>{
    
    const {customer} = req;
    console.log('icerideki customer' , customer);
    console.log('suanki body' , req.body);
    const {id} = customer;
    const {accessToken} = req;
    console.log('yeni access token' , accessToken);
    console.log('suanki id' , id);

        try { 
            
            const {firstName, lastName,
                    address, postalcode, country,
                    city, phoneNumber} = req.body;
            
            
            
            const phoneNumberRegex = /^(05)[0-9][0-9][\s]([0-9]){3}[\s]([0-9]){2}[\s]([0-9]){2}/
                    
            if(country === ""){
                return res.status(400).json({message: 'Lütfen geçerli bir ülke giriniz.'})
            } 
            else if(city === ""){
                return res.status(400).json({message: 'Lütfen geçerli bir şehir giriniz.'})
            }
            else if(firstName === ""){
                return res.status(400).json({message: 'Lütfen geçerli bir isim giriniz.'})
            }
            else if(lastName === ""){
                return res.status(400).json({message: 'Lütfen geçerli bir soyisim giriniz.'})
            }
            else if(address === ""){
                return res.status(400).json({message: 'Lütfen geçerli bir adres giriniz.'})
            }
            else if(!phoneNumberRegex.test(phoneNumber)){
                return res.status(400).json({message: 'Lütfen geçerli bir telefon numarası giriniz'});
            } 
            else if(postalcode === ''){
                return res.status(400).json({message : 'Lütfen geçerli bir posta kodu giriniz'});
            }

            await pool.query('UPDATE customers SET country = $1, city = $2, first_name = $3 , last_name = $4, address = $5, phone = $6, postal_code = $7 WHERE customer_id = $8' , [country,city,firstName,lastName,address,phoneNumber,postalcode, id])
            return res.status(200).json({message: 'Bilgiler başarıyla güncellendi!' , accessToken: accessToken})
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({message: 'Server error'})
        }
   






})





module.exports = profileRouter;