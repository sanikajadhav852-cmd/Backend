const db = require("../config/db");
const bcrypt = require("bcryptjs");
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

// ================= CREATE STAFF =================
const createStaff = async (req, res) => {
  const { name, username, password, phone } = req.body;

  if (!name || !username || !password || !phone) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query(
    "SELECT id FROM staff WHERE username = ?",
    [username],
    async (err, exists) => {
      if (exists.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        `INSERT INTO staff 
         (name, username, password, phone, is_on_duty, access_requested)
         VALUES (?, ?, ?, ?, 0, 0)`,
        [name, username, hashedPassword, phone],
        async () => {
          try {
            await client.messages.create({
              body: `Parking System Login:
Username: ${username}
Password: ${password}`,
              from: process.env.TWILIO_PHONE,
              to: phone,
            });
          } catch {
            console.log("SMS failed");
          }

          res.json({ message: "Staff created & credentials sent" });
        }
      );
    }
  );
};

// ================= ENABLE / DISABLE STAFF =================
const toggleStaffAccess = (req, res) => {
  const { staffId, is_on_duty } = req.body;

  db.query(
    "UPDATE staff SET is_on_duty = ?, access_requested = 0 WHERE id = ?",
    [is_on_duty, staffId],
    () => res.json({ message: "Access updated" })
  );
};

// ================= VIEW STAFF =================
const getAllStaff = (req, res) => {
  db.query(
    "SELECT id, name, username, phone, is_on_duty, access_requested FROM staff",
    (err, result) => res.json(result)
  );
};

module.exports = {
  createStaff,
  toggleStaffAccess,
  getAllStaff,
};
