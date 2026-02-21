const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= REGISTER STAFF =================
const registerStaff = (req, res) => {
  const { name, username, password, phone } = req.body;

  if (!name || !username || !password || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query(
    "SELECT id FROM staff WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        `INSERT INTO staff (name, username, password, phone, is_on_duty, access_requested)
         VALUES (?, ?, ?, ?, 0, 0)`,
        [name, username, hashedPassword, phone],
        (err) => {
          if (err) return res.status(500).json({ message: "Failed to create staff" });
          res.json({ message: "Staff created successfully" });
        }
      );
    }
  );
};

// ================= STAFF LOGIN =================
const loginStaff = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  db.query(
    "SELECT * FROM staff WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) {
        return res.status(401).json({ message: "Staff not found" });
      }

      const staff = results[0];
      const isMatch = await bcrypt.compare(password, staff.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (staff.is_on_duty === 0) {
        return res.status(403).json({
          accessDenied: true,
          staffId: staff.id,
          message: "Admin has not granted access yet",
        });
      }

      const token = jwt.sign(
        { id: staff.id, role: "staff" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login successful",
        token,
        staff: { id: staff.id, name: staff.name },
      });
    }
  );
};

// ================= REQUEST ACCESS =================
const requestAccess = (req, res) => {
  const { staffId } = req.body;

  if (!staffId) {
    return res.status(400).json({ message: "staffId is required" });
  }

  db.query(
    "UPDATE staff SET access_requested = 1 WHERE id = ?",
    [staffId],
    (err) => {
      if (err) return res.status(500).json({ message: "Failed to send request" });
      res.json({ message: "Access request sent to admin" });
    }
  );
};

// ================= GET ALL STAFF =================


// ================= TOGGLE DUTY =================
const toggleDuty = (req, res) => {
  const { id } = req.params;
  const { is_on_duty } = req.body;

  db.query(
    "UPDATE staff SET is_on_duty = ?, access_requested = 0 WHERE id = ?",
    [is_on_duty, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Failed to update" });
      res.json({ message: "Staff status updated" });
    }
  );
};


const getAllStaff = (req, res) => {
  db.query(
    "SELECT id, name, username, phone, is_on_duty, access_requested FROM staff",
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results);
    }
  );
};

// ================= GET ALL VEHICLES =================
const getAllVehicles = (req, res) => {
  // Optionally, filter by staff_id if needed: const staffId = req.user.id;
  const query = `
    SELECT * FROM vehicles
    ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch vehicles" });
    res.json(results);
  });
};


// ================= VEHICLE ENTRY =================
const vehicleEntry = (req, res) => {
  const { vehicleNumber, vehicleType } = req.body;
  const staffId = req.user.id;

  if (!vehicleNumber || !vehicleType) {
    return res.status(400).json({
      message: "Vehicle number and vehicle type are required",
    });
  }

  const checkQuery = `
    SELECT id FROM vehicles
    WHERE vehicle_number = ? AND exit_time IS NULL
  `;

  db.query(checkQuery, [vehicleNumber], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "Vehicle already inside parking" });
    }

    const insertQuery = `
      INSERT INTO vehicles (vehicle_number, vehicle_type, staff_id, entry_time, payment_status)
      VALUES (?, ?, ?, NOW(), 'UNPAID')
    `;

    db.query(insertQuery, [vehicleNumber, vehicleType, staffId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Entry failed" });
      }

      res.status(201).json({
        message: "Vehicle entry recorded",
        vehicleId: result.insertId,
      });
    });
  });
};

// ================= FEE CALCULATION =================
const calculateFee = (vehicleType, hours) => {
  const baseRate = vehicleType === "TWO_WHEELER" ? 10 : 20;
  const extraRate = 5;

  if (hours <= 1) return baseRate;
  return baseRate + (hours - 1) * extraRate;
};

// ================= VEHICLE EXIT =================
const vehicleExit = (req, res) => {
  const { vehicleNumber } = req.body;

  if (!vehicleNumber) {
    return res.status(400).json({ message: "Vehicle number is required" });
  }

  const findQuery = `
    SELECT id, entry_time, vehicle_type
    FROM vehicles
    WHERE vehicle_number = ? AND exit_time IS NULL
    LIMIT 1
  `;

  db.query(findQuery, [vehicleNumber], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length === 0) {
      return res.status(404).json({ message: "No active entry found" });
    }

    const { id, entry_time, vehicle_type } = results[0];

    const entryTime = new Date(entry_time);
    const exitTime = new Date();
    const hours = Math.ceil((exitTime - entryTime) / (1000 * 60 * 60));

    const fee = calculateFee(vehicle_type, hours);

    const updateQuery = `
      UPDATE vehicles
      SET exit_time = NOW(), fee = ?, payment_status = 'UNPAID'
      WHERE id = ?
    `;

    db.query(updateQuery, [fee, id], (err) => {
      if (err) return res.status(500).json({ message: "Exit failed" });

      res.json({
        message: "Vehicle exit recorded",
        vehicleType: vehicle_type,
        durationHours: hours,
        fee,
      });
    });
  });
};

module.exports = {
  registerStaff,
  loginStaff,
  requestAccess,
  getAllStaff,
  getAllVehicles ,
  toggleDuty,
  vehicleEntry,
  vehicleExit,
};
