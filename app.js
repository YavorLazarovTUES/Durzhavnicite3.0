import express from "express"
import {fetchStockData} from "./stockpriceapi.js"
const app=express()
import mysql from 'mysql2' 
import dotenv from 'dotenv'
dotenv.config();

var db = mysql.createConnection({
    host:process.env.MYSQL_HOST ,
    user:process.env.MYSQL_USER,
    password:process.env.MYSQL_PASSWORD,
    database: "Stocks"
  });

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.set('view engine', 'ejs')
app.use(express.static("public"));
app.get("/:stockname", async (req, res) => {
  let array= await fetchStockData(req.params.stockname);
  const [cur_stock] = await db.promise().query("SELECT * FROM StockNames WHERE ticker = ?", [req.params.stockname]);
  const [companies] = await db.promise().query("SELECT * FROM StockNames",);
 res.render("test", { stock_price_array:array[0],  stockdata:cur_stock[0],  days:array[1],allstocks:companies}); // Pass JSON string
});

app.listen(3000, () => {  
  console.log("Server running on port 3000");
});
