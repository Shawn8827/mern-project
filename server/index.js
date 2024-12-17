const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");

// Connect MongoDB
mongoose
  .connect("mongodb://localhost:27017/mernDB")
  .then(() => {
    console.log("Connecting to mongo..");
  })
  .catch((e) => {
    console.log(e);
  });

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//routes
app.use("/api/user", authRoute);

// courses 應該被 jwt 保護
// 如果 req header內沒有jwt, 則req會被視為 unauthorized
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

app.listen(8080);
console.log("Server run on port 8080");
