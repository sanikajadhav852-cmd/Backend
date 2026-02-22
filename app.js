const express = require("express");
const cors = require("cors"); 
const app = express();

// ✅ CORS MUST BE FIRST
app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend-url.com"], // allow your frontend(s)
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Parking Fee API is running");
});


app.use(cors({
  origin: "*",   // allow all for testing
  credentials: true
}));
// Mount your routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));

module.exports = app;