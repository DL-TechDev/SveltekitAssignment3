const express = require("express");
const app = express();

const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:5173", // Frontend origin
  credentials: true, // Allow credentials (cookies)
  methods: "GET,POST,PUT",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));

var cookieParser = require("cookie-parser");
app.use(cookieParser());

// Middleware
app.use(express.json()); // For parsing application/json

// Import all routes
const user = require("./routes/user");
const group = require("./routes/group");
const authRoute = require("./routes/auth");
const taskRoute = require("./routes/taskManagement");

// Routes
app.use("/user", user);
app.use("/group", group);
app.use("/auth", authRoute);
// routes for app, plan, tasks
app.use("/tasks", taskRoute);

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
