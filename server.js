const express = require('express');
const db = require('./db/database'); 
require('./db/create-admin');
require('./db/seed');
const app = express();
const session = require('express-session');
const bcrypt = require('bcryptjs');
function requireLogin(req, res, next){
  if (!req.session.adminId) {
    return res.redirect('/admin/login');
  }
  next();
}

app.use(session({
  secret: 'some-long-random-string-change-this-later',
  resave: false,
  saveUninitialized: false
}));

const { generateLetter } = require('./utils/letter');
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  const courses = db.prepare(`
    SELECT courses.*, labs.name AS lab_name
    FROM courses
    JOIN labs ON labs.id = courses.lab_id
  `).all();

  res.render('home', { courses });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get('/course/:id', (req, res) => {
  const courseId = req.params.id; // whatever number is in the URL

  const course = db.prepare(`
    SELECT courses.*, 
           labs.name AS lab_name, 
           labs.address AS lab_address,
           labs.director AS lab_director,
           labs.designation AS lab_designation
    FROM courses
    JOIN labs ON labs.id = courses.lab_id
    WHERE courses.id = ?
  `).get(courseId);

  if (!course) {
    return res.status(404).send('Course not found');
  }

  res.render('course-detail', { course });
});
app.get('/course/:id/apply', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) {
    return res.status(404).send('Course not found');
  }
  res.render('apply', { course });
});
app.post('/course/:id/apply', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) {
    return res.status(404).send('Course not found');
  }

  const lab = db.prepare('SELECT * FROM labs WHERE id = ?').get(course.lab_id);
  const { name, lab_assigned, lab_address, email, dob, accommodation } = req.body;

  const result = db.prepare(`
    INSERT INTO applications (course_id, name, lab_assigned, lab_address, email, dob, accommodation)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(course.id, name, lab_assigned, lab_address, email, dob, accommodation);

  const application = { id: result.lastInsertRowid, name, lab_assigned, lab_address, email, dob, accommodation };

  generateLetter(res, application, course, lab);
});

app.get('/admin/login', (req, res) => {
  res.render('admin-login', { error: null });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.render('admin-login', { error: 'Invalid username or password' });
  }

  req.session.adminId = admin.id; // mark this session as logged in
  res.redirect('/admin/dashboard');
});

 
  app.get('/admin/dashboard', requireLogin, (req, res) => {
  const courseCount = db.prepare('SELECT COUNT(*) AS count FROM courses').get().count;
  const labCount = db.prepare('SELECT COUNT(*) AS count FROM labs').get().count;
  const applicationCount = db.prepare('SELECT COUNT(*) AS count FROM applications').get().count;

  res.render('admin-dashboard', { courseCount, labCount, applicationCount });
});

app.get('/admin/labs/new', requireLogin, (req, res) => {
  res.render('admin-lab-form', { errors: null });
});

app.post('/admin/labs/new', requireLogin, (req, res) => {
  const { name, address, director, designation } = req.body;

  db.prepare(`
    INSERT INTO labs (name, address, director, designation)
    VALUES (?, ?, ?, ?)
  `).run(name, address, director, designation);

  res.redirect('/admin/labs');
});
app.get('/admin/labs', requireLogin, (req, res) => {
  const labs = db.prepare('SELECT * FROM labs').all();
  res.render('admin-labs', { labs });
});
app.get('/admin/courses/new', requireLogin, (req, res) => {
  const labs = db.prepare('SELECT * FROM labs').all();
  res.render('admin-course-form', { labs });
});

app.post('/admin/courses/new', requireLogin, (req, res) => {
  const { title, start_date, end_date, course_director, director_designation, lab_id } = req.body;

  db.prepare(`
    INSERT INTO courses (title, start_date, end_date, course_director, director_designation, lab_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, start_date, end_date, course_director, director_designation, lab_id);

  res.redirect('/admin/courses');
});

app.get('/admin/courses', requireLogin, (req, res) => {
  const courses = db.prepare(`
    SELECT courses.*, labs.name AS lab_name
    FROM courses
    JOIN labs ON labs.id = courses.lab_id
  `).all();
  res.render('admin-courses', { courses });
});
