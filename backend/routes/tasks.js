const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get all tasks
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedUser", "username");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a task
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, status, priority, assignedUser } = req.body;

    // Prevent column-name match
    if (["Todo", "In Progress", "Done"].includes(title)) {
      return res.status(400).json({ message: "Task title cannot match column names." });
    }

    // Unique title check
    const existing = await Task.findOne({ title });
    if (existing) {
      return res.status(400).json({ message: "Task title must be unique." });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      assignedUser,
      createdBy: req.user
    });

    // Real-time emit
    const io = req.app.get("socketio");
    io.emit("taskCreated", task);

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a task
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const updatedFields = req.body;
    updatedFields.lastModified = Date.now();

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true
    });

    const io = req.app.get("socketio");
    io.emit("taskUpdated", updatedTask);

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Task.findByIdAndDelete(req.params.id);

    const io = req.app.get("socketio");
    io.emit("taskDeleted", req.params.id);

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Smart Assign a task to the user with fewest active tasks
router.post("/:id/smart-assign", auth, async (req, res) => {
  try {
    const taskId = req.params.id;

    const users = await Task.aggregate([
      {
        $match: { status: { $in: ["Todo", "In Progress"] }, assignedUser: { $ne: null } }
      },
      {
        $group: {
          _id: "$assignedUser",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: 1 }
      }
    ]);

    // Get all users from the database
    const User = require("../models/User");
    const allUsers = await User.find();

    let chosenUser;

    // If some users have no task, pick from them
    if (users.length < allUsers.length) {
      const assignedIds = users.map(u => u._id.toString());
      const unassigned = allUsers.filter(u => !assignedIds.includes(u._id.toString()));
      chosenUser = unassigned[0];
    } else {
      // Choose the one with least tasks
      chosenUser = await User.findById(users[0]._id);
    }

    if (!chosenUser) {
      return res.status(400).json({ message: "No user found to assign" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        assignedUser: chosenUser._id,
        lastModified: Date.now()
      },
      { new: true }
    ).populate("assignedUser", "username");

    // Emit real-time
    const io = req.app.get("socketio");
    io.emit("taskUpdated", updatedTask);

    res.json({
      message: `Task smart-assigned to ${chosenUser.username}`,
      task: updatedTask
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Update task with conflict detection
router.put("/:id", auth, async (req, res) => {
  try {
    const clientModifiedTime = req.body.lastModified;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Conflict detection
    const serverModifiedTime = task.lastModified?.getTime() || 0;
    if (clientModifiedTime && clientModifiedTime < serverModifiedTime) {
      return res.status(409).json({
        message: "Conflict detected",
        serverVersion: task,
        clientVersion: req.body
      });
    }

    const updatedFields = req.body;
    updatedFields.lastModified = Date.now();

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true
    });

    const io = req.app.get("socketio");
    io.emit("taskUpdated", updatedTask);

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
