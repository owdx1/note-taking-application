/* Bu routta , kullanıcı giriş yapmışsa (access tokeni varsa gerçekleşecek işlemler bulunuyor)

- kullanıcı profiline girmek isterse
- kullanıcı siparişlerini görmek isterse
- kullanıcı sepetini görmek isterse


*/
const pool = require('../db');
const accessTokenValidator = require('../middlewares/accessTokenValidator');
const refreshTokenValidator = require('../middlewares/refreshTokenValidator');

const minioClient=require('../minio');

const categories = {

    1:'takim',
    
    2:'tek-ust',
    3:'tek-alt',
    4:'tesettur',
    5:'bone',
    6:'terlik',
  };

const profileRouter = require('express').Router();

async function getNewOrderId(customer_id){
    try {
        const orders = await pool.query('SELECT * FROM orders WHERE customer_id = $1 and orderStatus=0 order by order_date  desc' , [customer_id]);//sepeti listeler
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
        const {id} = customer;
        const {accessToken} = req; // bunu neden aldım hatırlamıyorum
        console.log(customer); // bu silinecek
        const availableCart=await pool.query('SELECT * from orders WHERE orderStatus=0 and customer_id=$1',[id]);
        if(availableCart.rows.length===0){
            await pool.query("INSERT INTO orders(customer_id,total_amount) VALUES($1,$2)",[id,0]);
        }
        
        const response = await pool.query('SELECT * FROM customers WHERE customer_id = $1' , [id]);
        const sendResponse = response.rows[0]; // burada yollanılan customerin içinde hashlı şifre de var, 
        // eğer olur da request intercept edilirse hashli şifreyi hackera vermis oluyoruz
        return res.status(200).json({customer:sendResponse , accessToken});
        
        
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

        const orderId= await getNewOrderId(customer_id);
        //console.log(orderId);
        //const basket=await pool.query("SELECT * FROM order_items WHERE order_id=$1",[orderId]);// sepettekiürünler
        const basket=await pool.query("select *,f.quantity as totalquantity,o.quantity as orderquantity,o.color as ocolor  from products p,order_items o,feature f ,sizes s, colors c where p.product_id=o.product_id and p.product_id=f.product_id and order_id=$1  and c.color_id=f.color_id and f.size_id=s.size_id and o.size=s.size and o.color=c.color",[orderId]);



        const dataObject = basket.rows;
        //console.log(dataObject);
        const preSignedUrlsArray = [];
        
        async function generatePreSignedUrls() {
          for (const d of dataObject) {
            const productPhoto = `${d.category_id}-${d.product_name}-${d.color}`;
            const bucketName= categories[d.category_id];
            //console.log(d.category_id);
            //console.log(bucketName);
            const listStream = minioClient.listObjectsV2(bucketName, productPhoto, true);
        
            const productUrls = [];
        
            await new Promise((resolve, reject) => {
              listStream.on('data', async (obj) => {
                try {
                  const photoUrlMinio = await minioClient.presignedGetObject(bucketName, obj.name, 3600);
                  const photoData = {
                    url: photoUrlMinio,
                  };
                  productUrls.push(photoData);
                } catch (error) {
                  console.error('Error generating pre-signed URL:', error);
                }
              });
        
              listStream.on('end', () => {
                preSignedUrlsArray.push(productUrls);
                resolve();
              });
        
              listStream.on('error', (err) => {
                reject(err);
              });
            });
          }
        }
        
        await generatePreSignedUrls();
        
        const productsWithUrls = dataObject.map((item, index) => ({
          ...item,
          photoUrls: preSignedUrlsArray[index],
        }));
        
       // console.log(productsWithUrls);




        return res.status(200).json({customer , basket:productsWithUrls , accessToken:accessToken}); // bunu bu şekilde kullanmak kafa karışıklığına yol açabilir ama düzeltiriz

        
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
        const {accessToken} = req;
        const orderId= await getNewOrderId(customer_id);

        await pool.query('DELETE FROM order_items WHERE order_id=$1',[orderId]);
        return res.status(200).json({message:"Sipariş Listeniz Başarıyla Silindi!!", accessToken:accessToken});
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});




profileRouter.post('/cart/delete-a-product',accessTokenValidator,refreshTokenValidator,async(req,res)=>{
    const{product_id,feature_id}=req.body;
    const {customer}=req;

    const {accessToken} = req;
        const customer_id=customer.id;
        const orderId= await getNewOrderId(customer_id);

    await pool.query("DELETE FROM order_items WHERE   order_id=$2 and order_item_id in (select o.order_item_id from products p,order_items o,feature f where p.product_id=o.product_id and p.product_id=f.product_id    and f.feature_id=$3  and p.product_id =$1 )",[product_id,orderId,feature_id]);

    return res.status(200).json({message:"Ürün Başarıyla Silindi!!!" , accessToken: accessToken});

});




profileRouter.post('/cart/buy', accessTokenValidator, refreshTokenValidator, async (req, res) => {
    const { customer } = req;
    const { accessToken } = req;
    const customer_id = customer.id;
    const orderId = await getNewOrderId(customer_id);
  
    const { totalPrice } = req.body; 
    console.log('totalprice',totalPrice);
    await pool.query('UPDATE orders SET orderStatus=1,total_amount=$2 WHERE order_id=$1', [orderId,totalPrice]);
    await pool.query('insert into orders(customer_id,total_amount) values($1,$2)', [customer_id, 0]); 
    return res.status(200).json({ message: "Satın alındı!!!", accessToken });
  });
  


profileRouter.get('/orders'  ,accessTokenValidator, refreshTokenValidator, async (req , res) => {
    try {

        const {customer} = req;
        const {accessToken} = req;
        
        const newestOrder = await pool.query('SELECT * FROM orders  WHERE customer_id=$1 and orderStatus>0 ' , [customer.id]);
        //const orderIds = newestOrder.rows.map((order) => order.order_id);
        const oldOrders=newestOrder.rows;
        console.log('yolladıgım siparisler' , oldOrders);
        
        return res.status(200).json({oldOrders , accessToken});
    
    }   catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }

});
profileRouter.get('/orders/:order_id',accessTokenValidator,refreshTokenValidator,async(req,res)=>{//spesifik siparişin içeriğini gösterir
    try {
        const {customer} = req;
        const order_id=req.params.order_id;
        const {accessToken} = req;
        const data=await pool.query('SELECT distinct I.*,P.product_name,P.category_id FROM orders o,order_items I, products P,feature F ,colors C, sizes S WHERE o.customer_id=$2 AND orderStatus>0 AND o.order_id=$1 AND o.order_id=I.order_id AND   P.product_id=F.product_id AND P.product_id=I.product_id and C.color_id=F.color_id AND F.size_id=S.size_id and I.size=S.size and I.color=C.color',[order_id,customer.id]);
        //console.log('data',data.rows);
        
        const dataObject = data.rows;
        console.log(dataObject);
        const preSignedUrlsArray = [];
        
        async function generatePreSignedUrls() {
          for (const d of dataObject) {
            const productPhoto = `${d.category_id}-${d.product_name}-${d.color}`;
            const bucketName= categories[d.category_id];
            //console.log(d.category_id);
            //console.log(bucketName);
            const listStream = minioClient.listObjectsV2(bucketName, productPhoto, true);
        
            const productUrls = [];
        
            await new Promise((resolve, reject) => {
              listStream.on('data', async (obj) => {
                try {
                  const photoUrlMinio = await minioClient.presignedGetObject(bucketName, obj.name, 3600);
                  const photoData = {
                    url: photoUrlMinio,
                  };
                  productUrls.push(photoData);
                } catch (error) {
                  console.error('Error generating pre-signed URL:', error);
                }
              });
        
              listStream.on('end', () => {
                preSignedUrlsArray.push(productUrls);
                resolve();
              });
        
              listStream.on('error', (err) => {
                reject(err);
              });
            });
          }
        }
        
        await generatePreSignedUrls();
        
        const productsWithUrls = dataObject.map((item, index) => ({
          ...item,
          photoUrls: preSignedUrlsArray[index],
        }));
        
        console.log(productsWithUrls);
        
        return res.status(200).json({ordered:productsWithUrls, accessToken: accessToken });
        
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