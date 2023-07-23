/* Bu routta , kullanıcı giriş yapmışsa (access tokeni varsa gerçekleşecek işlemler bulunuyor)

- kullanıcı profiline girmek isterse
- kullanıcı siparişlerini görmek isterse
- kullanıcı sepetini görmek isterse


*/
const pool = require('../db');
const accessTokenValidator = require('../middlewares/accessTokenValidator');
const refreshTokenValidator = require('../middlewares/refreshTokenValidator');



const profileRouter = require('express').Router();

async function getNewOrderId(customer_id){
    try {
        const orders = await pool.query('SELECT * FROM orders WHERE customer_id = $1 and isOrdered=false' , [customer_id]);//sepeti listeler
        const orderId = orders.rows[0].order_id;
        return orderId;
    } catch (error) {
    console.error( error);
      throw error;
    }
}

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
        const {product_id,quantity}=req.body;// buy tusuna basıldığında bana bir data dönmeli 
        const {accessToken} = req;

        const orderId=getNewOrderId(customer_id);
        const basket=await pool.query("SELECT * FROM order_items WHERE order_id=$1",[orderId]);// sepettekiürünler
        
        
        return res.status(200).json({customer , basket , accessToken:accessToken,message:"güncel sepettesiniz!!!"}); // bunu bu şekilde kullanmak kafa karışıklığına yol açabilir ama düzeltiriz

        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});
profileRouter.post('/cart/update-quantity',accessTokenValidator,refreshTokenValidator,async(req,res)=>{
    try {
        const{product_id,quantity}=req.body;
        const orderId=getNewOrderId(customer_id);
        await pool.query('UPDATE order_items SET quantity=$1 WHERE product_id=$2 and order_id=$3',[quantity,product_id,orderId]);
        return res.status(200).json({message:"product updated"});
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
})

profileRouter.delete('/cart/empty-cart',accessTokenValidator,refreshTokenValidator,async(req,res)=>{
    try {
        const {customer}=req;
        const customer_id=customer.id;
        const orderId=getNewOrderId(customer_id);

        await pool.query('DELETE FROM order_items WHERE order_id=$1',[orderId]);
        return res.status(200).json({message:"Sipariş Listeniz Başarıyla Silindi!!", accessToken:accessToken});
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});
profileRouter.delete('/cart/delete-a-product',accessTokenValidator,refreshTokenValidator,async(req,res)=>{
    const{product_id}=req.body;
    const {customer}=req;
        const customer_id=customer.id;
        const orderId=getNewOrderId(customer_id);

    await pool.query("DELETE FROM order_items WHERE product_id=$1 and order_id=$2",[product_id,orderId]);
    return res.status(200).json({message:"Ürün Başarıyla Silindi!!!"});
});
profileRouter.post('/cart/buy',accessTokenValidator,refreshTokenValidator,async(req,res)=>{
    const {customer}=req;
    const customer_id=customer.id;
    const orderId=getNewOrderId(customer_id);

    await pool.query('UPDATE orders SET isOrdered=true WHERE order_id=$1',[orderId]);
    return res.status(200).json({message:"Satın alındı!!!"});
});


profileRouter.get('/siparisler'  ,accessTokenValidator, async (req , res) => {
    try {
    
        const {customer} = req;
        const {accessToken} = req;
        const{orderInfo}=req.body;
        orderInfo=0;
        const newestOrder = await pool.query('SELECT * FROM orders   WHERE customer_id=$1 and isOrdered=true Order by order_date DESC' , [customer.id]);
        //const orderIds = newestOrder.rows.map((order) => order.order_id);
         const oldOrders=newestOrder.rows;
        
        
        return res.status(200).json(oldOrders);
    
    }   catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }

});
profileRouter.get('/orders/:order_id',accessTokenValidator,refreshTokenValidator,async(req,res)=>{//önceki siparişleri gösterir
    try {
        const {customer} = req;
        const{order_id}=req.params;
        const ordered=await pool.query('SELECT * FROM order_items WHERE isOrdered = true and order_id=$1',[order_id]);
        console.log(ordered);
        return res.status(200).json(ordered);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

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
});







module.exports = profileRouter;