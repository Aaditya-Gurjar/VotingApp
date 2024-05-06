const express = require("express");
const dotenv = require("dotenv").config();
const ConnectToDb = require("./Config/ConnectToDB.js");
const app = require("./app.js");
// const bodyParser = require("body-parser");

// Database Connection
ConnectToDb();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is Running at ${PORT}`);
});
