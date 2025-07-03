const mongoose = require("mongoose");

const actionLogSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      enum: ["ADD", "EDIT", "DELETE", "MOVE", "REASSIGN"],
      required: true
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    description: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActionLog", actionLogSchema);
