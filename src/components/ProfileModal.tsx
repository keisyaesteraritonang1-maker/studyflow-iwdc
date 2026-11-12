import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Check, GraduationCap, User, X } from 'lucide-react';
import { api } from '../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onUserUpdated: (u: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onUserUpdated,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [university, setUniversity] = useState(user.university);
  const [faculty, setFaculty] = useState(user.faculty);
  const [major, setMajor] = useState(user.major);
  const [studentId, setStudentId] = useState(user.studentId);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.login({
        name,
        email,
        university,
        faculty,
        major,
        studentId,
      });
      onUserUpdated(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui profil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8EB8E8]/20 flex items-center justify-center text-[#263449]">
              <GraduationCap className="w-4 h-4 text-[#8EB8E8]" />
            </div>
            <div>
              <h3 className="font-bold text-[#263449] text-base">Profil Mahasiswa</h3>
              <p className="text-xs text-slate-500">Identitas akademik pengguna StudyFlow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#8EB8E8] text-slate-900 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Email Kampus</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#8EB8E8] text-slate-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">NIM / ID Mahasiswa</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#8EB8E8] text-slate-900 font-medium font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Universitas</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#8EB8E8] text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Fakultas</label>
            <input
              type="text"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#8EB8E8] text-slate-900 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Program Studi / Departemen</label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#8EB8E8] text-slate-900 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#8EB8E8] hover:bg-[#7aa7d9] text-white font-semibold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Profil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
