const adminRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const adminTokenValidator = require('../middlewares/adminTokenValidator');


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

    return res.send('urun eklendi')

})


module.exports = adminRouter;