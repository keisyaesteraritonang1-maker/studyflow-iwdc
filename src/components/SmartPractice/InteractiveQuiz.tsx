import React, { useEffect, useState } from 'react';
import { LectureMaterial, Question, QuizAttempt } from '../../types';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  HelpCircle,
  LayoutGrid,
  Loader2,
  Send,
  Timer,
  Volume2,
} from 'lucide-react';
import { api } from '../../services/api';

interface InteractiveQuizProps {
  material: LectureMaterial;
  questions: Question[];
  onQuizFinished: (attempt: QuizAttempt) => void;
  onExitQuiz: () => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  material,
  questions,
  onQuizFinished,
  onExitQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNavGrid, setShowNavGrid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Optional countdown timer: default 2 minutes per question if enabled
  const [timerEnabled, setTimerEnabled] = useState(false);
  const totalSecondsInitial = questions.length * 90; // 1.5 min per question
  const [secondsRemaining, setSecondsRemaining] = useState(totalSecondsInitial);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (timerEnabled && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer!);
            // Auto submit when timer expires
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerEnabled, secondsRemaining]);

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQ) * 100);

  const handleSelectOption = (optKey: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optKey,
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      const attempt = await api.evaluateQuiz(material.id, answers, questions);
      onQuizFinished(attempt);
    } catch (err) {
      console.error(err);
      alert('Gagal mengevaluasi kuis. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar Navigation & Timer */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onExitQuiz}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Keluar dari Kuis"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-xs text-slate-500 font-medium">Latihan Soal Interaktif</span>
            <h3 className="text-sm sm:text-base font-bold text-[#263449] truncate max-w-xs sm:max-w-md">
              {material.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Toggle & Display */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimerEnabled(!timerEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                timerEnabled
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Aktifkan / Nonaktifkan Timer"
            >
              <Timer className="w-3.5 h-3.5 text-amber-600" />
              <span>{timerEnabled ? formatTimer(secondsRemaining) : 'Timer Nonaktif'}</span>
            </button>
          </div>

          {/* Question Grid Modal Toggle */}
          <button
            onClick={() => setShowNavGrid(!showNavGrid)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Navigasi</span>
            <span className="tabular-nums">
              {answeredCount}/{totalQ}
            </span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Soal <span className="text-slate-900 font-bold">{currentIndex + 1}</span> dari{' '}
            <span className="text-slate-900 font-bold">{totalQ}</span>
          </span>
          <span className="tabular-nums">
            {answeredCount} Terjawab ({Math.round((answeredCount / totalQ) * 100)}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8EB8E8] to-[#C5B8EA] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Navigation Drawer / Grid Popover */}
      {showNavGrid && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daftar Nomor Soal
            </h4>
            <span className="text-[11px] text-slate-400">Klik nomor untuk berpindah</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowNavGrid(false);
                  }}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'border-2 border-[#263449] bg-[#263449] text-white'
                      : isAnswered
                      ? 'bg-[#8EB8E8]/20 border border-[#8EB8E8] text-[#263449]'
                      : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm min-h-[380px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                {currentQ.topic || 'Materi Kuliah'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">Tingkat {currentQ.difficulty}</span>
            </div>
            <span className="text-slate-400">
              {currentQ.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Benar / Salah'}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-[#263449] leading-relaxed">
            {currentIndex + 1}. {currentQ.questionText}
          </h2>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, optIdx) => {
              // Extract option key prefix: "A", "B", "C", "D"
              const keyMatch = opt.match(/^([A-D])\./i);
              const optKey = keyMatch ? keyMatch[1].toUpperCase() : String.fromCharCode(65 + optIdx);
              const isSelected = answers[currentQ.id] === optKey;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optKey)}
                  className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-[#8EB8E8] bg-[#8EB8E8]/10 text-[#263449] ring-2 ring-[#8EB8E8]/20 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50/80 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-[#8EB8E8] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {optKey}
                  </span>
                  <span className="leading-relaxed flex-1">
                    {opt.replace(/^[A-D]\.\s*/i, '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sebelumnya</span>
          </button>

          <div className="flex items-center gap-3">
            {currentIndex < totalQ - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#263449] hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8EB8E8] hover:bg-[#7aa7d9] text-white text-xs font-semibold shadow-sm transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Selesaikan Kuis</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-[#263449]">Konfirmasi Penyelesaian Kuis</h3>
              <p className="text-xs text-slate-500">
                Anda telah menjawab{' '}
                <span className="font-bold text-slate-800">{answeredCount}</span> dari{' '}
                <span className="font-bold text-slate-800">{totalQ}</span> butir soal.
                {answeredCount < totalQ && (
                  <span className="text-amber-700 block mt-1 font-medium">
                    Masih terdapat {totalQ - answeredCount} soal yang belum dijawab!
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-[#8EB8E8] hover:bg-[#7aa7d9] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menilai...</span>
                  </>
                ) : (
                  <span>Kirim & Nilai</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
