const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",      // ✅ EMPTY PASSWORD
  database: "parksmart",
  port: 3307          // ✅ XAMPP MySQL port
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ MySQL Connected on port 3307");
  }
});

module.exports = db;