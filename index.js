require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const outlookRoutes = require("./routes/user");
const emailsRoutes = require("./routes/getEmail");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "any_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));

app.get("/", (req, res) => {
  res.render("getstarted");
});
app.get("/list", (req, res) => {
  res.render("emails");
});

// Outlook routes
app.use("/auth", outlookRoutes);
app.use("/email", emailsRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
