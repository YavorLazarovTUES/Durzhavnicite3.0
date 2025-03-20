import express from "express"
import {fetchStockData} from "./stockpriceapi.js"
const app=express()


app.set('view engine', 'ejs')
app.get("/:stockname", async (req, res) => {
  let array= await fetchStockData(req.params.stockname);
  console.log(array[1]);
  res.render("test", { stock_price_array:array[0],  stock_name:req.params.stockname,  days:array[1]}); // Pass JSON string
});

app.listen(3000, () => {  
  console.log("Server running on port 3000");
});
