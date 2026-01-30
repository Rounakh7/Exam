export type UserRole = 'admin' | 'student';

export type ExamType = 'basic' | 'prelims' | 'mains';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  completedCourses: string[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Exam {
  id: string;
  title: string;
  type: ExamType;
  courseKey: string;
  questions: Question[];
  duration: number;
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  answers: Record<string, number>;
  score: number;
  completedAt: string;
}
