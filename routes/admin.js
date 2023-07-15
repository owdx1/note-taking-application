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

/*adminRouter.post('/add-a-product' , adminTokenValidator , async (req , res) => {
    console.log("buraya geldi");
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
            size_i,
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
});*/

adminRouter.post('/add-product', adminTokenValidator,async(req,res)=>{
    try {

        const {customer}=req;
        const{id}=customer;
        const {product_id,quantity}=req.body;//hangi ürün ve ne kadar olunduğu arayüzden alınacak ----sanırım body !!!!!!
        const query=await pool.query("SELECT * FROM orders where customer_id=$1 ",[id]);
        if(query.rows.length===0){
          const newQuery=await pool.query("INSERT INTO orders(customer_id,total_amount) VALUES($1,$2)",[id,0]);
        }
        else{
        

          const newestOrder = await pool.query('SELECT * FROM orders ORDER BY order_date DESC WHERE customer_id=$1' , [customer.id]);
          const newOrderId = newestOrder.rows[0].order_id;//en son siparişi listeler



          const priceResult=await pool.query("SELECT price from products where product_id=$1",[product_id]);
          const price = parseFloat(priceResult.rows[0].price);// eklencek ürünün fiyatı

          const avilableProduct=await pool.query("SELECT * from order_items where product_id=$1 AND order_id=$2",[product_id,newOrderId]);
          if(avilableProduct.rows.length===0){//eğer daha önce  sepette yoksa ekle , varsa üzerine ekle
            const newQuery=await pool.query("INSERT INTO order_items(order_id,product_id,quantity,price) values($1,$2,$3,$4)",[newOrderId,product_id,quantity,price*quantity]);
          }
          else{
            //const oldPriceResult=await pool.query("SELECT price FROM order_items WHERE order_id = $1 AND product_id = $2", [or_id, product_id]);
            const oldQuantityResult=await pool.query("SELECT quantity from order_items Where order_id=$1 AND product_id=$2",[or_id,product_id]);
            let newPrice;
            let newQuantity;
            const oldQuantity=parseInt(oldQuantityResult.rows[0].quantity);
            //const oldPrice = parseFloat(oldPriceResult.rows[0].price);
            newQuantity=oldQuantity+quantity;
            newPrice = newQuantity*price;
             const updateQuery=await pool.query("UPDATE order_items SET quantity=$1,price=$2 where product_id=$3 and order_id=$4",[newQuantity,newPrice,product_id,newOrderId]);
          }
        }
        const idQuery=await pool.query("SELECT * FROM order_items ");
        res.json(idQuery.rows);


        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});//

adminRouter.get('/dashboard' , adminTokenValidator , async (req , res) => {
    const {admin} = req;
    try {
        const productsAll = await pool.query('SELECT * FROM products');
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
        
        await pool.query(`DELETE FROM products WHERE product_id = $1` , [product_id]);
        return res.status(200).send('Note deleted successfully');
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
})

adminRouter.post('/patch-a-product/:product_id' , adminTokenValidator , async (req , res) => {
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
});

adminRouter.get('/patch-a-product/:product_id' , adminTokenValidator , async (req , res) => {
    const {product_id} = req.params;
    console.log(product_id);

}) // buna gerek var mı bakacaz



module.exports = adminRouter;