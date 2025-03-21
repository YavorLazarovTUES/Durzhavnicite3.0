import mysql from 'mysql2';
import dotenv from 'dotenv';
import { fetchArticles } from "./scraper.js";
dotenv.config();

function insertArticles(condb) {
    condb.query("DELETE FROM table_name;", async (err,arg)=>{
        if (err) throw err;
    });
    condb.query("SELECT id, ticker, article_ids FROM StockNames", async (err, stocks) => {
        if (err) throw err;

        for (const stock of stocks) {
            const articles = await fetchArticles(stock.ticker);
            if (!articles || articles.length === 0) continue;

            const insertArticleQuery = "INSERT INTO Articles (title, body) VALUES ?";
            const articleData = articles.map(([title, ...body]) => [title, body.join(" ")]);
            
            condb.query(insertArticleQuery, [articleData], (err, result) => {
                if (err) throw err;
                console.log(`Inserted ${result.affectedRows} articles for ${stock.ticker}`);
                
                // Get inserted article IDs
                condb.query("SELECT id FROM Articles ORDER BY id DESC LIMIT ?", [articles.length], (err, articleRows) => {
                    if (err) throw err;

                    const newArticleIds = articleRows.map(row => row.id);
                    const existingArticleIds = JSON.parse(stock.article_ids || "[]");
                    const updatedArticleIds = [...newArticleIds, ...existingArticleIds].slice(0, 5);

                    condb.query("UPDATE StockNames SET article_ids = ? WHERE id = ?", [JSON.stringify(updatedArticleIds), stock.id], err => {
                        if (err) throw err;
                        console.log(`Updated article links for ${stock.ticker}`);
                    });
                });
            });
        }
    });
}

const condb = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: "Stocks"
        });
insertArticles(condb);