import React, { useState } from 'react';
import { LectureMaterial, Question, QuestionConfig } from '../../types';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import { api } from '../../services/api';

interface QuestionGeneratorModalProps {
  material: LectureMaterial;
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated: (questions: Question[]) => void;
}

export const QuestionGeneratorModal: React.FC<QuestionGeneratorModalProps> = ({
  material,
  isOpen,
  onClose,
  onQuestionsGenerated,
}) => {
  const [count, setCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [type, setType] = useState<'multiple_choice' | 'true_false'>('multiple_choice');
  const [isLoading, setIsLoading] = useState(false);
  const [retryStatus, setRetryStatus] = useState<{
    attempt: number;
    maxRetries: number;
    delaySeconds: number;
    message: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const countOptions = [5, 10, 15, 20, 30, 50];

  const handleGenerate = async () => {
    if (isLoading) return; // Prevent duplicate requests
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setRetryStatus(null);
      const config: QuestionConfig = { count, difficulty, type };
      const questions = await api.generateQuestions(material.id, config, (status) => {
        setRetryStatus(status);
      });
      onQuestionsGenerated(questions);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      if (
        rawMsg.includes('503') ||
        rawMsg.includes('429') ||
        rawMsg.includes('demand') ||
        rawMsg.includes('UNAVAILABLE') ||
        rawMsg.includes('Failed to fetch')
      ) {
        setErrorMsg(
          'Layanan AI sedang mengalami lonjakan permintaan (High Demand). Silakan coba beberapa saat lagi atau pilih jumlah soal yang lebih sedikit.'
        );
      } else {
        setErrorMsg(rawMsg || 'Gagal menghasilkan butir soal latihan.');
      }
    } finally {
      setIsLoading(false);
      setRetryStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8EB8E8]/20 flex items-center justify-center text-[#263449]">
              <Sparkles className="w-4 h-4 text-[#8EB8E8]" />
            </div>
            <div>
              <h3 className="font-bold text-[#263449] text-base">Konfigurasi Latihan Soal</h3>
              <p className="text-xs text-slate-500">Berdasarkan dokumen: {material.fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Retry Progress Alert Banner */}
        {isLoading && retryStatus && (
          <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900 animate-in fade-in duration-200">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Model AI Mengalami Lonjakan Permintaan</p>
              <p className="leading-relaxed">
                Mencoba ulang secara otomatis{' '}
                <span className="font-semibold text-amber-950">
                  (Percobaan {retryStatus.attempt} dari {retryStatus.maxRetries})
                </span>{' '}
                dalam {retryStatus.delaySeconds} detik...
              </p>
            </div>
          </div>
        )}

        {/* Friendly Error Alert Banner */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-start gap-2.5 border border-red-200 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="space-y-1.5 flex-1">
              <span className="font-semibold block">{errorMsg}</span>
              {count > 5 && (
                <button
                  type="button"
                  onClick={() => {
                    setCount(5);
                    setErrorMsg(null);
                  }}
                  className="text-[11px] underline font-semibold text-red-800 hover:text-red-900"
                >
                  Coba ubah ke 5 soal agar beban generasi lebih ringan
                </button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-5">
          {/* 1. Jumlah Soal */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Jumlah Butir Soal
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {countOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCount(opt)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    count === opt
                      ? 'border-[#8EB8E8] bg-[#8EB8E8]/15 text-[#263449] ring-2 ring-[#8EB8E8]/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt} Soal
                </button>
              ))}
            </div>
          </div>

          {/* 2. Tingkat Kesulitan */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Tingkat Kesulitan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setDifficulty('easy')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  difficulty === 'easy'
                    ? 'border-[#8EB8E8] bg-[#8EB8E8]/10 text-[#263449] ring-2 ring-[#8EB8E8]/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Mudah (Easy)</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Definisi, istilah, dan pemahaman dasar langsung dari teks.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDifficulty('medium')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  difficulty === 'medium'
                    ? 'border-[#8EB8E8] bg-[#8EB8E8]/10 text-[#263449] ring-2 ring-[#8EB8E8]/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Sedang (Medium)</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Penerapan praktis dan hubungan antarkonsep.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDifficulty('hard')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  difficulty === 'hard'
                    ? 'border-[#8EB8E8] bg-[#8EB8E8]/10 text-[#263449] ring-2 ring-[#8EB8E8]/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Sulit (Hard)</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Penalaran kritis, sintesis, dan studi kasus analitis.
                </div>
              </button>
            </div>
          </div>

          {/* 3. Tipe Soal */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Tipe Format Soal
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('multiple_choice')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  type === 'multiple_choice'
                    ? 'border-[#8EB8E8] bg-[#8EB8E8]/10 text-[#263449] ring-2 ring-[#8EB8E8]/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Pilihan Ganda</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  4 pilihan (A, B, C, D) dengan 1 kunci jawaban benar.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('true_false')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  type === 'true_false'
                    ? 'border-[#8EB8E8] bg-[#8EB8E8]/10 text-[#263449] ring-2 ring-[#8EB8E8]/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Benar atau Salah</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Evaluasi pernyataan berbasis kebenaran materi.
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-5 py-2.5 bg-[#8EB8E8] hover:bg-[#7aa7d9] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {retryStatus
                    ? `Mencoba Ulang (${retryStatus.attempt}/${retryStatus.maxRetries})...`
                    : `Membuat ${count} Soal AI...`}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate & Mulai Kuis</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
