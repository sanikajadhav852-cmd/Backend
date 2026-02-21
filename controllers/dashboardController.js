const db = require("../config/db");

// 1️⃣ Total Vehicles Today
const totalVehiclesToday = (req, res) => {
  const query = `
    SELECT COUNT(*) AS total
    FROM vehicles
    WHERE DATE(entry_time) = CURDATE()
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ vehicles_today: result[0].total });
  });
};

// 2️⃣ Total Revenue Today
const totalRevenueToday = (req, res) => {
  const query = `
    SELECT IFNULL(SUM(fee), 0) AS revenue
    FROM vehicles
    WHERE DATE(exit_time) = CURDATE()
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ revenue_today: result[0].revenue });
  });
};

// 3️⃣ Unpaid Vehicles
const unpaidVehicles = (req, res) => {
  const query = `
    SELECT id, vehicle_number, entry_time
    FROM vehicles
    WHERE fee IS NULL
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
};

// 4️⃣ Staff-wise Collection
const staffCollection = (req, res) => {
  const query = `
    SELECT s.name, COUNT(v.id) AS vehicles, SUM(v.fee) AS total_amount
    FROM vehicles v
    JOIN staff s ON v.staff_id = s.id
    WHERE v.fee IS NOT NULL
    GROUP BY s.id
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
};

module.exports = {
  totalVehiclesToday,
  totalRevenueToday,
  unpaidVehicles,
  staffCollection
};
