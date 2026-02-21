const db = require("../config/db");

// ✅ Vehicle Entry
const vehicleEntry = (req, res) => {
  const { vehicle_number } = req.body;
  const staff_id = req.user.id;

  if (!vehicle_number) {
    return res.status(400).json({ message: "Vehicle number is required" });
  }

  const query =
    "INSERT INTO vehicles (vehicle_number, staff_id, entry_time) VALUES (?, ?, NOW())";

  db.query(query, [vehicle_number, staff_id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(201).json({
      message: "Vehicle entry recorded",
      vehicle_id: result.insertId,
    });
  });
};

// ✅ Vehicle Exit
const vehicleExit = (req, res) => {
  const { vehicle_id } = req.body;

  if (!vehicle_id) {
    return res.status(400).json({ message: "Vehicle ID is required" });
  }

  const getQuery = "SELECT entry_time FROM vehicles WHERE id = ?";
  db.query(getQuery, [vehicle_id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Vehicle not found" });

    const entry_time = results[0].entry_time;
    const exit_time = new Date();

    const hours = Math.ceil((exit_time - entry_time) / (1000 * 60 * 60));
    const fee = hours * 50;

    const updateQuery = `
      UPDATE vehicles 
      SET exit_time = NOW(),
          total_hours = ?,
          fee = ?,
          payment_status = 'UNPAID'
      WHERE id = ?
    `;

    db.query(updateQuery, [hours, fee, vehicle_id], (err) => {
      if (err) return res.status(500).json({ message: err.message });

      res.status(200).json({
        message: "Vehicle exit recorded",
        hours,
        fee,
        payment_status: "UNPAID",
      });
    });
  });
};

const markPaymentPaid = (req, res) => {
  const { vehicle_id } = req.body;

  if (!vehicle_id) {
    return res.status(400).json({ message: "Vehicle ID is required" });
  }

  const query = `
    UPDATE vehicles 
    SET payment_status = 'PAID'
    WHERE id = ?
  `;

  db.query(query, [vehicle_id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Vehicle not found" });

    res.status(200).json({ message: "Payment marked as PAID" });
  });
};


module.exports = { vehicleEntry, vehicleExit, markPaymentPaid  };
