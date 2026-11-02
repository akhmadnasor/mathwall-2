import React, { useState } from 'react';
import {
  RotateCcw,
  Save,
  BookOpen,
  Lightbulb,
  PenTool,
  X,
  Sparkles,
} from 'lucide-react';
import {
  FractionBar3D,
  FractionPie3D,
  FractionNumberLine,
  FractionDisplay,
  MathText,
} from './FractionVisuals';
import {
  compareTwoFractions,
  addFractions,
  subtractFractions,
  type StudentIdentity,
} from '../utils/fractionMath';
import { safeApiRequest } from '../utils/apiClient';

interface MateriModuleProps {
  siswa: StudentIdentity;
  onSavedNotification: (msg: string, syncedToSheets: boolean) => void;
}

interface PracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const PRACTICE_QUESTIONS: Record<'topik1' | 'topik2' | 'topik3', PracticeQuestion[]> = {
  topik1: [
    {
      id: 't1-q1',
      question: 'Bandingkan pecahan 2/3 dan 3/5! Tanda perbandingan yang benar adalah ...',
      options: ['2/3 > 3/5', '2/3 < 3/5', '2/3 = 3/5', 'Tidak dapat dibandingkan'],
      correctIndex: 0,
      explanation: 'KPK dari 3 dan 5 adalah 15. Pecahan 2/3 = 10/15 dan 3/5 = 9/15. Karena 10/15 > 9/15, maka 2/3 > 3/5.',
    },
    {
      id: 't1-q2',
      question: 'Urutkan pecahan 1/2, 5/6, 2/3 dari yang TERKECIL ke TERBESAR!',
      options: ['1/2, 2/3, 5/6', '2/3, 1/2, 5/6', '5/6, 2/3, 1/2', '1/2, 5/6, 2/3'],
      correctIndex: 0,
      explanation: 'Samakan penyebut menjadi 6: 1/2 = 3/6, 2/3 = 4/6, dan 5/6. Urutan terkecil ke terbesar adalah 1/2, 2/3, 5/6.',
    },
    {
      id: 't1-q3',
      question: 'Manakah pecahan di bawah ini yang SENILAI dengan 3/4?',
      options: ['6/12', '9/12', '8/10', '6/10'],
      correctIndex: 1,
      explanation: 'Kalikan pembilang dan penyebut 3/4 dengan 3, sehingga diperoleh 9/12.',
    },
    {
      id: 't1-q4',
      question: 'Dalam resep es buah terdapat 5/8 liter sirup melon dan 3/4 liter air kelapa. Bahan manakah yang lebih sedikit?',
      options: ['Sirup melon (5/8 liter)', 'Air kelapa (3/4 liter)', 'Sama banyak', 'Keduanya lebih dari 1 liter'],
      correctIndex: 0,
      explanation: 'Ubah 3/4 menjadi 6/8. Karena 5/8 < 6/8, maka sirup melon 5/8 liter lebih sedikit.',
    },
    {
      id: 't1-q5',
      question: 'Di antara pecahan 3/10, 2/5, 1/2, dan 7/10, manakah yang nilainya PALING BESAR?',
      options: ['3/10', '2/5', '1/2', '7/10'],
      correctIndex: 3,
      explanation: 'Samakan penyebut ke 10: 3/10, 4/10, 5/10, dan 7/10. Nilai terbesar adalah 7/10.',
    },
  ],
  topik2: [
    {
      id: 't2-q1',
      question: 'Berapakah hasil penjumlahan dari 1/4 + 2/4?',
      options: ['3/8', '3/4', '1/2', '2/4'],
      correctIndex: 1,
      explanation: 'Penyebut sudah sama yaitu 4. Jumlahkan pembilangnya: 1/4 + 2/4 = 3/4.',
    },
    {
      id: 't2-q2',
      question: 'Hitunglah hasil penjumlahan pecahan berbeda penyebut: 1/3 + 1/2 = ...',
      options: ['2/5', '5/6', '3/6', '4/6'],
      correctIndex: 1,
      explanation: 'KPK dari 3 dan 2 adalah 6. Maka 1/3 = 2/6 dan 1/2 = 3/6. Hasilnya 2/6 + 3/6 = 5/6.',
    },
    {
      id: 't2-q3',
      question: 'Ibu mencampurkan 2/5 kg tepung terigu dan 3/10 kg tepung beras. Total berat tepung Ibu adalah ...',
      options: ['5/15 kg', '7/10 kg', '1/2 kg', '9/10 kg'],
      correctIndex: 1,
      explanation: 'Ubah 2/5 menjadi 4/10. Maka 4/10 + 3/10 = 7/10 kg.',
    },
    {
      id: 't2-q4',
      question: 'Hasil dari penjumlahan pecahan campuran 1 1/2 + 2 1/4 adalah ...',
      options: ['3 2/6', '3 3/4', '4 1/4', '3 1/4'],
      correctIndex: 1,
      explanation: 'Bilangan bulat: 1 + 2 = 3. Pecahan: 1/2 + 1/4 = 2/4 + 1/4 = 3/4. Jadi hasilnya 3 3/4.',
    },
    {
      id: 't2-q5',
      question: 'Hasil dari 3/4 + 5/6 dalam bentuk pecahan campuran paling sederhana adalah ...',
      options: ['1 7/12', '1 5/12', '8/10', '1 1/2'],
      correctIndex: 0,
      explanation: 'KPK dari 4 dan 6 adalah 12. Maka 9/12 + 10/12 = 19/12 = 1 7/12.',
    },
  ],
  topik3: [
    {
      id: 't3-q1',
      question: 'Hasil pengurangan 7/9 - 4/9 dalam bentuk paling sederhana adalah ...',
      options: ['3/9', '1/3', '3/18', '2/3'],
      correctIndex: 1,
      explanation: '7/9 - 4/9 = 3/9. Disederhanakan dengan dibagi 3 menjadi 1/3.',
    },
    {
      id: 't3-q2',
      question: 'Hitunglah hasil pengurangan dari 4/5 - 1/2 = ...',
      options: ['3/3', '3/10', '5/10', '7/10'],
      correctIndex: 1,
      explanation: 'KPK dari 5 dan 2 adalah 10. Maka 8/10 - 5/10 = 3/10.',
    },
    {
      id: 't3-q3',
      question: 'Persediaan minyak kelapa 7/8 liter dipakai memasak 3/4 liter. Sisa minyak kelapa adalah ...',
      options: ['4/4 liter', '1/8 liter', '2/8 liter', '3/8 liter'],
      correctIndex: 1,
      explanation: 'Ubah 3/4 menjadi 6/8. Maka 7/8 - 6/8 = 1/8 liter.',
    },
    {
      id: 't3-q4',
      question: 'Hasil dari pengurangan pecahan campuran 3 5/6 - 1 1/3 adalah ...',
      options: ['2 1/2', '2 4/3', '2 2/6', '1 1/2'],
      correctIndex: 0,
      explanation: 'Bilangan bulat: 3 - 1 = 2. Pecahan: 5/6 - 2/6 = 3/6 = 1/2. Hasil akhirnya 2 1/2.',
    },
    {
      id: 't3-q5',
      question: 'Hasil pengurangan dari 2 1/4 - 3/4 adalah ...',
      options: ['1 1/2', '2 2/4', '1 3/4', '1 1/4'],
      correctIndex: 0,
      explanation: 'Ubah 2 1/4 menjadi pecahan biasa 9/4. Maka 9/4 - 3/4 = 6/4 = 1 1/2.',
    },
  ],
};

export const MateriModule: React.FC<MateriModuleProps> = ({ siswa, onSavedNotification }) => {
  const [activeTopic, setActiveTopic] = useState<'topik1' | 'topik2' | 'topik3'>('topik1');

  // Interactive Sandbox Controls for Visual Model
  const [numA, setNumA] = useState(3);
  const [denA, setDenA] = useState(4);
  const [numB, setNumB] = useState(2);
  const [denB, setDenB] = useState(6);
  const [animStep, setAnimStep] = useState<1 | 2 | 3>(3);

  // Popup Modal State: 'konsep' | 'contoh' | 'latihan' | null
  const [activePopup, setActivePopup] = useState<'konsep' | 'contoh' | 'latihan' | null>(null);

  // Practice Exercises State per topic
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [savingTopic, setSavingTopic] = useState(false);

  const compResult = compareTwoFractions({ num: numA, den: denA }, { num: numB, den: denB });
  const addResult = addFractions({ num: numA, den: denA }, { num: numB, den: denB });
  const subResult = subtractFractions({ num: numA, den: denA }, { num: numB, den: denB });

  const topicMeta = {
    topik1: {
      id: 'MATERI-01',
      title: 'Topik 1: Membandingkan & Mengurutkan Pecahan',
      shortDesc: 'Menentukan pecahan yang lebih besar, lebih kecil, atau senilai dengan KPK.',
    },
    topik2: {
      id: 'MATERI-02',
      title: 'Topik 2: Penjumlahan Bilangan Pecahan',
      shortDesc: 'Menjumlahkan pecahan biasa dan campuran dengan menyamakan penyebut (KPK).',
    },
    topik3: {
      id: 'MATERI-03',
      title: 'Topik 3: Pengurangan Bilangan Pecahan',
      shortDesc: 'Mengurangkan pecahan biasa dan campuran serta menyederhanakan hasilnya.',
    },
  }[activeTopic];

  const currentQuestions = PRACTICE_QUESTIONS[activeTopic];
  const answeredCount = currentQuestions.filter((q) => answers[q.id] !== undefined).length;
  const correctCount = currentQuestions.filter((q) => answers[q.id] === q.correctIndex).length;
  const currentScore = Math.round((correctCount / currentQuestions.length) * 100);

  const handleSaveProgress = async () => {
    setSavingTopic(true);
    try {
      const { data } = await safeApiRequest('/api/materi/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_siswa: siswa.id_siswa,
          nama_siswa: siswa.nama_siswa,
          topik_id: topicMeta.id,
          judul_topik: topicMeta.title,
          persentase_baca: 100,
          latihan_benar: correctCount,
          latihan_total: currentQuestions.length,
          skor_latihan: currentScore,
          status_selesai: answeredCount === currentQuestions.length ? 'SELESAI' : 'SEDANG_BELAJAR',
        }),
      });
      onSavedNotification(
        data?.sheetsStatusMessage || `Progress ${topicMeta.title} berhasil disimpan.`,
        Boolean(data?.savedToGoogleSheets)
      );
    } catch {
      onSavedNotification('Gagal menghubungi server saat menyimpan progress materi.', false);
    } finally {
      setSavingTopic(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Compact Unified Top Bar: Topic Selector + 3 Clickable Popup Icon Triggers */}
      <div className="shrink-0 surface-3d-card rounded-2xl px-4 py-2.5 flex flex-wrap xl:flex-nowrap items-center justify-between gap-3">
        {/* Left: Topic Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTopic('topik1')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-[#082545] transition-all whitespace-nowrap cursor-pointer ${
              activeTopic === 'topik1'
                ? 'bg-[#0066DD] text-white shadow-[0_2px_0_#082545]'
                : 'bg-white text-[#082545] hover:bg-[#BAE6FD]/40'
            }`}
          >
            1. Membandingkan
          </button>
          <button
            type="button"
            onClick={() => setActiveTopic('topik2')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-[#082545] transition-all whitespace-nowrap cursor-pointer ${
              activeTopic === 'topik2'
                ? 'bg-[#58CC02] text-white shadow-[0_2px_0_#082545]'
                : 'bg-white text-[#082545] hover:bg-[#BBF7D0]/40'
            }`}
          >
            2. Penjumlahan
          </button>
          <button
            type="button"
            onClick={() => setActiveTopic('topik3')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-[#082545] transition-all whitespace-nowrap cursor-pointer ${
              activeTopic === 'topik3'
                ? 'bg-[#FF7A00] text-white shadow-[0_2px_0_#082545]'
                : 'bg-white text-[#082545] hover:bg-[#FEF08A]/50'
            }`}
          >
            3. Pengurangan
          </button>
        </div>

        {/* Right: 3 Clickable Icon Cards that open Popup Modals */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActivePopup('konsep')}
            className="px-3.5 py-2 rounded-xl border-2 border-[#082545] bg-[#BAE6FD]/55 hover:bg-[#BAE6FD] text-[#082545] text-xs font-extrabold flex items-center gap-2 shadow-[0_2px_0_#082545] cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#0066DD]" />
            <span>Ikon Konsep Inti</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePopup('contoh')}
            className="px-3.5 py-2 rounded-xl border-2 border-[#082545] bg-[#FEF08A]/80 hover:bg-[#FFD60A] text-[#082545] text-xs font-extrabold flex items-center gap-2 shadow-[0_2px_0_#082545] cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-[#D97706]" />
            <span>Ikon Contoh Soal</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePopup('latihan')}
            className="px-4 py-2 rounded-xl border-2 border-[#082545] bg-[#58CC02] hover:bg-[#46A302] text-white text-xs font-extrabold flex items-center gap-2 shadow-[0_2px_0_#082545] cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>Pop-Up Latihan ({answeredCount}/5)</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Single-Screen Interactive Stage */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Left Zone: Interactive Visual Fraction Model Stage (7 cols) */}
        <div className="lg:col-span-7 surface-3d-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#082545]">
                {topicMeta.title}
              </h2>
              <p className="text-xs text-slate-600">{topicMeta.shortDesc}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAnimStep(s as 1 | 2 | 3)}
                  className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border-2 border-[#082545] ${
                    animStep === s
                      ? 'bg-[#FFD60A] text-[#082545]'
                      : 'bg-white text-slate-700'
                  }`}
                >
                  Tahap {s}
                </button>
              ))}
            </div>
          </div>

          {/* 3D Fraction Bars with KPK Dashed Subdivision */}
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#0066DD]">
                <span>Pecahan A =</span>
                <FractionDisplay num={numA} den={denA} size="sm" colorClass="text-[#0066DD]" />
                {animStep >= 2 && (
                  <>
                    <span>=</span>
                    <FractionDisplay
                      num={compResult.eqNumA}
                      den={compResult.kpk}
                      size="sm"
                      colorClass="text-[#082545]"
                    />
                    <span className="text-[11px] font-bold text-slate-500">(KPK {compResult.kpk})</span>
                  </>
                )}
              </div>
              <FractionBar3D
                num={numA}
                den={denA}
                subdivideToKpk={animStep >= 2 ? compResult.kpk : undefined}
                color="azure"
                onSegmentClick={(n) => setNumA(n)}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#15803D]">
                <span>Pecahan B =</span>
                <FractionDisplay num={numB} den={denB} size="sm" colorClass="text-[#15803D]" />
                {animStep >= 2 && (
                  <>
                    <span>=</span>
                    <FractionDisplay
                      num={compResult.eqNumB}
                      den={compResult.kpk}
                      size="sm"
                      colorClass="text-[#082545]"
                    />
                    <span className="text-[11px] font-bold text-slate-500">(KPK {compResult.kpk})</span>
                  </>
                )}
              </div>
              <FractionBar3D
                num={numB}
                den={denB}
                subdivideToKpk={animStep >= 2 ? compResult.kpk : undefined}
                color="emerald"
                onSegmentClick={(n) => setNumB(n)}
              />
            </div>
          </div>

          {/* 3D Pie Charts & Large Mathematical Equation Display */}
          <div className="grid grid-cols-3 items-center gap-2 bg-[#FFFDF7] border-2 border-[#082545] rounded-2xl p-2.5">
            <div className="flex flex-col items-center">
              <FractionPie3D num={numA} den={denA} color="azure" size={76} />
              <div className="mt-1">
                <FractionDisplay num={numA} den={denA} size="md" colorClass="text-[#0066DD]" />
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-1">
              {activeTopic === 'topik1' && (
                <>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase">
                    Perbandingan
                  </span>
                  <div className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#082545] shadow-[0_3px_0_#082545] flex items-center gap-2">
                    <FractionDisplay num={numA} den={denA} size="md" colorClass="text-[#0066DD]" />
                    <span className="text-2xl font-extrabold text-[#FF7A00]">
                      {compResult.symbol}
                    </span>
                    <FractionDisplay num={numB} den={denB} size="md" colorClass="text-[#15803D]" />
                  </div>
                </>
              )}

              {activeTopic === 'topik2' && (
                <>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase">
                    Hasil Jumlah
                  </span>
                  <div className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#082545] shadow-[0_3px_0_#082545] flex items-center gap-1.5">
                    <span className="text-xl font-extrabold text-[#082545]">=</span>
                    <FractionDisplay
                      whole={addResult.simplified.whole}
                      num={addResult.simplified.remNum}
                      den={addResult.simplified.den}
                      size="md"
                      colorClass="text-[#15803D]"
                    />
                  </div>
                </>
              )}

              {activeTopic === 'topik3' && (
                <>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase">
                    Hasil Kurang
                  </span>
                  <div className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#082545] shadow-[0_3px_0_#082545] flex items-center gap-1.5">
                    <span className="text-xl font-extrabold text-[#082545]">=</span>
                    <FractionDisplay
                      whole={subResult.simplified.whole}
                      num={subResult.simplified.remNum}
                      den={subResult.simplified.den}
                      size="md"
                      colorClass="text-[#FF7A00]"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col items-center">
              <FractionPie3D num={numB} den={denB} color="emerald" size={76} />
              <div className="mt-1">
                <FractionDisplay num={numB} den={denB} size="md" colorClass="text-[#15803D]" />
              </div>
            </div>
          </div>

          {/* Interactive Number Line */}
          <div>
            <FractionNumberLine
              maxWhole={2}
              fractions={[
                { label: `A (${numA}/${denA})`, num: numA, den: denA, color: '#0066DD' },
                { label: `B (${numB}/${denB})`, num: numB, den: denB, color: '#16A34A' },
              ]}
            />
          </div>
        </div>

        {/* Right Zone: Grade 5 SD Concise Step-by-Step Board & Touch Sliders (5 cols) */}
        <div className="lg:col-span-5 surface-3d-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-2.5">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm sm:text-base font-extrabold text-[#082545]">
                Atur Nilai Pecahan A & B
              </h3>
              <button
                type="button"
                onClick={() => {
                  setNumA(3);
                  setDenA(4);
                  setNumB(2);
                  setDenB(6);
                  setAnimStep(3);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-extrabold text-[#082545] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Sliders for Fraction A & B Side-by-Side or Compact Stacked */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#BAE6FD]/35 border-2 border-[#082545] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-extrabold text-[#0066DD]">Pecahan A</span>
                  <div className="bg-white px-2 py-0.5 rounded-lg border border-[#082545]">
                    <FractionDisplay num={numA} den={denA} size="sm" colorClass="text-[#0066DD]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#082545]">
                      Pembilang: {numA}
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={denA}
                      value={Math.min(numA, denA)}
                      onChange={(e) => setNumA(Number(e.target.value))}
                      className="w-full h-2 accent-[#0066DD] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#082545]">
                      Penyebut: {denA}
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      value={denA}
                      onChange={(e) => {
                        const d = Number(e.target.value);
                        setDenA(d);
                        if (numA > d) setNumA(d);
                      }}
                      className="w-full h-2 accent-[#0066DD] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#BBF7D0]/45 border-2 border-[#082545] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-extrabold text-[#15803D]">Pecahan B</span>
                  <div className="bg-white px-2 py-0.5 rounded-lg border border-[#082545]">
                    <FractionDisplay num={numB} den={denB} size="sm" colorClass="text-[#15803D]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#082545]">
                      Pembilang: {numB}
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={denB}
                      value={Math.min(numB, denB)}
                      onChange={(e) => setNumB(Number(e.target.value))}
                      className="w-full h-2 accent-[#58CC02] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#082545]">
                      Penyebut: {denB}
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      value={denB}
                      onChange={(e) => {
                        const d = Number(e.target.value);
                        setDenB(d);
                        if (numB > d) setNumB(d);
                      }}
                      className="w-full h-2 accent-[#58CC02] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Concise, Grade-5 Friendly Step-by-Step Box with Vertical Fractions */}
            <div className="p-3 rounded-xl bg-white border-2 border-[#082545] space-y-2">
              <div className="text-xs sm:text-sm font-extrabold text-[#082545] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF7A00]" />
                <span>Cara Menghitung (3 Langkah Mudah Kelas 5):</span>
              </div>

              <div className="space-y-1.5 text-xs sm:text-sm text-[#082545]">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-1.5">
                  <span className="font-extrabold text-[#0066DD]">1. KPK Penyebut:</span>
                  <span>
                    KPK dari <strong>{denA}</strong> dan <strong>{denB}</strong> adalah{' '}
                    <strong className="px-1.5 py-0.5 rounded bg-[#FFD60A] text-[#082545]">
                      {compResult.kpk}
                    </strong>
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-1.5">
                  <span className="font-extrabold text-[#15803D]">2. Samakan:</span>
                  <FractionDisplay num={numA} den={denA} size="sm" colorClass="text-[#0066DD]" />
                  <span>=</span>
                  <FractionDisplay num={compResult.eqNumA} den={compResult.kpk} size="sm" />
                  <span>dan</span>
                  <FractionDisplay num={numB} den={denB} size="sm" colorClass="text-[#15803D]" />
                  <span>=</span>
                  <FractionDisplay num={compResult.eqNumB} den={compResult.kpk} size="sm" />
                </div>

                <div className="p-2 rounded-lg bg-[#FEF9C3] border border-[#082545] flex flex-wrap items-center gap-1.5 font-extrabold">
                  <span className="text-[#FF7A00]">3. Hasil:</span>
                  {activeTopic === 'topik1' && (
                    <div className="flex items-center gap-1.5">
                      <FractionDisplay num={numA} den={denA} size="sm" colorClass="text-[#0066DD]" />
                      <span className="text-lg text-[#FF7A00]">{compResult.symbol}</span>
                      <FractionDisplay num={numB} den={denB} size="sm" colorClass="text-[#15803D]" />
                    </div>
                  )}
                  {activeTopic === 'topik2' && (
                    <div className="flex items-center gap-1.5">
                      <FractionDisplay num={compResult.eqNumA} den={compResult.kpk} size="sm" />
                      <span>+</span>
                      <FractionDisplay num={compResult.eqNumB} den={compResult.kpk} size="sm" />
                      <span>=</span>
                      <FractionDisplay
                        whole={addResult.simplified.whole}
                        num={addResult.simplified.remNum}
                        den={addResult.simplified.den}
                        size="sm"
                        colorClass="text-[#15803D]"
                      />
                    </div>
                  )}
                  {activeTopic === 'topik3' && (
                    <div className="flex items-center gap-1.5">
                      <FractionDisplay num={compResult.eqNumA} den={compResult.kpk} size="sm" />
                      <span>−</span>
                      <FractionDisplay num={compResult.eqNumB} den={compResult.kpk} size="sm" />
                      <span>=</span>
                      <FractionDisplay
                        whole={subResult.simplified.whole}
                        num={subResult.simplified.remNum}
                        den={subResult.simplified.den}
                        size="sm"
                        colorClass="text-[#FF7A00]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action to Open Practice Questions Popup */}
          <button
            type="button"
            onClick={() => setActivePopup('latihan')}
            className="w-full surface-3d-btn-emerald py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>Buka Pop-Up Soal Latihan ({answeredCount}/5 · Skor: {currentScore})</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* POPUP MODAL 1: RINGKASAN KONSEP INTI KELAS 5 SD                      */}
      {/* ==================================================================== */}
      {activePopup === 'konsep' && (
        <div className="fixed inset-0 z-50 bg-[#082545]/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-3d-card rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#0066DD] text-white border-2 border-[#082545] flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#0066DD] uppercase">
                    Ringkasan Materi Kelas V SD
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#082545]">{topicMeta.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePopup(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#082545]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeTopic === 'topik1' && (
              <div className="space-y-4 text-base text-[#082545] leading-relaxed">
                <div className="p-4 rounded-2xl bg-[#BAE6FD]/35 border-2 border-[#082545] space-y-1.5">
                  <div className="font-extrabold text-[#0066DD]">1. Jika Penyebut Sudah Sama</div>
                  <p>
                    Bandingkan langsung angka <strong>pembilang (atas)</strong>. Contoh:{' '}
                    <MathText text="3/5 > 2/5" /> karena 3 lebih besar dari 2.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FEF9C3] border-2 border-[#082545] space-y-1.5">
                  <div className="font-extrabold text-[#D97706]">2. Jika Penyebut Berbeda</div>
                  <p>
                    Samakan penyebut menggunakan <strong>KPK</strong>. Contoh: membandingkan{' '}
                    <MathText text="3/4" /> dan <MathText text="2/3" />. Karena KPK 4 dan 3 adalah
                    12, maka <MathText text="3/4 = 9/12" /> dan <MathText text="2/3 = 8/12" />.
                    Jadi <MathText text="3/4 > 2/3" />.
                  </p>
                </div>
              </div>
            )}

            {activeTopic === 'topik2' && (
              <div className="space-y-4 text-base text-[#082545] leading-relaxed">
                <div className="p-4 rounded-2xl bg-[#BBF7D0]/45 border-2 border-[#082545] space-y-1.5">
                  <div className="font-extrabold text-[#15803D]">1. Penjumlahan Berpenyebut Berbeda</div>
                  <p>
                    Cari <strong>KPK</strong> dari kedua penyebut, ubah menjadi pecahan senilai,
                    lalu jumlahkan pembilangnya: <MathText text="1/2 + 1/3 = 3/6 + 2/6 = 5/6" />.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FEF9C3] border-2 border-[#082545] space-y-1.5">
                  <div className="font-extrabold text-[#D97706]">2. Penjumlahan Pecahan Campuran</div>
                  <p>
                    Jumlahkan bilangan bulat dengan bilangan bulat, lalu jumlahkan bagian
                    pecahannya: <MathText text="1 1/4 + 2 2/4 = 3 3/4" />.
                  </p>
                </div>
              </div>
            )}

            {activeTopic === 'topik3' && (
              <div className="space-y-4 text-base text-[#082545] leading-relaxed">
                <div className="p-4 rounded-2xl bg-[#FEF08A]/55 border-2 border-[#082545] space-y-1.5">
                  <div className="font-extrabold text-[#D97706]">1. Menyamakan Penyebut dengan KPK</div>
                  <p>
                    Kurangkan pembilang setelah penyebutnya disamakan dengan KPK:{' '}
                    <MathText text="3/4 - 1/2 = 3/4 - 2/4 = 1/4" />.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#BAE6FD]/35 border-2 border-[#082545] space-y-1.5">
                  <div className="font-extrabold text-[#0066DD]">2. Menyederhanakan Hasil Pecahan</div>
                  <p>
                    Bagi pembilang dan penyebut hasil akhir dengan FPB agar menjadi bentuk paling
                    sederhana: <MathText text="4/6 = 2/3" />.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActivePopup('contoh')}
                className="surface-3d-btn-amber px-5 py-2.5 rounded-xl text-sm font-extrabold"
              >
                Lihat Contoh Soal →
              </button>
              <button
                type="button"
                onClick={() => setActivePopup(null)}
                className="surface-3d-btn-neutral px-5 py-2.5 rounded-xl text-sm font-extrabold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* POPUP MODAL 2: CONTOH SOAL CERITA KONTEKSTUAL                        */}
      {/* ==================================================================== */}
      {activePopup === 'contoh' && (
        <div className="fixed inset-0 z-50 bg-[#082545]/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-3d-card rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FF7A00] text-white border-2 border-[#082545] flex items-center justify-center">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#FF7A00] uppercase">
                    Contoh Soal Kontekstual Kelas V SD
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#082545]">{topicMeta.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePopup(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#082545]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeTopic === 'topik1' && (
              <div className="space-y-4 text-base text-[#082545] leading-relaxed">
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-[#082545] space-y-1.5">
                  <div className="font-extrabold text-[#0066DD]">Soal Cerita:</div>
                  <p>
                    Nadia menyiapkan tiga botol sari buah untuk campuran kue di Mini Bakery:{' '}
                    <MathText text="2/3" /> liter sari mangga, <MathText text="5/6" /> liter sari
                    jeruk, dan <MathText text="1/2" /> liter sari stroberi. Urutkan dari yang paling
                    sedikit!
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#BBF7D0]/45 border-2 border-[#082545] space-y-1.5">
                  <div className="font-extrabold text-[#15803D]">Penyelesaian:</div>
                  <p>1. KPK dari penyebut 3, 6, dan 2 adalah <strong>6</strong>.</p>
                  <p>
                    2. Ubah ke penyebut 6: <MathText text="2/3 = 4/6" />,{' '}
                    <MathText text="5/6 = 5/6" />, dan <MathText text="1/2 = 3/6" />.
                  </p>
                  <p className="font-extrabold">
                    3. Urutan dari terkecil: <MathText text="1/2, 2/3, 5/6" />.
                  </p>
                </div>
              </div>
            )}

            {activeTopic === 'topik2' && (
              <div className="space-y-4 text-base text-[#082545] leading-relaxed">
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-[#082545] space-y-1.5">
                  <div className="font-extrabold text-[#15803D]">Soal Cerita:</div>
                  <p>
                    Untuk membuat kue klepon labu kuning, Raka mencampurkan{' '}
                    <MathText text="1 1/4" /> kg tepung ketan dan <MathText text="3/8" /> kg labu
                    kuning kukus. Berapa kg total bahan Raka?
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#BBF7D0]/45 border-2 border-[#082545] space-y-1.5">
                  <div className="font-extrabold text-[#15803D]">Penyelesaian:</div>
                  <p>1. KPK dari 4 dan 8 adalah <strong>8</strong>.</p>
                  <p>2. Samakan penyebut pecahan: <MathText text="1 1/4 = 1 2/8" />.</p>
                  <p className="font-extrabold">
                    3. Jumlahkan: <MathText text="1 2/8 + 3/8 = 1 5/8" /> kg.
                  </p>
                </div>
              </div>
            )}

            {activeTopic === 'topik3' && (
              <div className="space-y-4 text-base text-[#082545] leading-relaxed">
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-[#082545] space-y-1.5">
                  <div className="font-extrabold text-[#FF7A00]">Soal Cerita:</div>
                  <p>
                    Persediaan santan di dapur adalah <MathText text="2 1/3" /> liter. Digunakan
                    memasak kolak sebanyak <MathText text="3/4" /> liter. Berapa liter sisa santan?
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FEF9C3] border-2 border-[#082545] space-y-1.5">
                  <div className="font-extrabold text-[#D97706]">Penyelesaian:</div>
                  <p>1. Ubah pecahan campuran ke pecahan biasa: <MathText text="2 1/3 = 7/3" />.</p>
                  <p>
                    2. KPK dari 3 dan 4 adalah <strong>12</strong>:{' '}
                    <MathText text="7/3 - 3/4 = 28/12 - 9/12" />.
                  </p>
                  <p className="font-extrabold">
                    3. Hasil akhir: <MathText text="19/12 = 1 7/12" /> liter.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActivePopup('latihan')}
                className="surface-3d-btn-emerald px-5 py-2.5 rounded-xl text-sm font-extrabold"
              >
                Lanjut Kerjakan Latihan Soal →
              </button>
              <button
                type="button"
                onClick={() => setActivePopup(null)}
                className="surface-3d-btn-neutral px-5 py-2.5 rounded-xl text-sm font-extrabold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* POPUP MODAL 3: LATIHAN SOAL INTERAKTIF (5 SOAL PER TOPIK)            */}
      {/* ==================================================================== */}
      {activePopup === 'latihan' && (
        <div className="fixed inset-0 z-50 bg-[#082545]/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-3d-card rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-5 bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-200 pb-3 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#58CC02] text-white border-2 border-[#082545] flex items-center justify-center">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#15803D] uppercase">
                    Latihan Pemahaman Siswa Kelas V SD
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#082545]">
                    {topicMeta.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-[#FEF9C3] border-2 border-[#082545] text-xs sm:text-sm font-extrabold text-[#082545]">
                  Skor: {currentScore} / 100 ({correctCount}/{currentQuestions.length} Benar)
                </div>
                <button
                  type="button"
                  onClick={() => setActivePopup(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#082545]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {currentQuestions.map((q, idx) => {
                const userAns = answers[q.id];
                const hasAnswered = userAns !== undefined;
                const isCorrect = userAns === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 border-2 border-[#082545]/25 space-y-3"
                  >
                    <div className="text-base font-extrabold text-[#082545] leading-relaxed">
                      {idx + 1}. <MathText text={q.question} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIdx) => {
                        const selected = userAns === optIdx;
                        let btnStyle =
                          'bg-white text-[#082545] border-[#082545] hover:bg-[#BAE6FD]/30';
                        if (hasAnswered) {
                          if (optIdx === q.correctIndex) {
                            btnStyle =
                              'bg-[#BBF7D0] text-[#082545] border-[#15803D] font-extrabold';
                          } else if (selected && !isCorrect) {
                            btnStyle = 'bg-red-100 text-red-900 border-red-500';
                          }
                        }
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className={`text-left px-3.5 py-2.5 rounded-xl border-2 text-sm transition-all font-bold flex items-center gap-2.5 cursor-pointer ${btnStyle}`}
                          >
                            <span className="w-7 h-7 rounded-lg bg-[#082545] text-white font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>
                              <MathText text={opt} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {hasAnswered && (
                      <div
                        className={`p-3 rounded-xl text-xs sm:text-sm font-medium ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-950 border border-emerald-400'
                            : 'bg-amber-50 text-amber-950 border border-amber-400'
                        }`}
                      >
                        <strong className="font-extrabold">
                          {isCorrect ? '✓ Jawaban Tepat! ' : '✕ Mari Perhatikan: '}
                        </strong>
                        <MathText text={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs sm:text-sm font-extrabold text-[#082545]">
                Terjawab: {answeredCount}/5 Soal · Nilai Latihan: {currentScore}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={savingTopic}
                  onClick={handleSaveProgress}
                  className="surface-3d-btn-emerald px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingTopic ? 'Menyimpan...' : 'Simpan Nilai Latihan'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePopup(null)}
                  className="surface-3d-btn-neutral px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
