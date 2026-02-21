const bcrypt = require('bcryptjs');
const db = require('./config/db'); // adjust path to your db config

async function resetAdmin() {
  const username = 'admin';
  const newPlainPassword = 'Admin@123'; // or whatever you want

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPlainPassword, salt);

  console.log('New hash:', newHash);

  db.query(
    'UPDATE admin SET password = ? WHERE username = ?',
    [newHash, username],
    (err, result) => {
      if (err) {
        console.error('Update error:', err);
        return;
      }
      console.log('Admin password updated successfully. Affected rows:', result.affectedRows);
      process.exit(0);
    }
  );
}

resetAdmin();