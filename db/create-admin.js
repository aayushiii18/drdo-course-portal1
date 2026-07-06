const bcrypt = require('bcryptjs');
const db = require('./database');

const username = 'admin';
const plainPassword = 'admin123';

const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);

if (existing) {
  console.log('Admin already exists, skipping.');
} else {
  const hash = bcrypt.hashSync(plainPassword, 10);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);
  console.log(`Admin created: ${username} / ${plainPassword}`);
}