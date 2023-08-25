/*Burada
Kullanıcı:
- sepetine ürün ekler
-ürün siler

*/

const shopRouter = require('express').Router();

const pool = require('../db');
const minioClient=require('../minio');
const accessTokenValidator = require('../middlewares/accessTokenValidator');
const refreshTokenValidator = require('../middlewares/refreshTokenValidator');

const categories = {

  1:'takim',
  
  2:'tek-ust',
  3:'tek-alt',
  4:'tesettur',
  5:'bone',
  6:'terlik',
};


const bucketName = 'ecommerce';



async function getBasketItemCount(customerId) {

    
  
    try {

      const newestOrder = await pool.query('SELECT * FROM orders  WHERE customer_id=$1 and orderStatus=0' , [customerId]);
    const newOrderId = newestOrder.rows[0].order_id;//en son siparişin idsi

    const productNumResult = await pool.query("SELECT SUM(quantity) FROM order_items WHERE order_id = $1", [newOrderId]);
    let productNum=productNumResult.rows[0].sum;
    
      
      return productNum
    } catch (error) {
      console.error('Error retrieving basket item count:', error);
      throw error;
    }
  }










shopRouter.post('/add-basket',accessTokenValidator,refreshTokenValidator,async(req,res)=>{
    try {
      const {product_id,quantity,size,totalAmount,color,category,currentFeatureId}=req.body;
        const {customer,accessToken}=req;
        const{id}=customer;
        //hangi ürün ve ne kadar olunduğu arayüzden alınacak ----sanırım body !!!!!!
        //size de alınacak
        console.log(product_id,quantity,totalAmount,size,category,currentFeatureId);
        const query=await pool.query("SELECT * FROM orders where customer_id=$1 ",[id]);
        if(query.rows.length===0){
          const newQuery=await pool.query("INSERT INTO orders(customer_id,total_amount) VALUES($1,$2)",[id,0]);
        }
        
        

          const newestOrder = await pool.query('SELECT * FROM orders  WHERE customer_id=$1 and orderStatus=0 order by order_date  desc' , [id]);
          const newOrderId = newestOrder.rows[0].order_id;//en son siparişin idsi
         

        let checkQuantity =await pool.query('SELECT quantity FROM feature where feature_id=$1',[currentFeatureId]);
        checkQuantity=checkQuantity.rows[0].quantity;
        if(checkQuantity>=quantity){

        
         
          const avilableProduct=await pool.query("select *  from products p,order_items o,feature f , sizes s , colors c where p.product_id=o.product_id and p.product_id=f.product_id and order_id=$1  and o.size=s.size and f.feature_id=$2 and f.size_id=s.size_id and c.color_id=f.color_id and c.color=o.color",[newOrderId,currentFeatureId]);
          //!!!!!!!!!!!!!!!!!!!!
          if(avilableProduct.rows.length===0){//eğer daha önce  sepette yoksa ekle , varsa üzerine ekl
            const newQuery=await pool.query("INSERT INTO order_items(order_id,product_id,quantity,price,size,color) values($1,$2,$3,$4,$5,$6)",[newOrderId,product_id,quantity,totalAmount,size,color]);
        
        }
          else{



            let oldQuantity; // Declare the variable outside the if block
            let oldPrice
         
          const oldQuantityResult = await pool.query("SELECT quantity from order_items WHERE order_id=$1 AND product_id=$2 and size=$3 and color=$4", [newOrderId, product_id, size,color]);
          const oldPriceResult=await pool.query("SELECT price FROM order_items WHERE order_id = $1 AND product_id = $2 and size=$3 and color=$4", [newOrderId, product_id,size,color]);
          oldPrice=parseFloat(oldPriceResult.rows[0].price);

         oldQuantity = parseInt(oldQuantityResult.rows[0].quantity);
        

        let newPrice;
        let newQuantity;
            //const oldPrice = parseFloat(oldPriceResult.rows[0].price);
            newQuantity=oldQuantity+quantity;
            newPrice = totalAmount+oldPrice;
            const updateQuery=await pool.query("UPDATE order_items SET quantity=$1,price=$2 where product_id=$3 and order_id=$4 and size=$5 and color=$6",[newQuantity,newPrice,product_id,newOrderId,size,color]);
        





        }
          const productNum = await getBasketItemCount(customer.id);
           console.log("real:",productNum);
          
          return res.status(200).json({message: 'Added in basket  successfully' , productNum: productNum,accessToken:accessToken});
      }

        //const idQuery=await pool.query("SELECT * FROM order_items ");
        //res.json(idQuery.rows);
      else{
        return res.status(404).json({message:'Insufficient stock quantity  '});
      }

        
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:'Cannot Added'});
    }
});//test edilecek!!!!!!!!!!!!!!!!!!!!!!!

shopRouter.delete('/delete-product/:product_id',accessTokenValidator,refreshTokenValidator,async(req,res)=>{
    try {
        const{customer}=req;
        const product_id=req.params.product_id;
        const newestOrder = await pool.query('SELECT * FROM orders  WHERE customer_id=$1 and orderStatus=0 order by order_date  desc' , [customer.id]);
          const newOrderId = newestOrder.rows[0].order_id;//en son siparişi listeler(son siparis id)

          const avilableProduct=await pool.query("Select * from order_items where order_id=$2 and product_id=$1",[product_id,newOrderId]);
        if(avilableProduct.rows.length===0){return res.status(404).send('Note not found');    }
        else{
            await pool.query("DELETE FROM order_items WHERE order_id=$1 AND product_id=$2",[newOrderId,product_id]);
            return res.status(200).json({message: 'Product deleted successfully'});

        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

shopRouter.put('/update-quantity/:product_id',accessTokenValidator,refreshTokenValidator,async(req,res)=>{
    try {
        const{customer}=req;
        const product_id=req.params.product_id;
        const {quantity}=req.body;
        const newestOrder = await pool.query('SELECT * FROM orders  WHERE customer_id=$1 and orderStatus=0 order by order_date  desc' , [customer.id]);
          const newOrderId = newestOrder.rows[0].order_id;//en son siparişi listeler

          const avilableProduct=await pool.query("SELECT * from order_items I, products P,feature F where product_id=$1 AND order_id=$2 AND I.product_id=P.product_id AND P.product_id=F.product_id  ",[product_id,newOrderId]);
          if(avilableProduct.rows.length===0){        return res.status(404).send('Note not found');    }
        else{
            const oldQuantityResult=await pool.query("SELECT quantity FROM order_items WHERE order_id=$1 and product_id=$2",[newOrderId,product_id]);
            const oldQuantity=parseInt(oldQuantityResult.rows[0].quantity);
            
            const newQuantity=oldQuantity+quantity;
            const newPrice = newQuantity*price;
            await pool.query("UPDATE order_items SET  quantity=$3,price=$4 WHERE order_id=$1 AND product_id=$2",[newOrderId,product_id,newQuantity,newPrice]);
            return res.status(200).json({message: 'Product updated successfully'});
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

shopRouter.get('/', async (req, res) => {
  try {
    const rawData = await pool.query('SELECT * FROM products');
    const data = rawData.rows;

    const preSignedUrlsArray = [];
    

    async function generatePreSignedUrls() {
      for (const d of data) {
        const productPhoto = `${d.category_id}-${d.product_name}`;
        //console.log(productPhoto);
        const bucketName= categories[d.category_id];

        const listStream = minioClient.listObjectsV2(bucketName, productPhoto, true);

        const productUrls = [];
        
        await new Promise((resolve, reject) => {
          listStream.on('data', async (obj) => {
            try {
              const photoUrlMinio = await minioClient.presignedGetObject(bucketName, obj.name, 3600);

              // Customize the data associated with each photo URL
              const photoData = {
                url: photoUrlMinio,
                name:obj.name,
                name:obj.name,
                //description: 'Description of the photo',
                //otherData: 'Other data related to the photo',
              };

              productUrls.push(photoData);
              
            } catch (error) {
              console.error('Error generating pre-signed URL:', error);
            }
          });

          listStream.on('end', () => {
            preSignedUrlsArray.push(productUrls);
           

            resolve(); // Resolve the promise when the stream ends
          });

          listStream.on('error', (err) => {
            reject(err); // Reject the promise if an error occurs
          });
        });
      }
    }

    await generatePreSignedUrls();

    const productsWithUrls = data.map((item, index) => ({
      ...item,
      photoUrls: preSignedUrlsArray[index],
      
    }));

    console.log(productsWithUrls);
    return res.status(200).json({ data: productsWithUrls });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while fetching the products" });
  }
});



shopRouter.get('/products/:product_id',async(req,res)=>{//ürünün üzerine tıklayınca gelen ürün dataları
    try {
        const product_id=req.params.product_id;
        const rawData = await pool.query('SELECT * FROM products P,feature F, colors C,sizes S WHERE P.product_id=$1 AND F.product_id=P.product_id and C.color_id=F.color_id and S.size_id=F.size_id',[product_id]);
        let data=rawData.rows;
        const productQuantity=data.quantity;


        const preSignedUrlsArray = [];

    async function generatePreSignedUrls() {
      for (const d of data) {
        const productPhoto = `${d.category_id}-${d.product_name}-${d.color}`;
        //console.log(productPhoto);
        const bucketName= categories[d.category_id];
        const listStream = minioClient.listObjectsV2(bucketName, productPhoto, true);

        const productUrls = [];

        await new Promise((resolve, reject) => {
          listStream.on('data', async (obj) => {
            try {
              
              const photoUrlMinio = await minioClient.presignedGetObject(bucketName, obj.name, 3600);

              // Customize the data associated with each photo URL
              const photoData = {
                url: photoUrlMinio,
                name:obj.name,
                //description: 'Description of the photo',
                //otherData: 'Other data related to the photo',
              };

              productUrls.push(photoData);
            } catch (error) {
              console.error('Error generating pre-signed URL:', error);
            }
          });

          listStream.on('end', () => {
            preSignedUrlsArray.push(productUrls);
            resolve(); // Resolve the promise when the stream ends
          });

          listStream.on('error', (err) => {
            reject(err); // Reject the promise if an error occurs
          });
        });
      }
    }

    await generatePreSignedUrls();

    const productsWithUrls = data.map((item, index) => ({
      ...item,
      photoUrls: preSignedUrlsArray[index],
    }));

        
            
                



    

                  
        console.log(productsWithUrls);
         return res.status(200).json({transformedData:productsWithUrls})
        

        
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});
shopRouter.get('/products-of-week',async(req,res)=>{
  try {
      const productsOfWeek=await pool.query('SELECT * FROM products WHERE isProductOfTheWeek=true ');
      return res.status(200).json({productsOfWeek});


  } catch (error) {
    console.error(error);
        return res.status(500).send('Server Error');
  }
});





/*


shopRouter.get('/products/:product_id',async(req,res)=>{//ürünün üzerine tıklayınca gelen ürün dataları
    try {
        const{product_id}=req.params;
        const rawData = await pool.query('SELECT * FROM products P,feature F WHERE P.product_id=$1 AND F.product_id=P.product_id',[product_id]);
        let data=rawData.rows;
        
        const productQuantity=data.quantity;
        if(rawData.rows[0].category_id===6){//available sizelari döndürüyor
            const sizeIsNotNull = data
            .filter(item => item.size_i !== null)
                .map(item => item.size_i);

                const productUrlsArray = data.map(item => item.featureurl);


          const preSignedUrls = [];

          for (const productUrl of productUrlsArray) {
            const photoUrl = await minioClient.presignedGetObject('ecommerce', productUrl, 3600);
            preSignedUrls.push(photoUrl);
          }
  
         // Combine the original data with the pre-signed URLs
         let transformedData = data.map((item, index) => ({
            ...item,
            photoUrl: preSignedUrls[index],
           }));
            

              transformedData = transformedData.map(({ size_i, quantity,feature_id,photoUrl}) => ({ size_i, quantity ,feature_id,photoUrl}));

            console.log(transformedData);
            return res.status(200).json({transformedData,productsWithUrls})
        }else{
            const sizeIsNotNull = data
            .filter(item => item.size !== null)
                .map(item => item.size);

                const productUrlsArray = data.map(item => item.featureurl);


                const preSignedUrls = [];
      
                for (const productUrl of productUrlsArray) {
                  const photoUrl = await minioClient.presignedGetObject('ecommerce', productUrl, 3600);
                  preSignedUrls.push(photoUrl);
                }
        
               // Combine the original data with the pre-signed URLs
               let transformedData = data.map((item, index) => ({
                  ...item,
                  photoUrl: preSignedUrls[index],
                 }));
                  


                  

                 transformedData = transformedData.map(({ size, quantity,feature_id ,photoUrl}) => ({ size, quantity ,feature_id,photoUrl}));
                 console.log(transformedData);
            return res.status(200).json({transformedData,productsWithUrls})
        }

        
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
})*/ 
module.exports = shopRouter;