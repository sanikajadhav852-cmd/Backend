const express = require("express");
const router = express.Router();

const {
  vehicleEntry,
  vehicleExit,
  markPaymentPaid
} = require("../controllers/vehicleController");

const protect = require("../middleware/authMiddleware");

// Vehicle entry
router.post("/entry", protect, vehicleEntry);

// Vehicle exit
router.post("/exit", protect, vehicleExit);
router.post("/pay", protect, markPaymentPaid);

module.exports = router;
