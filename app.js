import express from "express"
const app=express()
import dotenv from 'dotenv'
dotenv.config();
import { restClient } from '@polygon.io/client-js';
import { resolve } from "chart.js/helpers";
const rest = restClient(process.env.POLY_API_KEY);

async function fetchStockData() {
  try {
    const data = await rest.stocks.aggregates(
      "AAPL",
      1,
      "day",
      "2025-01-01",
      "2025-02-01",
      {
        adjusted: "true",
        sort: "asc",
        limit: 35,
      }
    );
    let stock_price_array = [];
    stock_price_array = data.results.map(result => result.c); // Extract closing prices
    console.log("Updated Stock Prices in promise:", stock_price_array);
    return stock_price_array;
  } catch (error) {
    console.error("An error happened:", error);
  }
}

app.set('view engine', 'ejs')
let array=await fetchStockData()
app.get("/", (req, res) => {
  console.log("Updated Stock Prices:", array);
  res.render("test", { stock_price_array:array}); // Pass JSON string
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
