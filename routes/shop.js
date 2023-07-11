const shopRouter = require('express').Router();


shopRouter.get('/' , (req , res) =>{
    res.status(200).send('hi');
})

module.exports = shopRouter;