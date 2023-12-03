const express = require("express");
const router = express.Router();
const { connection } = require("./db");

router.get("/delay-history/city/:city", (req, res) => {
  console.log("search delay-history of cities");
  const { city } = req.params;
  var sql = `
      SELECT count(*)  
      FROM Flights f JOIN Airports a ON (f.ORIGIN_AIRPORT = a.IATA_CODE)
      WHERE a.CITY = '${city}' AND f.DEPARTURE_TIME > 0
      `;
  console.log(sql);
  connection.query(sql, (err, result) => {
    if (err) {
      res.send(err);
      return;
    }
    res.json(result);
    // res.redirect("/??");
  });
});

router.get("/delay-history/airport/:airport", (req, res) => {
  console.log("search delay-history of airports");
  const { airport } = req.params;
  var sql = `
      SELECT count(*)
      FROM Flights
      WHERE ORIGIN_AIRPORT = '${airport}' AND DEPARTURE_TIME > 0
      `;
  console.log(sql);
  connection.query(sql, (err, result) => {
    if (err) {
      res.send(err);
      return;
    }
    res.json(result);
    // res.redirect("/??");
  });
});

router.get("/delay-history/flight/:airline_IATA/:number", (req, res) => {
  const { airline_IATA, number } = req.params;
  console.log(airline_IATA, number);
  console.log("search delay-history of flight numbers");
  var sql = `
      SELECT count(*) 
      FROM Flights
      WHERE AIRLINE = '${airline_IATA}' AND FLIGHT_NUMBER = '${number}' AND DEPARTURE_TIME > 0
      `;

  console.log(sql);
  connection.query(sql, (err, result) => {
    if (err) {
      res.send(err);
      return;
    }
    res.json(result);
    // res.redirect("/??");
  });
});

module.exports = router;
