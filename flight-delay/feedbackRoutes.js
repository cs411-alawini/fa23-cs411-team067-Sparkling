const express = require("express");
const router = express.Router();
const { v4: uuid } = require("uuid");
const connection = require("./db");

router.post(
  "/feedback/:userid/:year/:month/:day/:airline_IATA/:number",
  (req, res) => {
    const { userid, year, month, day, airline_IATA, number } = req.params;
    var newFeedback = req.body.feedback; ///!!! form should provide 'name=comments'
    var feedbackID = uuid();
    var sql = `INSERT INTO Feedbacks(FEEDBACKID, USERID, CONTENT, YEAR, MONTH, DAY, FLIGHT_NUMBER, AIRLINE) VALUES ('${feedbackID}', '${userid}', '${newFeedback}',${year},${month},${day},'${number}','${airline_IATA}')`;

    console.log(sql);
    connection.query(sql, function (err, result) {
      if (err) {
        res.send(err);
        return;
      }
      // res.json(result);
      res.send("Insert your feedback successfully.");
    });
  }
);

router.delete("/feedback/:feedbackID", (req, res) => {
  //need to add authentication???
  const { feedbackID } = req.params;
  var sql = `SELECT * FROM Feedbacks WHERE FEEDBACKID = '${feedbackID}'`;
  console.log(sql);
  connection.query(sql, async (err, result) => {
    if (err) {
      res.send(err); //Error
      return;
    }
    if (result.length === 0) {
      res.send("No feedback found with that feedbackID");
    } else {
      //found feedback with that feedbackID
      var deleteSql = `DELETE FROM Feedbacks WHERE FEEDBACKID = '${feedbackID}'`;
      connection.query(deleteSql, async (deleteErr, result) => {
        if (deleteErr) {
          res.send(deleteErr); //Error
          return;
        }
        res.send("Feedback deleted successfully!");
      });
    }
  });
});

module.exports = router;
