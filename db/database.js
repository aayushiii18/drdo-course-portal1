const Database = require('better-sqlite3');
const db = new Database('db/portal.db');


db.exec(`
  CREATE TABLE IF NOT EXISTS labs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    director TEXT NOT NULL,
    designation TEXT NOT NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    course_director TEXT NOT NULL,
    director_designation TEXT NOT NULL,
    lab_id INTEGER NOT NULL,
    FOREIGN KEY (lab_id) REFERENCES labs(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    lab_assigned TEXT NOT NULL,
    lab_address TEXT NOT NULL,
    email TEXT NOT NULL,
    dob TEXT NOT NULL,
    accommodation TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

module.exports = db; 