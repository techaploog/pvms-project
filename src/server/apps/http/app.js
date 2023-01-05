const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const api = require("./routes/api");

const API_PORT = process.env.PVMS_API_PORT;

// init
const app = express();

// middleware
app.use(
  cors({
    origin: `http://localhost:${API_PORT}`,
  })
);
app.use(helmet());
app.use(express.json());

// API routes
app.use("/api", api);

// custom 404
app.use((req, res, next) => {
  res.status(404).send("Not Found");
});

// custom error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Server Error!");
});

module.exports = app;
