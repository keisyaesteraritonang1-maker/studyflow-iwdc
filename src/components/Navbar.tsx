import React from 'react';
import { UserProfile } from '../types';
import { BookOpen, Calculator, GraduationCap, LayoutDashboard, User } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'smart-practice' | 'grade-predictor';
  onSelectTab: (tab: 'dashboard' | 'smart-practice' | 'grade-predictor') => void;
  user: UserProfile;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand Wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left text-slate-900 group whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8EB8E8] to-[#C5B8EA] flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#263449]">
              StudyFlow
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single line, no wrap) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'dashboard'
                ? 'bg-slate-100 text-[#263449] font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('smart-practice')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'smart-practice'
                ? 'bg-[#8EB8E8]/15 text-[#263449] font-semibold border border-[#8EB8E8]/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#8EB8E8]" />
            <span>Smart Practice</span>
          </button>

          <button
            onClick={() => onSelectTab('grade-predictor')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'grade-predictor'
                ? 'bg-[#C5B8EA]/20 text-[#263449] font-semibold border border-[#C5B8EA]/40'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-4 h-4 text-[#A99AE8]" />
            <span>Grade Predictor</span>
          </button>
        </nav>

        {/* Zone 3: Single Primary Action / User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
            title="Kelola Profil Mahasiswa"
          >
            <div className="w-6 h-6 rounded-full bg-[#8EB8E8]/20 flex items-center justify-center text-[#263449]">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="font-semibold text-slate-900 truncate max-w-[130px]">
                {user.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-500">IPB University</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
