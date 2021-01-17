const path = require("path");
const express = require("express");
const session = require("express-session");
const fetch = require("node-fetch");

const dotenv = require("dotenv");
const dotenvResult = dotenv.config({ path: "./server/config/config.env" }); /* ## Load env variables ## */
if (dotenvResult.error) {
  throw dotenvResult.error;
}

const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const config = require(path.join(__dirname, "../webpack.config.js"));
const compiler = webpack(config);

const app = express();

/* Connect to Mongo-database - Persistant data storage for trello tasks. */
const connectDB = require("./config/db.js");
connectDB();

/* Initiate webpack */
app.use(webpackDevMiddleware(compiler, config.devServer));
app.use(webpackHotMiddleware(compiler));
app.use(express.static(path.join(__dirname, "../build")));

/* Parsing application/json */
app.use(express.json());

/* Backend routes - TESTS */
const Task = require("./models/Task");
app.post("/createTask", async (req, res) => {
  console.log("HIT IN SERVER (ADD):", req.body);
  Task.create(req.body);
  console.log("HIT IN DATABASE:");
  console.log(await Task.find());
  await res.json("End of task creation reached.");
});
app.delete("/deleteTask/:id", async (req, res) => {
  await console.log("HIT IN SERVER (DEL):", req.params.id);
  await Task.deleteOne({ id: req.params.id });
  console.log("HIT IN DATABASE:");
  console.log(await Task.find());
  await res.json("End of task deletion reached.");
});
/* - - - - - - - - - - - - - - - - - - - - */

/* Endpoint */
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

/* localhost PORT */
app.listen(4000);
