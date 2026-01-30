import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import { Exam, ExamAttempt, Question } from '../../types';
import { ArrowLeft, CheckCircle2, XCircle, FileText, Calendar, Award } from 'lucide-react';

interface ExamResultsProps {
  onBack: () => void;
}

export function ExamResults({ onBack }: ExamResultsProps) {
  const { user } = useAuth();
  const attempts = storage.getAttempts().filter((a) => a.studentId === user?.id);
  const exams = storage.getExams();

  const getExam = (examId: string): Exam | undefined => exams.find((e) => e.id === examId);

  // Sort attempts by date, newest first
  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  if (sortedAttempts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No exam results yet</h2>
          <p className="text-gray-500">Complete an exam to see your results here.</p>
        </div>
      </div>
    );
  }

  return (
    <ExamResultList
      attempts={sortedAttempts}
      getExam={getExam}
      onBack={onBack}
    />
  );
}

interface ExamResultListProps {
  attempts: ExamAttempt[];
  getExam: (examId: string) => Exam | undefined;
  onBack: () => void;
}

function ExamResultList({ attempts, getExam, onBack }: ExamResultListProps) {
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const selectedAttempt = attempts.find((a) => a.id === selectedAttemptId);
  const selectedExam = selectedAttempt ? getExam(selectedAttempt.examId) : undefined;

  if (selectedAttempt && selectedExam) {
    return (
      <ExamResultDetail
        attempt={selectedAttempt}
        exam={selectedExam}
        onBackToList={() => setSelectedAttemptId(null)}
        onBackToDashboard={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Results</h1>
        <p className="text-gray-600 mb-6">Click an exam to see questions, your answers, and correct answers.</p>
        <div className="space-y-3">
          {attempts.map((attempt) => {
            const exam = getExam(attempt.examId);
            const passed = attempt.score >= 70;
            const date = new Date(attempt.completedAt).toLocaleString();
            return (
              <button
                key={attempt.id}
                onClick={() => setSelectedAttemptId(attempt.id)}
                className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-lg ${passed ? 'bg-green-100' : 'bg-red-100'}`}
                  >
                    {passed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{exam?.title ?? 'Unknown exam'}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        {date}
                      </span>
                      <span className="flex items-center space-x-1">
                        <Award className="w-4 h-4" />
                        {attempt.score.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-blue-600 font-medium text-sm">View details →</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ExamResultDetailProps {
  attempt: ExamAttempt;
  exam: Exam;
  onBackToList: () => void;
  onBackToDashboard: () => void;
}

function ExamResultDetail({ attempt, exam, onBackToList, onBackToDashboard }: ExamResultDetailProps) {
  const passed = attempt.score >= 70;
  const date = new Date(attempt.completedAt).toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBackToList}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Results</span>
          </button>
          <button
            onClick={onBackToDashboard}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Dashboard
          </button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                {date}
              </span>
              <span className="flex items-center space-x-1">
                <Award className="w-4 h-4" />
                Score: <strong>{attempt.score.toFixed(1)}%</strong>
                {passed ? (
                  <span className="text-green-600 font-medium"> (Passed)</span>
                ) : (
                  <span className="text-red-600 font-medium"> (Failed)</span>
                )}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {exam.questions.map((question, index) => (
              <QuestionResultBlock
                key={question.id}
                question={question}
                questionNumber={index + 1}
                userAnswerIndex={attempt.answers[question.id]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuestionResultBlockProps {
  question: Question;
  questionNumber: number;
  userAnswerIndex: number | undefined;
}

function QuestionResultBlock({ question, questionNumber, userAnswerIndex }: QuestionResultBlockProps) {
  const correctIndex = question.correctAnswer;
  const isCorrect = userAnswerIndex === correctIndex;
  const userAnswerText =
    userAnswerIndex !== undefined && question.options[userAnswerIndex] !== undefined
      ? question.options[userAnswerIndex]
      : '— Not answered';
  const correctAnswerText = question.options[correctIndex] ?? '—';

  return (
    <div
      className={`border rounded-xl p-5 ${
        isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
      }`}
    >
      <div className="flex items-start space-x-3 mb-4">
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
          }`}
        >
          {questionNumber}
        </span>
        <p className="font-medium text-gray-900 pt-0.5">{question.question}</p>
      </div>

      <div className="ml-11 space-y-3">
        <div className="flex items-start space-x-2">
          <span className="text-sm font-semibold text-gray-600 min-w-[120px]">Your answer:</span>
          <span className="flex items-center space-x-2">
            {userAnswerIndex !== undefined && (
              <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                {isCorrect ? <CheckCircle2 className="w-4 h-4 inline" /> : <XCircle className="w-4 h-4 inline" />}
              </span>
            )}
            <span className={isCorrect ? 'text-green-800 font-medium' : 'text-red-800 font-medium'}>
              {userAnswerText}
            </span>
          </span>
        </div>
        {!isCorrect && (
          <div className="flex items-start space-x-2">
            <span className="text-sm font-semibold text-gray-600 min-w-[120px]">Correct answer:</span>
            <span className="flex items-center space-x-2 text-green-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              {correctAnswerText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
