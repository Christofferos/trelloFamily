const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
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
  client.on("createTask", createTask);
  client.on("deleteTask", deleteTask);

  function createTask(item) {
    Task.create(item);
    client.emit("createTask", "End of task creation reached.");
  }
  function deleteTask(idSent) {
    Task.deleteOne({ id: idSent });
    client.emit("deleteTask", "End of task deletion reached.");
  }
});

/* ## Listen on PORT provided by Heroku (or 3000 if local): ## */
io.listen(process.env.PORT || 3000);
