import React, { useState } from 'react';
import { QuizAttempt } from '../../types';
import {
  AlertCircle,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';

interface QuizResultViewProps {
  attempt: QuizAttempt;
  onRetake: () => void;
  onBackToSummary: () => void;
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({
  attempt,
  onRetake,
  onBackToSummary,
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const filteredQuestions = attempt.questionsSnapshot.filter((q) => {
    const ans = attempt.answers.find((a) => a.questionId === q.id);
    if (filter === 'correct') return ans?.isCorrect;
    if (filter === 'incorrect') return !ans?.isCorrect;
    return true;
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-[#8EB8E8] bg-blue-50 border-blue-200';
    if (score >= 55) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Score Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-500 font-medium">Hasil Evaluasi Kuis</span>
            <h2 className="text-xl font-bold text-[#263449]">{attempt.materialTitle}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onRetake}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi Kuis</span>
            </button>
            <button
              onClick={onBackToSummary}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#263449] hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              <span>Kembali ke Rangkuman</span>
            </button>
          </div>
        </div>

        {/* Score KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Nilai Akhir
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#263449] tabular-nums">
              {attempt.score.toFixed(0)}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Persentase: {attempt.percentage.toFixed(0)}%
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Soal
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#263449] tabular-nums">
              {attempt.totalQuestions}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Butir latihan</span>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Jawaban Benar
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums">
              {attempt.correctAnswers}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              ({Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100)}%)
            </span>
          </div>

          <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 space-y-1">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">
              Jawaban Salah
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 tabular-nums">
              {attempt.incorrectAnswers}
            </div>
            <span className="text-[11px] text-rose-600 font-medium">
              ({Math.round((attempt.incorrectAnswers / attempt.totalQuestions) * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Learning Evaluation Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3.5 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm">Topik yang Sudah Dikuasai</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {attempt.evaluation.strongTopics.map((topic, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Topics to Review & Recommendations */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3.5 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm">Rekomendasi Pendalaman Materi</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {attempt.evaluation.studyRecommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Question Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#263449]">Pembahasan Soal & Kunci Jawaban</h3>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Semua ({attempt.totalQuestions})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                filter === 'correct' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Benar ({attempt.correctAnswers})
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                filter === 'incorrect' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Salah ({attempt.incorrectAnswers})
            </button>
          </div>
        </div>

        <div className="space-y-3.5">
          {filteredQuestions.map((q, idx) => {
            const userAns = attempt.answers.find((a) => a.questionId === q.id);
            const isCorrect = userAns?.isCorrect;
            const isExpanded = expandedQuestions[q.id] ?? true;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-5 space-y-3.5 transition-all ${
                  isCorrect ? 'border-slate-200' : 'border-rose-200/80'
                }`}
              >
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                        <span>Topik: {q.topic}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">Tingkat {q.difficulty}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                        {idx + 1}. {q.questionText}
                      </h4>
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-400 p-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 text-xs sm:text-sm">
                    {/* Options list */}
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const keyMatch = opt.match(/^([A-D])\./i);
                        const optKey = keyMatch
                          ? keyMatch[1].toUpperCase()
                          : String.fromCharCode(65 + optIdx);
                        const isUserChoice = userAns?.selectedAnswer === optKey;
                        const isRightKey = q.correctAnswer.toUpperCase() === optKey;

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                              isRightKey
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                                : isUserChoice && !isCorrect
                                ? 'bg-rose-50/70 border-rose-300 text-rose-950 font-medium'
                                : 'bg-slate-50/50 border-slate-100 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold">{optKey}.</span>
                              <span>{opt.replace(/^[A-D]\.\s*/i, '')}</span>
                            </div>

                            <div className="text-[11px] font-semibold shrink-0">
                              {isRightKey && (
                                <span className="text-emerald-700 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Kunci Jawaban
                                </span>
                              )}
                              {isUserChoice && !isRightKey && (
                                <span className="text-rose-700 flex items-center gap-1">
                                  <X className="w-3 h-3" /> Jawaban Anda
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/80 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-[#263449] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#8EB8E8]" />
                        Penjelasan Akademik:
                      </span>
                      <p className="leading-relaxed text-slate-600">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
