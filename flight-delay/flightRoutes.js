const express = require("express");
const router = express.Router();
const { connection } = require("./db");
const { redisClient } = require("./redisClient");

async function checkCache(req, res, cacheKey, sql, queryParams = []) {
  console.log("Checking cache for ", cacheKey);
  try {
    const data = await redisClient.get(cacheKey);
    if (data !== null) {
      console.log("Cache hit");
      res.json(JSON.parse(data));
    } else {
      console.log("Cache miss");
      // console.log(sql);
      connection.query(sql, queryParams, (err, result) => {
        if (err) {
          console.error("Error querying database:", err);
          res.status(500).send("Error querying database");
          return;
        }
        // Cache the result in Redis for future requests
        redisClient.setEx(cacheKey, 3600, JSON.stringify(result)); // Cache for 1 hour
        res.json(result); // Send the database result to the client
      });
    }
  } catch (err) {
    console.error("Error fetching from Redis:", err);
    res.status(500).send("Error fetching data");
  }
}

router.get("/delay-history/city/:city", async (req, res) => {
  const { city } = req.params;
  const cacheKey = `delay-history:city:${city}`;
  // console.log(`cacheKey: ${cacheKey}`);
  const sql = `
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
          HAVING a.city= ?
          LIMIT 50
        `;
  checkCache(req, res, cacheKey, sql, [city]);
});

router.get("/delay-history/airport/:airport", async (req, res) => {
  console.log("Checking cache for delay-history of airports...");
  const { airport } = req.params;
  const cacheKey = `delay-history:airport:${airport}`;

  const sql = `
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
  HAVING f.ORIGIN_AIRPORT= ?
  LIMIT 50
`;
  checkCache(req, res, cacheKey, sql, [airport]);
});

router.get("/delay-history/flight/:airline_IATA/:number", async (req, res) => {
  console.log("search delay-history of flight numbers");
  const { airline_IATA, number } = req.params;
  console.log(`${airline_IATA}, ${number}`);

  const cacheKey = `delay-history:flight:${airline_IATA}:${number}`;
  const sql = `
          SELECT *
          FROM Flights
          WHERE AIRLINE = ? AND FLIGHT_NUMBER = ? AND DEPARTURE_TIME > 0
        `;
  checkCache(req, res, cacheKey, sql, [airline_IATA, number]);
});

//search delay rate of all airport
router.get("/delay-rate/airport", async (req, res) => {
  console.log(`Search delay rate of all airports.`);
  const cacheKey = `delay-rate:all-airports`;
  const sql = `
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
  checkCache(req, res, cacheKey, sql);
});

//search delay rate of an airport
router.get("/delay-rate/airport/:airport_IATA", async (req, res) => {
  const { airport_IATA } = req.params;
  console.log(`Searching cache for delay rate of airport ${airport_IATA}...`);
  const cacheKey = `delay-rate:airport:${airport_IATA}`;
  const sql = `
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
  checkCache(req, res, cacheKey, sql, [airport_IATA]);
});

//search delay rate of origin airport${airport_IATA}
router.get("/delay-rate/route/from/:airport_IATA", (req, res) => {
  const { airport_IATA } = req.params;
  const cacheKey = `delay-rate:route:${airport_IATA}`;
  console.log(airport_IATA);

  console.log(`search delay rate of origin airport${airport_IATA}`);

  const sql = `
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
    WHERE ORIGIN_AIRPORT= ? AND DESTINATION_AIRPORT NOT LIKE '1__'
    GROUP BY ORIGIN_AIRPORT, DESTINATION_AIRPORT
  `; //'1__' filter out suspicious row for now
  checkCache(req, res, cacheKey, sql, [airport_IATA]);
});

//search delay rate of all routes, limit X rows
router.get("/delay-rate/route/:limitXRows", (req, res) => {
  const { limitXRows } = req.params;
  console.log(`search delay rate of all routes, limit ${limitXRows} rows`);

  const cacheKey = `delay-rate:route:${limitXRows}`;
  const sql = `
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
  LIMIT ?
  `;
  const limit = parseInt(limitXRows, 10); //10: decimal
  if (isNaN(limit)) {
    return res.status(400).send("Invalid limit parameter");
  }

  //'1__' filter out suspicious row for now
  checkCache(req, res, cacheKey, sql, [limit]);
});

//search delay rate of an route
router.get(
  "/delay-rate/route/from/:airport_origin/to/:airport_destination",
  (req, res) => {
    const { airport_origin, airport_destination } = req.params;
    const cacheKey = `delay-rate:route:${airport_origin}:${airport_destination}`;
    console.log(
      `search delay rate of the route: from ${airport_origin} to ${airport_destination}`
    );
    const sql = `
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
    WHERE ORIGIN_AIRPORT = ? AND DESTINATION_AIRPORT = ?
      AND ORIGIN_AIRPORT NOT LIKE '1__' AND DESTINATION_AIRPORT NOT LIKE '1__'
    GROUP BY ORIGIN_AIRPORT, DESTINATION_AIRPORT
  `;
    //'1__' filter out suspicious row for now
    checkCache(req, res, cacheKey, sql, [airport_origin, airport_destination]);
  }
);

module.exports = router;
