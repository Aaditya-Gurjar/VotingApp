const express = require("express");
const userRoute = require("./Routes/userRoutes.js");
const candidateRoute = require("./Routes/candidateRoutes.js");

const app = express();

//Middleware
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/user", userRoute);
app.use("/candidate", candidateRoute);


module.exports = app;
