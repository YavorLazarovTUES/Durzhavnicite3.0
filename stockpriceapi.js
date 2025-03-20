import dotenv from 'dotenv'
dotenv.config();
import { restClient } from '@polygon.io/client-js';
const rest = restClient(process.env.POLY_API_KEY);

function formatUnixTimestamp(unixMsec) {
    const date = new Date(unixMsec);
    const options = { month: "short", day: "2-digit" };
    const formattedDate = date.toLocaleDateString("en-US", options);
    const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of year
    return `${formattedDate} '${year}`;
}


export async function fetchStockData(stock_name) {
    try {
        const timeframe = 3;
        const date = new Date();
        const today = date.toISOString().split('T')[0];
        let moago = new Date();
        moago.setMonth(moago.getMonth() - timeframe );
        const prev_month = moago.toISOString().split('T')[0];

      const data = await rest.stocks.aggregates(
        stock_name,
        1,
        "day",
        prev_month,
        today,
        {
          adjusted: "true",
          sort: "asc",
          limit: 730,
        }
      );
      let stock_price_array = [];
      stock_price_array = data.results.map(result => result.c);
      let trade_days = [];
      trade_days = data.results.map(result => result.t);
      trade_days = trade_days.map(formatUnixTimestamp)
      let returnarr =[stock_price_array,trade_days]
      return returnarr;
    } catch (error) {
      console.error("An error happened:", error);
    }
  }