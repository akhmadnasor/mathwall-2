import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  FlaskConical,
  Gamepad2,
  Compass,
  ClipboardCheck,
  Award,
  Library,
  UserCheck,
  LogOut,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { LandingScreens } from './components/LandingScreens';
import { MateriModule } from './components/MateriModule';
import { StemLabModule } from './components/StemLabModule';
import { GamesModule } from './components/GamesModule';
import { PjblModule } from './components/PjblModule';
import { QuizModule } from './components/QuizModule';
import {
  EvaluasiModule,
  ReferensiModule,
  PengembangModule,
  PetunjukModule,
  DatabaseModal,
} from './components/EvaluasiRefDevModules';
import type { StudentIdentity } from './utils/fractionMath';
import { safeApiRequest } from './utils/apiClient';

type ActiveModuleTab =
  | 'materi'
  | 'lab'
  | 'game'
  | 'pjbl'
  | 'quiz'
  | 'evaluasi'
  | 'petunjuk'
  | 'referensi'
  | 'pengembang';

export default function App() {
  const [siswa, setSiswa] = useState<StudentIdentity | null>(() => {
    try {
      const saved = sessionStorage.getItem('matwall_active_siswa');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveModuleTab>('materi');
  const [dbStatus, setDbStatus] = useState<any>({
    connected: false,
    mode: 'UNCONFIGURED',
    spreadsheetTitle: 'Tesis Bismillah_Mathawall',
    message: 'Memeriksa status koneksi database Google Sheets...',
    tabCounts: {},
  });
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    syncedToSheets: boolean;
  } | null>(null);

  // Double-click / Double-tap detector on Header Logo for IFP / PID Admin Access
  const lastLogoTapRef = useRef<number>(0);
  const handleLogoTapOrClick = () => {
    const now = Date.now();
    if (now - lastLogoTapRef.current < 420) {
      setIsDbModalOpen(true);
      lastLogoTapRef.current = 0;
    } else {
      lastLogoTapRef.current = now;
    }
  };

  const fetchDbStatus = async () => {
    try {
      const { ok, data } = await safeApiRequest('/api/db/status');
      if (ok && data) {
        setDbStatus(data);
      }
    } catch {
      setDbStatus((prev: any) => ({
        ...prev,
        connected: false,
        message: 'Server lokal aktif.',
      }));
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const showSaveToast = (message: string, syncedToSheets: boolean) => {
    setToast({ message, syncedToSheets });
    fetchDbStatus();
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const handleStudentLoginSuccess = (
    studentData: StudentIdentity,
    saveStatus: { savedLocal: boolean; savedToGoogleSheets: boolean; sheetsStatusMessage: string }
  ) => {
    setSiswa(studentData);
    try {
      sessionStorage.setItem('matwall_active_siswa', JSON.stringify(studentData));
    } catch {
      // ignore storage errors
    }
    showSaveToast(
      `Selamat datang, ${studentData.nama_siswa}! Selamat belajar di MATWALL.`,
      saveStatus.savedToGoogleSheets
    );
  };

  const handleLogoutSiswa = () => {
    setSiswa(null);
    try {
      sessionStorage.removeItem('matwall_active_siswa');
    } catch {
      // ignore
    }
  };

  if (!siswa) {
    return (
      <>
        <LandingScreens
          onStudentLoginSuccess={handleStudentLoginSuccess}
          onOpenAdminModal={() => setIsDbModalOpen(true)}
        />
        <DatabaseModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          dbStatus={dbStatus}
          onRefreshStatus={fetchDbStatus}
        />
      </>
    );
  }

  const navItems: Array<{
    id: ActiveModuleTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'materi', label: 'Materi', icon: BookOpen },
    { id: 'lab', label: 'Virtual Lab 3D', icon: FlaskConical },
    { id: 'game', label: '3 Game 3D', icon: Gamepad2 },
    { id: 'pjbl', label: 'Proyek PjBL', icon: Compass },
    { id: 'quiz', label: 'Quiz (15)', icon: ClipboardCheck },
    { id: 'evaluasi', label: 'Evaluasi', icon: Award },
    { id: 'petunjuk', label: 'Petunjuk', icon: HelpCircle },
    { id: 'referensi', label: 'Referensi', icon: Library },
    { id: 'pengembang', label: 'Pengembang', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFFDF7] text-[#082545] overflow-x-hidden">
      {/* Sticky Top Header & 9-Module Navigation Bar with Square Icon on the Left */}
      <header className="sticky top-0 shrink-0 bg-white/95 backdrop-blur-md border-b-2 border-[#082545] px-2.5 sm:px-4 lg:px-5 py-2 z-30 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex flex-wrap xl:flex-nowrap items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: Square MATHWALL Icon & Brand (Double-click / Double-tap opens Hidden Admin Modal) */}
          <div
            onClick={handleLogoTapOrClick}
            onDoubleClick={() => setIsDbModalOpen(true)}
            title="MATHWALL — Mathematics Interactive Wordwall"
            className="flex items-center gap-2 cursor-pointer select-none shrink-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0066DD] via-[#FF7A00] to-[#58CC02] p-0.5 border border-[#082545] shadow-sm group-hover:scale-105 transition-transform">
              <img
                src="https://lh3.googleusercontent.com/d/15UXWQT0qi-Aph08CDQwsPYB1q7xvNG4M"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('/hero_lp.png')) {
                    target.src = '/hero_lp.png';
                  }
                }}
                referrerPolicy="no-referrer"
                alt="MATHWALL Logo"
                className="w-full h-full rounded-[10px] object-contain bg-white"
              />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight font-display whitespace-nowrap leading-none">
                <span className="text-[#0066DD]">MATH</span>
                <span className="text-[#FF7A00]">WALL</span>
              </div>
              <div className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                Kelas V SD
              </div>
            </div>
          </div>

          {/* Center: All 9 Module Navigation Buttons (No Horizontal Scrollbar, Full Visibility) */}
          <nav className="order-3 xl:order-2 w-full xl:w-auto flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 pt-1 xl:pt-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2 sm:px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 border-2 border-[#082545] transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#FF7A00] text-white shadow-[0_2px_0_#082545]'
                      : 'bg-[#FFFDF7] text-[#082545] hover:bg-[#BAE6FD]/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Student Identity & Logout */}
          <div className="order-2 xl:order-3 flex items-center gap-1.5 shrink-0 text-xs font-extrabold">
            <div className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-[#FEF9C3] border border-[#082545] text-[11px]">
              <span className="text-[#0066DD] truncate max-w-[100px] 2xl:max-w-[140px]">
                {siswa.nama_siswa}
              </span>
              <span>·</span>
              <span className="whitespace-nowrap">{siswa.kelas}</span>
            </div>
            <button
              type="button"
              onClick={handleLogoutSiswa}
              className="surface-3d-btn-neutral px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 text-red-600 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-5 z-40 max-w-md animate-bounce">
          <div className="px-4 py-2.5 rounded-2xl border-2 border-[#082545] bg-[#BBF7D0] text-[#082545] text-xs font-extrabold flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Scrollable Workspace Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 flex flex-col">
        {activeTab === 'materi' && (
          <MateriModule siswa={siswa} onSavedNotification={showSaveToast} />
        )}
        {activeTab === 'lab' && (
          <StemLabModule siswa={siswa} onSavedNotification={showSaveToast} />
        )}
        {activeTab === 'game' && (
          <GamesModule siswa={siswa} onSavedNotification={showSaveToast} />
        )}
        {activeTab === 'pjbl' && (
          <PjblModule siswa={siswa} onSavedNotification={showSaveToast} />
        )}
        {activeTab === 'quiz' && (
          <QuizModule siswa={siswa} onSavedNotification={showSaveToast} />
        )}
        {activeTab === 'evaluasi' && (
          <EvaluasiModule siswa={siswa} onSavedNotification={showSaveToast} />
        )}
        {activeTab === 'petunjuk' && <PetunjukModule />}
        {activeTab === 'referensi' && <ReferensiModule />}
        {activeTab === 'pengembang' && <PengembangModule />}
      </main>

      {/* Compact Single-Line Academic Footer */}
      <footer className="shrink-0 bg-white border-t border-slate-200 px-4 lg:px-8 py-1.5">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-500">
          <div>
            <strong>MATWALL — Mathematics Interactive Wordwall</strong> · Matematika Kelas V SD
            (Kurikulum Merdeka, Fase C, Semester 1)
          </div>
          <div>
            Pengembang: <strong>MILA AULIA (NIM: 501332956)</strong> · S2 Magister Pendidikan Dasar
            · Universitas Terbuka
          </div>
        </div>
      </footer>

      {/* Hidden Admin & Database Configuration Modal (Triggered by Double-Click on Logo) */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        dbStatus={dbStatus}
        onRefreshStatus={fetchDbStatus}
      />
    </div>
  );
}
