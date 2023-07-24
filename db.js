const Pool = require('pg').Pool;
/*
const pool = new Pool({
  user: "postgres",
  password: "o547988633",
  host: "localhost",
  port:"5432",
  database: "vobe_ecom16thjuly"  
});
*/



const pool = new Pool({
  user: "postgres",
  password: "0539",
  host: "localhost",
  port:"5432",
  database: "ecom2"  
});
module.exports = pool;