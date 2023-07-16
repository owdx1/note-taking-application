/*Burada
Kullanıcı:
- sepetine ürün ekler
-ürün siler

*/

const shopRouter = require('express').Router();

const pool = require('../db');

const accessTokenValidator = require('../middlewares/accessTokenValidator');
const refreshTokenValidator = require('../middlewares/refreshTokenValidator');

shopRouter.get('/basket',accessTokenValidator,refreshTokenValidator,async(req,res)=>{
    try {
        const {customer}=req;
        const{id}=customer;
        const newestOrder = await pool.query('SELECT * FROM orders  WHERE customer_id=$1 ORDER BY order_date DESC' , [customer.id]);
        const newOrderId = newestOrder.rows[0].order_id;//en son siparişin idsi
        
        const cart=await pool.query("SELECT P.product_name,p.color,o.price,F.size_i,F.size,F.quantity from order_items o,products p ,feature F WHERE order_id=$1 and o.product_id=p.product_id and p.product_id=F.product_id",[newOrderId]);

        const data=cart.rows;
        
        return res.status(200).json({data});
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:'Cannot server error'});
    }
})
shopRouter.post('/add-basket',accessTokenValidator,refreshTokenValidator,async(req,res)=>{
    try {

        const {customer}=req;
        const{id}=customer;
        const {product_id,quantity}=req.body;//hangi ürün ve ne kadar olunduğu arayüzden alınacak ----sanırım body !!!!!!
        //size de alınacak
        const query=await pool.query("SELECT * FROM orders where customer_id=$1 ",[id]);
        if(query.rows.length===0){
          const newQuery=await pool.query("INSERT INTO orders(customer_id,total_amount) VALUES($1,$2)",[id,0]);
        }
        
        

          const newestOrder = await pool.query('SELECT * FROM orders  WHERE customer_id=$1 ORDER BY order_date DESC' , [customer.id]);
          const newOrderId = newestOrder.rows[0].order_id;//en son siparişin idsi
         

          const priceResult=await pool.query("SELECT price from products where product_id=$1",[product_id]);
          const price = parseFloat(priceResult.rows[0].price);// eklencek ürünün fiyatı

          const avilableProduct=await pool.query("SELECT * from order_items I, products P,feature F where P.product_id=$1 AND I.order_id=$2 AND I.product_id=P.product_id AND P.product_id=F.product_id  ",[product_id,newOrderId]);
          //!!!!!!!!!!!!!!!!!!!!
          if(avilableProduct.rows.length===0){//eğer daha önce  sepette yoksa ekle , varsa üzerine ekle
            const newQuery=await pool.query("INSERT INTO order_items(order_id,product_id,quantity,price) values($1,$2,$3,$4)",[newOrderId,product_id,quantity,price*quantity]);
          }
          else{
            //const oldPriceResult=await pool.query("SELECT price FROM order_items WHERE order_id = $1 AND product_id = $2", [or_id, product_id]);
            const oldQuantityResult=await pool.query("SELECT quantity from order_items Where order_id=$1 AND product_id=$2",[newOrderId,product_id]);
            let newPrice;
            let newQuantity;
            const oldQuantity=parseInt(oldQuantityResult.rows[0].quantity);
            //const oldPrice = parseFloat(oldPriceResult.rows[0].price);
            newQuantity=oldQuantity+quantity;
            newPrice = newQuantity*price;
             const updateQuery=await pool.query("UPDATE order_items SET quantity=$1,price=$2 where product_id=$3 and order_id=$4",[newQuantity,newPrice,product_id,newOrderId]);
          }
          const productNumResult = await pool.query("SELECT SUM(quantity) FROM order_items WHERE order_id = $1", [newOrderId]);
          let productNum=productNumResult.rows[0].sum;
           console.log("real:",productNum);
          
          return res.status(200).json({message: 'Added in basket  successfully' , productNum: productNum});

        //const idQuery=await pool.query("SELECT * FROM order_items ");
        //res.json(idQuery.rows);


        
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:'Cannot Added'});
    }
});//test edilecek!!!!!!!!!!!!!!!!!!!!!!!

shopRouter.delete('/delete-product/:product_id',accessTokenValidator,refreshTokenValidator,async(req,res)=>{
    try {
        const{customer}=req;
        const{product_id}=req.params;
        const newestOrder = await pool.query('SELECT * FROM orders ORDER BY order_date DESC WHERE customer_id=$1' , [customer.id]);
          const newOrderId = newestOrder.rows[0].order_id;//en son siparişi listeler(son siparis id)

        const avilableProduct=await pool.query("SELECT * from order_items I, products P,feature F where product_id=$1 AND order_id=$2 AND I.product_id=P.product_id AND P.product_id=F.product_id  ",[product_id,newOrderId]);
        if(avilableProduct.rows.length===0){        return res.status(404).send('Note not found');    }
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
        const{product_id}=req.params;
        const {quantity}=req.body;
        const newestOrder = await pool.query('SELECT * FROM orders  WHERE customer_id=$1 ORDER BY order_date DESC' , [customer.id]);
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




shopRouter.get('/' , async (req , res) => {

    try {

        const rawData = await pool.query('SELECT * FROM products');// ürünün genel görüntüsü
        const data = rawData.rows;
        

        return res.status(200).json({data})


    } catch (error) {
        console.error(error);
        
        return res.status(500).json({message: "An error occured while fetching the products where quantity > 0"})
        
    }


});
shopRouter.get('/:product_id',async(req,res)=>{//ürünün üzerine tıklayınca gelen ürün dataları
    try {
        const{product_id}=req.params;
        const rawData = await pool.query('SELECT * FROM products P,feature F WHERE P.product_id=$1 AND F.product_id=P.product_id',[product_id]);
        let data=rawData.rows;
        if(rawData.rows[0].category_id===6){//available sizelari döndürüyor
            const sizeIsNotNull = data
            .filter(item => item.size_i !== null)
                .map(item => item.size_i);

            console.log(sizeIsNotNull);
            return res.status(200).json({sizeIsNotNull})
        }else{
            const sizeIsNotNull = data
            .filter(item => item.size !== null)
                .map(item => item.size);

            console.log(sizeIsNotNull);
            return res.status(200).json({sizeIsNotNull})
        }

        
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
})

module.exports = shopRouter;