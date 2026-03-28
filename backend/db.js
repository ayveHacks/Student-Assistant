const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'campus.sqlite'); // Changed name to avoid old lock
const db = new Database(dbPath);

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'faculty')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      faculty_id INTEGER,
      FOREIGN KEY(faculty_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY,
      student_id INTEGER,
      course_id INTEGER,
      time_slot TEXT NOT NULL,
      FOREIGN KEY(student_id) REFERENCES users(id),
      FOREIGN KEY(course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      venue TEXT NOT NULL,
      time TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      student_id INTEGER,
      related_entity TEXT,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'escalated')) NOT NULL DEFAULT 'pending',
      assigned_to INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES users(id),
      FOREIGN KEY(assigned_to) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL,
      state TEXT NOT NULL,
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const hasUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

  if (hasUsers === 0) {
    // Seed demo data
    const insertUser = db.prepare('INSERT INTO users (id, name, role) VALUES (?, ?, ?)');
    insertUser.run(1, 'Alice Student', 'student');
    insertUser.run(2, 'Bob Student', 'student');
    insertUser.run(3, 'Dr. Smith', 'faculty');
    insertUser.run(4, 'Prof. Johnson', 'faculty');

    const insertCourse = db.prepare('INSERT INTO courses (id, name, faculty_id) VALUES (?, ?, ?)');
    insertCourse.run(101, 'DAA', 3);
    insertCourse.run(102, 'Physics', 4);
    insertCourse.run(103, 'Chemistry', 4);

    const insertTimetable = db.prepare('INSERT INTO timetable (student_id, course_id, time_slot) VALUES (?, ?, ?)');
    insertTimetable.run(1, 101, 'Monday 10:00 AM');
    insertTimetable.run(1, 102, 'Monday 10:00 AM');
    insertTimetable.run(2, 103, 'Tuesday 11:00 AM');

    const insertEvent = db.prepare('INSERT INTO events (id, name, venue, time) VALUES (?, ?, ?, ?)');
    insertEvent.run(1, 'TechFest 2026', 'Main Auditorium', 'Today 5:00 PM');
    insertEvent.run(2, 'Job Fair', 'UB Tower', 'Tomorrow 10:00 AM');

    console.log('Database initialized with seed data.');
  } else {
    console.log('Database already seeded.');
  }
}

initDb();

module.exports = db;
