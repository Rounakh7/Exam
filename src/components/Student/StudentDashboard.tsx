import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import { Exam, ExamType } from '../../types';
import { LogOut, BookOpen, Clock, Award, FileBarChart } from 'lucide-react';
import { ExamTaking } from './ExamTaking';
import { ExamResults } from './ExamResults';

export function StudentDashboard() {
  const { user, logout } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showResultsPage, setShowResultsPage] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = () => {
    setExams(storage.getExams());
  };

  const getExamsByType = (type: ExamType) => {
    return exams.filter(e => e.type === type);
  };

  const handleStartExam = (exam: Exam) => {
    setSelectedExam(exam);
  };

  const handleExamComplete = () => {
    setSelectedExam(null);
    loadExams();
  };

  if (showResultsPage) {
    return <ExamResults onBack={() => setShowResultsPage(false)} />;
  }

  if (selectedExam) {
    return <ExamTaking exam={selectedExam} onComplete={handleExamComplete} />;
  }

  const renderExamSection = (title: string, type: ExamType, icon: React.ReactNode, bgColor: string) => {
    const sectionExams = getExamsByType(type);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`${bgColor} p-3 rounded-lg`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{sectionExams.length} exams available</p>
          </div>
        </div>

        {sectionExams.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No exams available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sectionExams.map(exam => (
              <div
                key={exam.id}
                className="border border-gray-200 rounded-lg p-4 transition hover:shadow-md hover:border-blue-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{exam.duration} minutes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{exam.questions.length} questions</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartExam(exam)}
                    className="px-6 py-2 rounded-lg font-semibold transition transform bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
                  >
                    Start Exam
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowResultsPage(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <FileBarChart className="w-4 h-4" />
                <span>Exam Results</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Exams</h2>
          <p className="text-gray-600">Select an exam type and start your test</p>
        </div>

        <div className="space-y-6">
          {renderExamSection(
            'Basic Exams',
            'basic',
            <BookOpen className="w-6 h-6 text-green-600" />,
            'bg-green-100'
          )}
          {renderExamSection(
            'Prelims Exams',
            'prelims',
            <Clock className="w-6 h-6 text-yellow-600" />,
            'bg-yellow-100'
          )}
          {renderExamSection(
            'Mains Exams',
            'mains',
            <Award className="w-6 h-6 text-red-600" />,
            'bg-red-100'
          )}
        </div>

        {user && user.completedCourses.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Your Completed Courses</h3>
            <div className="flex flex-wrap gap-2">
              {user.completedCourses.map((course, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold"
                >
                  {course}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
