const express = require("express");
const router = express.Router();
const path = require("path");
const { v4: uuid } = require("uuid");
const { connection } = require("./db");
const app = express();
// const methodOverride = require("method-override");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// app.use(methodOverride("_method")); //to support update in HTTP forms
app.use(express.urlencoded({ extended: true }));

//To create, update or delele feedback, users must login before they can do so.
const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login"); //Users must login before they can create, update or delele feedback
  }
  next();
};

//show all of the feedback posted by login user
router.get("/feedback", requireLogin, (req, res) => {
  const userId = req.session.userId;
  var sql = `SELECT * FROM Feedbacks WHERE USERID = '${userId}'`;
  var allFeedback = [];
  console.log(sql);
  connection.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    var allFeedback = result;
    console.log(allFeedback); // Now allFeedback contains the query result

    res.render("feedback/show", { allFeedback });
  });
});

//login user can create new feedback
router.get("/feedback/new", requireLogin, (req, res) => {
  res.render("feedback/new");
});

//show feedback by feedbackID
router.get("/feedback/:feedbackID", (req, res) => {
  const { feedbackID } = req.params;
  var sql = `SELECT * FROM Feedbacks WHERE feedbackID = '${feedbackID}'`;
  console.log(sql);
  connection.query(sql, function (err, result) {
    if (err) {
      res.send(err);
      return;
    }
    // res.json(result);
    var feedback = result[0];
    console.log(feedback);
    res.render("feedback/detail", { feedback });
  });
});

//edit content of feedback by feedbackID
router.get("/feedback/:feedbackID/edit", (req, res) => {
  const { feedbackID } = req.params;
  var sql = `SELECT * FROM Feedbacks WHERE feedbackID = '${feedbackID}'`;
  console.log(sql);
  connection.query(sql, function (err, result) {
    if (err) {
      res.send(err);
      return;
    }
    // res.json(result);
    var feedback = result[0];
    console.log(feedback);
    res.render("feedback/edit", { feedback });
  });
});

//search feedback by flight
router.get("/feedback/:year/:month/:day/:airline_IATA/:number", (req, res) => {
  const { year, month, day, airline_IATA, number } = req.params;
  var sql = `SELECT * 
            FROM Feedbacks 
            WHERE YEAR = ${year} AND MONTH = ${month} AND DAY = ${day} AND FLIGHT_NUMBER = '${number}' AND AIRLINE = '${airline_IATA}'
            LIMIT 50`;
  console.log(sql);
  connection.query(sql, function (err, result) {
    if (err) {
      res.send(err);
      return;
    }
    res.json(result);
    // res.send("Insert your feedback successfully.");
  });
});

//logined user can post feedback for a flight that exists in flight-delay table
router.post("/feedback/new", requireLogin, (req, res) => {
  const { date, airline_IATA, flight_number, content } = req.body;
  const [year, month, day] = date.split("-").map(Number);
  const userid = req.session.userId;
  // console.log(userid);
  // Check if the user had already posted feedback for this flight
  var sql_checkIfPosted = `SELECT COUNT(*) AS count
                             FROM Feedbacks
                             WHERE USERID = '${userid}' AND YEAR = ${year} AND MONTH = ${month} AND DAY = ${day} AND FLIGHT_NUMBER = '${flight_number}' AND AIRLINE = '${airline_IATA}'
                             LIMIT 1`;

  connection.query(sql_checkIfPosted, (err, result) => {
    if (err) {
      res.send(err);
      return;
    }

    if (result[0].count > 0) {
      return res.send(
        "<h1>You have already posted feedback on this flight! Do not post repetitive feedback for the same flight!</h1>"
      );
    } else {
      // Post feedback
      var feedbackID = uuid();
      var sql = `call CheckIfFlightExistBeforeInsert('${feedbackID}', '${userid}', '${content}', ${year}, ${month}, ${day}, '${flight_number}', '${airline_IATA}')`;

      connection.query(sql, (err, result) => {
        if (err) {
          // check if the error is from the trigger
          if (err.message.includes("No matching flight")) {
            res.send(
              "<h1>Feedback cannot be posted because the flight does not exist.</h1>"
            );
          } else if (
            err.code === "ER_NO_REFERENCED_ROW_2" &&
            err.sqlMessage.includes("foreign key constraint fails") &&
            err.sql.includes("CheckIfFlightExistBeforeInsert")
          ) {
            req.session.userId = null;
            error_Msg =
              "Your account has been deleted due to a violation of user agreement: Users are not allowed to post too much (>=5) feedbacks with 2 minutes.";
            res.render("feedback/error", { error_Msg });
          }
          // handle other errors
          else {
            res.send(err);
          }
          return;
        }
        // res.json(result);
        // res.send("Inserted your feedback successfully.");
        console.log("Inserted your feedback successfully.");

        res.redirect("/feedback");
      });
    }
  });
});

//user can update his/her own feedback
router.put("/feedback/:feedbackID", requireLogin, (req, res) => {
  const { feedbackID } = req.params;
  const newContent = req.body.content;
  const sql_updateFeedback = `UPDATE Feedbacks
                              SET CONTENT = '${newContent}'
                              WHERE FEEDBACKID = '${feedbackID}'
                              `;
  console.log(sql_updateFeedback);
  connection.query(sql_updateFeedback, function (err, result) {
    if (err) {
      res.send(err);
      return;
    }
    // res.send("Update feedback successfully.");
    console.log("Update feedback successfully.");
    res.redirect(`/feedback/${feedbackID}`);
  });
});

//logined user can delete feedback for a specific flight
router.delete("/feedback/:feedbackID", requireLogin, (req, res) => {
  const { feedbackID } = req.params;
  var sql = `SELECT * FROM Feedbacks WHERE FEEDBACKID = '${feedbackID}'`;
  console.log(sql);
  connection.query(sql, async (err, result) => {
    if (err) {
      res.send(err); //Error
      return;
    }
    if (result.length === 0) {
      res.send("<h1>No feedback found with that feedbackID</h1>");
    } else {
      //found feedback with that feedbackID
      var deleteSql = `DELETE FROM Feedbacks WHERE FEEDBACKID = '${feedbackID}'`;
      connection.query(deleteSql, async (deleteErr, result) => {
        if (deleteErr) {
          res.send(deleteErr); //Error
          return;
        }
        // res.send("Feedback deleted successfully!");
        console.log("Feedback deleted successfully!");
        res.redirect("/feedback");
      });
    }
  });
});

module.exports = router;
