const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const CLIENT_ENDPOINT = "*"; // https://nifty-mirzakhani-1530fc.netlify.app/

const io = require("socket.io")(server, {
  cors: {
    origin: CLIENT_ENDPOINT,
    methods: ["GET", "PUT", "POST", "DELETE"], // Test
  },
});

/* ## Load env variables ## */
const session = require("express-session");
const dotenv = require("dotenv");
const dotenvResult = dotenv.config({
  /* PATH: Production: "./config/config.env" */ /* Development: "./database/config/config.env" */
  path: "./config/config.env",
});
if (dotenvResult.error) {
  throw dotenvResult.error;
}

/* Connect to Mongo-database - Persistant data storage for trello tasks. */
const connectDB = require("./config/db.js");
connectDB();
const Task = require("./models/Task");

const clientRoom = {};
let clientID = 0;
let roomName = 001;

/* ### [Connection]: While atleast one client is connected to server. ### */
io.on("connection", (client) => {
  client.on("joinRoom", handleJoinRoom);
  console.log("Connected!");
  client.on("createTask", createTask);
  client.on("deleteTask", deleteTask);
  client.on("getItems", getItems);
  client.on("updateTask", updateTask);

  function handleJoinRoom() {
    clientID += 1;
    client.number = clientID;
    clientRoom[client.id] = roomName;
    client.join(roomName);
    // console.log(clientRoom);
  }
  function createTask(item) {
    Task.create(item);
    // io.sockets.in(roomName).emit("createTask", item);
    client.emit("createTask", item);
  }
  async function deleteTask(idSent, items) {
    const nrOfDeleted = await Task.deleteOne({ id: idSent });
    // io.sockets.in(roomName).emit("deleteTask", nrOfDeleted);
    client.emit("deleteTask", nrOfDeleted);
    await io.sockets.in(roomName).emit("getItemsResponse", !items ? [] : items, !items ? 0 : items.length);
  }
  async function getItems() {
    // console.log("TEST");
    const items = await Task.find({ id: { $gt: -1 } });
    io.sockets.in(roomName).emit("getItemsResponse", !items ? [] : items, !items ? 0 : items.length);
    // client.emit("getItemsResponse", items);
  }

  async function updateTask(item, items) {
    await Task.replaceOne({ id: item.id }, item);
    await io.sockets.in(roomName).emit("getItemsResponse", !items ? [] : items, !items ? 0 : items.length);
  }
});

/* async function getItems() {
  console.log("TEST");
  const items = await Task.find({ id: { $gt: -1 } });
  io.sockets.in(roomName).emit("getItemsResponse", items);
  // client.emit("getItemsResponse", items);
} */

/* ## Listen on PORT provided by Heroku (or 3000 if local): ## */
server.listen(process.env.PORT || 3000);
