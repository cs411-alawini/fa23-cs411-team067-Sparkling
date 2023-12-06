var express = require("express");
var path = require("path");
var cors = require("cors");
const ejsMate = require("ejs-mate");
const {
  connection,
  createProcedure,
  trigger_checkFeedbackFrequency: createTrigger,
} = require("./db");
const session = require("express-session");
const methodOverride = require("method-override"); //to support update in HTTP forms
// API:https://hackmd.io/uFNnJ9u9SsO_yfV6OQXO0Q?view

const { v4: uuid } = require("uuid"); //generate uid for every registered user
// const bcrypt = require("bcrypt"); //For hashing Passwords During Registration

connection.connect((err) => {
  if (err) {
    console.log("Database connection fails: " + err.stack);
    return;
  }
  console.log("Connecting the database successfully");
});
createProcedure();
createTrigger();
var app = express();

//set up ejs view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "pt1", resave: false, saveUninitialized: true }));
app.use(methodOverride("_method"));

// import routes
const feedbackRoutes = require("./feedbackRoutes");
const userRoutes = require("./userRoutes");
const flightRoutes = require("./flightRoutes");

// use routes
// app.use("/api", feedbackRoutes);
app.use(feedbackRoutes);
app.use(userRoutes);
app.use(flightRoutes);

/* GET home page, respond by rendering index.ejs */
app.get("/", function (req, res) {
  res.render("index", { title: "Flight Delay Search Platform" });
});

app.listen(3000, function () {
  console.log("Node app is running on port 3000");
});
