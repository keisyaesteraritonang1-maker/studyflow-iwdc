import React, { useState } from 'react';
import { AssessmentComponent, CourseContract, GradeBoundary } from '../../types';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { validateWeights } from '../../utils/gradeCalculator';

interface ExtractionConfirmationModalProps {
  isOpen: boolean;
  initialData: Omit<CourseContract, 'id' | 'userId' | 'updatedAt'>;
  onConfirm: (confirmedData: Omit<CourseContract, 'id' | 'userId' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const ExtractionConfirmationModal: React.FC<ExtractionConfirmationModalProps> = ({
  isOpen,
  initialData,
  onConfirm,
  onCancel,
}) => {
  const [courseName, setCourseName] = useState(initialData.courseName);
  const [courseCode, setCourseCode] = useState(initialData.courseCode || '');
  const [semester, setSemester] = useState(initialData.semester || 'Semester Ganjil');
  const [components, setComponents] = useState<AssessmentComponent[]>(initialData.components || []);
  const [gradeBoundaries, setGradeBoundaries] = useState<GradeBoundary[]>(
    initialData.gradeBoundaries || []
  );
  const [targetGrade, setTargetGrade] = useState<string>(initialData.targetGrade || 'A');

  if (!isOpen) return null;

  const weightValidation = validateWeights(components);

  const handleUpdateComponent = (
    index: number,
    field: keyof AssessmentComponent,
    value: string | number
  ) => {
    setComponents((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: field === 'weight' ? Number(value) || 0 : value,
      };
      return copy;
    });
  };

  const handleAddComponent = () => {
    setComponents((prev) => [
      ...prev,
      {
        id: `c_new_${Date.now()}`,
        name: 'Komponen Baru',
        weight: 10,
        isGraded: false,
        score: null,
      },
    ]);
  };

  const handleRemoveComponent = (index: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateBoundary = (index: number, minScore: number) => {
    setGradeBoundaries((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], minScore: Number(minScore) || 0 };
      return copy;
    });
  };

  const handleSaveAndConfirm = () => {
    if (!weightValidation.isValid) {
      alert(weightValidation.message);
      return;
    }

    onConfirm({
      courseName: courseName.trim() || 'Mata Kuliah Baru',
      courseCode: courseCode.trim(),
      semester,
      academicYear: '2026/2027',
      components,
      gradeBoundaries,
      targetGrade,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-[#A99AE8] uppercase tracking-wider">
              Konfirmasi & Verifikasi Data Ekstraksi
            </span>
            <h3 className="font-bold text-[#263449] text-lg">
              Periksa Komponen Penilaian Kontrak Kuliah
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if weight != 100% */}
        {!weightValidation.isValid ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-900">Total Bobot Belum 100%</p>
              <p>{weightValidation.message}</p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Total bobot tepat 100%. Komponen siap digunakan untuk kalkulasi akurat.</span>
          </div>
        )}

        {/* Course Info Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Nama Mata Kuliah</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#8EB8E8] text-slate-900 bg-white"
              placeholder="Contoh: Kalkulus I"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Kode Mata Kuliah</label>
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#8EB8E8] text-slate-900 bg-white"
              placeholder="Contoh: MAT101"
            />
          </div>
        </div>

        {/* Editable Components Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tabel Komponen & Bobot Penilaian
            </label>
            <button
              type="button"
              onClick={handleAddComponent}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Komponen</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3.5">Nama Komponen Evaluasi</th>
                  <th className="py-2.5 px-3.5 w-32">Bobot (%)</th>
                  <th className="py-2.5 px-3.5 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {components.map((comp, idx) => (
                  <tr key={comp.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3.5">
                      <input
                        type="text"
                        value={comp.name}
                        onChange={(e) => handleUpdateComponent(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#8EB8E8] text-slate-800 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3.5">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={comp.weight}
                          onChange={(e) => handleUpdateComponent(idx, 'weight', e.target.value)}
                          className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#8EB8E8] text-slate-800 text-xs tabular-nums text-right font-semibold"
                        />
                        <span className="text-slate-500 font-medium">%</span>
                      </div>
                    </td>
                    <td className="py-2 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(idx)}
                        disabled={components.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Hapus komponen"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200 text-slate-800">
                <tr>
                  <td className="py-2.5 px-3.5">Total Bobot Evaluasi</td>
                  <td className="py-2.5 px-3.5">
                    <span
                      className={`tabular-nums ${
                        weightValidation.isValid ? 'text-emerald-700' : 'text-amber-700 font-extrabold'
                      }`}
                    >
                      {weightValidation.totalWeight}%
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Grade Boundaries (Ambang Batas Nilai Huruf) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ambang Batas Nilai Huruf (Standar IPB / Dosen)
            </label>
            <span className="text-[11px] text-slate-500">Nilai minimum untuk setiap predikat</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {gradeBoundaries.map((b, idx) => (
              <div key={b.grade} className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{b.grade}</span>
                  <span className="text-[10px] text-slate-400">≥</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={b.minScore}
                  onChange={(e) => handleUpdateBoundary(idx, Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-slate-200 text-xs font-semibold tabular-nums text-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveAndConfirm}
            disabled={!weightValidation.isValid}
            className="px-6 py-2.5 bg-[#8EB8E8] hover:bg-[#7aa7d9] text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span>Konfirmasi & Simpan Kontrak</span>
          </button>
        </div>
      </div>
    </div>
  );
};
