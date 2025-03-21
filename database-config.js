import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const companies = [
    ["Alphabet Inc.", "GOOGL"],
    ["Amazon.com Inc.", "AMZN"],
    ["Apple Inc.", "AAPL"],
    ["Bank of America Corp","BAC"],
    ["Exxon Mobil Corporation", "XOM"],
    ["Ferrari NV","RACE"],
    ["Ford Motor Company","F"],
    ["Johnson & Johnson", "JNJ"],
    ["JPMorgan Chase & Co.", "JPM"],
    ["Meta Platforms Inc.", "META"],
    ["Microsoft Corporation", "MSFT"],
    ["NVIDIA Corporation", "NVDA"],
    ["Procter & Gamble Co.", "PG"],
    ["Salesforce.com","CRM"],
    ["Taiwan Semiconductor Manufacturing Company", "TSM"],
    ["Tesla Inc.", "TSLA"],
    ["UnitedHealth Group Incorporated", "UNH"],
    ["Visa Inc.", "V"],
    ["Walmart Inc.", "WMT"],
    ["Walt Disney Company", "DIS"],
];

const con = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
});

con.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL");

    con.query("CREATE DATABASE IF NOT EXISTS Stocks", err => {
        if (err) throw err;
        console.log("Database ready");
        
        const condb = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: "Stocks"
        });
        
        condb.connect(err => {
            if (err) throw err;
            console.log("Connected to Stocks database");
            
            const tableQuery = `CREATE TABLE IF NOT EXISTS StockNames (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_name VARCHAR(255) UNIQUE,
                ticker VARCHAR(255) UNIQUE
            )`;
            
            condb.query(tableQuery, err => {
                if (err) throw err;
                console.log("Table ready");
                
                condb.query("SELECT COUNT(*) AS count FROM StockNames", (err, result) => {
                    if (err) throw err;
                    const rowCount = result[0].count;
                    if (rowCount !== companies.length) {
                        condb.query("TRUNCATE TABLE StockNames", err => {
                            if (err) throw err;
                            console.log("Table cleared");
                            
                            const insertQuery = "INSERT INTO StockNames (company_name, ticker) VALUES ?";
                            condb.query(insertQuery, [companies], (err, result) => {
                                if (err) throw err;
                                console.log(`Inserted ${result.affectedRows} records`);
                                condb.end();
                            });
                        });
                    } else {
                        condb.end();
                    }
                });
            });
        });
    });
});
