var mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST,
  user: process.env.DB_USER || process.env.MYSQL_USER,
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
  port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
  multipleStatements: true,
};

const missingVars = [];
if (!dbConfig.host) missingVars.push("DB_HOST");
if (!dbConfig.user) missingVars.push("DB_USER");
if (!dbConfig.database) missingVars.push("DB_NAME");
if (!dbConfig.password) missingVars.push("DB_PASSWORD");

if (missingVars.length) {
  throw new Error(
    `Missing required database environment variables: ${missingVars.join(", ")}`,
  );
}

var db = mysql.createPool(dbConfig);

module.exports = db;
