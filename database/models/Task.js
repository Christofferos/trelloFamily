const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  id: Number,
  icon: Number,
  status: String,
  title: String,
  content: String,
  created: Date,
  modified: Date,
  activity: Array /* [String] */,
  currentComment: String,
});

module.exports = mongoose.model("Task", TaskSchema);
