const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

//Load envrioment variables
dotenv.config();

// Initialise app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "initial test route" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
