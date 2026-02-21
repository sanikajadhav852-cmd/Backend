const express = require("express");
const router = express.Router();

const {
  totalVehiclesToday,
  totalRevenueToday,
  unpaidVehicles,
  staffCollection
} = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");

// Admin dashboard routes
router.get("/vehicles-today", protect, totalVehiclesToday);
router.get("/revenue-today", protect, totalRevenueToday);
router.get("/unpaid", protect, unpaidVehicles);
router.get("/staff-collection", protect, staffCollection);

module.exports = router;
