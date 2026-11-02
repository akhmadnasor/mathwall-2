import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  FileDown,
  CheckCircle2,
  ChefHat,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Scale,
  Calculator,
  Calendar,
  Award,
} from 'lucide-react';
import {
  lcmArray,
  simplifyFraction,
  subtractFractions,
  downloadPjblPdf,
  type StudentIdentity,
} from '../utils/fractionMath';
import { FractionBar3D, FractionDisplay, MathText } from './FractionVisuals';
import { safeApiRequest } from '../utils/apiClient';

interface PjblModuleProps {
  siswa: StudentIdentity;
  onSavedNotification: (msg: string, syncedToSheets: boolean) => void;
}

interface RecipeIngredient {
  id: string;
  nama: string;
  satuan: string;
  awalNum: number;
  awalDen: number;
  terpakaiNum: number;
  terpakaiDen: number;
}

const BAKERY_PRESETS = [
  {
    namaResep: 'Cupcake Stroberi Spesial Mini Bakery',
    porsiTarget: '12 Cupcake Kelas V SD',
    bahan: [
      { id: 'b1', nama: 'Tepung Terigu Halus', satuan: 'kg', awalNum: 3, awalDen: 4, terpakaiNum: 1, terpakaiDen: 2 },
      { id: 'b2', nama: 'Gula Pasir Halus', satuan: 'kg', awalNum: 2, awalDen: 3, terpakaiNum: 1, terpakaiDen: 3 },
      { id: 'b3', nama: 'Mentega Tawar (Butter)', satuan: 'kg', awalNum: 1, awalDen: 4, terpakaiNum: 1, terpakaiDen: 8 },
      { id: 'b4', nama: 'Susu Cair Segar', satuan: 'liter', awalNum: 5, awalDen: 6, terpakaiNum: 2, terpakaiDen: 3 },
    ],
  },
  {
    namaResep: 'Bolu Lapis Cokelat Keju Master Chef',
    porsiTarget: '8 Potong Bolu Lembut',
    bahan: [
      { id: 'b1', nama: 'Tepung Terigu Protein Sedang', satuan: 'kg', awalNum: 4, awalDen: 5, terpakaiNum: 3, terpakaiDen: 5 },
      { id: 'b2', nama: 'Cokelat Bubuk Premium', satuan: 'kg', awalNum: 1, awalDen: 2, terpakaiNum: 1, terpakaiDen: 4 },
      { id: 'b3', nama: 'Keju Parut Pilihan', satuan: 'kg', awalNum: 3, awalDen: 4, terpakaiNum: 1, terpakaiDen: 2 },
      { id: 'b4', nama: 'Gula Halus', satuan: 'kg', awalNum: 2, awalDen: 5, terpakaiNum: 1, terpakaiDen: 5 },
    ],
  },
  {
    namaResep: 'Roti Manis Pisang Cokelat Mini Bakery',
    porsiTarget: '10 Roti Manis Hangat',
    bahan: [
      { id: 'b1', nama: 'Tepung Roti Pilihan', satuan: 'kg', awalNum: 5, awalDen: 6, terpakaiNum: 1, terpakaiDen: 2 },
      { id: 'b2', nama: 'Pisang Raja Lumat', satuan: 'kg', awalNum: 2, awalDen: 3, terpakaiNum: 1, terpakaiDen: 3 },
      { id: 'b3', nama: 'Susu Kental Manis', satuan: 'liter', awalNum: 1, awalDen: 3, terpakaiNum: 1, terpakaiDen: 6 },
      { id: 'b4', nama: 'Mentega Kuning', satuan: 'kg', awalNum: 1, awalDen: 2, terpakaiNum: 1, terpakaiDen: 4 },
    ],
  },
];

export const PjblModule: React.FC<PjblModuleProps> = ({
  siswa,
  onSavedNotification,
}) => {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [namaResep, setNamaResep] = useState('Cupcake Stroberi Spesial Mini Bakery');
  const [porsiTarget, setPorsiTarget] = useState('12 Cupcake Kelas V SD');

  // Tahap 1: Pertanyaan Mendasar
  const [fase1Text, setFase1Text] = useState(
    'Bagaimana cara menakar bahan-bahan kue di Mini Bakery menggunakan perbandingan, penjumlahan, dan pengurangan pecahan agar kue yang dibuat lezat, takarannya pas, dan sisa bahan terhitung dengan tepat?'
  );

  // Tahap 2: Mendesain Rencana Proyek
  const [fase2Text, setFase2Text] = useState(
    'Kami merancang resep kue di Mini Bakery dengan 4 bahan utama bertakaran pecahan, lalu mengurutkan bahan dari yang paling sedikit ke paling banyak, menjumlahkan seluruh takaran bahan dengan KPK, dan menghitung sisa bahan di dapur.'
  );

  // Tahap 3: Menyusun Jadwal
  const [jadwalList, setJadwalList] = useState([
    {
      tahap: 'Langkah 1: Menentukan ide kue & pertanyaan mendasar Master Chef Pecahan',
      targetWaktu: 'Hari ke-1 (30 Menit)',
      selesai: true,
    },
    {
      tahap: 'Langkah 2: Memilih bahan kue & menulis takaran pecahan awal',
      targetWaktu: 'Hari ke-2 (40 Menit)',
      selesai: true,
    },
    {
      tahap: 'Langkah 3: Menghitung urutan pecahan, jumlah total bahan, dan sisa bahan',
      targetWaktu: 'Hari ke-3 (45 Menit)',
      selesai: true,
    },
    {
      tahap: 'Langkah 4: Menampilkan Kartu Resep Mini Bakery & menceritakan hasilnya di kelas',
      targetWaktu: 'Hari ke-4 (35 Menit)',
      selesai: true,
    },
  ]);

  // Tahap 4: Memonitor Kemajuan — Bahan Resep Kue Mini Bakery
  const [bahanList, setBahanList] = useState<RecipeIngredient[]>(BAKERY_PRESETS[0].bahan);

  // Tahap 5: Menguji Hasil dan Presentasi
  const [fase5Presentasi, setFase5Presentasi] = useState(
    'Kartu Resep Mini Bakery: Master Chef Pecahan telah kami tampilkan di depan kelas lengkap dengan urutan bahan dari terkecil ke terbesar, total penjumlahan seluruh bahan kue, dan sisa stok bahan setelah dipakai.'
  );

  // Tahap 6: Mengevaluasi Pengalaman
  const [fase6Refleksi, setFase6Refleksi] = useState(
    'Melalui proyek Mini Bakery: Master Chef Pecahan, saya jadi mudah memahami cara menyamakan penyebut dengan KPK saat membandingkan, menjumlahkan, dan mengurangkan pecahan untuk membuat kue.'
  );

  const [isSaving, setIsSaving] = useState(false);

  // Mathematical Calculations for Tahap 4 & Tahap 5 Digital Project
  const allDenominators = bahanList.map((b) => Math.max(1, b.awalDen));
  const kpkAwal = lcmArray(allDenominators.length > 0 ? allDenominators : [1]);

  const sortedBahan = [...bahanList]
    .map((b) => ({
      ...b,
      val: b.awalNum / Math.max(1, b.awalDen),
      eqNum: b.awalNum * (kpkAwal / Math.max(1, b.awalDen)),
    }))
    .sort((a, b) => a.val - b.val);

  const perbandinganSummary = sortedBahan
    .map((b) => `${b.nama} (${b.awalNum}/${b.awalDen} = ${b.eqNum}/${kpkAwal})`)
    .join(' < ');

  const totalRawNum = sortedBahan.reduce((acc, b) => acc + b.eqNum, 0);
  const totalSumSimplified = simplifyFraction(totalRawNum, kpkAwal);
  const totalPenjumlahanString = `${totalRawNum}/${kpkAwal} = ${totalSumSimplified.formattedMixed} satuan (${totalSumSimplified.decimal.toFixed(2)})`;

  const sisaPerBahan = bahanList.map((b) => {
    const diff = subtractFractions(
      { num: b.awalNum, den: b.awalDen },
      { num: b.terpakaiNum, den: b.terpakaiDen }
    );
    return {
      ...b,
      diff,
    };
  });

  const sisaSummaryString = sisaPerBahan
    .map((s) => `${s.nama}: ${s.awalNum}/${s.awalDen} - ${s.terpakaiNum}/${s.terpakaiDen} = ${s.diff.simplified.formattedMixed}`)
    .join(' | ');

  const completedPhasesCount = [
    Boolean(fase1Text.trim()),
    Boolean(fase2Text.trim()),
    jadwalList.some((j) => j.selesai),
    bahanList.length >= 2,
    Boolean(fase5Presentasi.trim()),
    Boolean(fase6Refleksi.trim()),
  ].filter(Boolean).length;
  const completionPct = Math.round((completedPhasesCount / 6) * 100);

  const handleApplyPreset = (idx: number) => {
    const preset = BAKERY_PRESETS[idx];
    if (!preset) return;
    setNamaResep(preset.namaResep);
    setPorsiTarget(preset.porsiTarget);
    setBahanList(preset.bahan.map((b) => ({ ...b })));
  };

  const handleSavePjbl = async () => {
    setIsSaving(true);
    try {
      const { data } = await safeApiRequest('/api/pjbl/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_siswa: siswa.id_siswa,
          nama_siswa: siswa.nama_siswa,
          kelas: siswa.kelas,
          asal_sekolah: siswa.asal_sekolah,
          nama_resep: namaResep,
          porsi_target: porsiTarget,
          fase_1_pertanyaan: fase1Text,
          fase_2_rencana: fase2Text,
          fase_3_jadwal: jadwalList,
          fase_4_bahan_json: bahanList,
          fase_4_perbandingan: perbandinganSummary,
          fase_4_total_penjumlahan: totalPenjumlahanString,
          fase_4_sisa_pengurangan: sisaSummaryString,
          fase_5_presentasi: fase5Presentasi,
          fase_6_refleksi: fase6Refleksi,
          persentase_selesai: completionPct,
        }),
      });
      onSavedNotification(
        data?.sheetsStatusMessage ||
          `Proyek Mini Bakery "${namaResep}" berhasil disimpan.`,
        Boolean(data?.savedToGoogleSheets)
      );
    } catch {
      onSavedNotification('Gagal menyimpan Proyek PjBL ke server.', false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPjblPdf = () => {
    downloadPjblPdf({
      siswa,
      namaResep,
      porsiTarget,
      fase1: fase1Text,
      fase2: fase2Text,
      jadwal: jadwalList,
      bahanList,
      perbandinganRingkasan: perbandinganSummary,
      totalPenjumlahan: totalPenjumlahanString,
      sisaPengurangan: sisaSummaryString,
      fase5Presentasi,
      fase6Refleksi,
    });
  };

  const phasesMeta = [
    {
      num: 1,
      shortTitle: 'Tahap 1',
      title: 'Pertanyaan Mendasar',
      desc: 'Tantangan Master Chef',
    },
    {
      num: 2,
      shortTitle: 'Tahap 2',
      title: 'Rencana Resep Kue',
      desc: 'Pilih Menu & Porsi',
    },
    {
      num: 3,
      shortTitle: 'Tahap 3',
      title: 'Jadwal Kegiatan',
      desc: 'Susun Langkah Kerja',
    },
    {
      num: 4,
      shortTitle: 'Tahap 4',
      title: 'Takaran Pecahan',
      desc: 'Bandingkan, Jumlah & Kurang',
    },
    {
      num: 5,
      shortTitle: 'Tahap 5',
      title: 'Kartu Resep & Uji',
      desc: 'Poster Kue & Presentasi',
    },
    {
      num: 6,
      shortTitle: 'Tahap 6',
      title: 'Refleksi Pengalaman',
      desc: 'Cerita Hasil Belajar',
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Header Banner: Mini Bakery: Master Chef Pecahan */}
      <div className="surface-3d-card rounded-3xl p-4 sm:p-5 space-y-4 shrink-0 bg-gradient-to-r from-[#FFFDF7] via-[#FEF9C3]/40 to-[#BAE6FD]/25">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#F59E0B] text-white border-2 border-[#082545] shadow-[0_4px_0_#082545] flex items-center justify-center shrink-0">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#FF7A00]/15 text-[#D97706] text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Project Based Learning (PjBL) · 6 Tahapan Mudah Dipahami</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#082545] tracking-tight mt-0.5">
                Mini Bakery: Master Chef Pecahan
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSavePjbl}
              className="surface-3d-btn-emerald px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Proyek'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportPjblPdf}
              className="surface-3d-btn-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Unduh Portofolio (PDF)</span>
            </button>
          </div>
        </div>

        {/* Clear 6-Step Visual Roadmap for Grade 5 Elementary Students */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t-2 border-[#082545]/10">
          {phasesMeta.map((p) => {
            const isActive = activePhase === p.num;
            return (
              <button
                key={p.num}
                type="button"
                onClick={() => setActivePhase(p.num as 1 | 2 | 3 | 4 | 5 | 6)}
                className={`p-2.5 rounded-2xl border-2 border-[#082545] text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                  isActive
                    ? 'bg-[#0066DD] text-white shadow-[0_4px_0_#082545] -translate-y-0.5'
                    : 'bg-white text-[#082545] hover:bg-[#BAE6FD]/35'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      isActive ? 'bg-[#FFD60A] text-[#082545]' : 'bg-slate-100 text-[#0066DD]'
                    }`}
                  >
                    {p.shortTitle}
                  </span>
                  {activePhase > p.num && (
                    <CheckCircle2
                      className={`w-4 h-4 ${isActive ? 'text-[#FFD60A]' : 'text-[#58CC02]'}`}
                    />
                  )}
                </div>
                <div className="text-xs sm:text-sm font-extrabold leading-snug">{p.title}</div>
                <div
                  className={`text-[10px] font-medium leading-tight ${
                    isActive ? 'text-[#BAE6FD]' : 'text-slate-500'
                  }`}
                >
                  {p.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Content Card */}
      <div className="flex-1 surface-3d-card rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between">
        {/* ================================================================ */}
        {/* TAHAP 1: PERTANYAAN MENDASAR                                     */}
        {/* ================================================================ */}
        {activePhase === 1 && (
          <div className="flex-1 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-100 pb-3">
                <div>
                  <span className="inline-block px-3 py-1 rounded-lg bg-[#0066DD]/10 text-[#0066DD] text-xs font-extrabold">
                    Tahap 1 dari 6 · Memulai Proyek Mini Bakery
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#082545] mt-1">
                    1. Pertanyaan Mendasar (Tantangan Master Chef Pecahan)
                  </h3>
                </div>
              </div>

              {/* Kid-Friendly Story Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FEF9C3] to-[#BAE6FD]/40 border-2 border-[#082545] space-y-2">
                <div className="text-sm sm:text-base font-extrabold text-[#082545] flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-[#FF7A00] shrink-0" />
                  <span>Cerita Tantangan di Dapur Mini Bakery:</span>
                </div>
                <p className="text-sm sm:text-base text-[#082545] leading-relaxed">
                  Hari ini kamu menjadi <strong>Master Chef Cilik Kelas V SD</strong> di{' '}
                  <strong>Mini Bakery</strong>! Untuk membuat kue yang lezat dan mengembang sempurna,
                  setiap bahan seperti tepung (<MathText text="3/4" /> kg), gula (
                  <MathText text="2/3" /> kg), dan mentega (<MathText text="1/4" /> kg) harus
                  ditakar dengan pecahan yang tepat.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-white/90 border border-[#082545]/20 text-xs sm:text-sm">
                    <strong className="text-[#0066DD] block">1. Bandingkan Bahan:</strong>
                    Bahan kue manakah yang takarannya paling sedikit dan paling banyak?
                  </div>
                  <div className="p-3 rounded-xl bg-white/90 border border-[#082545]/20 text-xs sm:text-sm">
                    <strong className="text-[#15803D] block">2. Jumlahkan Bahan:</strong>
                    Berapa jumlah berat seluruh bahan adonan jika digabungkan?
                  </div>
                  <div className="p-3 rounded-xl bg-white/90 border border-[#082545]/20 text-xs sm:text-sm">
                    <strong className="text-[#FF7A00] block">3. Hitung Sisa Bahan:</strong>
                    Berapa sisa bahan di dapur setelah sebagian dipakai memanggang kue?
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-extrabold text-[#082545] mb-2">
                  Tuliskan Pertanyaan Mendasar Kelompokmu:
                </label>
                <textarea
                  rows={3}
                  value={fase1Text}
                  onChange={(e) => setFase1Text(e.target.value)}
                  placeholder="Tuliskan pertanyaan utama yang ingin kalian pecahkan di Mini Bakery..."
                  className="w-full p-3.5 text-sm sm:text-base rounded-2xl border-2 border-[#082545]/30 focus:border-[#0066DD] bg-white text-[#082545] font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t-2 border-slate-100">
              <button
                type="button"
                onClick={() => setActivePhase(2)}
                className="surface-3d-btn-primary px-6 py-3 rounded-2xl text-sm sm:text-base font-extrabold flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Tahap 2: Rencana Resep Kue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAHAP 2: MENDESAIN RENCANA PROYEK RESEP KUE                      */}
        {/* ================================================================ */}
        {activePhase === 2 && (
          <div className="flex-1 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="border-b-2 border-slate-100 pb-3">
                <span className="inline-block px-3 py-1 rounded-lg bg-[#0066DD]/10 text-[#0066DD] text-xs font-extrabold">
                  Tahap 2 dari 6 · Merancang Menu Kue
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#082545] mt-1">
                  2. Mendesain Rencana Proyek (Menu Mini Bakery)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Pilih contoh paket resep kue di bawah ini atau ketik kreasi kue favoritmu sendiri!
                </p>
              </div>

              {/* Quick Bakery Recipe Presets */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-[#FF7A00] uppercase tracking-wider">
                  Pilih Cepat Paket Resep Mini Bakery:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BAKERY_PRESETS.map((preset, idx) => {
                    const selected = namaResep === preset.namaResep;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(idx)}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#BAE6FD]/40 border-[#0066DD] shadow-[0_3px_0_#0066DD]'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-extrabold text-[#0066DD]">
                          Paket Resep #{idx + 1}
                        </div>
                        <div className="text-sm font-extrabold text-[#082545] mt-0.5">
                          {preset.namaResep}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">{preset.porsiTarget}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold text-[#082545] mb-1.5">
                    Nama Kue / Roti Kreasi Kelompok:
                  </label>
                  <input
                    type="text"
                    value={namaResep}
                    onChange={(e) => setNamaResep(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm sm:text-base font-bold rounded-xl border-2 border-slate-300 bg-white text-[#082545]"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-extrabold text-[#082545] mb-1.5">
                    Target Hasil Porsi Kue:
                  </label>
                  <input
                    type="text"
                    value={porsiTarget}
                    onChange={(e) => setPorsiTarget(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm sm:text-base font-bold rounded-xl border-2 border-slate-300 bg-white text-[#082545]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-extrabold text-[#082545] mb-1.5">
                  Rencana Langkah Pembuatan & Alat Takar yang Digunakan:
                </label>
                <textarea
                  rows={3}
                  value={fase2Text}
                  onChange={(e) => setFase2Text(e.target.value)}
                  className="w-full p-3.5 text-sm sm:text-base rounded-2xl border-2 border-slate-300 bg-white text-[#082545]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-slate-100">
              <button
                type="button"
                onClick={() => setActivePhase(1)}
                className="surface-3d-btn-neutral px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Tahap 1</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePhase(3)}
                className="surface-3d-btn-primary px-6 py-3 rounded-2xl text-sm sm:text-base font-extrabold flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Tahap 3: Jadwal Kegiatan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAHAP 3: MENYUSUN JADWAL KEGIATAN                                */}
        {/* ================================================================ */}
        {activePhase === 3 && (
          <div className="flex-1 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="border-b-2 border-slate-100 pb-3">
                <span className="inline-block px-3 py-1 rounded-lg bg-[#0066DD]/10 text-[#0066DD] text-xs font-extrabold">
                  Tahap 3 dari 6 · Mengatur Waktu Belajar
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#082545] mt-1 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-[#FF7A00]" />
                  <span>3. Menyusun Jadwal Kegiatan Master Chef</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Centang tahapan kegiatan yang sudah kalian kerjakan dan atur target waktunya!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {jadwalList.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      item.selesai
                        ? 'bg-[#BBF7D0]/30 border-[#16A34A]'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={item.selesai}
                        onChange={(e) => {
                          const next = [...jadwalList];
                          next[idx].selesai = e.target.checked;
                          setJadwalList(next);
                        }}
                        className="w-5 h-5 mt-0.5 accent-[#58CC02] shrink-0"
                      />
                      <span className="text-sm font-extrabold text-[#082545] leading-snug">
                        {item.tahap}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={item.targetWaktu}
                      onChange={(e) => {
                        const next = [...jadwalList];
                        next[idx].targetWaktu = e.target.value;
                        setJadwalList(next);
                      }}
                      className="px-3 py-1.5 text-xs font-mono font-bold rounded-xl border-2 border-slate-300 bg-white w-full sm:w-40 shrink-0 text-[#082545]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-slate-100">
              <button
                type="button"
                onClick={() => setActivePhase(2)}
                className="surface-3d-btn-neutral px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Tahap 2</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePhase(4)}
                className="surface-3d-btn-primary px-6 py-3 rounded-2xl text-sm sm:text-base font-extrabold flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Tahap 4: Hitung Takaran Pecahan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAHAP 4: MEMONITOR KEMAJUAN & KALKULASI TAKARAN PECAHAN          */}
        {/* ================================================================ */}
        {activePhase === 4 && (
          <div className="flex-1 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-3">
                <div>
                  <span className="inline-block px-3 py-1 rounded-lg bg-[#0066DD]/10 text-[#0066DD] text-xs font-extrabold">
                    Tahap 4 dari 6 · Dapur Hitung Pecahan Mini Bakery
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#082545] mt-1">
                    4. Menghitung Takaran Bahan Kue dengan Pecahan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Masukkan pecahan <strong>Stok Awal</strong> di dapur dan{' '}
                    <strong>Takaran Terpakai</strong> untuk membuat kue. Sistem akan otomatis
                    menghitung urutan, jumlah total, dan sisa bahan!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setBahanList((prev) => [
                      ...prev,
                      {
                        id: `b-${Date.now()}`,
                        nama: `Bahan Kue ${prev.length + 1}`,
                        satuan: 'kg',
                        awalNum: 3,
                        awalDen: 4,
                        terpakaiNum: 1,
                        terpakaiDen: 4,
                      },
                    ])
                  }
                  className="surface-3d-btn-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Bahan Kue</span>
                </button>
              </div>

              {/* Ingredient Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {bahanList.map((b, idx) => {
                  const sisa = sisaPerBahan[idx].diff;
                  return (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border-2 border-[#082545]/20 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="w-full sm:w-44">
                        <div className="text-[11px] font-extrabold text-[#0066DD]">
                          Bahan Kue #{idx + 1} ({b.satuan})
                        </div>
                        <input
                          type="text"
                          value={b.nama}
                          onChange={(e) => {
                            const next = [...bahanList];
                            next[idx].nama = e.target.value;
                            setBahanList(next);
                          }}
                          className="w-full mt-0.5 px-3 py-1.5 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-slate-300 bg-white text-[#082545]"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-center p-2 rounded-xl bg-white border border-sky-200">
                          <div className="text-[10px] font-extrabold text-[#0066DD] mb-1">
                            Stok Awal
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={b.awalNum}
                              onChange={(e) => {
                                const next = [...bahanList];
                                next[idx].awalNum = Math.max(1, Number(e.target.value));
                                setBahanList(next);
                              }}
                              className="w-11 px-1 py-1 text-xs text-center rounded-lg border-2 border-[#082545] bg-white font-mono font-extrabold"
                            />
                            <span className="font-extrabold text-sm">/</span>
                            <input
                              type="number"
                              min={2}
                              max={20}
                              value={b.awalDen}
                              onChange={(e) => {
                                const next = [...bahanList];
                                next[idx].awalDen = Math.max(2, Number(e.target.value));
                                setBahanList(next);
                              }}
                              className="w-11 px-1 py-1 text-xs text-center rounded-lg border-2 border-[#082545] bg-white font-mono font-extrabold"
                            />
                          </div>
                        </div>

                        <div className="text-center p-2 rounded-xl bg-white border border-amber-200">
                          <div className="text-[10px] font-extrabold text-[#FF7A00] mb-1">
                            Terpakai
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={b.terpakaiNum}
                              onChange={(e) => {
                                const next = [...bahanList];
                                next[idx].terpakaiNum = Math.max(0, Number(e.target.value));
                                setBahanList(next);
                              }}
                              className="w-11 px-1 py-1 text-xs text-center rounded-lg border-2 border-[#082545] bg-white font-mono font-extrabold"
                            />
                            <span className="font-extrabold text-sm">/</span>
                            <input
                              type="number"
                              min={2}
                              max={20}
                              value={b.terpakaiDen}
                              onChange={(e) => {
                                const next = [...bahanList];
                                next[idx].terpakaiDen = Math.max(2, Number(e.target.value));
                                setBahanList(next);
                              }}
                              className="w-11 px-1 py-1 text-xs text-center rounded-lg border-2 border-[#082545] bg-white font-mono font-extrabold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right px-2.5 py-1.5 rounded-xl bg-[#BBF7D0]/45 border border-[#16A34A]/40">
                          <div className="text-[10px] font-extrabold text-[#15803D]">Sisa Bahan:</div>
                          <FractionDisplay
                            whole={sisa.simplified.whole}
                            num={sisa.simplified.remNum}
                            den={sisa.simplified.den}
                            size="sm"
                            colorClass="text-[#15803D]"
                          />
                        </div>
                        {bahanList.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              setBahanList((prev) => prev.filter((item) => item.id !== b.id))
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                            title="Hapus Bahan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3 Clear Step-by-Step Mathematical Explanation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                <div className="p-4 rounded-2xl bg-[#BAE6FD]/40 border-2 border-[#082545] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#0066DD]">
                    <Scale className="w-4 h-4 shrink-0" />
                    <span>1. Membandingkan &amp; Mengurutkan (KPK = {kpkAwal})</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Urutan bahan dari takaran paling sedikit ke paling banyak:
                  </p>
                  <div className="text-xs sm:text-sm font-bold text-[#082545] leading-snug bg-white/80 p-2.5 rounded-xl border border-[#082545]/15">
                    <MathText text={perbandinganSummary} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#BBF7D0]/45 border-2 border-[#082545] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#15803D]">
                    <Calculator className="w-4 h-4 shrink-0" />
                    <span>2. Penjumlahan Total Bahan Kue</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Jumlah seluruh takaran awal setelah disamakan penyebut ke KPK {kpkAwal}:
                  </p>
                  <div className="text-xs sm:text-sm font-extrabold text-[#082545] leading-snug bg-white/80 p-2.5 rounded-xl border border-[#082545]/15">
                    <MathText text={totalPenjumlahanString} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FEF9C3] border-2 border-[#082545] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#D97706]">
                    <ChefHat className="w-4 h-4 shrink-0" />
                    <span>3. Pengurangan Sisa Bahan Dapur</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Sisa masing-masing bahan (Stok Awal dikurangi Takaran Terpakai):
                  </p>
                  <div className="text-xs sm:text-sm font-bold text-[#082545] leading-snug bg-white/80 p-2.5 rounded-xl border border-[#082545]/15">
                    <MathText text={sisaSummaryString} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-slate-100">
              <button
                type="button"
                onClick={() => setActivePhase(3)}
                className="surface-3d-btn-neutral px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Tahap 3</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePhase(5)}
                className="surface-3d-btn-primary px-6 py-3 rounded-2xl text-sm sm:text-base font-extrabold flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Tahap 5: Kartu Resep &amp; Presentasi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAHAP 5: MENGUJI HASIL & PRESENTASI KARTU RESEP MINI BAKERY      */}
        {/* ================================================================ */}
        {activePhase === 5 && (
          <div className="flex-1 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="border-b-2 border-slate-100 pb-3">
                <span className="inline-block px-3 py-1 rounded-lg bg-[#0066DD]/10 text-[#0066DD] text-xs font-extrabold">
                  Tahap 5 dari 6 · Pameran Karya Master Chef Pecahan
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#082545] mt-1">
                  5. Menguji Hasil &amp; Presentasi Kartu Resep Mini Bakery
                </h3>
              </div>

              {/* Digital Recipe Poster Card */}
              <div className="p-5 rounded-3xl bg-[#082545] text-white border-[3px] border-[#FFD60A] space-y-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#FFD60A] text-[#082545] flex items-center justify-center font-extrabold shrink-0">
                      <ChefHat className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono font-extrabold text-[#FFD60A] uppercase">
                        KARTU RESEP DIGITAL · MINI BAKERY: MASTER CHEF PECAHAN
                      </div>
                      <h4 className="text-lg sm:text-xl font-extrabold">{namaResep}</h4>
                      <p className="text-xs text-slate-300">
                        Master Chef: <strong>{siswa.nama_siswa}</strong> ({siswa.kelas} —{' '}
                        {siswa.asal_sekolah}) · Target: {porsiTarget}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-white text-[#082545] border-2 border-[#FFD60A] flex items-center gap-2">
                    <span className="text-xs font-extrabold">TOTAL ADONAN:</span>
                    <FractionDisplay
                      whole={totalSumSimplified.whole}
                      num={totalSumSimplified.remNum}
                      den={totalSumSimplified.den}
                      size="sm"
                      colorClass="text-[#0066DD]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2.5 bg-white text-[#082545] p-4 rounded-2xl">
                    <div className="text-xs sm:text-sm font-extrabold text-[#082545]">
                      Visualisasi Balok Pecahan Takaran Bahan Kue:
                    </div>
                    {bahanList.map((b, i) => (
                      <FractionBar3D
                        key={b.id}
                        num={b.awalNum}
                        den={b.awalDen}
                        color={(['azure', 'emerald', 'amber', 'coral'] as const)[i % 4]}
                        label={`${b.nama} (${b.satuan})`}
                      />
                    ))}
                  </div>

                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                      <div className="font-extrabold text-[#BAE6FD]">
                        1. Urutan Bahan (Terkecil ke Terbesar):
                      </div>
                      <div className="text-white">
                        <MathText text={perbandinganSummary} className="text-white" />
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                      <div className="font-extrabold text-[#BBF7D0]">
                        2. Penjumlahan Total Bahan (KPK = {kpkAwal}):
                      </div>
                      <div className="text-white">
                        <MathText text={totalPenjumlahanString} className="text-white" />
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                      <div className="font-extrabold text-[#FFD60A]">
                        3. Pengurangan Sisa Bahan di Dapur:
                      </div>
                      <div className="text-white">
                        <MathText text={sisaSummaryString} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-slate-100">
              <button
                type="button"
                onClick={() => setActivePhase(4)}
                className="surface-3d-btn-neutral px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Tahap 4</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePhase(6)}
                className="surface-3d-btn-primary px-6 py-3 rounded-2xl text-sm sm:text-base font-extrabold flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Tahap 6: Evaluasi &amp; Refleksi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAHAP 6: MENGEVALUASI PENGALAMAN & REFLEKSI                      */}
        {/* ================================================================ */}
        {activePhase === 6 && (
          <div className="flex-1 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="border-b-2 border-slate-100 pb-3">
                <span className="inline-block px-3 py-1 rounded-lg bg-[#0066DD]/10 text-[#0066DD] text-xs font-extrabold">
                  Tahap 6 dari 6 · Penyelesaian Proyek Mini Bakery
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#082545] mt-1 flex items-center gap-2">
                  <Award className="w-6 h-6 text-[#FF7A00]" />
                  <span>6. Mengevaluasi Pengalaman &amp; Refleksi Master Chef</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Ceritakan hasil presentasi kelompokmu dan pengalamanmu belajar pecahan di Mini Bakery!
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-extrabold text-[#082545] mb-1.5">
                  Catatan Hasil Presentasi Kelas (Tahap 5):
                </label>
                <textarea
                  rows={2}
                  value={fase5Presentasi}
                  onChange={(e) => setFase5Presentasi(e.target.value)}
                  className="w-full p-3.5 text-sm sm:text-base rounded-2xl border-2 border-slate-300 bg-white text-[#082545]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-extrabold text-[#082545] mb-1.5">
                  Refleksi Pengalaman Belajar di Mini Bakery (Tahap 6):
                </label>
                <textarea
                  rows={3}
                  value={fase6Refleksi}
                  onChange={(e) => setFase6Refleksi(e.target.value)}
                  className="w-full p-3.5 text-sm sm:text-base rounded-2xl border-2 border-slate-300 bg-white text-[#082545]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-slate-100">
              <button
                type="button"
                onClick={() => setActivePhase(5)}
                className="surface-3d-btn-neutral px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Tahap 5</span>
              </button>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportPjblPdf}
                  className="surface-3d-btn-primary px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Unduh Portofolio Mini Bakery (PDF)</span>
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSavePjbl}
                  className="surface-3d-btn-emerald px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSaving ? 'Menyimpan...' : 'Simpan Lengkap 6 Tahap PjBL'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
