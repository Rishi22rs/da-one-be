var mysql = require("mysql");

var db = mysql.createConnection({
  host: "mysql-underrated.alwaysdata.net",
  user: "377818",
  database: "underrated_la",
  multipleStatements: true,
  password: "HelloalwaysData@22",
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = db;
