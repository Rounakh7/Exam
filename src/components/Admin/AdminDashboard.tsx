import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getExams, deleteExam as deleteExamApi } from '../../api/exams';
import { Exam, ExamType } from '../../types';
import { Plus, LogOut, Edit, Trash2, BookOpen } from 'lucide-react';
import { ExamForm } from './ExamForm';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    const list = await getExams();
    setExams(list);
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    const result = await deleteExamApi(examId);
    if (result.success) {
      setExams((prev) => prev.filter((e) => e.id !== examId));
    } else {
      alert(result.error || 'Failed to delete exam');
    }
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExam(null);
    loadExams();
  };

  const getExamTypeColor = (type: ExamType) => {
    switch (type) {
      case 'basic':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'prelims':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'mains':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getExamTypeDuration = (type: ExamType) => {
    switch (type) {
      case 'basic':
        return '40 min';
      case 'prelims':
        return '20 min';
      case 'mains':
        return '30 min';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
              </div>
            </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Manage Exams</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Exam</span>
          </button>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No exams yet</h3>
            <p className="text-gray-600 mb-6">Create your first exam to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Exam</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => (
              <div
                key={exam.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getExamTypeColor(exam.type)}`}>
                        {exam.type.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">{getExamTypeDuration(exam.type)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Course Key:</span>
                    <span className="font-semibold text-gray-900">{exam.courseKey}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-semibold text-gray-900">{exam.questions.length}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleEditExam(exam)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ExamForm
          exam={editingExam}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
