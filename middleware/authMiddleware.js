// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1️⃣ Check token presence
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ================= ADMIN =================
    if (decoded.role === "admin") {
      // ✅ Admin does NOT need DB staff check
      req.user = {
        id: decoded.id,
        role: "admin",
      };
      return next();
    }

    // ================= STAFF =================
    if (decoded.role === "staff") {
      db.query(
        "SELECT id, username, is_on_duty FROM staff WHERE id = ?",
        [decoded.id],
        (err, results) => {
          if (err) {
            console.error("Auth DB error:", err);
            return res.status(500).json({ message: "Auth server error" });
          }

          if (results.length === 0) {
            return res.status(401).json({ message: "Staff not found" });
          }

          if (results[0].is_on_duty === 0) {
            return res.status(403).json({ message: "Staff is not on duty" });
          }

          // ✅ Attach staff user
          req.user = {
            id: results[0].id,
            username: results[0].username,
            role: "staff",
          };

          next();
        }
      );
    } else {
      return res.status(403).json({ message: "Invalid role" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = protect;
