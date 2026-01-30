import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'exam.db');
export const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'student')),
    completed_courses TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    course_key TEXT NOT NULL,
    questions TEXT NOT NULL,
    duration INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exam_attempts (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    answers TEXT NOT NULL,
    score REAL NOT NULL,
    completed_at TEXT NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
  );
`);

// Seed default admin if none exists
const adminCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get();
if (adminCount.c === 0) {
  const adminId = 'admin-1';
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare(
    `INSERT INTO users (id, username, password_hash, role, completed_courses) VALUES (?, ?, ?, 'admin', '[]')`
  ).run(adminId, 'admin', hash);
  console.log('Default admin created: username=admin, password=admin123');
}

export function getUserByUsername(username) {
  const row = db.prepare('SELECT * FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM(?))').get(username?.trim() || '');
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    completedCourses: JSON.parse(row.completed_courses || '[]'),
  };
}

export function getUserById(id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    completedCourses: JSON.parse(row.completed_courses || '[]'),
  };
}

export function checkPassword(username, plainPassword) {
  const row = db.prepare('SELECT id, password_hash, username, role, completed_courses FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM(?))').get(username?.trim() || '');
  if (!row) return null;
  if (!bcrypt.compareSync(plainPassword, row.password_hash)) return null;
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    completedCourses: JSON.parse(row.completed_courses || '[]'),
  };
}

export function createUser(id, username, passwordHash, role) {
  db.prepare(
    `INSERT INTO users (id, username, password_hash, role, completed_courses) VALUES (?, ?, ?, ?, '[]')`
  ).run(id, username.trim(), passwordHash, role);
  return getUserById(id);
}

export function updateUserCompletedCourses(userId, completedCourses) {
  db.prepare('UPDATE users SET completed_courses = ? WHERE id = ?').run(
    JSON.stringify(completedCourses),
    userId
  );
  return getUserById(userId);
}

export function getAllExams() {
  const rows = db.prepare('SELECT * FROM exams ORDER BY created_at DESC').all();
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    courseKey: r.course_key,
    questions: JSON.parse(r.questions || '[]'),
    duration: r.duration,
    createdAt: r.created_at,
  }));
}

export function getExamById(id) {
  const row = db.prepare('SELECT * FROM exams WHERE id = ?').get(id);
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    courseKey: row.course_key,
    questions: JSON.parse(row.questions || '[]'),
    duration: row.duration,
    createdAt: row.created_at,
  };
}

export function createExam(exam) {
  db.prepare(
    `INSERT INTO exams (id, title, type, course_key, questions, duration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    exam.id,
    exam.title,
    exam.type,
    exam.courseKey,
    JSON.stringify(exam.questions),
    exam.duration,
    exam.createdAt
  );
  return getExamById(exam.id);
}

export function updateExam(exam) {
  db.prepare(
    `UPDATE exams SET title = ?, type = ?, course_key = ?, questions = ?, duration = ? WHERE id = ?`
  ).run(
    exam.title,
    exam.type,
    exam.courseKey,
    JSON.stringify(exam.questions),
    exam.duration,
    exam.id
  );
  return getExamById(exam.id);
}

export function deleteExam(id) {
  db.prepare('DELETE FROM exam_attempts WHERE exam_id = ?').run(id);
  return db.prepare('DELETE FROM exams WHERE id = ?').run(id);
}

export function getAttemptsByStudentId(studentId) {
  const rows = db.prepare('SELECT * FROM exam_attempts WHERE student_id = ? ORDER BY completed_at DESC').all(studentId);
  return rows.map((r) => ({
    id: r.id,
    examId: r.exam_id,
    studentId: r.student_id,
    answers: JSON.parse(r.answers || '{}'),
    score: r.score,
    completedAt: r.completed_at,
  }));
}

export function createAttempt(attempt) {
  db.prepare(
    `INSERT INTO exam_attempts (id, exam_id, student_id, answers, score, completed_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    attempt.id,
    attempt.examId,
    attempt.studentId,
    JSON.stringify(attempt.answers),
    attempt.score,
    attempt.completedAt
  );
  return attempt;
}
