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

//search delay rate of all airport
router.get("/delay-rate/airport", (req, res) => {
  console.log(`Search delay rate of all airports.`);
  var sql = `
            SELECT ORIGIN_AIRPORT,
            AVG(CASE WHEN ARRIVAL_DELAY > 0 
            THEN 1 
            ELSE 0 
            END) AS AVG_Delay_Rate
            FROM Flights
            GROUP BY ORIGIN_AIRPORT
            HAVING ORIGIN_AIRPORT NOT LIKE '1__';
  `;
  //'1__' filter out suspicious row for now

  console.log(sql);
  connection.query(sql, (err, result) => {
    if (err) {
      res.send(err);
      return;
    }
    res.json(result);
  });
});

//search delay rate of an airport
router.get("/delay-rate/airport/:airport_IATA", (req, res) => {
  const { airport_IATA } = req.params;
  console.log(airport_IATA);
  console.log(`search delay rate of the airport ${airport_IATA}`);
  var sql = `
            SELECT ORIGIN_AIRPORT, 
            AVG(CASE WHEN ARRIVAL_DELAY > 0 
            THEN 1 
            ELSE 0 
            END) AS AVG_Delay_Rate
            FROM Flights
            WHERE ORIGIN_AIRPORT = '${airport_IATA}'
            GROUP BY ORIGIN_AIRPORT
            HAVING ORIGIN_AIRPORT NOT LIKE '1__';
  `;
  //'1__' filter out suspicious row for now

  console.log(sql);
  connection.query(sql, (err, result) => {
    if (err) {
      res.send(err);
      return;
    }
    res.json(result);
  });
});

module.exports = router;