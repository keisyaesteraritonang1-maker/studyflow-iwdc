import React, { useRef, useState } from 'react';
import { CourseContract } from '../../types';
import {
  AlertCircle,
  FileText,
  ImageIcon,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { api } from '../../services/api';

interface ContractUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtracted: (data: Omit<CourseContract, 'id' | 'userId' | 'updatedAt'>) => void;
}

export const ContractUploadModal: React.FC<ContractUploadModalProps> = ({
  isOpen,
  onClose,
  onExtracted,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(ext)) {
      setErrorMsg(`Format file "${ext}" tidak didukung. Mohon unggah PDF, DOCX, JPG, atau PNG.`);
      return;
    }

    try {
      setIsUploading(true);
      const res = await api.parseContractFile(file);
      onExtracted(res.extractedData);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Gagal mengekstrak silabus kontrak kuliah.';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C5B8EA]/30 flex items-center justify-center text-[#263449]">
              <FileText className="w-4 h-4 text-[#A99AE8]" />
            </div>
            <div>
              <h3 className="font-bold text-[#263449] text-base">Unggah Kontrak Kuliah (RPKPS)</h3>
              <p className="text-xs text-slate-500">Ekstrak komponen bobot dan batas nilai huruf</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-start gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-[#C5B8EA] bg-[#C5B8EA]/10 scale-[0.99]'
              : 'border-slate-300 hover:border-[#C5B8EA] hover:bg-slate-50/50'
          } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleProcessFile(e.target.files[0]);
              }
            }}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-9 h-9 text-[#A99AE8] animate-spin" />
              <p className="text-xs sm:text-sm font-semibold text-[#263449]">
                AI sedang menganalisis komponen penilaian...
              </p>
              <p className="text-[11px] text-slate-400">
                Membaca tabel bobot dan aturan konversi nilai
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#C5B8EA]/20 flex items-center justify-center text-[#A99AE8]">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-[#263449]">
                  Pilih atau seret dokumen kontrak perkuliahan
                </p>
                <p className="text-[11px] text-slate-500">
                  Mendukung: <span className="font-semibold text-slate-700">PDF, DOCX, JPG, PNG</span> (Termasuk foto silabus / scan)
                </p>
              </div>
            </>
          )}
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">Catatan Konfirmasi:</p>
          <p>
            Setelah diekstrak, data komponen akan ditampilkan dalam{' '}
            <span className="font-bold text-slate-800">tabel yang dapat diedit</span>. Anda dapat
            memeriksa, menambah, atau merevisi bobot sebelum kalkulasi diterapkan.
          </p>
        </div>
      </div>
    </div>
  );
};
