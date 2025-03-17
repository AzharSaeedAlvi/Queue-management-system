const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to Database
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String, // admin, user, supervisor
});

const QueueSchema = new mongoose.Schema({
  userId: String,
  type: String, // case, call, break, manual task, exception
  status: String, // active, completed, on-break
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const Queue = mongoose.model("Queue", QueueSchema);

// User Registration
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, role });
  await user.save();
  res.json({ message: "User registered successfully" });
});

// User Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token, role: user.role });
});

// Add to Queue
app.post("/queue", async (req, res) => {
  const { userId, type } = req.body;
  const queueItem = new Queue({ userId, type, status: "active" });
  await queueItem.save();
  res.json({ message: "Added to queue" });
});

// Get Queue
app.get("/queue", async (req, res) => {
  const queue = await Queue.find({ status: "active" }).sort({ timestamp: 1 });
  res.json(queue);
});

// Complete Task
app.post("/queue/complete", async (req, res) => {
  const { id } = req.body;
  await Queue.findByIdAndUpdate(id, { status: "completed" });
  res.json({ message: "Task completed" });
});

// Forgot Password (Admin Reset)
app.post("/reset-password", async (req, res) => {
  const { username, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ username }, { password: hashedPassword });
  res.json({ message: "Password reset successfully" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
