const express = require("express");
const app = express();

/* Parsing application/json */
app.use(express.json());

const session = require("express-session");
const fetch = require("node-fetch");

const dotenv = require("dotenv");
const dotenvResult = dotenv.config({ path: "./config/config.env" }); /* ## Load env variables ## */
if (dotenvResult.error) {
  throw dotenvResult.error;
}

/* Connect to Mongo-database - Persistant data storage for trello tasks. */
const connectDB = require("./config/db.js");
connectDB();

/* Backend routes - TESTS */
const Task = require("./models/Task");
app.post("/createTask", async (req, res) => {
  console.log("HIT IN SERVER (ADD):", req.body);
  Task.create(req.body);
  console.log("HIT IN DATABASE:");
  console.log(await Task.find());
  await res.header("Access-Control-Allow-Origin", "*");
  await res.header("Access-Control-Allow-Headers", "*");
  await res.json("End of task creation reached.");
});
app.delete("/deleteTask/:id", async (req, res) => {
  await console.log("HIT IN SERVER (DEL):", req.params.id);
  await Task.deleteOne({ id: req.params.id });
  console.log("HIT IN DATABASE:");
  console.log(await Task.find());
  await res.header("Access-Control-Allow-Origin", "*");
  await res.header("Access-Control-Allow-Headers", "*");
  await res.json("End of task deletion reached.");
});
/* - - - - - - - - - - - - - - - - - - - - */

/* localhost PORT */
app.listen(process.env.PORT || 3000);
