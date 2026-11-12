import React from 'react';
import { CourseContract, GradeCalculationResult } from '../../types';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  Info,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface CalculationDashboardProps {
  contract: CourseContract;
  calcResult: GradeCalculationResult;
  onSelectTargetGrade: (grade: string, customScore?: number) => void;
}

export const CalculationDashboard: React.FC<CalculationDashboardProps> = ({
  contract,
  calcResult,
  onSelectTargetGrade,
}) => {
  const gradedComponentsCount = contract.components.filter((c) => c.isGraded && c.score !== null).length;
  const ungradedComponentsCount = contract.components.length - gradedComponentsCount;

  // Selected target boundary
  const targetBoundary = contract.gradeBoundaries.find((b) => b.grade === contract.targetGrade);
  const targetScoreValue = contract.customTargetScore || targetBoundary?.minScore || 85;

  return (
    <div className="space-y-6">
      {/* Target Grade Selector Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#263449]">
              Pilih Target Predikat Nilai Akhir
            </h3>
            <p className="text-xs text-slate-500">
              Kalkulator akan menghitung rata-rata nilai yang harus diraih pada sisa komponen evaluasi.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Mata Kuliah: <span className="text-slate-800 font-bold">{contract.courseName}</span>
          </div>
        </div>

        {/* Buttons for each target grade */}
        <div className="flex flex-wrap items-center gap-2">
          {contract.gradeBoundaries
            .filter((b) => ['A', 'AB', 'B', 'BC', 'C'].includes(b.grade))
            .map((boundary) => {
              const isSelected = contract.targetGrade === boundary.grade;
              return (
                <button
                  key={boundary.grade}
                  type="button"
                  onClick={() => onSelectTargetGrade(boundary.grade, boundary.minScore)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#263449] text-white shadow-sm ring-2 ring-[#263449]/20'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">{boundary.grade}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    ≥ {boundary.minScore}
                  </span>
                </button>
              );
            })}

          {/* Custom manual target score input */}
          <div className="flex items-center gap-1.5 ml-auto text-xs">
            <span className="text-slate-500 text-[11px]">Skor Kustom:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={contract.customTargetScore || ''}
              placeholder="Contoh: 88"
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : Number(e.target.value);
                onSelectTargetGrade('Custom', val);
              }}
              className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold tabular-nums text-center"
            />
          </div>
        </div>
      </div>

      {/* Primary KPI & Result Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Feasibility Alert Banner */}
        {calcResult.isComplete ? (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Seluruh Komponen Telah Dinilai</p>
              <p className="text-slate-700">{calcResult.explanation}</p>
            </div>
          </div>
        ) : calcResult.isSecured ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Target Nilai Aman Secara Matematis!</p>
              <p className="text-slate-700">{calcResult.explanation}</p>
            </div>
          </div>
        ) : calcResult.isAchievable ? (
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 text-xs sm:text-sm flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Target Nilai Masih Dapat Diraih</p>
              <p className="text-slate-700">{calcResult.explanation}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Target Tidak Dapat Dicapai Secara Matematis</p>
              <p className="text-slate-700">{calcResult.explanation}</p>
            </div>
          </div>
        )}

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Kontribusi Saat Ini
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#263449] tabular-nums">
              {calcResult.currentContribution.toFixed(2)}
              <span className="text-xs font-normal text-slate-400"> poin</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Dari {calcResult.gradedWeight}% bobot yang telah dinilai
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Sisa Bobot Penilaian
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#263449] tabular-nums">
              {calcResult.remainingWeight.toFixed(0)}%
            </div>
            <div className="text-[11px] text-slate-500">
              {ungradedComponentsCount} komponen belum dinilai
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border space-y-1 ${
              !calcResult.isAchievable
                ? 'border-rose-200 bg-rose-50/30'
                : calcResult.isSecured
                ? 'border-emerald-200 bg-emerald-50/30'
                : 'border-[#8EB8E8]/50 bg-[#8EB8E8]/10'
            }`}
          >
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Rata-Rata Nilai Dibutuhkan
            </span>
            <div
              className={`text-2xl sm:text-3xl font-extrabold tabular-nums ${
                !calcResult.isAchievable
                  ? 'text-rose-700'
                  : calcResult.isSecured
                  ? 'text-emerald-700'
                  : 'text-[#263449]'
              }`}
            >
              {calcResult.isComplete
                ? 'Selesai'
                : calcResult.requiredAverageRemaining !== null
                ? calcResult.requiredAverageRemaining.toFixed(2)
                : '—'}
            </div>
            <div className="text-[11px] text-slate-500">
              {calcResult.isComplete
                ? 'Semua nilai sudah masuk'
                : calcResult.isSecured
                ? 'Sudah dijamin aman'
                : `Target: ${targetScoreValue} (${contract.targetGrade})`}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Proyeksi Nilai Akhir
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#263449] tabular-nums">
              {calcResult.projectedFinalScore.toFixed(2)}
              <span className="text-sm font-bold text-[#8EB8E8] ml-1.5">
                ({calcResult.projectedFinalGrade})
              </span>
            </div>
            <div className="text-[11px] text-slate-500">Berdasarkan data terkini</div>
          </div>
        </div>

        {/* Visual Progress Bar Breakdown */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Progress Evaluasi Semester (Bobot Penilaian)</span>
            <span className="tabular-nums">
              {calcResult.gradedWeight}% Dinilai / {calcResult.remainingWeight}% Tersisa
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${calcResult.gradedWeight}%` }}
              title={`Sudah dinilai: ${calcResult.gradedWeight}%`}
            />
            <div
              className="h-full bg-slate-200 transition-all duration-300"
              style={{ width: `${calcResult.remainingWeight}%` }}
              title={`Belum dinilai: ${calcResult.remainingWeight}%`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Komponen Selesai ({gradedComponentsCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span>Sisa Belum Dinilai ({ungradedComponentsCount})</span>
            </div>
          </div>
        </div>

        {/* Transparent Formula Calculation Explanation */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Info className="w-4 h-4 text-[#8EB8E8]" />
            <span>Rincian Transparansi Perhitungan Matematis:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono leading-relaxed">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
              <div className="font-semibold text-slate-700">1. Kontribusi Nilai Saat Ini:</div>
              <div className="text-slate-500">
                Σ (Nilai × Bobot / 100) ={' '}
                <span className="font-bold text-slate-800">{calcResult.currentContribution.toFixed(2)}</span> poin
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
              <div className="font-semibold text-slate-700">2. Rata-Rata Komponen Sisa:</div>
              <div className="text-slate-500">
                ({targetScoreValue} - {calcResult.currentContribution.toFixed(2)}) / {calcResult.remainingWeight}% × 100 ={' '}
                <span className="font-bold text-slate-800">
                  {calcResult.requiredAverageRemaining !== null
                    ? calcResult.requiredAverageRemaining.toFixed(2)
                    : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
