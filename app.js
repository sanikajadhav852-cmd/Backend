const express = require("express");
const cors = require("cors"); 
const app = express();


app.use(express.json());

app.get("/", (req, res) => {
  res.send("Parking Fee API is running");
});


app.use(cors({
  origin: "http://localhost:5173", // frontend origin
  credentials: true
}));



app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));

module.exports = app;