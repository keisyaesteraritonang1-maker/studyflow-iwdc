import React, { useEffect, useState } from 'react';
import { CourseContract, LectureMaterial, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SmartPracticeView } from './components/SmartPractice/SmartPracticeView';
import { GradePredictorView } from './components/GradePredictor/GradePredictorView';
import { ProfileModal } from './components/ProfileModal';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'smart-practice' | 'grade-predictor'>(
    'dashboard'
  );
  const [user, setUser] = useState<UserProfile>({
    id: 'usr_ipb_demo',
    name: 'Keisya Ester Aritonang',
    email: 'keisyaesteraritonang1@gmail.com',
    university: 'IPB University (Institut Pertanian Bogor)',
    faculty: 'Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)',
    major: 'Ilmu Komputer',
    studentId: 'G64220088',
  });

  const [materials, setMaterials] = useState<LectureMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<LectureMaterial | null>(null);

  const [contracts, setContracts] = useState<CourseContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<CourseContract | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  const fetchData = async () => {
    try {
      const [userData, materialsData, contractsData] = await Promise.all([
        api.getCurrentUser().catch(() => user),
        api.getMaterials().catch(() => []),
        api.getContracts().catch(() => []),
      ]);

      if (userData) setUser(userData);
      setMaterials(materialsData);
      if (materialsData.length > 0 && !selectedMaterial) {
        setSelectedMaterial(materialsData[0]);
      }

      setContracts(contractsData);
      if (contractsData.length > 0 && !selectedContract) {
        setSelectedContract(contractsData[0]);
      }
    } catch (e) {
      console.error('Failed to load initial StudyFlow data:', e);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#263449] flex flex-col selection:bg-[#8EB8E8]/20">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <main className="flex-1">
        {isLoadingInitial ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#8EB8E8] animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Memuat StudyFlow...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                user={user}
                materials={materials}
                contracts={contracts}
                onNavigate={setCurrentTab}
                onSelectMaterial={(m) => {
                  setSelectedMaterial(m);
                  setCurrentTab('smart-practice');
                }}
                onSelectContract={(c) => {
                  setSelectedContract(c);
                  setCurrentTab('grade-predictor');
                }}
              />
            )}

            {currentTab === 'smart-practice' && (
              <SmartPracticeView
                materials={materials}
                selectedMaterial={selectedMaterial}
                onSelectMaterial={setSelectedMaterial}
                onRefreshMaterials={async () => {
                  const refreshed = await api.getMaterials();
                  setMaterials(refreshed);
                }}
              />
            )}

            {currentTab === 'grade-predictor' && (
              <GradePredictorView
                contracts={contracts}
                selectedContract={selectedContract}
                onSelectContract={setSelectedContract}
                onRefreshContracts={async () => {
                  const refreshed = await api.getContracts();
                  setContracts(refreshed);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#263449]">StudyFlow</span>
            <span aria-hidden="true">·</span>
            <span>Learn Smarter, Achieve Better</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Dirancang khusus untuk Mahasiswa IPB University & Mahasiswa Indonesia
          </div>
        </div>
      </footer>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        user={user}
        onClose={() => setIsProfileModalOpen(false)}
        onUserUpdated={setUser}
      />
    </div>
  );
}
