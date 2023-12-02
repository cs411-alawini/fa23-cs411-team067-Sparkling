const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "34.172.145.168",
  user: "root",
  password: "123456",
  database: "PT1_flights_delay",
});

module.exports = connection;
