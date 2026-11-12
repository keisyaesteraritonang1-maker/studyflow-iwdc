import React, { useState } from 'react';
import { AssessmentComponent, CourseContract } from '../../types';
import { simulateScenario } from '../../utils/gradeCalculator';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface ScenarioSimulatorProps {
  contract: CourseContract;
  targetScore: number;
  onApplyAsActualScores: (simulatedScores: Record<string, number>) => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  contract,
  targetScore,
  onApplyAsActualScores,
}) => {
  // Only ungraded components can be simulated
  const ungradedComponents = contract.components.filter((c) => !c.isGraded || c.score === null);

  const [simulatedScores, setSimulatedScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ungradedComponents.forEach((c) => {
      initial[c.id] = 85; // default reasonable simulation
    });
    return initial;
  });

  const handleScoreChange = (id: string, val: number) => {
    setSimulatedScores((prev) => ({
      ...prev,
      [id]: Math.min(100, Math.max(0, val)),
    }));
  };

  const handleReset = () => {
    const initial: Record<string, number> = {};
    ungradedComponents.forEach((c) => {
      initial[c.id] = 85;
    });
    setSimulatedScores(initial);
  };

  const simResult = simulateScenario(
    contract.components,
    targetScore,
    simulatedScores,
    contract.gradeBoundaries
  );

  if (ungradedComponents.length === 0) {
    return null; // All components are already graded, no simulation needed
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#A99AE8]" />
            <h3 className="text-base font-bold text-[#263449]">
              Simulator Skenario Akademik (&ldquo;What-If&rdquo;)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Uji berbagai skenario perolehan nilai pada komponen yang belum keluar tanpa mengubah nilai asli.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Slider</span>
          </button>
        </div>
      </div>

      {/* Simulation Result Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div>
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Proyeksi Nilai Skenario
          </span>
          <span className="text-2xl font-extrabold text-[#263449] tabular-nums">
            {simResult.projectedScore.toFixed(2)}
            <span className="text-sm font-bold text-[#8EB8E8] ml-2">
              ({simResult.projectedGrade})
            </span>
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Status Pencapaian Target
          </span>
          <div className="text-xs font-bold mt-1">
            {simResult.projectedScore >= targetScore ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Target {contract.targetGrade} Berhasil Diraih!
              </span>
            ) : (
              <span className="text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Masih kurang{' '}
                {(targetScore - simResult.projectedScore).toFixed(2)} poin
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
            Sisa Komponen Lain
          </span>
          <span className="text-xs font-semibold text-slate-700 mt-1 block">
            {simResult.remainingUnsimulatedWeight <= 0
              ? 'Seluruh komponen telah disimulasikan'
              : `Perlu rata-rata ${simResult.requiredAverageUnsimulated?.toFixed(2)} pada ${
                  simResult.remainingUnsimulatedWeight
                }% sisa`}
          </span>
        </div>
      </div>

      {/* Sliders for each ungraded component */}
      <div className="space-y-4">
        {ungradedComponents.map((comp) => {
          const simVal = simulatedScores[comp.id] ?? 85;
          const weightedPts = ((simVal * comp.weight) / 100).toFixed(2);

          return (
            <div
              key={comp.id}
              className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-white space-y-2.5 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 text-sm">{comp.name}</span>
                  <span className="text-slate-400 ml-2 font-medium">Bobot: {comp.weight}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Kontribusi:</span>
                  <span className="font-bold text-slate-800 tabular-nums">{weightedPts} poin</span>
                  <div className="px-2.5 py-1 rounded bg-[#C5B8EA]/20 font-bold text-slate-800 tabular-nums">
                    {simVal}
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-mono">0</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={simVal}
                  onChange={(e) => handleScoreChange(comp.id, Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#A99AE8]"
                />
                <span className="text-[10px] text-slate-400 font-mono">100</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save as actual button */}
      <div className="pt-2 flex items-center justify-between">
        <p className="text-[11px] text-slate-400 italic">
          Nilai simulasi tidak menggantikan nilai asli Anda kecuali jika Anda memilih tombol di samping.
        </p>

        <button
          type="button"
          onClick={() => {
            if (confirm('Simpan nilai skenario ini sebagai nilai aktual resmi Anda?')) {
              onApplyAsActualScores(simulatedScores);
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Terapkan Sebagai Nilai Aktual</span>
        </button>
      </div>
    </div>
  );
};
