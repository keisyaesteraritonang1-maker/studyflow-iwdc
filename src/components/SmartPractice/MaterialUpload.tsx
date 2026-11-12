import React, { useRef, useState } from 'react';
import { LectureMaterial } from '../../types';
import {
  AlertCircle,
  FileCheck2,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { api } from '../../services/api';

interface MaterialUploadProps {
  onMaterialCreated: (material: LectureMaterial) => void;
  onResetSamples: () => void;
}

export const MaterialUpload: React.FC<MaterialUploadProps> = ({
  onMaterialCreated,
  onResetSamples,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['.pdf', '.pptx', '.docx', '.txt'];

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return `Format file "${ext}" tidak didukung. Mohon unggah dokumen PDF, PPTX, DOCX, atau TXT.`;
    }
    if (file.size > 25 * 1024 * 1024) {
      return 'Ukuran file melebihi batas maksimal 25 MB.';
    }
    if (file.size === 0) {
      return 'File dokumen kosong (0 byte).';
    }
    return null;
  };

  const handleUploadFile = async (file: File) => {
    setErrorMsg(null);
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress('Membaca dokumen dan mengekstrak teks...');

      const result = await api.uploadMaterial(file);
      setUploadProgress('Ekstraksi selesai! Menyiapkan materi...');
      onMaterialCreated(result.material);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Terjadi kegagalan saat mengekstrak dokumen.';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-[#263449]">Unggah Materi Perkuliahan</h3>
        <p className="text-xs sm:text-sm text-slate-500">
          Sistem akan mengekstrak teks dokumen asli secara otomatis dan menganalisis strukturnya dengan AI.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="space-y-1">
            <p className="font-semibold">Gagal Memproses Dokumen</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-[#8EB8E8] bg-[#8EB8E8]/10 scale-[0.99]'
            : 'border-slate-300 hover:border-[#8EB8E8] hover:bg-slate-50/50'
        } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.pptx,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleUploadFile(e.target.files[0]);
            }
          }}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#8EB8E8] animate-spin" />
            <p className="text-sm font-semibold text-[#263449]">{uploadProgress}</p>
            <p className="text-xs text-slate-400">Mohon tunggu beberapa detik...</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-[#8EB8E8]/15 flex items-center justify-center text-[#263449]">
              <UploadCloud className="w-7 h-7 text-[#8EB8E8]" />
            </div>

            <div className="space-y-1">
              <p className="text-sm sm:text-base font-semibold text-[#263449]">
                Tarik & letakkan file materi kuliah ke sini, atau{' '}
                <span className="text-[#8EB8E8] underline underline-offset-2">pilih dari perangkat</span>
              </p>
              <p className="text-xs text-slate-500">
                Format yang didukung: <span className="font-semibold text-slate-700">PDF, PPTX, DOCX, TXT</span> (Maksimal 25MB)
              </p>
            </div>
          </>
        )}
      </div>

      {/* Quick Sample Picker */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          Belum punya file? Coba langsung dengan materi perkuliahan IPB University:
        </div>
        <button
          type="button"
          onClick={onResetSamples}
          className="text-xs font-semibold text-[#8EB8E8] hover:text-[#7aa7d9] flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Muat Ulang Materi Contoh IPB</span>
        </button>
      </div>
    </div>
  );
};
