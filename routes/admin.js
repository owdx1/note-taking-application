const adminRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const adminTokenValidator = require('../middlewares/adminTokenValidator');
const pool = require('../db');








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
    
})

adminRouter.get('/products/:product_id', adminTokenValidator , async (req, res) => {
    const{product_id} = req.params;
    try {

        const product = await pool.query('SELECT * FROM products WHERE product_id = $1' , [product_id]);
        return res.status(200).json(product.rows);
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    } 
})

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
        const{acceptButton,order_id}=req.body;
        if(acceptButton===true){
            await pool.query('UPDATE orders SET isAccepted=true Where order_id=$1',[order_id]);
        }
        return res.status(200).json({adminToken:adminToken,message:"Sipariş onaylandı"});

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});


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




module.exports = adminRouter;









