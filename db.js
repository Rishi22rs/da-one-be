var mysql = require("mysql2/promise");

var db = mysql.createPool({
  host: "mysql-underrated.alwaysdata.net",
  user: "377818",
  database: "underrated_la",
  multipleStatements: true,
  password: "HelloalwaysData@22",
});

module.exports = db;
