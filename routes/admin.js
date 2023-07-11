const adminRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const adminTokenValidator = require('../middlewares/adminTokenValidator');
const pool = require('../db');





adminRouter.post('/login' ,  (req , res) => {
    const {username , password} = req.body;

    if(username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD){
        res.status(401).send('Unauthorized access');
    }
    const payload = {
        id : "simdilik dursun"
    } // buraya ne koyacağımdan emin değilim

    const adminToken = jwt.sign(payload , process.env.ADMIN_TOKEN_SECRET , {expiresIn: "1d"});
    
    res.status(200).json({message: "admin successfully logged in" , adminToken : adminToken})

})

adminRouter.post('/add-a-product' , adminTokenValidator , async (req , res) => {
    const {admin} = req;
    console.log(admin); // bu admin bilgilerini içeren kısım, customer bilgilerine ihtiyacımız var ama admin bilgilerine ihtiyacımız tam
                        // anlamıyla yok çünkü adminin kim olduğunu ve bilgilerini biliyoruz zaten. customer için kesinlikle yapılması
                        // gereken bu durum admin için geçerli değil ama yine de burda dursun el alışkanlığı olarak.
    
    try {
        const { product_name,
            category_id,
            price,
            quantity,
            color,
            size,
            pattern,
            description 
        } = req.body;
        const product_size = size;
        const newQuery = (category_id == 2) ? 
            await pool.query("INSERT INTO products (product_name, category_id, price,quantity, color, size_i, pattern, description) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
                [product_name,category_id,price,quantity ,color ,product_size ,pattern ,description])
                :
            await pool.query("INSERT INTO products (product_name, category_id, price, quantity, color, size, pattern, description) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
                [product_name,category_id,price,quantity ,color ,product_size ,pattern ,description]);

        return res.status(200).json({message: 'New product added successfully!'})

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }                    
});

adminRouter.get('/dashboard' , adminTokenValidator , async (req , res) => {
    const {admin} = req;
    try {
        const products = await pool.query('SELECT * FROM products');
        // bu dashboard'da toplam satılan ürün sayısı, kazanılan toplam miktar, ve ürünlerin bulunduğu bir sekme yer alacak. 

        




        res.status(200).json(products.rows, admin); 
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
        
        await pool.query(`DELETE FROM products WHERE product_id = $1` , [product_id]);
        return res.status(200).send('Note deleted successfully');
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
})

adminRouter.post('/patch-a-note/:note_id' , adminTokenValidator , async (req , res) => {
    const {product_id} = req.params;

    const { product_name,
        category_id,
        price,
        quantity,
        color,
        size,
        pattern,
        description 
    } = req.body;

    const product = await pool.query('SELECT * FROM customers where product_id = $1' , [product_id]);

    if(note.rows.length === 0){
        return res.status(404).send('Note not found')
    }

    await pool.query('UPDATE notes SET product_name = $1, category_id = $2, price = $3, quantity = $4, color = $5, size = $6, pattern = $7, description = $8 WHERE product_id = $9' , 
    [ product_name, category_id, price, quantity, color, size, pattern, description, product_id]);

    return res.status(200).json({message: 'Product updated successfully'});
}) 



module.exports = adminRouter;