var mysql = require("mysql2/promise");

var db = mysql.createPool({
  host: "mysql-bae2b.alwaysdata.net",
  user: "bae2b",
  database: "bae2b_daone",
  multipleStatements: true,
  password: "Hellobae2b@22",
});

module.exports = db;
