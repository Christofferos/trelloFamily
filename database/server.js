const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const CLIENT_ENDPOINT = "*"; // https://nifty-mirzakhani-1530fc.netlify.app/

const io = require("socket.io")(server, {
  cors: {
    origin: CLIENT_ENDPOINT,
    methods: ["GET", "PUT", "POST", "DELETE"], // Test
    /*
    allowedHeaders: ["custom-header"],
    credentials: true, */
  },
  /* handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  }, */
});

const session = require("express-session");
const dotenv = require("dotenv");
const dotenvResult = dotenv.config({ path: "./config/config.env" }); /* ## Load env variables ## */
if (dotenvResult.error) {
  throw dotenvResult.error;
}

/* Connect to Mongo-database - Persistant data storage for trello tasks. */
const connectDB = require("./config/db.js");
connectDB();
const Task = require("./models/Task");

/* ### [Connection]: While atleast one client is connected to server. ### */
io.on("connection", (client) => {
  console.log("Connected!");
  client.on("createTask", createTask);
  client.on("deleteTask", deleteTask);

  function createTask(item) {
    Task.create(item);
    client.emit("createTask", "End of task creation reached. Item: " + item);
  }
  function deleteTask(idSent) {
    Task.deleteOne({ id: idSent });
    client.emit("deleteTask", "End of task deletion reached. ID sent: " + idSent);
  }
});

/* ## Listen on PORT provided by Heroku (or 3000 if local): ## */
server.listen(process.env.PORT || 3000);
