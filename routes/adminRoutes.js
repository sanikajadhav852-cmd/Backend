const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createStaff,
  toggleStaffAccess,
  getAllStaff,
} = require("../controllers/adminController");

// 🔒 ADMIN ONLY MIDDLEWARE
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

router.post("/create-staff", protect, adminOnly, createStaff);
router.get("/staff", protect, adminOnly, getAllStaff);
router.put("/toggle-access", protect, adminOnly, toggleStaffAccess);

module.exports = router;
