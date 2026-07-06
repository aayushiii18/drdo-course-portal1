const db = require('./database');

const existingLabs = db.prepare('SELECT COUNT(*) AS count FROM labs').get().count;

if (existingLabs > 0) {
  console.log('Sample data already exists, skipping seed.');
} else {
  // Insert one lab
  const insertLab = db.prepare(`
    INSERT INTO labs (name, address, director, designation)
    VALUES (?, ?, ?, ?)
  `);
  const labResult = insertLab.run(
    'Solid State Physics Laboratory (SSPL)',
    'Lucknow Road, Timarpur, Delhi - 110054',
    'Dr. A. K. Sharma',
    'Director, SSPL'
  );

  console.log('Inserted lab with id:', labResult.lastInsertRowid);

  // Insert one course, linked to that lab
  const insertCourse = db.prepare(`
    INSERT INTO courses (title, start_date, end_date, course_director, director_designation, lab_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const courseResult = insertCourse.run(
    'Advanced Materials for Defence Applications',
    '2026-08-10',
    '2026-08-21',
    'Dr. Neha Kulkarni',
    "Scientist 'G' & Course Director",
    labResult.lastInsertRowid
  );

  console.log('Inserted course with id:', courseResult.lastInsertRowid);
}