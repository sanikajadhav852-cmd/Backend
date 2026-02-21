// routes/staffRoutes.js
const express = require("express");
const router = express.Router();

const {
  registerStaff,
  loginStaff,
  requestAccess,
  getAllStaff,
  toggleDuty,
  getAllVehicles,
  vehicleEntry,   // ← add
  vehicleExit, 
     // ← add
} = require("../controllers/staffController");

const protect = require("../middleware/authMiddleware"); // your auth middleware

// Public routes
router.post("/login", loginStaff);
router.post("/request-access", requestAccess);

// Protected routes (require JWT + staff on duty)
router.post("/register", protect, registerStaff);
router.get("/all", protect, getAllStaff);
router.put("/toggle-duty/:id", protect, toggleDuty);

// New vehicle routes (staff only, protected)
router.get("/vehicles", protect, getAllVehicles);
router.post("/vehicle/entry", protect, vehicleEntry);
router.post("/vehicle/exit", protect, vehicleExit);

module.exports = router;