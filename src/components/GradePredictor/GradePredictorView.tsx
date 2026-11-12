import React, { useState } from 'react';
import { CourseContract, AssessmentComponent } from '../../types';
import { calculateGradePrediction, validateWeights } from '../../utils/gradeCalculator';
import { ContractUploadModal } from './ContractUploadModal';
import { ExtractionConfirmationModal } from './ExtractionConfirmationModal';
import { ComponentScoreTable } from './ComponentScoreTable';
import { CalculationDashboard } from './CalculationDashboard';
import { ScenarioSimulator } from './ScenarioSimulator';
import {
  AlertTriangle,
  BookOpen,
  Calculator,
  ChevronDown,
  Edit3,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { api } from '../../services/api';

interface GradePredictorViewProps {
  contracts: CourseContract[];
  selectedContract: CourseContract | null;
  onSelectContract: (c: CourseContract | null) => void;
  onRefreshContracts: () => void;
}

export const GradePredictorView: React.FC<GradePredictorViewProps> = ({
  contracts,
  selectedContract,
  onSelectContract,
  onRefreshContracts,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [extractedDataToConfirm, setExtractedDataToConfirm] = useState<
    Omit<CourseContract, 'id' | 'userId' | 'updatedAt'> | null
  >(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // If no contract selected, select the first available
  const activeContract = selectedContract || contracts[0] || null;

  // Calculate prediction for active contract
  const targetScore =
    activeContract?.customTargetScore ||
    activeContract?.gradeBoundaries.find((b) => b.grade === activeContract.targetGrade)?.minScore ||
    85;

  const calcResult = activeContract
    ? calculateGradePrediction(
        activeContract.components,
        targetScore,
        activeContract.gradeBoundaries
      )
    : null;

  const handleUpdateComponent = async (index: number, updated: AssessmentComponent) => {
    if (!activeContract) return;
    const newComponents = [...activeContract.components];
    newComponents[index] = updated;

    const updatedContract: CourseContract = {
      ...activeContract,
      components: newComponents,
      updatedAt: new Date().toISOString(),
    };

    onSelectContract(updatedContract);
    try {
      await api.saveContract(updatedContract);
      onRefreshContracts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectTargetGrade = async (grade: string, customScore?: number) => {
    if (!activeContract) return;
    const updatedContract: CourseContract = {
      ...activeContract,
      targetGrade: grade,
      customTargetScore: customScore,
      updatedAt: new Date().toISOString(),
    };

    onSelectContract(updatedContract);
    try {
      await api.saveContract(updatedContract);
      onRefreshContracts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplySimulatedScores = async (simulatedScores: Record<string, number>) => {
    if (!activeContract) return;
    const newComponents = activeContract.components.map((comp) => {
      if (simulatedScores[comp.id] !== undefined) {
        return {
          ...comp,
          isGraded: true,
          score: simulatedScores[comp.id],
        };
      }
      return comp;
    });

    const updatedContract: CourseContract = {
      ...activeContract,
      components: newComponents,
      updatedAt: new Date().toISOString(),
    };

    onSelectContract(updatedContract);
    try {
      await api.saveContract(updatedContract);
      onRefreshContracts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveConfirmedContract = async (
    confirmedData: Omit<CourseContract, 'id' | 'userId' | 'updatedAt'>
  ) => {
    try {
      const saved = await api.saveContract({
        id: isEditModalOpen && activeContract ? activeContract.id : undefined,
        ...confirmedData,
      });
      setExtractedDataToConfirm(null);
      setIsEditModalOpen(false);
      onRefreshContracts();
      onSelectContract(saved);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan kontrak kuliah.');
    }
  };

  const handleDeleteContract = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Hapus kontrak kuliah ini beserta catatan nilainya?')) return;
    try {
      await api.deleteContract(id);
      if (activeContract?.id === id) {
        onSelectContract(null);
      }
      onRefreshContracts();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus kontrak kuliah.');
    }
  };

  const handleResetSampleContracts = async () => {
    try {
      const refreshed = await api.resetSampleContracts();
      onRefreshContracts();
      if (refreshed.length > 0) {
        onSelectContract(refreshed[0]);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memuat ulang contoh kontrak IPB.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>StudyFlow</span>
            <span aria-hidden="true">/</span>
            <span>Grade Predictor</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#263449]">
            Grade Predictor & Target Akademik
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Hitung target nilai sisa yang dibutuhkan secara progresif sesuai kontrak kuliah resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#8EB8E8] hover:bg-[#7aa7d9] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Kontrak Kuliah</span>
          </button>
        </div>
      </div>

      {/* Course Switcher Strip */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {contracts.map((c) => {
            const isSelected = activeContract?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => onSelectContract(c)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#263449] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{c.courseName}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {c.courseCode}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleDeleteContract(c.id, e)}
                  className={`p-1 rounded hover:bg-rose-500/20 hover:text-rose-400 transition-colors ml-1 ${
                    isSelected ? 'text-white/60' : 'text-slate-400'
                  }`}
                  title="Hapus kontrak"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleResetSampleContracts}
          className="text-xs font-semibold text-[#8EB8E8] hover:underline whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Contoh Kontrak IPB</span>
        </button>
      </div>

      {activeContract && calcResult ? (
        <div className="space-y-8">
          {/* Active Contract Info Banner with Edit Button */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{activeContract.courseCode}</span>
                <span aria-hidden="true">·</span>
                <span>{activeContract.semester}</span>
                <span aria-hidden="true">·</span>
                <span>T.A. {activeContract.academicYear}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#263449]">
                {activeContract.courseName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Bobot & Ambang Nilai</span>
              </button>
            </div>
          </div>

          {/* Progressive Component Score Input */}
          <ComponentScoreTable
            components={activeContract.components}
            onChangeComponent={handleUpdateComponent}
          />

          {/* Results Dashboard & KPI Visuals */}
          <CalculationDashboard
            contract={activeContract}
            calcResult={calcResult}
            onSelectTargetGrade={handleSelectTargetGrade}
          />

          {/* Interactive What-If Scenario Simulator */}
          <ScenarioSimulator
            contract={activeContract}
            targetScore={targetScore}
            onApplyAsActualScores={handleApplySimulatedScores}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              Belum Ada Kontrak Kuliah yang Dipilih
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Unggah dokumen silabus / kontrak kuliah Anda atau muat ulang contoh mata kuliah IPB.
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-[#8EB8E8] text-white text-xs font-semibold rounded-xl"
          >
            Unggah Kontrak Kuliah
          </button>
        </div>
      )}

      {/* Upload Contract Document / Image Modal */}
      <ContractUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onExtracted={(data) => {
          setExtractedDataToConfirm(data);
        }}
      />

      {/* Extraction Confirmation & Verification Modal */}
      {extractedDataToConfirm && (
        <ExtractionConfirmationModal
          isOpen={true}
          initialData={extractedDataToConfirm}
          onConfirm={handleSaveConfirmedContract}
          onCancel={() => setExtractedDataToConfirm(null)}
        />
      )}

      {/* Manual Edit Modal */}
      {isEditModalOpen && activeContract && (
        <ExtractionConfirmationModal
          isOpen={true}
          initialData={{
            courseName: activeContract.courseName,
            courseCode: activeContract.courseCode,
            semester: activeContract.semester,
            academicYear: activeContract.academicYear,
            components: activeContract.components,
            gradeBoundaries: activeContract.gradeBoundaries,
            targetGrade: activeContract.targetGrade,
            customTargetScore: activeContract.customTargetScore,
          }}
          onConfirm={handleSaveConfirmedContract}
          onCancel={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};
