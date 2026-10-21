const express = require("express");
const cors = require("cors");
const path = require("path");

const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");
const ordersRouter = require("./orders/orders.router");
const dishesRouter = require("./dishes/dishes.router");

const app = express();

// You have not learned about CORS yet.
// The following line let's this API be used by any website.
app.use(cors());
app.use(express.json());

app.use("/dishes", dishesRouter);

// Keep the coursework UI and API on the same origin; no external backend URL.
const demoDirectory = path.resolve(__dirname, "../public/demo");
app.get("/", (req, res) => res.redirect("/demo/"));
app.use("/demo", express.static(demoDirectory));
app.get("/demo/*", (req, res) => {
  res.sendFile(path.join(demoDirectory, "index.html"));
});
app.use("/orders", ordersRouter);

app.use(notFound);

app.use(errorHandler);

module.exports = app;
