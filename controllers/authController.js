const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = (req, res) => {
  const { username, password } = req.body;

  // Admin first
  db.query(
    "SELECT * FROM admin WHERE username = ?",
    [username],
    async (_, admin) => {
      if (admin.length > 0) {
        const match = await bcrypt.compare(password, admin[0].password);
        if (!match) return res.status(400).json({ message: "Invalid credentials" });

        return res.json({
          token: jwt.sign(
  { id: admin.id, role: "admin" },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
),
          role: "admin",
        });
      }

      // Staff
     db.query("SELECT * FROM staff WHERE username = ?", [username], async (err, staffResults) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (staffResults.length === 0) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const staff = staffResults[0];
      if (!(await bcrypt.compare(password, staff.password))) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      if (staff.is_on_duty === 0) {
        return res.status(403).json({
          accessDenied: true,
          staffId: staff.id,
          message: "Access not granted by admin yet. Please request access.",
        });
      }

      const token = jwt.sign({ id: staff.id, role: "staff" }, process.env.JWT_SECRET, { expiresIn: "1d" });
      res.json({ token, role: "staff", message: "Staff login successful" });
    });
  });
}

module.exports = { login };
