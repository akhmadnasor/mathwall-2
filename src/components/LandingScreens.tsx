import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  LogIn,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  Pause,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { FractionBar3D, FractionPie3D, FractionDisplay } from './FractionVisuals';
import { lcm, type StudentIdentity } from '../utils/fractionMath';
import { safeApiRequest } from '../utils/apiClient';
import { PetunjukModal } from './EvaluasiRefDevModules';

interface LandingScreensProps {
  onStudentLoginSuccess: (
    siswa: StudentIdentity,
    saveStatus: { savedLocal: boolean; savedToGoogleSheets: boolean; sheetsStatusMessage: string }
  ) => void;
  onOpenAdminModal: () => void;
}

const HERO_SQUARE_URL = 'https://lh3.googleusercontent.com/d/15UXWQT0qi-Aph08CDQwsPYB1q7xvNG4M';
const HERO_BANNER_URL = 'https://lh3.googleusercontent.com/d/19BNPLTVJKnNnhbH-d8uNwZLa2hOcfTPL';

export const LandingScreens: React.FC<LandingScreensProps> = ({
  onStudentLoginSuccess,
  onOpenAdminModal,
}) => {
  const [screen, setScreen] = useState<1 | 2>(1);
  const [isPetunjukOpen, setIsPetunjukOpen] = useState(false);
  const [squareImgSrc, setSquareImgSrc] = useState<string>(HERO_SQUARE_URL);
  const [heroBannerSrc, setHeroBannerSrc] = useState<string>(HERO_BANNER_URL);

  // Double-tap / Double-click detector on Logo for IFP / PID and Desktop Admin Menu
  const lastTapRef = useRef<number>(0);
  const handleLogoInteraction = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 420) {
      onOpenAdminModal();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  // Interactive Animated Fractions State
  const [demoNumA, setDemoNumA] = useState<number>(1);
  const [demoDenA, setDemoDenA] = useState<number>(2);
  const [demoNumB, setDemoNumB] = useState<number>(3);
  const [demoDenB, setDemoDenB] = useState<number>(4);
  const [autoCycle, setAutoCycle] = useState<boolean>(true);

  const presets = [
    { na: 1, da: 2, nb: 3, db: 4 },
    { na: 2, da: 3, nb: 5, db: 6 },
    { na: 2, da: 4, nb: 3, db: 6 },
    { na: 3, da: 5, nb: 7, db: 10 },
  ];

  useEffect(() => {
    if (!autoCycle) return;
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % presets.length;
      setDemoNumA(presets[idx].na);
      setDemoDenA(presets[idx].da);
      setDemoNumB(presets[idx].nb);
      setDemoDenB(presets[idx].db);
    }, 3600);
    return () => clearInterval(timer);
  }, [autoCycle]);

  // Simple 1-Click Login State
  const [showOptionalIdentity, setShowOptionalIdentity] = useState(false);
  const [namaSiswa, setNamaSiswa] = useState('Siswa Kelas V SD');
  const [kelas, setKelas] = useState('Kelas V-A');
  const [asalSekolah, setAsalSekolah] = useState('SD Negeri Merdeka');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInstantLogin = async () => {
    setErrorMsg('');
    setIsSubmitting(true);

    const finalNama = namaSiswa.trim() || 'Siswa Kelas V SD';
    const finalKelas = kelas.trim() || 'Kelas V SD';
    const finalSekolah = asalSekolah.trim() || 'SD Kurikulum Merdeka';

    const fallbackSiswa: StudentIdentity = {
      id_siswa: `SISWA-${Date.now().toString().slice(-6)}`,
      nama_siswa: finalNama,
      kelas: finalKelas,
      asal_sekolah: finalSekolah,
    };

    try {
      const res: any = await safeApiRequest('/api/siswa/masuk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_siswa: finalNama,
          kelas: finalKelas,
          asal_sekolah: finalSekolah,
        }),
      });
      const payload = res?.data || res || {};
      const studentObj: StudentIdentity = payload.siswa || res?.siswa || fallbackSiswa;

      onStudentLoginSuccess(studentObj, {
        savedLocal: Boolean(payload.savedLocal ?? true),
        savedToGoogleSheets: Boolean(payload.savedToGoogleSheets ?? false),
        sheetsStatusMessage:
          payload.sheetsStatusMessage ||
          `Selamat datang ${studentObj.nama_siswa}! Sesi belajar aktif.`,
      });
    } catch {
      onStudentLoginSuccess(fallbackSiswa, {
        savedLocal: true,
        savedToGoogleSheets: false,
        sheetsStatusMessage: `Selamat datang ${fallbackSiswa.nama_siswa}! Sesi belajar aktif.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const compareSign =
    demoNumA / demoDenA < demoNumB / demoDenB
      ? '<'
      : demoNumA / demoDenA > demoNumB / demoDenB
      ? '>'
      : '=';

  const currentKpk = lcm(demoDenA, demoDenB);
  const eqA = demoNumA * (currentKpk / demoDenA);
  const eqB = demoNumB * (currentKpk / demoDenB);

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden overflow-y-auto bg-[#FFFDF7] text-[#082545] selection:bg-[#FFD60A] selection:text-[#082545]">
      {/* Organic Ambient Mesh Background & Subtle Mathematical Grid */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-28 -left-28 w-[420px] h-[420px] rounded-full opacity-45 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #BAE6FD 0%, rgba(186,230,253,0) 70%)',
          }}
        />
        <div
          className="absolute top-1/4 -right-28 w-[460px] h-[460px] rounded-full opacity-45 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #FEF08A 0%, rgba(254,240,138,0) 70%)',
          }}
        />
        <div
          className="absolute -bottom-28 left-1/3 w-[420px] h-[420px] rounded-full opacity-35 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #BBF7D0 0%, rgba(187,247,208,0) 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(#0066DD 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
      </div>

      {/* Sticky Top Navigation Bar with Square Icon on the Left */}
      <header className="sticky top-0 z-30 shrink-0 backdrop-blur-md bg-white/90 border-b border-[#082545]/10 px-4 sm:px-6 lg:px-10 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo on the Left — Uses Square Hero Image (Double-click opens Hidden Admin Menu) */}
          <button
            type="button"
            onClick={handleLogoInteraction}
            onDoubleClick={onOpenAdminModal}
            title="MATHWALL — Mathematics Interactive Wordwall"
            className="group flex items-center gap-3 text-left select-none cursor-pointer focus:outline-none"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0066DD] via-[#FF7A00] to-[#58CC02] p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden p-0.5">
                <img
                  src={squareImgSrc}
                  onError={() => {
                    if (squareImgSrc !== '/hero_lp.png') setSquareImgSrc('/hero_lp.png');
                  }}
                  referrerPolicy="no-referrer"
                  alt="Ikon MATHWALL"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold tracking-tight font-display leading-none">
                <span className="text-[#0066DD]">MATH</span>
                <span className="text-[#FF7A00]">WALL</span>
              </div>
              <div className="text-[11px] font-bold text-slate-500 tracking-wide mt-0.5">
                Interactive Wordwall · Kelas V SD
              </div>
            </div>
          </button>

          {/* Center Navigation Switcher */}
          <nav className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setScreen(1)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                screen === 1
                  ? 'bg-white text-[#0066DD] shadow-sm'
                  : 'text-slate-600 hover:text-[#082545]'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setScreen(2)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                screen === 2
                  ? 'bg-white text-[#FF7A00] shadow-sm'
                  : 'text-slate-600 hover:text-[#082545]'
              }`}
            >
              Eksplorasi
            </button>
            <button
              type="button"
              onClick={() => setIsPetunjukOpen(true)}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-slate-600 hover:text-[#0066DD] hover:bg-white/70 flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#0066DD]" />
              <span>Petunjuk</span>
            </button>
          </nav>

          {/* Right Quick Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            {screen === 1 ? (
              <button
                type="button"
                onClick={() => setScreen(2)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#F97316] hover:from-[#EA580C] hover:to-[#FF7A00] text-white font-extrabold text-xs sm:text-sm shadow-[0_6px_16px_rgba(255,122,0,0.32)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Masuk Pembelajaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleInstantLogin}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#58CC02] to-[#16A34A] text-white font-extrabold text-xs sm:text-sm shadow-[0_6px_16px_rgba(88,204,2,0.32)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Memuat...' : 'LOGIN'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN SCROLLABLE HERO STAGE */}
      <main className="relative z-10 flex-1 flex items-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
        <AnimatePresence mode="wait">
          {screen === 1 ? (
            <motion.div
              key="welcome-stage"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
            >
              {/* ============================================================ */}
              {/* LEFT COLUMN: STATIC EYE-CATCHING HERO SHOWCASE (HALAMAN 1)   */}
              {/* ============================================================ */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
                <div className="relative w-full">
                  {/* Vibrant Multi-Tone Ambient Halo Behind Static Hero Card */}
                  <div
                    className="pointer-events-none absolute -inset-3 rounded-[36px] opacity-75 blur-2xl"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 30%, rgba(255,214,10,0.55) 0%, rgba(0,102,221,0.45) 50%, rgba(88,204,2,0.4) 90%)',
                    }}
                  />

                  {/* Static Eye-Catching Hero Showcase Card on the Left */}
                  <div
                    onClick={handleLogoInteraction}
                    onDoubleClick={onOpenAdminModal}
                    className="relative z-10 rounded-[32px] bg-white/95 backdrop-blur-xl border-[3px] border-white shadow-[0_24px_60px_rgba(8,37,69,0.16)] p-3 sm:p-4 space-y-3.5 cursor-pointer select-none"
                  >
                    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#0066DD]/15 via-sky-50 to-[#FEF9C3]/35 overflow-hidden border-2 border-[#082545]/10 shadow-inner">
                      <img
                        src={heroBannerSrc}
                        onError={() => {
                          if (heroBannerSrc !== '/hero_latest.png') setHeroBannerSrc('/hero_latest.png');
                        }}
                        referrerPolicy="no-referrer"
                        alt="Hero MATHWALL — Mathematics Interactive Wordwall Bilangan Pecahan"
                        className="w-full h-auto object-contain block"
                      />
                    </div>

                    {/* Eye-Catching Interactive Bottom Dock Matching the Artwork */}
                    <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#082545] via-[#0F3866] to-[#1E3A8A] text-white flex flex-wrap items-center justify-between gap-3 shadow-md border border-sky-400/30">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FFD60A] text-[#082545] text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                          Live KPK = {currentKpk}
                        </span>
                        <div>
                          <div className="text-xs font-extrabold text-white">
                            Perbandingan Pecahan Senilai
                          </div>
                          <div className="text-[11px] text-[#BAE6FD] font-semibold">
                            {eqA}/{currentKpk} dibanding {eqB}/{currentKpk}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 font-extrabold shrink-0 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                        <FractionDisplay
                          num={demoNumA}
                          den={demoDenA}
                          size="sm"
                          colorClass="text-[#BAE6FD]"
                        />
                        <span className="w-7 h-7 rounded-lg bg-[#FFD60A] text-[#082545] font-mono text-sm font-extrabold flex items-center justify-center shadow-sm">
                          {compareSign}
                        </span>
                        <FractionDisplay
                          num={demoNumB}
                          den={demoDenB}
                          size="sm"
                          colorClass="text-[#BBF7D0]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* RIGHT COLUMN: SAMBUTAN NARRATIVE & CTA BUTTONS               */}
              {/* ============================================================ */}
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/95 border border-[#0066DD]/25 shadow-sm text-xs font-extrabold text-[#0066DD]">
                  <Sparkles className="w-4 h-4 text-[#FF7A00]" />
                  <span>Matematika Kelas V SD</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[#15803D]">Kurikulum Merdeka Fase C · Semester 1</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl xl:text-[42px] font-extrabold tracking-tight text-[#082545] leading-[1.15]">
                    Belajar Pecahan Jadi Lebih{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066DD] to-[#0284C7]">
                      Hidup
                    </span>
                    ,{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-[#D97706]">
                      Visual
                    </span>
                    , dan{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16A34A] to-[#58CC02]">
                      Menyenangkan
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                    Selamat datang di <strong>MATHWALL</strong> — media pembelajaran interaktif
                    berbasis <strong>Project Based Learning (PjBL)</strong>. Pahami cara
                    membandingkan pecahan seperti{' '}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#BAE6FD]/50 text-[#0066DD] font-extrabold mx-0.5 align-middle">
                      <FractionDisplay num={1} den={2} size="sm" colorClass="text-[#0066DD]" />
                    </span>{' '}
                    dan{' '}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#BBF7D0]/60 text-[#15803D] font-extrabold mx-0.5 align-middle">
                      <FractionDisplay num={3} den={4} size="sm" colorClass="text-[#15803D]" />
                    </span>
                    , menjumlahkan, serta mengurangkan pecahan melalui laboratorium virtual 3D,
                    wahana permainan, dan proyek{' '}
                    <strong className="text-[#082545]">Mini Bakery: Master Chef Pecahan</strong>.
                  </p>
                </div>

                {/* 3 Visual Topic Highlight Pills Matching Hero Illustration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="px-3 py-2 rounded-2xl bg-pink-50/90 border border-pink-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-pink-500 text-white font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                      ⚖
                    </span>
                    <span className="text-[11px] font-extrabold text-[#082545] leading-tight">
                      Membandingkan &amp; Mengurutkan
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-2xl bg-sky-50/90 border border-sky-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#0066DD] text-white font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                      +
                    </span>
                    <span className="text-[11px] font-extrabold text-[#082545] leading-tight">
                      Penjumlahan Pecahan
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#16A34A] text-white font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                      −
                    </span>
                    <span className="text-[11px] font-extrabold text-[#082545] leading-tight">
                      Pengurangan Pecahan
                    </span>
                  </div>
                </div>

                {/* Primary & Secondary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setScreen(2)}
                    className="group px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0066DD] to-[#0284C7] hover:from-[#0052B5] hover:to-[#0066DD] text-white text-sm sm:text-base font-extrabold shadow-[0_10px_25px_rgba(0,102,221,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2.5 cursor-pointer"
                  >
                    <span>Jelajahi Wahana Belajar</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={handleInstantLogin}
                    disabled={isSubmitting}
                    className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FEF9C3]/60 text-[#082545] border-2 border-slate-200 hover:border-[#FF7A00] text-sm sm:text-base font-extrabold shadow-sm hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-[#FF7A00]" />
                    <span>{isSubmitting ? 'Memuat...' : 'Langsung Login'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ================================================================ */
            /* VIEW 2: LEFT STATIC HERO LOGIN PORTAL & RIGHT ECOSYSTEM INTRO    */
            /* ================================================================ */
            <motion.div
              key="login-stage"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
            >
              {/* LEFT COLUMN: Static Eye-Catching Hero Illustration + 1-Click Login Portal */}
              <div className="lg:col-span-5 relative">
                <div
                  className="pointer-events-none absolute -inset-2.5 rounded-[36px] opacity-65 blur-2xl"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,214,10,0.45) 0%, rgba(0,102,221,0.38) 55%, rgba(88,204,2,0.35) 90%)',
                  }}
                />
                <div className="relative z-10 rounded-[32px] bg-white/95 backdrop-blur-xl border-[3px] border-white shadow-[0_24px_60px_rgba(8,37,69,0.14)] p-5 sm:p-6 space-y-5 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0066DD] via-[#FF7A00] to-[#58CC02]" />

                  <div className="text-center space-y-3.5 pt-1">
                    <div
                      onClick={handleLogoInteraction}
                      onDoubleClick={onOpenAdminModal}
                      className="w-full rounded-2xl bg-gradient-to-b from-[#0066DD]/15 via-sky-50 to-[#FEF9C3]/35 border-2 border-[#082545]/10 shadow-sm cursor-pointer select-none overflow-hidden"
                    >
                      <img
                        src={heroBannerSrc}
                        onError={() => {
                          if (heroBannerSrc !== '/hero_latest.png') setHeroBannerSrc('/hero_latest.png');
                        }}
                        referrerPolicy="no-referrer"
                        alt="Hero MATHWALL — Mathematics Interactive Wordwall"
                        className="w-full h-auto object-contain block"
                      />
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-2xl font-extrabold text-[#082545]">
                        Portal Masuk Belajar
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Sentuh tombol <strong>LOGIN</strong> di bawah ini untuk langsung membuka
                        seluruh wahana pembelajaran interaktif.
                      </p>
                    </div>
                  </div>

                  {/* Single Prominent Login Button */}
                  <div className="space-y-3">
                    {errorMsg && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold text-center">
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleInstantLogin}
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#58CC02] to-[#16A34A] hover:from-[#16A34A] hover:to-[#58CC02] text-white text-lg font-extrabold shadow-[0_10px_25px_rgba(88,204,2,0.32)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>{isSubmitting ? 'MEMBUKA DASHBOARD...' : 'LOGIN'}</span>
                    </button>

                    {/* Optional Student Identity Selector */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowOptionalIdentity(!showOptionalIdentity)}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs font-extrabold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-4 h-4 text-[#0066DD] shrink-0" />
                          <span className="truncate">
                            Profil: <strong className="text-[#082545]">{namaSiswa}</strong> ({kelas})
                          </span>
                        </span>
                        {showOptionalIdentity ? (
                          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </button>

                      <AnimatePresence>
                        {showOptionalIdentity && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                              <div>
                                <label className="block font-extrabold text-slate-700 mb-1">
                                  Nama Siswa / Kelompok:
                                </label>
                                <input
                                  type="text"
                                  value={namaSiswa}
                                  onChange={(e) => setNamaSiswa(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-[#082545]"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                  <label className="block font-extrabold text-slate-700 mb-1">
                                    Kelas:
                                  </label>
                                  <input
                                    type="text"
                                    value={kelas}
                                    onChange={(e) => setKelas(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-[#082545]"
                                  />
                                </div>
                                <div>
                                  <label className="block font-extrabold text-slate-700 mb-1">
                                    Sekolah:
                                  </label>
                                  <input
                                    type="text"
                                    value={asalSekolah}
                                    onChange={(e) => setAsalSekolah(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-[#082545]"
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Ekosistem Pembelajaran Digital Terpadu + Peraga Pecahan Interaktif */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#FF7A00]/10 text-[#FF7A00] text-xs font-extrabold uppercase tracking-wider">
                    <span>Ekosistem Pembelajaran Digital Terpadu</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setScreen(1)}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Dashboard</span>
                  </button>
                </div>

                {/* Peraga Pecahan Interaktif · Sentuh Balok atau Pasangan Pecahan (Moved to Screen 2) */}
                <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_14px_35px_rgba(8,37,69,0.08)] p-4 sm:p-5 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="text-[11px] font-extrabold text-[#FF7A00] uppercase tracking-wider">
                        Peraga Pecahan Interaktif · Sentuh Balok atau Pasangan Pecahan
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAutoCycle(!autoCycle)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-extrabold text-[#082545] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {autoCycle ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-[#0066DD]" />
                          <span>Jeda Animasi</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-[#15803D]" />
                          <span>Putar Otomatis</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Fraction Pair Selector Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {presets.map((p, idx) => {
                      const isActive =
                        demoNumA === p.na &&
                        demoDenA === p.da &&
                        demoNumB === p.nb &&
                        demoDenB === p.db;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAutoCycle(false);
                            setDemoNumA(p.na);
                            setDemoDenA(p.da);
                            setDemoNumB(p.nb);
                            setDemoDenB(p.db);
                          }}
                          className={`py-1.5 px-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#0066DD]/10 border-[#0066DD] text-[#0066DD] shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <FractionDisplay num={p.na} den={p.da} size="sm" />
                          <span>vs</span>
                          <FractionDisplay num={p.nb} den={p.db} size="sm" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive 3D Fraction Bars + Pie Charts */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
                    <div className="sm:col-span-5 flex items-center justify-around bg-slate-50/80 rounded-2xl p-3 border border-slate-200/70">
                      <div className="flex flex-col items-center gap-1">
                        <FractionPie3D num={demoNumA} den={demoDenA} color="azure" size={68} />
                        <FractionDisplay num={demoNumA} den={demoDenA} size="sm" colorClass="text-[#0066DD]" />
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[#FFD60A] text-[#082545] font-mono text-lg font-extrabold flex items-center justify-center shadow-sm">
                        {compareSign}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <FractionPie3D num={demoNumB} den={demoDenB} color="emerald" size={68} />
                        <FractionDisplay num={demoNumB} den={demoDenB} size="sm" colorClass="text-[#15803D]" />
                      </div>
                    </div>

                    <div className="sm:col-span-7 space-y-2">
                      <FractionBar3D
                        num={demoNumA}
                        den={demoDenA}
                        subdivideToKpk={currentKpk}
                        color="azure"
                        label="Sentuh segmen balok biru (Pecahan A):"
                        onSegmentClick={(n) => {
                          setAutoCycle(false);
                          setDemoNumA(n);
                        }}
                      />
                      <FractionBar3D
                        num={demoNumB}
                        den={demoDenB}
                        subdivideToKpk={currentKpk}
                        color="emerald"
                        label="Sentuh segmen balok hijau (Pecahan B):"
                        onSegmentClick={(n) => {
                          setAutoCycle(false);
                          setDemoNumB(n);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 shrink-0 border-t border-slate-200/70 bg-white/75 backdrop-blur-sm px-4 sm:px-6 lg:px-10 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <img
              src={squareImgSrc}
              onError={() => {
                if (squareImgSrc !== '/hero_lp.png') setSquareImgSrc('/hero_lp.png');
              }}
              referrerPolicy="no-referrer"
              alt="Ikon MATHWALL"
              className="w-5 h-5 rounded object-contain"
            />
            <span>
              <strong className="text-[#082545]">MATWALL</strong> — Mathematics Interactive Wordwall
              · Kelas V Sekolah Dasar
            </span>
          </div>
          <div>
            Pengembang: <strong className="text-[#082545]">MILA AULIA (NIM: 501332956)</strong> · S2
            Magister Pendidikan Dasar · Universitas Terbuka
          </div>
        </div>
      </footer>

      {/* Modal Petunjuk Penggunaan */}
      <PetunjukModal isOpen={isPetunjukOpen} onClose={() => setIsPetunjukOpen(false)} />
    </div>
  );
};
