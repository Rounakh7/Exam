import { User, Exam, ExamAttempt } from '../types';

const USERS_KEY = 'exam_users';
const EXAMS_KEY = 'exam_exams';
const ATTEMPTS_KEY = 'exam_attempts';
const CURRENT_USER_KEY = 'exam_current_user';

export const storage = {
  getUsers: (): User[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getExams: (): Exam[] => {
    const exams = localStorage.getItem(EXAMS_KEY);
    return exams ? JSON.parse(exams) : [];
  },

  saveExams: (exams: Exam[]) => {
    localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
  },

  getAttempts: (): ExamAttempt[] => {
    const attempts = localStorage.getItem(ATTEMPTS_KEY);
    return attempts ? JSON.parse(attempts) : [];
  },

  saveAttempts: (attempts: ExamAttempt[]) => {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  initializeDefaultAdmin: () => {
    const users = storage.getUsers();
    if (!users.some(u => u.role === 'admin')) {
      const defaultAdmin: User = {
        id: 'admin-1',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        completedCourses: []
      };
      storage.saveUsers([...users, defaultAdmin]);
    }
  }
};
