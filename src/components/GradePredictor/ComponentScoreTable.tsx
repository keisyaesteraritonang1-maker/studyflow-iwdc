import React from 'react';
import { AssessmentComponent } from '../../types';
import { Check, CheckCircle2, Clock, HelpCircle } from 'lucide-react';

interface ComponentScoreTableProps {
  components: AssessmentComponent[];
  onChangeComponent: (index: number, updated: AssessmentComponent) => void;
}

export const ComponentScoreTable: React.FC<ComponentScoreTableProps> = ({
  components,
  onChangeComponent,
}) => {
  const handleToggleGraded = (index: number, isGraded: boolean) => {
    const current = components[index];
    onChangeComponent(index, {
      ...current,
      isGraded,
      // If toggled to graded and score was null, start with default or keep 0
      score: isGraded ? (current.score !== null ? current.score : 80) : null,
    });
  };

  const handleScoreChange = (index: number, val: string) => {
    const current = components[index];
    if (val === '') {
      // Empty input
      onChangeComponent(index, { ...current, score: null });
      return;
    }
    const num = Math.min(100, Math.max(0, Number(val)));
    onChangeComponent(index, { ...current, score: isNaN(num) ? 0 : num });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-[#263449]">
            Input Nilai Akademik (Progresif)
          </h3>
          <p className="text-xs text-slate-500">
            Anda tidak perlu mengisi semua nilai sekaligus. Pilih status &ldquo;Nilai Sudah Ada&rdquo; untuk komponen yang nilainya telah keluar.
          </p>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Nilai 0 adalah nilai riil yang valid</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Komponen Evaluasi</th>
              <th className="py-3 px-4 w-24">Bobot</th>
              <th className="py-3 px-4 w-44">Status Penilaian</th>
              <th className="py-3 px-4 w-36">Nilai Didapat (0–100)</th>
              <th className="py-3 px-4 w-32 text-right">Kontribusi Poin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {components.map((comp, idx) => {
              const isGraded = comp.isGraded && comp.score !== null;
              const contribution = isGraded
                ? ((Number(comp.score) * Number(comp.weight)) / 100).toFixed(2)
                : '—';

              return (
                <tr key={comp.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {comp.name}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700 tabular-nums">
                    {comp.weight}%
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleToggleGraded(idx, true)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                          comp.isGraded
                            ? 'bg-white text-emerald-800 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Sudah Dinilai
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleGraded(idx, false)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                          !comp.isGraded
                            ? 'bg-white text-slate-800 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Belum Ada
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {comp.isGraded ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={comp.score !== null ? comp.score : ''}
                          onChange={(e) => handleScoreChange(idx, e.target.value)}
                          placeholder="0-100"
                          className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#8EB8E8] text-xs font-bold text-slate-900 tabular-nums"
                        />
                        <span className="text-[11px] text-slate-400">/100</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Belum dinilai
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-slate-800 tabular-nums">
                    {contribution !== '—' ? `${contribution} poin` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
