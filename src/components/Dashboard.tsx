import React from 'react';
import { CourseContract, LectureMaterial, UserProfile } from '../types';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  FileText,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  materials: LectureMaterial[];
  contracts: CourseContract[];
  onNavigate: (tab: 'smart-practice' | 'grade-predictor') => void;
  onSelectMaterial: (m: LectureMaterial) => void;
  onSelectContract: (c: CourseContract) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  materials,
  contracts,
  onNavigate,
  onSelectMaterial,
  onSelectContract,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>{user.university}</span>
                <span aria-hidden="true">·</span>
                <span>{user.faculty}</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#263449]">
                  Welcome to StudyFlow!
                </h1>
                <p className="text-xl sm:text-2xl font-semibold text-[#8EB8E8]">
                  Your academic journey, made smarter.
                </p>
              </div>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Platform pembelajaran adaptif dan kalkulator target nilai akademis yang dirancang
                khusus untuk mahasiswa universitas. Ekstrak materi kuliah perkuliahan menjadi
                rangkuman terstruktur dan kuis interaktif, serta rencanakan target IPK dengan
                perhitungan matematis akurat.
              </p>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('smart-practice')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#8EB8E8] hover:bg-[#7aa7d9] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                <span>Mulai Belajar Materi</span>
              </button>

              <button
                onClick={() => onNavigate('grade-predictor')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#263449] text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
              >
                <Calculator className="w-4 h-4 text-[#A99AE8]" />
                <span>Hitung Target Nilai</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full bg-slate-100">
            <img
              src="/src/assets/images/hero_academic_campus_1794504673655.jpg"
              alt="Kampus IPB University dan Ruang Belajar Mahasiswa"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
          </div>
        </div>
      </section>

      {/* Primary Feature Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#263449]">Fitur Utama StudyFlow</h2>
            <p className="text-xs text-slate-500">Pilih modul pembelajaran yang ingin Anda gunakan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: SMART PRACTICE */}
          <div
            onClick={() => onNavigate('smart-practice')}
            className="group cursor-pointer bg-white rounded-2xl border border-slate-200/90 hover:border-[#8EB8E8] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#8EB8E8]/20 flex items-center justify-center text-[#263449]">
                  <BookOpen className="w-5 h-5 text-[#8EB8E8]" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>{materials.length} Materi Tersedia</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-[#263449] group-hover:text-[#7aa7d9] transition-colors">
                  SMART PRACTICE
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  &ldquo;Turn your lecture materials into summaries and interactive practice questions.&rdquo;
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-500 space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A8D5BA]" />
                  <span>Ekstraksi dokumen asli PDF, PPTX, DOCX, & TXT</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A8D5BA]" />
                  <span>Rangkuman 7 seksi akademis terstruktur</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A8D5BA]" />
                  <span>Latihan soal adaptif (Pilihan Ganda & Benar/Salah)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 p-4 px-6 flex items-center justify-between">
              <div className="relative h-28 w-44 rounded-lg overflow-hidden border border-slate-200/60 hidden sm:block">
                <img
                  src="/src/assets/images/smart_practice_card_1794504688503.jpg"
                  alt="Smart Practice Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <span className="text-xs font-semibold text-[#263449] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Buka Smart Practice <ArrowRight className="w-4 h-4 text-[#8EB8E8]" />
              </span>
            </div>
          </div>

          {/* Card 2: GRADE PREDICTOR */}
          <div
            onClick={() => onNavigate('grade-predictor')}
            className="group cursor-pointer bg-white rounded-2xl border border-slate-200/90 hover:border-[#C5B8EA] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#C5B8EA]/30 flex items-center justify-center text-[#263449]">
                  <Calculator className="w-5 h-5 text-[#A99AE8]" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>{contracts.length} Kontrak Kuliah</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-[#263449] group-hover:text-[#A99AE8] transition-colors">
                  GRADE PREDICTOR
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  &ldquo;Know what scores you need to reach your academic goals.&rdquo;
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-500 space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A8D5BA]" />
                  <span>Input nilai progresif (membedakan nilai 0 vs belum dinilai)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A8D5BA]" />
                  <span>Kalkulasi rata-rata nilai sisa yang dibutuhkan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A8D5BA]" />
                  <span>Simulator skenario &ldquo;What-if&rdquo; instan</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 p-4 px-6 flex items-center justify-between">
              <div className="relative h-28 w-44 rounded-lg overflow-hidden border border-slate-200/60 hidden sm:block">
                <img
                  src="/src/assets/images/grade_predictor_card_1794504702176.jpg"
                  alt="Grade Predictor Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <span className="text-xs font-semibold text-[#263449] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Buka Grade Predictor <ArrowRight className="w-4 h-4 text-[#A99AE8]" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        {/* Recent Materials */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8EB8E8]" />
              <h3 className="font-bold text-slate-900 text-sm">Materi Kuliah Anda</h3>
            </div>
            <button
              onClick={() => onNavigate('smart-practice')}
              className="text-xs text-[#8EB8E8] hover:underline font-medium"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-2.5">
            {materials.slice(0, 3).map((mat) => (
              <div
                key={mat.id}
                onClick={() => {
                  onSelectMaterial(mat);
                  onNavigate('smart-practice');
                }}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-[#8EB8E8]/50 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="min-w-0 pr-3">
                  <h4 className="text-xs font-semibold text-slate-800 truncate">{mat.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>{mat.wordCount.toLocaleString()} kata</span>
                    <span aria-hidden="true">·</span>
                    <span>{mat.summary ? 'Sudah Dirangkum' : 'Belum Dirangkum'}</span>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded bg-[#8EB8E8]/15 text-[#263449] font-medium shrink-0">
                  Buka
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Course Contracts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#A99AE8]" />
              <h3 className="font-bold text-slate-900 text-sm">Target & Kontrak Kuliah</h3>
            </div>
            <button
              onClick={() => onNavigate('grade-predictor')}
              className="text-xs text-[#A99AE8] hover:underline font-medium"
            >
              Kelola Kontrak
            </button>
          </div>

          <div className="space-y-2.5">
            {contracts.slice(0, 3).map((contract) => {
              const gradedCount = contract.components.filter((c) => c.isGraded).length;
              return (
                <div
                  key={contract.id}
                  onClick={() => {
                    onSelectContract(contract);
                    onNavigate('grade-predictor');
                  }}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-[#C5B8EA]/60 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-800 truncate">
                        {contract.courseName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {contract.courseCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>Target: Nilai {contract.targetGrade}</span>
                      <span aria-hidden="true">·</span>
                      <span>{gradedCount} dari {contract.components.length} dinilai</span>
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded bg-[#C5B8EA]/25 text-[#263449] font-medium shrink-0">
                    Prediksi
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
