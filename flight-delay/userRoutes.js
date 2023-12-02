const express = require("express");
const router = express.Router();
const { v4: uuid } = require("uuid");
const connection = require("./db");

router.post("/register", async (req, res) => {
  const { username, password, email } = req.query;
  const userId = uuid();
  var sql = `INSERT INTO Users(USERID, EMAIL, USERNAME, PASSWORD) VALUES ('${userId}', '${email}', '${username}', '${password}')`;
  console.log(sql);
  connection.query(sql, function (err, result) {
    if (err) {
      res.send(err);
      return;
    }
    // res.json(result);
    res.send("Insert your feedback successfully.");
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  var sql = `SELECT PASSWORD FROM Users WHERE EMAIL = '${email}'`;
  console.log(sql);
  connection.query(sql, async (err, result) => {
    if (err) {
      res.send(err); //cannot find user
      return;
    }

    if (result.length === 0) {
      res.send("No user found with that email");
    } else {
      const { PASSWORD: correctPwd } = result[0]; //e.g. result = [ { PASSWORD: '123' } ]

      //compare password
      if (correctPwd !== password) {
        res.send("Wrong password");
      } else {
        res.send("Correct password. Now logging you in.");
      }
    }
  });
});
module.exports = router;
