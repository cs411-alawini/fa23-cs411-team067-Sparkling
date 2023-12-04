const mysql = require("mysql2");

const dbConfig = {
  host: "34.172.145.168",
  user: "root",
  password: "123456",
  database: "PT1_flights_delay",
};
const connection = mysql.createConnection(dbConfig);

function createProcedure() {
  const storedProcedureName = "CheckIfFlightExist";
  const sql_checkProcedureExists = `
    SELECT *
    FROM INFORMATION_SCHEMA.ROUTINES 
    WHERE ROUTINE_SCHEMA = '${dbConfig.database}' 
      AND ROUTINE_TYPE = 'PROCEDURE' 
      AND ROUTINE_NAME = '${storedProcedureName}';
  `;

  const sql_dropProcedure = `DROP PROCEDURE IF EXISTS ${storedProcedureName};`;

  const sql_checkFlightExistsStoredProcedure = `
          CREATE PROCEDURE ${storedProcedureName}(
              IN p_FEEDBACKID VARCHAR(255),
              IN p_USERID VARCHAR(255),
              IN p_CONTENT VARCHAR(255),
              IN p_YEAR INT,
              IN p_MONTH INT,
              IN p_DAY INT,
              IN p_FLIGHT_NUMBER VARCHAR(255),
              IN p_AIRLINE VARCHAR(2)
          )
          BEGIN
              DECLARE flightExists INT DEFAULT 0;

              -- check if the flight exists
              SELECT COUNT(*) INTO flightExists
              FROM Flights
              WHERE YEAR = p_YEAR AND MONTH = p_MONTH AND DAY = p_DAY
                    AND FLIGHT_NUMBER = p_FLIGHT_NUMBER AND AIRLINE = p_AIRLINE
              LIMIT 1;

              -- if flight exists, insert the feedback
              IF flightExists > 0 THEN
                  INSERT INTO Feedbacks(FEEDBACKID, USERID, CONTENT, YEAR, MONTH, DAY, FLIGHT_NUMBER, AIRLINE)
                  VALUES (p_FEEDBACKID, p_USERID, p_CONTENT, p_YEAR, p_MONTH, p_DAY, p_FLIGHT_NUMBER, p_AIRLINE);
              ELSE
                  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No matching flight: The flight you mentioned does not exist in table Flights.';
              END IF;
          END;
  `;

  // First, check if the stored procedure exists
  connection.query(sql_checkProcedureExists, (err, results) => {
    if (err) {
      throw err;
    }

    if (results.length > 0) {
      // If it exists, drop the procedure
      connection.query(sql_dropProcedure, (err, result) => {
        if (err) {
          throw err;
        }
        console.log("Old stored procedure dropped successfully");
      });
    }
    connection.query(sql_checkFlightExistsStoredProcedure, (err, results) => {
      if (err) {
        throw err;
      }
      console.log("New stored procedure created successfully");
    });
  });
}

module.exports = { connection, createProcedure };

// function setUpDBTrigger() {
//   const triggerCheckFlight = "CheckFlight";
//   const sql_checkFlightExistsTrigger = `
//   CREATE TRIGGER ${triggerCheckFlight}
//     BEFORE INSERT ON Feedbacks
//     FOR EACH ROW
//     BEGIN
//       SET @flightCount = (SELECT count(*)
//                             FROM Flights
//                             WHERE YEAR = new.YEAR AND MONTH = new.MONTH AND DAY = new.DAY
//                                   AND FLIGHT_NUMBER=new.FLIGHT_NUMBER AND AIRLINE=new.AIRLINE
//                             LIMIT 1);
//       IF @flightCount > 0 THEN
//         INSERT INTO Feedbacks(FEEDBACKID, USERID, CONTENT, YEAR, MONTH, DAY, FLIGHT_NUMBER, AIRLINE)
//         VALUES (new.FEEDBACKID, new.USERID, new.CONTENT, new.YEAR, new.MONTH, new.DAY, new.FLIGHT_NUMBER, new.AIRLINE);
//       ELSEIF @flightCount = 0 THEN
//         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No matching flight: The flight you mention in your feedback does not exist in table Flights.';
//       END IF;
//     END;
//   `;
//   // console.log(sql_checkFlightExistsTrigger);
//   const sql_checkTriggerExists = `
//   SELECT TRIGGER_NAME
//   FROM information_schema.TRIGGERS
//   WHERE TRIGGER_SCHEMA = '${dbConfig.database}' AND TRIGGER_NAME = '${triggerCheckFlight}';
// `;
//   connection.query(sql_checkTriggerExists, (err, results) => {
//     // console.log(sql_checkTriggerExists);
//     if (err) {
//       throw err;
//     }
//     //if trigger exists, drop it and create a new one.
//     if (results.length === 1) {
//       const sql_dropTrigger = `DROP TRIGGER ${triggerCheckFlight};`;
//       connection.query(sql_dropTrigger, (err, result) => {
//         if (err) {
//           throw err;
//         }
//         // console.log("Trigger dropped successfully");
//       });
//     }
//     connection.query(sql_checkFlightExistsTrigger, (err, result) => {
//       if (err) {
//         throw err;
//       }
//       console.log("Trigger created successfully");
//     });
//   });
// }