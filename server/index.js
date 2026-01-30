import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  db,
  checkPassword,
  getUserById,
  getUserByUsername,
  createUser,
  updateUserCompletedCourses,
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getAttemptsByStudentId,
  createAttempt,
} from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'exam-app-secret-change-in-production';
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminOnly(req, res, next) {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

// —— Auth ——
app.post('/api/auth/register', (req, res) => {
  const { username, password, role } = req.body;
  if (!username?.trim() || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const r = role === 'admin' ? 'admin' : 'student';
  if (getUserByUsername(username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  const id = `user-${crypto.randomUUID().slice(0, 8)}`;
  const hash = bcrypt.hashSync(password, 10);
  const user = createUser(id, username.trim(), hash, r);
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  return res.json({ user, token });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const user = checkPassword(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  return res.json({ user, token });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(user);
});

app.put('/api/auth/me/courses', authMiddleware, (req, res) => {
  const { courseKey } = req.body;
  if (!courseKey) return res.status(400).json({ error: 'courseKey required' });
  const user = getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const courses = user.completedCourses.includes(courseKey) ? user.completedCourses : [...user.completedCourses, courseKey];
  const updated = updateUserCompletedCourses(req.userId, courses);
  return res.json(updated);
});

// —— Exams (admin: create/update/delete; all authenticated: list) ——
app.get('/api/exams', authMiddleware, (req, res) => {
  const exams = getAllExams();
  return res.json(exams);
});

app.post('/api/exams', authMiddleware, adminOnly, (req, res) => {
  const { id, title, type, courseKey, questions, duration, createdAt } = req.body;
  if (!title || !type || !courseKey || !Array.isArray(questions) || duration == null) {
    return res.status(400).json({ error: 'Missing required exam fields' });
  }
  const exam = {
    id: id || `exam-${Date.now()}`,
    title,
    type,
    courseKey,
    questions,
    duration: Number(duration),
    createdAt: createdAt || new Date().toISOString(),
  };
  createExam(exam);
  return res.status(201).json(exam);
});

app.put('/api/exams/:id', authMiddleware, adminOnly, (req, res) => {
  const existing = getExamById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Exam not found' });
  const { title, type, courseKey, questions, duration } = req.body;
  const exam = {
    id: existing.id,
    title: title ?? existing.title,
    type: type ?? existing.type,
    courseKey: courseKey ?? existing.courseKey,
    questions: Array.isArray(questions) ? questions : existing.questions,
    duration: duration != null ? Number(duration) : existing.duration,
    createdAt: existing.createdAt,
  };
  updateExam(exam);
  return res.json(exam);
});

app.delete('/api/exams/:id', authMiddleware, adminOnly, (req, res) => {
  if (!getExamById(req.params.id)) return res.status(404).json({ error: 'Exam not found' });
  deleteExam(req.params.id);
  return res.status(204).send();
});

// —— Attempts ——
app.get('/api/attempts', authMiddleware, (req, res) => {
  const attempts = getAttemptsByStudentId(req.userId);
  return res.json(attempts);
});

app.post('/api/attempts', authMiddleware, (req, res) => {
  const { id, examId, answers, score, completedAt } = req.body;
  if (!examId || typeof score !== 'number' || !completedAt) {
    return res.status(400).json({ error: 'Missing required attempt fields' });
  }
  const attempt = {
    id: id || `attempt-${Date.now()}`,
    examId,
    studentId: req.userId,
    answers: answers || {},
    score,
    completedAt,
  };
  createAttempt(attempt);
  return res.status(201).json(attempt);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`From other devices use your PC IP, e.g. http://10.52.195.75:${PORT}`);
});
