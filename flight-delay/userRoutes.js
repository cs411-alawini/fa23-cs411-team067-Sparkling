const express = require("express");
const router = express.Router();
const path = require("path");
const { v4: uuid } = require("uuid");
const { connection } = require("./db");
const app = express();
const methodOverride = require("method-override");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

router.get("/login", (req, res) => {
  res.render("feedback/login");
});

router.get("/register", (req, res) => {
  res.render("feedback/register");
});

//user register
router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  const userId = uuid();
  var sql = `INSERT INTO Users(USERID, EMAIL, USERNAME, PASSWORD) VALUES ('${userId}', '${email}', '${username}', '${password}')`;
  console.log(sql);
  connection.query(sql, function (err, result) {
    if (err) {
      res.send(err);
      return;
    }
    // res.json(result);
    res.render("feedback/login");
  });
});

//login user
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  var sql = `SELECT * FROM Users WHERE EMAIL = '${email}'`;
  console.log(sql);
  connection.query(sql, async (err, result) => {
    if (err) {
      res.send(err);
      return;
    }

    if (result.length === 0) {
      res.send("<h1>No user found with that email</h1>");
    } else {
      const { PASSWORD: correctPwd, USERID: userId } = result[0]; //e.g. result = [ { PASSWORD: '123' } ]

      //compare password
      if (correctPwd !== password) {
        res.send("<h1>Wrong password</h1>");
      } else {
        req.session.userId = userId;
        // console.log("print user id", req.session.userId);
        // res.send("Correct password. Now logging you in.");
        res.redirect("/feedback");
      }
    }
  });
});

//logout user
router.get("/logout", (req, res) => {
  req.session.userId = null;
  // console.log("log out");
  res.render("feedback/login");
  // res.render("/");
  // res.send("Logout successfully");
});

module.exports = router;
