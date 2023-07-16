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
            pattern,
            color,
            description ,
            size,quantity,
        } = req.body;

        
       /* const avilableProduct=await pool.query("SELECT * from products where product_id=$1 ",[product_id]);
        const newQuery = (category_id == 2) ? 
            await pool.query("INSERT INTO products (product_name, category_id, price, color, pattern, description) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
                [product_name,category_id,price ,color  ,pattern ,description])
                :
            await pool.query("INSERT INTO products (product_name, category_id, price, color, pattern, description) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
                [product_name,category_id,price ,color  ,pattern ,description]);
            */  
           await pool.query("INSERT INTO products (product_name, category_id, price, color, description) VALUES($1,$2,$3,$4,$5) RETURNING *",
            [product_name,category_id,price ,color   ,description]);
            const product_id=await pool.query("SELECT product_id FROM products WHERE product_name=$1 AND category_id=$2 AND price=$3 AND color=$4 AND description=$5",[product_name,category_id,price ,color   ,description]);
            const productId=product_id.rows[0].product_id;
            console.log(productId);
                if(category_id===6){
                    
                    // ürün varsa diye kontrol etmeli burda
                    await pool.query("INSERT INTO feature(product_id,size_i,quantity) values($1,$2,$3)",[productId,size,quantity]);
                }
                else{
                   
                    // ürün varsa diye kontrol etmeli
                    
                    await pool.query("INSERT INTO feature(product_id,size,quantity) values($1,$2,$3)",[productId,size,quantity]);
                }



        return res.status(200).json({message: 'New product added successfully!'})

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
})




module.exports = adminRouter;









