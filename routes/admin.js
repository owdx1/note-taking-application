const adminRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const adminTokenValidator = require('../middlewares/adminTokenValidator');
const pool = require('../db');

const minioClient=require('../minio');







adminRouter.post('/login' ,  (req , res) => {
    const {username , password} = req.body;
    console.log(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
    if(username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD){
        res.status(401).send('Unauthorized access');
    }
    const payload = {
        username:process.env.ADMIN_USERNAME,
        password:process.env.ADMIN_PASSWORD
    } // buraya ne koyacağımdan emin değilim

    const adminToken = jwt.sign(payload , process.env.ADMIN_TOKEN_SECRET , {expiresIn: "1d"});
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    console.log('admin',adminToken);
    res.status(200).json({
        message: 'Admin successfully logged in',
        adminToken: adminToken,
        refreshToken: refreshToken
    });

});
// admin logout front endde gerçekleştirilecek

adminRouter.post('/add-a-product' ,adminTokenValidator , async (req , res) => {
    const {adminToken} = req.admin;
     // bu admin bilgilerini içeren kısım, customer bilgilerine ihtiyacımız var ama admin bilgilerine ihtiyacımız tam
                        // anlamıyla yok çünkü adminin kim olduğunu ve bilgilerini biliyoruz zaten. customer için kesinlikle yapılması
                        // gereken bu durum admin için geçerli değil ama yine de burda dursun el alışkanlığı olarak.
    
    try {
        const { product_name,
            category_id,
            price,
            discount,// default value=0
            pattern,
            color,
            description ,
            size,quantity
        } = req.body;

        const availableInProduct=await pool.query("SELECT * FROM products P,feature F , sizes S , colors C WHERE P.product_id=F.product_id and  P.category_id=$1   and P.product_name=$2 and F.color_id=C.color_id and F.size_id=S.size_id AND C.color=$3 and S.size=$4",[category_id,product_name,color,size]);
        if(availableInProduct.rows.length===0){
                    
        const prId=await pool.query("INSERT INTO products (product_name, category_id, price,discount, description) VALUES($1,$2,$3,$4,$5) RETURNING product_id",
        [product_name,category_id,price ,discount,description]);
        console.log("prid",prId.rows[0].product_id);
        const productId=prId.rows[0].product_id;
        console.log(productId);
        
        const colorResult=await pool.query("SELECT color_id from colors WHERE color=$1",[color]);
        const sizeResult=await pool.query("SELECT size_id from sizes WHERE size=$1",[size]);
        const size_id=sizeResult.rows[0].size_id;
        const color_id=colorResult.rows[0].color_id;
        await pool.query("INSERT INTO feature(product_id,size_id,quantity,color_id) values($1,$2,$3,$4)",[productId,size_id,quantity,color_id]);
               

            console.log('adminToken,',req.admin);
            const adminToken=req.admin;
       return res.status(200).json({message: 'New product added successfully!',adminToken});
            }
        else{
            return res.status(500).json({message: 'Product already available!',adminToken});
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }                    
});

adminRouter.get('/dashboard' , adminTokenValidator , async (req , res) => {
    const adminToken=req.admin;
    try {
        const productsAll = await pool.query('SELECT * FROM products');//anasayfada yayınlanan ürünler 
        // bu dashboard'da toplam satılan ürün sayısı, kazanılan toplam miktar, ve ürünlerin bulunduğu bir sekme yer alacak.
        const products  = productsAll.rows;

        
        const preSignedUrlsArray = [];
        
        async function generatePreSignedUrls() {
          for (const d of products) {
            const productPhoto = `${d.category_id}-${d.product_name}`;
            const listStream = minioClient.listObjectsV2('ecommerce', productPhoto, true);
        
            const productUrls = [];
        
            await new Promise((resolve, reject) => {
              listStream.on('data', async (obj) => {
                try {
                  const photoUrlMinio = await minioClient.presignedGetObject('ecommerce', obj.name, 3600);
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
        
        const productsWithUrls = products.map((item, index) => ({
          ...item,
          photoUrls: preSignedUrlsArray[index],
        }));
        
        //console.log(productsWithUrls);
        




        res.status(200).json({products:productsWithUrls , adminToken}); 
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    } 
    
});


adminRouter.get('/products/:product_id/:feature_id', adminTokenValidator , async (req, res) => {
    const{product_id,feature_id} = req.params;
    const adminToken=req.admin;
    try {

        const product = await pool.query('SELECT P.*,S.size,C.color,F.quantity FROM products P,feature F ,sizes S, colors C WHERE P.product_id = $1 and P.product_id=F.product_id  And F.size_id=S.size_id and C.color_id=F.color_id and F.feature_id=$2' , [product_id,feature_id]);
        const productDetails=product.rows;
        return res.status(200).json({productDetails,adminToken});
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    } 
});


adminRouter.delete('/delete-a-product/:product_id' , adminTokenValidator,  async (req, res) => {

    const {product_id} = req.params;
    const adminToken=req.admin;
    try {

        const product = await pool.query('SELECT * FROM products WHERE product_id = $1', [product_id]);

        if (product.rows.length === 0) {
            
            return res.status(404).send('Product not found');
        }
        
        await pool.query('DELETE FROM products WHERE product_id = $1' , [product_id]);//featureden de siler
        return res.status(200).send({message:'product deleted successfully',adminToken});
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
})

adminRouter.put('/patch-a-product/:product_id' , adminTokenValidator , async (req , res) => {// ürünün genel özelliklerini günceller
    const {product_id} = req.params;
    const adminToken=req.admin;
    const { product_name,
        category_id,
        price,
        quantity,
        color,
        size,
        discount,
        pattern,
        description,
        productOfTheWeek 
    } = req.body;

    const product = await pool.query('SELECT * FROM products where product_id = $1' , [product_id]);

    if(product.rows.length === 0){
        return res.status(404).send('Note not found')
    }

    await pool.query('UPDATE products SET product_name = $1, category_id = $2, price = $3,  pattern = $4, description = $5,discount=$7 ,isProductOfTheWeek=$8 WHERE product_id = $6' , 
    [ product_name, category_id, price,  pattern, description, product_id,discount,productOfTheWeek]);

    return res.status(200).json({message: 'Product updated successfully',adminToken});
});





adminRouter.get('/getOrders',adminTokenValidator,async(req,res)=>{

    try {
        const adminToken=req.admin;
        
        await pool.query('SELECT * from orders where  isOrdered=true and isAccepted=false');//!! and isAccepted=false;
        return res.status(200).json({adminToken:adminToken});

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});
adminRouter.post('/acceptOrders:order_id',adminTokenValidator,async(req,res)=>{

    try {
        const adminToken=req.admin;
        const{order_id}=req.params;
        const{acceptButton,feature_id,quantity}=req.body;
        if(acceptButton===true){
            await pool.query('UPDATE orders SET isAccepted=true Where order_id=$1',[order_id]);
            //!await pool.query('UPDATE orders SET isAccepted=false WHERE order_id=$1',[order_id]);

            for (const stock of availableStock) {
                const feature_id = stock.feature_id;
                const quantity = stock.quantity;
                const product_id=stock.product_id;
                const result = await pool.query('SELECT quantity from feature  where feature_id = $1', [feature_id]);
                const numberOfBestSellerResult=await pool.query('SELECT bestSeller from products WHERE product_id=$1',[product_id]);
                const numberOBS=numberOfBestSellerResult.rows[0].bestSeller;

                const availableStock = result.rows[0].quantity;
              
                
                const setquantity = availableStock - quantity;
                 const newNumberOBS=numberOBS+quantity;
                await pool.query('UPDATE products SET bestSeller=$1 WHERE product_id=$2',[newNumberOBS,product_id]);
                await pool.query('UPDATE feature SET quantity = $1 WHERE feature_id = $2', [setquantity, feature_id]);
            }}
        return res.status(200).json({adminToken:adminToken,message:"Sipariş onaylandı, stok güncellendi"});

    }
     catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});








adminRouter.get('/getOrders/:order_id',adminTokenValidator,async(req,res)=>{

    try {
        const{order_id}=req.params;
        const adminToken=req.admin;
        const orderFeature=await pool.query('select * from orders o,order_items I where o.order_id=I.order_id and isOrdered=true and o.order_id=$1;',[order_id]);
        return res.status(200).json({orderFeature:orderFeature.rows,adminToken:adminToken});

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});


//genel ürün  ve alt dalı

adminRouter.get('/products/:product_id',adminTokenValidator,async(req,res)=>{//ürünün üzerine tıklayınca gelen ürün dataları
    try {
        const adminToken=req.admin;
        const{product_id}=req.params;
        const rawData = await pool.query('SELECT * FROM products P,feature F, colors C,sizes S WHERE P.product_id=$1 AND F.product_id=P.product_id and C.color_id=F.color_id and S.size_id=F.size_id',[product_id]);
        let data=rawData.rows;
        const productQuantity=data.quantity;


        const preSignedUrlsArray = [];

    async function generatePreSignedUrls() {
      for (const d of data) {
        const productPhoto = `${d.category_id}-${d.product_name}-${d.color}`;
        //console.log(productPhoto);

        const listStream = minioClient.listObjectsV2('ecommerce', productPhoto, true);

        const productUrls = [];

        await new Promise((resolve, reject) => {
          listStream.on('data', async (obj) => {
            try {
              
              const photoUrlMinio = await minioClient.presignedGetObject('ecommerce', obj.name, 3600);

              // Customize the data associated with each photo URL
              const photoData = {
                url: photoUrlMinio,
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
         return res.status(200).json({productDetails:productsWithUrls,adminToken})
        

        
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
    
});
// genel ürün güncelleme
adminRouter.put('/update-product/:product_id:/feature_id', adminTokenValidator, async (req, res) => {
    try {
        const { product_id } = req.params;
        const updatedFeature = req.body; // Assuming the request body is an array of JSON objects
        const adminToken=req.admin;
        //updatedFeature : [{newSize:'XL',newQuantity:17,newColor:'mor'},{newSize:'XLL',newQuantity:11,newColor:'pembe'},{newSize:'L',newQuantity:15,newColor:'sarı'}]
        for (const feature of updatedFeature) {
            const newQuantity = feature.newQuantity;
            const newSize = feature.newSize;
            const newColor=feature.newColor;
                const sizeResult=await pool.query('SELECT size_id from sizes Where size=$1',[newSize]);
                const colorResult=await pool.query('SELECT color_id from colors Where color=$1',[newColor]);
                const size_id=sizeResult.rows[0].size_id;
                const color_id=colorResult.rows[0].color_id;
                await pool.query('UPDATE feature SET quantity=$1 WHERE product_id=$2 and size_id=$3,and color_id=$4 ', [newQuantity, product_id,size_id,color_id]);
            /*
                const existingFeature = await pool.query('SELECT * FROM feature F,size S WHERE F.product_id=$1 AND S.size=$2 AND F.size_id=S.size_id', [product_id, newSize]);

                if (existingFeature.rows.length > 0) {
                    const sizeResult=await pool.query('SELECT size_id from sizes Where size=$1',[newSize]);
                    const size_id=sizeResult.rows[0].size_id;
                    await pool.query('UPDATE feature SET quantity=$1 WHERE product_id=$2 AND size_id=$3', [newQuantity, product_id, size_id]);
                } else {
                    const sizeResult=await pool.query('INSERT INTO sizes(size) values($1) returning size_id',[newSize]);
                    const size=sizeResult.rows[0].size_id;
                    await pool.query('INSERT INTO feature(product_id, size_id, quantity) VALUES($1, $2, $3)', [product_id, size, newQuantity]);
                }*/
            
        }

        return res.status(200).json({
            adminToken,
            message: 'Ürün başarıyla güncellendi'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

adminRouter.get('/fetchCustomers',adminTokenValidator,async(req,res)=>{
    try {
        const adminToken=req.admin;
        const customers=await pool.query('SELECT * FROM customers');
        return res.status(200).json({
            data:customers.rows,
            adminToken
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

adminRouter.delete('/delete-customer/:customer_id',adminTokenValidator,async(req,res)=>{
    try {
        const adminToken=req.admin;
        const{customer_id}=req.params;
        await pool.query('DELETE FROM customers WHERE customer_id=$1',[customer_id]);
        return res.status(200).json({
            adminToken,
            message:'Müşteri Başarıyla Silindi'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});

//olmayan ürün için
adminRouter.post('/add-feature',adminTokenValidator,async(req,res)=>{
    try {
        const adminToken=req.admin;
        const{product_id,quantity,size,color}=req.body;

        const sizeResult=await pool.query('SELECT size_id FROM sizes WHERE size=$1',[size]);
        const colorResult=await pool.query('SELECT color_id FROM colors WHERE color=$1',[color]);
        const size_id=sizeResult.rows[0].size_id;
        const color_id=colorResult.rows[0].color_id;
        
        await pool.query('INSERT INTO feature(product_id,quantity,size_id,color_id) values($1,$2,$3,$4)',[product_id,quantity,size_id,color_id]);

        return res.status(200).json({
            adminToken,
            message:'ürün başarıyla eklendi'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});









module.exports = adminRouter;









