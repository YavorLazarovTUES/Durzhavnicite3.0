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
            
            validateStockNamesSchema(condb);
        });
    });
});

function validateStockNamesSchema(condb) {
    condb.query("DESCRIBE StockNames", (err, rows) => {
        if (err) {
            console.log("StockNames table does not exist, creating...");
            createStockNamesTable(condb);
            return;
        }
        
        const existingColumns = rows.map(row => row.Field);
        const expectedColumns = { company_name: "VARCHAR(255) UNIQUE", ticker: "VARCHAR(255) UNIQUE", article_ids: "JSON" };
        const missingColumns = Object.keys(expectedColumns).filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length > 0) {
            console.log("StockNames table missing columns:", missingColumns.join(", "));
            missingColumns.forEach(column => {
                condb.query(`ALTER TABLE StockNames ADD COLUMN ${column} ${expectedColumns[column]}`, err => {
                    if (err) throw err;
                    console.log(`Added column ${column} to StockNames`);
                });
            });
        }
        populateStockNames(condb);
    });
}

function createStockNamesTable(condb) {
    const tableQuery = `CREATE TABLE StockNames (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) UNIQUE,
        ticker VARCHAR(255) UNIQUE,
        article_ids JSON
    )`;
    
    condb.query(tableQuery, err => {
        if (err) throw err;
        console.log("StockNames table created");
        populateStockNames(condb);
    });
}

function populateStockNames(condb) {
    condb.query("SELECT COUNT(*) AS count FROM StockNames", (err, result) => {
        if (err) throw err;
        const rowCount = result[0].count;
        if (rowCount !== companies.length) {
            condb.query("TRUNCATE TABLE StockNames", err => {
                if (err) throw err;
                console.log("Table cleared");
                
                const insertQuery = "INSERT INTO StockNames (company_name, ticker, article_ids) VALUES ?";
                const stockData = companies.map(c => [...c, JSON.stringify([])]);
                condb.query(insertQuery, [stockData], (err, result) => {
                    if (err) throw err;
                    console.log(`Inserted ${result.affectedRows} records`);
                    createArticlesTable(condb);
                });
            });
        } else {
            createArticlesTable(condb);
        }
    });
}

function createArticlesTable(condb) {
    const articleQuery = `CREATE TABLE IF NOT EXISTS Articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        body TEXT
    )`;

    condb.query(articleQuery, (err) => {
        if (err) throw err;
        console.log("Articles table ready");
    });
}

