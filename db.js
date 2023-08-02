const Pool = require('pg').Pool;

const pool = new Pool({
  user: "postgres",
  password: "o547988633",
  host: "localhost",
  port:"5432",
  database: "vobe24th"  
});



/*
const pool = new Pool({
  user: "postgres",
  password: "0539",
  host: "localhost",
  port:"5432",
  database: "ecom3"  
});*/
module.exports = pool;