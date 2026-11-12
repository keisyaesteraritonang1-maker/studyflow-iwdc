import React, { useState } from 'react';
import { LectureMaterial, Question, QuizAttempt } from '../../types';
import { MaterialUpload } from './MaterialUpload';
import { SummaryView } from './SummaryView';
import { QuestionGeneratorModal } from './QuestionGeneratorModal';
import { InteractiveQuiz } from './InteractiveQuiz';
import { QuizResultView } from './QuizResultView';
import {
  BookOpen,
  ChevronRight,
  FileText,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { api } from '../../services/api';

interface SmartPracticeViewProps {
  materials: LectureMaterial[];
  selectedMaterial: LectureMaterial | null;
  onSelectMaterial: (m: LectureMaterial | null) => void;
  onRefreshMaterials: () => void;
}

export const SmartPracticeView: React.FC<SmartPracticeViewProps> = ({
  materials,
  selectedMaterial,
  onSelectMaterial,
  onRefreshMaterials,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[] | null>(null);
  const [currentQuizAttempt, setCurrentQuizAttempt] = useState<QuizAttempt | null>(null);

  const handleMaterialCreated = (newMaterial: LectureMaterial) => {
    onRefreshMaterials();
    onSelectMaterial(newMaterial);
    setIsUploading(false);
  };

  const handleDeleteMaterial = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Apakah Anda yakin ingin menghapus materi perkuliahan ini?')) return;
    try {
      await api.deleteMaterial(id);
      if (selectedMaterial?.id === id) {
        onSelectMaterial(null);
      }
      onRefreshMaterials();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus materi.');
    }
  };

  const handleResetSamples = async () => {
    try {
      const refreshed = await api.resetSampleMaterials();
      onRefreshMaterials();
      if (refreshed.length > 0) {
        onSelectMaterial(refreshed[0]);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memuat ulang materi contoh.');
    }
  };

  // If in middle of an active quiz
  if (activeQuizQuestions && selectedMaterial) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InteractiveQuiz
          material={selectedMaterial}
          questions={activeQuizQuestions}
          onQuizFinished={(attempt) => {
            setActiveQuizQuestions(null);
            setCurrentQuizAttempt(attempt);
          }}
          onExitQuiz={() => {
            if (confirm('Apakah Anda yakin ingin keluar dari kuis? Jawaban belum tersimpan.')) {
              setActiveQuizQuestions(null);
            }
          }}
        />
      </div>
    );
  }

  // If showing quiz result
  if (currentQuizAttempt && selectedMaterial) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuizResultView
          attempt={currentQuizAttempt}
          onRetake={() => {
            setCurrentQuizAttempt(null);
            setActiveQuizQuestions(currentQuizAttempt.questionsSnapshot);
          }}
          onBackToSummary={() => setCurrentQuizAttempt(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>StudyFlow</span>
            <span aria-hidden="true">/</span>
            <span>Smart Practice</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#263449]">
            Smart Practice & Ringkasan Materi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ekstrak materi perkuliahan menjadi rangkuman komprehensif dan latihan soal adaptif berbasis AI.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsUploading(!isUploading)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#8EB8E8] hover:bg-[#7aa7d9] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Unggah Materi Baru</span>
          </button>
        </div>
      </div>

      {/* Upload Drawer / Section */}
      {isUploading && (
        <MaterialUpload
          onMaterialCreated={handleMaterialCreated}
          onResetSamples={handleResetSamples}
        />
      )}

      {/* Main Layout: Materials Sidebar + Content Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Materials Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daftar Materi ({materials.length})
            </span>
            <button
              onClick={handleResetSamples}
              className="text-[11px] text-[#8EB8E8] hover:underline font-semibold"
              title="Reset ke contoh IPB"
            >
              Reset Sampel
            </button>
          </div>

          <div className="space-y-2">
            {materials.map((mat) => {
              const isSelected = selectedMaterial?.id === mat.id;
              return (
                <div
                  key={mat.id}
                  onClick={() => onSelectMaterial(mat)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-[#8EB8E8] bg-white ring-2 ring-[#8EB8E8]/20 shadow-sm'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="text-xs font-bold text-[#263449] truncate leading-tight">
                      {mat.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>{mat.fileName.split('.').pop()?.toUpperCase()}</span>
                      <span aria-hidden="true">·</span>
                      <span>{mat.wordCount.toLocaleString()} kata</span>
                    </div>

                    <div className="pt-1 flex items-center gap-2 text-[10px]">
                      {mat.summary ? (
                        <span className="text-emerald-700 font-medium">✓ Rangkuman siap</span>
                      ) : (
                        <span className="text-slate-400">Belum dirangkum</span>
                      )}
                      {mat.questions && mat.questions.length > 0 && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-indigo-600 font-medium">
                            {mat.questions.length} Soal
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleDeleteMaterial(mat.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Hapus materi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}

            {materials.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">Belum ada dokumen materi yang diunggah.</p>
                <button
                  onClick={() => setIsUploading(true)}
                  className="px-3.5 py-1.5 bg-[#8EB8E8] text-white text-xs font-semibold rounded-xl"
                >
                  Unggah Dokumen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Summary & Practice Action Area */}
        <div className="lg:col-span-8">
          {selectedMaterial ? (
            <SummaryView
              material={selectedMaterial}
              onOpenQuestionModal={() => setIsQuestionModalOpen(true)}
              onSummaryUpdated={(updated) => {
                onSelectMaterial(updated);
                onRefreshMaterials();
              }}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  Pilih Materi Perkuliahan
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Pilih salah satu dokumen dari daftar di sebelah kiri atau unggah materi baru untuk
                  melihat rangkuman dan memulai kuis latihan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question Generator Config Modal */}
      {selectedMaterial && (
        <QuestionGeneratorModal
          material={selectedMaterial}
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          onQuestionsGenerated={(questions) => {
            setActiveQuizQuestions(questions);
            onRefreshMaterials();
          }}
        />
      )}
    </div>
  );
};
