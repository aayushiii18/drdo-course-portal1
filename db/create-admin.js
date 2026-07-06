const bcrypt = require('bcryptjs');
const db = require('./database');

const username = 'admin';
const plainPassword = 'admin123'; // change this to whatever you want

const hash = bcrypt.hashSync(plainPassword, 10);
db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);

console.log(`Admin created: ${username} / ${plainPassword}`);