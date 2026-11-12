import React, { useState } from 'react';
import { LectureMaterial, SummarySection } from '../../types';
import {
  BookMarked,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  KeyRound,
  ListChecks,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';

interface SummaryViewProps {
  material: LectureMaterial;
  onOpenQuestionModal: () => void;
  onSummaryUpdated: (updatedMaterial: LectureMaterial) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  material,
  onOpenQuestionModal,
  onSummaryUpdated,
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'all' | 'concepts' | 'definitions' | 'subchapters' | 'glossary'
  >('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const summary = material.summary;

  const handleGenerateOrRegenerate = async () => {
    try {
      setIsRegenerating(true);
      setErrorMsg(null);
      const newSummary = await api.generateSummary(material.id);
      onSummaryUpdated({ ...material, summary: newSummary });
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Gagal menghasilkan rangkuman.';
      setErrorMsg(msg);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopySummary = async () => {
    if (!summary) return;
    const textToCopy = `RANGKUMAN MATERI AKADEMIK: ${material.title}
Sumber File: ${material.fileName}

1. RINGKASAN UMUM:
${summary.overview}

2. KONSEP UTAMA:
${summary.mainConcepts.map((c, i) => `${i + 1}. ${c}`).join('\n')}

3. DEFINISI PENTING:
${summary.importantDefinitions.map((d) => `• ${d.term}: ${d.definition}`).join('\n')}

4. PEMBAHASAN SUB-BAB:
${summary.subchapters.map((s) => `[${s.title}]\n${s.explanation}`).join('\n\n')}

5. GLOSARIUM & ISTILAH:
${summary.terminology.map((t) => `• ${t.term}: ${t.meaning}`).join('\n')}

6. POIN KUNCI:
${summary.keyPoints.map((k) => `• ${k}`).join('\n')}

7. KESIMPULAN AKHIR:
${summary.finalConclusion}
`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
      console.error('Failed to copy to clipboard');
    }
  };

  if (!summary && !isRegenerating) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#8EB8E8]/15 text-[#8EB8E8] flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl font-bold text-[#263449]">
            Generate Rangkuman Akademik Terstruktur
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Teks materi kuliah ({material.wordCount.toLocaleString()} kata) telah berhasil diekstrak.
            AI akan merangkum 7 seksi komprehensif berdasarkan isi dokumen asli.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl max-w-md mx-auto border border-red-200">
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleGenerateOrRegenerate}
          className="px-6 py-3 bg-[#8EB8E8] hover:bg-[#7aa7d9] text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
        >
          Buat Rangkuman Otomatis
        </button>
      </div>
    );
  }

  if (isRegenerating) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#8EB8E8] animate-spin mx-auto" />
        <div className="space-y-1">
          <h4 className="font-bold text-[#263449]">Sedang Menganalisis & Merangkum Materi...</h4>
          <p className="text-xs text-slate-500">
            Mengekstrak konsep utama, definisi, terminologi, dan kesimpulan dari {material.fileName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{material.fileName}</span>
            <span aria-hidden="true">·</span>
            <span>{material.wordCount.toLocaleString()} kata</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#263449] truncate">
            {material.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Salin Rangkuman</span>
              </>
            )}
          </button>

          <button
            onClick={handleGenerateOrRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Regenerate Rangkuman</span>
          </button>

          <button
            onClick={onOpenQuestionModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#8EB8E8] hover:bg-[#7aa7d9] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Latihan Soal</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#263449] text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua Bagian (7 Seksi)
        </button>
        <button
          onClick={() => setActiveTab('concepts')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'concepts'
              ? 'bg-[#263449] text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          Konsep Utama
        </button>
        <button
          onClick={() => setActiveTab('definitions')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'definitions'
              ? 'bg-[#263449] text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          Definisi Penting
        </button>
        <button
          onClick={() => setActiveTab('subchapters')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'subchapters'
              ? 'bg-[#263449] text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          Pembahasan Sub-bab
        </button>
        <button
          onClick={() => setActiveTab('glossary')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'glossary'
              ? 'bg-[#263449] text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          Glosarium & Poin Kunci
        </button>
      </div>

      {/* Structured Content Sections */}
      <div className="space-y-6">
        {/* Section 1: Ringkasan Umum */}
        {(activeTab === 'all' || activeTab === 'concepts') && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-[#8EB8E8]/20 flex items-center justify-center text-[#263449]">
                <FileText className="w-4 h-4 text-[#8EB8E8]" />
              </div>
              <h3 className="font-bold text-[#263449] text-base">1. Ringkasan Umum Materi</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {summary?.overview}
            </p>
          </div>
        )}

        {/* Section 2: Konsep Utama */}
        {(activeTab === 'all' || activeTab === 'concepts') && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-[#C5B8EA]/30 flex items-center justify-center text-[#263449]">
                <Sparkles className="w-4 h-4 text-[#A99AE8]" />
              </div>
              <h3 className="font-bold text-[#263449] text-base">2. Konsep-Konsep Utama</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-700">
              {summary?.mainConcepts.map((concept, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{concept}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 3: Definisi Penting */}
        {(activeTab === 'all' || activeTab === 'definitions') && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <BookMarked className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#263449] text-base">3. Definisi Penting</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary?.importantDefinitions.map((def, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5"
                >
                  <h4 className="text-sm font-bold text-[#263449]">{def.term}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{def.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Pembahasan Sub-Bab */}
        {(activeTab === 'all' || activeTab === 'subchapters') && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-[#8EB8E8]/20 flex items-center justify-center text-[#263449]">
                <ListChecks className="w-4 h-4 text-[#8EB8E8]" />
              </div>
              <h3 className="font-bold text-[#263449] text-base">4. Pembahasan Setiap Sub-Bab</h3>
            </div>
            <div className="space-y-4">
              {summary?.subchapters.map((sub, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 space-y-2">
                  <h4 className="text-sm font-bold text-[#263449] flex items-center gap-2">
                    <span className="text-[#8EB8E8]">§</span> {sub.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {sub.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Glosarium & Istilah Penting */}
        {(activeTab === 'all' || activeTab === 'glossary') && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-[#C5B8EA]/30 flex items-center justify-center text-[#263449]">
                <KeyRound className="w-4 h-4 text-[#A99AE8]" />
              </div>
              <h3 className="font-bold text-[#263449] text-base">
                5. Glosarium & Terminologi Penting
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {summary?.terminology.map((term, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-100 text-xs space-y-1">
                  <span className="font-semibold text-slate-800">{term.term}</span>
                  <p className="text-slate-500 leading-normal">{term.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 6: Poin Kunci */}
        {(activeTab === 'all' || activeTab === 'glossary') && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#263449] text-base">6. Poin-Poin Kunci</h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {summary?.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8EB8E8] mt-2 shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 7: Kesimpulan Akhir */}
        {activeTab === 'all' && (
          <div className="bg-gradient-to-br from-slate-50 to-[#8EB8E8]/10 rounded-2xl border border-[#8EB8E8]/30 p-6 sm:p-7 space-y-3">
            <h3 className="font-bold text-[#263449] text-base">7. Kesimpulan Akhir</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {summary?.finalConclusion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
