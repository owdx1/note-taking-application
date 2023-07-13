const shopRouter = require('express').Router();
const { raw } = require('mysql');
const pool = require('../db');


shopRouter.get('/' , async (req , res) => {

    try {

        const rawData = await pool.query('SELECT * FROM products');
        const data = rawData.rows;

        return res.status(200).json({data})


    } catch (error) {
        console.error(error);
        
        return res.status(500).json({message: "An error occured while fetching the products where quantity > 0"})
        
    }

})

module.exports = shopRouter;