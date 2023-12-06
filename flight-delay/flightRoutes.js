const express = require("express");
const router = express.Router();
const { connection } = require("./db");

router.get("/delay-history/city/:city", (req, res) => {
  console.log("search delay-history of cities");
  const { city } = req.params;
  var sql = `
    SELECT 
    ORIGIN_AIRPORT,
    a.CITY AS ori_city,
    DESTINATION_AIRPORT,
    a1.CITY AS des_city,
    SUM(CASE WHEN ARRIVAL_DELAY > 0 THEN 1 ELSE 0 END) / COUNT(*) AS delay_rate
    FROM Flights f
    JOIN Airports a ON a.IATA_CODE = f.ORIGIN_AIRPORT
    JOIN Airports a1 ON a1.IATA_CODE = f.DESTINATION_AIRPORT
    WHERE ORIGIN_AIRPORT NOT LIKE '1__' AND DESTINATION_AIRPORT NOT LIKE '1__'
    GROUP BY ORIGIN_AIRPORT, DESTINATION_AIRPORT
    HAVING a.city='${city}'
    LIMIT 50
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
  SELECT 
  ORIGIN_AIRPORT,
  a.CITY AS ori_city,
  DESTINATION_AIRPORT,
  a1.CITY AS des_city,
  SUM(CASE WHEN ARRIVAL_DELAY > 0 THEN 1 ELSE 0 END) / COUNT(*) AS delay_rate
  FROM Flights f
  JOIN Airports a ON a.IATA_CODE = f.ORIGIN_AIRPORT
  JOIN Airports a1 ON a1.IATA_CODE = f.DESTINATION_AIRPORT
  WHERE ORIGIN_AIRPORT NOT LIKE '1__' AND DESTINATION_AIRPORT NOT LIKE '1__'
  GROUP BY ORIGIN_AIRPORT, DESTINATION_AIRPORT
  HAVING f.ORIGIN_AIRPORT='${airport}'
  LIMIT 50
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
      SELECT *
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
  SELECT
    f.ORIGIN_AIRPORT,
    a.LATITUDE,
    a.LONGITUDE,
    AVG(CASE WHEN f.ARRIVAL_DELAY > 0 
    THEN 1 
    ELSE 0 
    END) AS AVG_Delay_Rate
  FROM Flights f
  JOIN Airports a ON f.ORIGIN_AIRPORT = a.IATA_CODE
  GROUP BY f.ORIGIN_AIRPORT
  HAVING f.ORIGIN_AIRPORT NOT LIKE '1__'
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
  SELECT
    f.ORIGIN_AIRPORT,
    // a.LATITUDE,
    a.LONGITUDE,
    AVG(CASE WHEN f.ARRIVAL_DELAY > 0 
    THEN 1 
    ELSE 0 
    END) AS AVG_Delay_Rate
  FROM Flights f
  JOIN Airports a ON f.ORIGIN_AIRPORT = a.IATA_CODE
  WHERE f.ORIGIN_AIRPORT = '${airport_IATA}'
  GROUP BY f.ORIGIN_AIRPORT
  HAVING f.ORIGIN_AIRPORT NOT LIKE '1__'
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

//search delay rate of origin airport${airport_IATA}
router.get("/delay-rate/route/:airport_IATA", (req, res) => {
  const { airport_IATA } = req.params;
  console.log(airport_IATA);
  console.log(`search delay rate of origin airport${airport_IATA}`);
  var sql = `
    SELECT 
      ORIGIN_AIRPORT,
      a.LATITUDE AS origin_lat,
      a.LONGITUDE AS origin_lon,
      DESTINATION_AIRPORT,
      a1.LATITUDE AS dest_lat,
      a1.LONGITUDE AS dest_lon,
      SUM(CASE WHEN ARRIVAL_DELAY > 0 THEN 1 ELSE 0 END) / COUNT(*) AS delay_rate
    FROM Flights f
      JOIN Airports a ON a.IATA_CODE = f.ORIGIN_AIRPORT
      JOIN Airports a1 ON a1.IATA_CODE = f.DESTINATION_AIRPORT
    WHERE ORIGIN_AIRPORT='${airport_IATA}' AND DESTINATION_AIRPORT NOT LIKE '1__'
    GROUP BY ORIGIN_AIRPORT, DESTINATION_AIRPORT
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

//search delay rate of all routes, limit X rows
router.get("/delay-rate/route/:limitXRows", (req, res) => {
  const { limitXRows } = req.params;
  console.log(`search delay rate of all routes, limit ${limitXRows} rows`);
  var sql = `
  SELECT 
    ORIGIN_AIRPORT,
    a.LATITUDE AS origin_lat,
    a.LONGITUDE AS origin_lon,
    DESTINATION_AIRPORT,
    a1.LATITUDE AS dest_lat,
    a1.LONGITUDE AS dest_lon,
    SUM(CASE WHEN ARRIVAL_DELAY > 0 THEN 1 ELSE 0 END) / COUNT(*) AS delay_rate
  FROM Flights f
  JOIN Airports a ON a.IATA_CODE = f.ORIGIN_AIRPORT
  JOIN Airports a1 ON a1.IATA_CODE = f.DESTINATION_AIRPORT
  WHERE ORIGIN_AIRPORT NOT LIKE '1__' AND DESTINATION_AIRPORT NOT LIKE '1__'
  GROUP BY ORIGIN_AIRPORT, DESTINATION_AIRPORT
  LIMIT ${limitXRows};
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

//search delay rate of an route
router.get(
  "/delay-rate/route/:airport_origin/:airport_destination",
  (req, res) => {
    const { airport_origin, airport_destination } = req.params;
    console.log(
      `search delay rate of the route: from ${airport_origin} to ${airport_destination}`
    );
    var sql = `
    SELECT 
      ORIGIN_AIRPORT,
      a.LATITUDE AS origin_lat,
      a.LONGITUDE AS origin_lon,
      DESTINATION_AIRPORT,
      a1.LATITUDE AS dest_lat,
      a1.LONGITUDE AS dest_lon,
      SUM(CASE WHEN ARRIVAL_DELAY > 0 THEN 1 ELSE 0 END) / COUNT(*) AS delay_rate
    FROM Flights f
      JOIN Airports a ON a.IATA_CODE = f.ORIGIN_AIRPORT
      JOIN Airports a1 ON a1.IATA_CODE = f.DESTINATION_AIRPORT
    WHERE ORIGIN_AIRPORT = '${airport_origin}' AND DESTINATION_AIRPORT = '${airport_destination}' 
      AND ORIGIN_AIRPORT NOT LIKE '1__' AND DESTINATION_AIRPORT NOT LIKE '1__'
    GROUP BY ORIGIN_AIRPORT, DESTINATION_AIRPORT
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
  }
);

module.exports = router;
