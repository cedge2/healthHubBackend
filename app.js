"use strict";

/** Express app for healthHub. */

const express = require("express");
const cors = require("cors");
require('dotenv').config({ path: './.env.local' });

const { NotFoundError } = require("./expressError");

//const { authenticateJWT } = require("./middleware/auth");
//const authRoutes = require("./routes/auth");
const administratorsRoutes = require("./routes/administrators");
const doctorsRoutes = require("./routes/doctors");
const patientsRoutes = require("./routes/patients"); 

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

//app.use("/auth", authRoutes);
app.use("/administrators", administratorsRoutes);
app.use("/doctors", doctorsRoutes);
app.use("/patients", patientsRoutes); 

/** Handle 404 errors -- this matches everything */
//app.use(function (req, res, next) {
  //return next(new NotFoundError());
//});


app.use(authenticateJWT);

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
