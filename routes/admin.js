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
        id : "simdilik dursun"
    } // buraya ne koyacağımdan emin değilim

    const adminToken = jwt.sign(payload , process.env.ADMIN_TOKEN_SECRET , {expiresIn: "1d"});
    
    res.status(200).json({message: "admin successfully logged in" , adminToken : adminToken})

});
// admin logout front endde gerçekleştirilecek

adminRouter.post('/add-a-product' ,adminTokenValidator , async (req , res) => {
    const {admin} = req;
    console.log(admin); // bu admin bilgilerini içeren kısım, customer bilgilerine ihtiyacımız var ama admin bilgilerine ihtiyacımız tam
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

                const availableInProduct=await pool.query("SELECT * FROM products P,feature F WHERE P.product_id=F.product_id and P.category_id=$1 and P.color=$2 and F.size=$3 ",[category_id,color,size]);
            if(availableInProduct.rows.length===0){
                    
           const prId=await pool.query("INSERT INTO products (product_name, category_id, price,discount, color, description) VALUES($1,$2,$3,$4,$5,$6) RETURNING product_id",
           [product_name,category_id,price ,discount,color   ,description]);
           console.log("prid",prId.rows[0].product_id);
           const productId=prId.rows[0].product_id;
           console.log(productId);

               if(category_id===6){
                   
                   
                   await pool.query("INSERT INTO feature(product_id,size_i,quantity) values($1,$2,$3)",[productId,size,quantity]);
               }
               else{
                  
                  
                   
                   await pool.query("INSERT INTO feature(product_id,size,quantity) values($1,$2,$3)",[productId,size,quantity]);
               }



       return res.status(200).json({message: 'New product added successfully!'});
            }
        else{
            return res.status(500).json({message: 'Product already available!'});
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }                    
});

adminRouter.get('/dashboard' , adminTokenValidator , async (req , res) => {
    const {admin} = req;
    try {
        const productsAll = await pool.query('SELECT * FROM products');//anasayfada yayınlanan ürünler 
        // bu dashboard'da toplam satılan ürün sayısı, kazanılan toplam miktar, ve ürünlerin bulunduğu bir sekme yer alacak.
        const products  = productsAll.rows;

        res.status(200).json({products , admin}); 
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    } 
    
});

adminRouter.get('/products/:product_id', adminTokenValidator , async (req, res) => {
    const{product_id} = req.params;
    try {

        const product = await pool.query('SELECT * FROM products WHERE p.product_id = $1 and p.product_id=f.product_id' , [product_id]);
        return res.status(200).json(product.rows);
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    } 
});


adminRouter.get('/products/:product_id/:feature_id', adminTokenValidator , async (req, res) => {
    const{product_id,feature_id} = req.params;
    try {

        const product = await pool.query('SELECT * FROM products WHERE p.product_id = $1 and p.product_id=f.product_id and f.feature_id=$2' , [product_id,feature_id]);
        return res.status(200).json(product.rows);
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    } 
});


adminRouter.delete('/delete-a-product/:product_id' , adminTokenValidator,  async (req, res) => {

    const {product_id} = req.params;

    try {

        const product = await pool.query('SELECT * FROM products WHERE product_id = $1', [product_id]);

        if (product.rows.length === 0) {
            
            return res.status(404).send('Product not found');
        }
        
        await pool.query('DELETE FROM products WHERE product_id = $1' , [product_id]);//featureden de siler
        return res.status(200).send('product deleted successfully');
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
})

adminRouter.post('/patch-a-product/:product_id' , adminTokenValidator , async (req , res) => {// ürünün genel özelliklerini günceller
    const {product_id} = req.params;

    const { product_name,
        category_id,
        price,
        quantity,
        color,
        size,
        discount,
        pattern,
        description 
    } = req.body;

    const product = await pool.query('SELECT * FROM products where product_id = $1' , [product_id]);

    if(product.rows.length === 0){
        return res.status(404).send('Note not found')
    }

    await pool.query('UPDATE products SET product_name = $1, category_id = $2, price = $3, color = $4, pattern = $5, description = $6,discount=$8 WHERE product_id = $7' , 
    [ product_name, category_id, price, color, pattern, description, product_id,discount]);

    return res.status(200).json({message: 'Product updated successfully'});
});

adminRouter.get('/patch-a-product/:product_id/:feature_id' , adminTokenValidator , async (req , res) => {
    const {product_id} = req.params;
    const { size,
        quantity
    } = req.body;



}) 

adminRouter.put('/product-feature/:product_id/:feature_id',adminTokenValidator,async(res,req)=>{//ürünün alt özelliklerini günceller
    try {
        const{quantity}=req.body;
        const query=await pool.query("UPDATE feature SET quantity=$1 WHERE product_id=$2 AND feature_id=$3",[quantity,product_id,feature_id]);

       
        return res.status(200).json({message: 'INNER product updated successfully'});

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});

adminRouter.get('/getOrders',adminTokenValidator,async(req,res)=>{

    try {
        const {adminToken}=req;
        
        await pool.query('SELECT * from orders where  isOrdered=true');//!! and isAccepted=false;
        return res.status(200).json({adminToken:adminToken});

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});
adminRouter.post('/acceptOrders',adminTokenValidator,async(req,res)=>{

    try {
        const {adminToken}=req;
        const{acceptButton,order_id,feature_id,quantity}=req.body;
        if(acceptButton===true){
            await pool.query('UPDATE orders SET isAccepted=true Where order_id=$1',[order_id]);
            //!await pool.query('UPDATE orders SET isAccepted=false WHERE order_id=$1',[order_id]);

            for (const stock of availableStock) {
                const feature_id = stock.feature_id;
                const quantity = stock.quantity;
                const product_id=stock.product_id;
                const result = await pool.query('SELECT quantity from feature where feature_id = $1', [feature_id]);
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
adminRouter.put('/set-products-of-week/:product_id',adminTokenValidator,async(req,res)=>{
    try {
        const{product_id}=req.params;
        await pool.query('UPDATE products SET isProductOfTheWeek=true WHERE product_id=$1',[product_id]);


        return res.status(200).json({adminToken:adminToken,message:"Ürün eklendi"});

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
})







adminRouter.get('/getOrders/:order_id',adminTokenValidator,async(req,res)=>{

    try {
        const{order_id}=req.params;
        const {adminToken}=req;
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
        const{product_id}=req.params;
        const rawData = await pool.query('SELECT * FROM products P,feature F WHERE P.product_id=$1 AND F.product_id=P.product_id',[product_id]);
        let data=rawData.rows;
        const {adminToken}=req;

        const productQuantity=data.quantity;


        
            
                const productUrlsArray = data.map(item => item.producturl);

                console.log('before',productUrlsArray);

                const preSignedUrls = [];

                for (const productUrl of productUrlsArray) {
                  const photoUrl = await minioClient.presignedGetObject('ecommerce', productUrl, 3600);
                  preSignedUrls.push(photoUrl);
                }



                const transformedData = data.map(({ size, quantity,feature_id }) => ({ size, quantity ,feature_id}));

                const productsWithUrls = transformedData.map((item, index) => ({
                  ...item,
                  photoUrl: preSignedUrls[index],
                }));  
            console.log(productsWithUrls);
            return res.status(200).json({transformedData:productsWithUrls,adminToken:adminToken})
        

        
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});
// genel ürün güncelleme
adminRouter.put('/update-product/:product_id', adminTokenValidator, async (req, res) => {
    try {
        const { product_id } = req.params;
        const updatedFeature = req.body; // Assuming the request body is an array of JSON objects
        const { adminToken } = req;
        //updatedFeature : [{newSize:'XL',newQuantity:17},{newSize:'XLL',newQuantity:11},{newSize:'L',newQuantity:15}]
        for (const feature of updatedFeature) {
            const newQuantity = feature.newQuantity;
            const newSize = feature.newSize;

            if (newSize === null) {
                await pool.query('UPDATE feature SET quantity=$1 WHERE product_id=$2 ', [newQuantity, product_id]);
            } else {
                const existingFeature = await pool.query('SELECT * FROM feature WHERE product_id=$1 AND size=$2', [product_id, newSize]);

                if (existingFeature.rows.length > 0) {
                    await pool.query('UPDATE feature SET quantity=$1 WHERE product_id=$2 AND size=$3', [newQuantity, product_id, newSize]);
                } else {
                    await pool.query('INSERT INTO feature(product_id, size, quantity) VALUES($1, $2, $3)', [product_id, newSize, newQuantity]);
                }
            }
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







module.exports = adminRouter;









