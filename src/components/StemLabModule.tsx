import React, { useState } from 'react';
import {
  PlusCircle,
  FileDown,
  FileSpreadsheet,
  Save,
  Trash2,
  RotateCcw,
  ClipboardList,
  X,
} from 'lucide-react';
import {
  lcmArray,
  addFractions,
  subtractFractions,
  downloadLkpdPdf,
  exportLabExcel,
  type StudentIdentity,
} from '../utils/fractionMath';
import { FractionDisplay, MathText } from './FractionVisuals';
import { ThreeStemLabCanvas } from './ThreeStemLabCanvas';
import { safeApiRequest } from '../utils/apiClient';

interface StemLabModuleProps {
  siswa: StudentIdentity;
  onSavedNotification: (msg: string, syncedToSheets: boolean) => void;
}

interface LabTrialRow {
  no: number;
  variabel: string;
  perhitunganKpk: string;
  hasilPecahan: string;
  nilaiDesimal: string;
  keterangan: string;
}

export const StemLabModule: React.FC<StemLabModuleProps> = ({
  siswa,
  onSavedNotification,
}) => {
  const [activeLab, setActiveLab] = useState<'lab1' | 'lab2' | 'lab3'>('lab1');
  const [isLkpdModalOpen, setIsLkpdModalOpen] = useState<boolean>(false);

  // Lab 1 State
  const [l1NumA, setL1NumA] = useState(3);
  const [l1DenA, setL1DenA] = useState(4);
  const [l1NumB, setL1NumB] = useState(2);
  const [l1DenB, setL1DenB] = useState(3);
  const [l1NumC, setL1NumC] = useState(5);
  const [l1DenC, setL1DenC] = useState(6);

  // Lab 2 State
  const [l2NumA, setL2NumA] = useState(2);
  const [l2DenA, setL2DenA] = useState(5);
  const [l2NumB, setL2NumB] = useState(3);
  const [l2DenB, setL2DenB] = useState(4);

  // Lab 3 State
  const [l3WholeA, setL3WholeA] = useState(1);
  const [l3NumA, setL3NumA] = useState(3);
  const [l3DenA, setL3DenA] = useState(4);
  const [l3NumB, setL3NumB] = useState(5);
  const [l3DenB, setL3DenB] = useState(6);

  // LKPD Fields per Lab
  const [hipotesisMap, setHipotesisMap] = useState<Record<'lab1' | 'lab2' | 'lab3', string>>({
    lab1: 'Jika tiga larutan nutrisi memiliki pecahan berpenyebut berbeda, maka urutan volume dari terkecil ke terbesar dapat ditentukan secara presisi dengan menyamakan penyebut ke KPK.',
    lab2: 'Jika dua takaran cairan pecahan dijumlahkan dalam tabung reaktor, maka total volume sama dengan jumlah pembilang setelah disamakan ke penyebut KPK.',
    lab3: 'Jika volume awal tangki irigasi dikurangi volume air yang dialirkan ke tanaman, maka sisa volume dapat dihitung dengan pengurangan pecahan berpenyebut KPK.',
  });

  const [observasiMap, setObservasiMap] = useState<Record<'lab1' | 'lab2' | 'lab3', string>>({
    lab1: 'Tinggi permukaan cairan pada ketiga tabung ukur 3D sebanding dengan nilai pembilang baru setelah seluruh pecahan diubah ke penyebut KPK.',
    lab2: 'Garis skala pada tabung reaktor 3D membagi satuan liter menjadi bagian KPK sehingga kedua cairan dapat digabungkan secara akurat.',
    lab3: 'Penurunan tinggi cairan pada tangki irigasi 3D sesuai dengan jumlah bagian KPK yang dikeluarkan melalui katup irigasi tetes.',
  });

  const [kesimpulanMap, setKesimpulanMap] = useState<Record<'lab1' | 'lab2' | 'lab3', string>>({
    lab1: 'Membandingkan dan mengurutkan pecahan berpenyebut berbeda memerlukan penyamaan penyebut menggunakan KPK agar ukuran tiap bagian satuan menjadi setara.',
    lab2: 'Penjumlahan pecahan berpenyebut berbeda menghasilkan pecahan baru yang pembilangnya merupakan jumlah pecahan senilai berpenyebut KPK, lalu disederhanakan dengan FPB.',
    lab3: 'Pengurangan pecahan biasa maupun pecahan campuran dilakukan dengan menyamakan penyebut (KPK) atau mengubah ke pecahan biasa terlebih dahulu.',
  });

  const [trialsMap, setTrialsMap] = useState<Record<'lab1' | 'lab2' | 'lab3', LabTrialRow[]>>({
    lab1: [
      {
        no: 1,
        variabel: 'Tabung A = 3/4 L, B = 2/3 L, C = 5/6 L',
        perhitunganKpk: 'KPK(4,3,6) = 12 → A = 9/12, B = 8/12, C = 10/12',
        hasilPecahan: 'Urutan: 2/3 < 3/4 < 5/6',
        nilaiDesimal: '0.67 < 0.75 < 0.83',
        keterangan: 'Tabung C memiliki volume tertinggi',
      },
    ],
    lab2: [
      {
        no: 1,
        variabel: 'Cairan A = 2/5 L + Cairan B = 3/4 L',
        perhitunganKpk: 'KPK(5,4) = 20 → 8/20 + 15/20',
        hasilPecahan: '23/20 = 1 3/20 L',
        nilaiDesimal: '1.1500 L',
        keterangan: 'Melebihi 1 liter (pecahan campuran 1 3/20 L)',
      },
    ],
    lab3: [
      {
        no: 1,
        variabel: 'Stok Awal = 1 3/4 L − Terpakai = 5/6 L',
        perhitunganKpk: '7/4 − 5/6 → KPK(4,6) = 12 → 21/12 − 10/12',
        hasilPecahan: '11/12 L',
        nilaiDesimal: '0.9167 L',
        keterangan: 'Sisa cadangan air irigasi 11/12 liter',
      },
    ],
  });

  const [isSaving, setIsSaving] = useState(false);

  const l1Kpk = lcmArray([l1DenA, l1DenB, l1DenC]);
  const l1EqA = l1NumA * (l1Kpk / l1DenA);
  const l1EqB = l1NumB * (l1Kpk / l1DenB);
  const l1EqC = l1NumC * (l1Kpk / l1DenC);
  const l1Sorted = [
    { id: 'A', num: l1NumA, den: l1DenA, eqNum: l1EqA, label: `${l1NumA}/${l1DenA}`, eq: `${l1EqA}/${l1Kpk}`, val: l1NumA / l1DenA },
    { id: 'B', num: l1NumB, den: l1DenB, eqNum: l1EqB, label: `${l1NumB}/${l1DenB}`, eq: `${l1EqB}/${l1Kpk}`, val: l1NumB / l1DenB },
    { id: 'C', num: l1NumC, den: l1DenC, eqNum: l1EqC, label: `${l1NumC}/${l1DenC}`, eq: `${l1EqC}/${l1Kpk}`, val: l1NumC / l1DenC },
  ].sort((x, y) => x.val - y.val);

  const l2Add = addFractions({ num: l2NumA, den: l2DenA }, { num: l2NumB, den: l2DenB });
  const l3Sub = subtractFractions(
    { whole: l3WholeA, num: l3NumA, den: l3DenA },
    { num: l3NumB, den: l3DenB }
  );

  const labInfo = {
    lab1: {
      id: 'LAB-01',
      title: 'Lab 1: Membandingkan dan Mengurutkan Pecahan',
      stemContext: 'Eksperimen Visual 3D — Analisis Takaran Larutan pada Tabung Ukur',
    },
    lab2: {
      id: 'LAB-02',
      title: 'Lab 2: Penjumlahan Pecahan',
      stemContext: 'Eksperimen Visual 3D — Reaktor Pencampuran Cairan Pecahan',
    },
    lab3: {
      id: 'LAB-03',
      title: 'Lab 3: Pengurangan Pecahan',
      stemContext: 'Eksperimen Visual 3D — Sistem Tangki Air & Pengurangan Volume',
    },
  }[activeLab];

  const handleRecordTrial = () => {
    const currentList = trialsMap[activeLab];
    const nextNo = currentList.length + 1;
    let newRow: LabTrialRow;

    if (activeLab === 'lab1') {
      newRow = {
        no: nextNo,
        variabel: `Tabung A = ${l1NumA}/${l1DenA} L, B = ${l1NumB}/${l1DenB} L, C = ${l1NumC}/${l1DenC} L`,
        perhitunganKpk: `KPK = ${l1Kpk} → A = ${l1EqA}/${l1Kpk}, B = ${l1EqB}/${l1Kpk}, C = ${l1EqC}/${l1Kpk}`,
        hasilPecahan: `Urutan: ${l1Sorted.map((s) => `${s.id}(${s.label})`).join(' < ')}`,
        nilaiDesimal: l1Sorted.map((s) => s.val.toFixed(2)).join(' < '),
        keterangan: `Terbesar: Tabung ${l1Sorted[2].id} (${l1Sorted[2].label})`,
      };
    } else if (activeLab === 'lab2') {
      newRow = {
        no: nextNo,
        variabel: `Cairan A = ${l2NumA}/${l2DenA} L + Cairan B = ${l2NumB}/${l2DenB} L`,
        perhitunganKpk: `KPK(${l2DenA},${l2DenB}) = ${l2Add.kpk} → ${l2Add.eqNumA}/${l2Add.kpk} + ${l2Add.eqNumB}/${l2Add.kpk}`,
        hasilPecahan: `${l2Add.rawSumNum}/${l2Add.kpk} = ${l2Add.simplified.formattedMixed} L`,
        nilaiDesimal: `${l2Add.simplified.decimal} L`,
        keterangan: `FPB Penyederhanaan = ${l2Add.simplified.fpb}`,
      };
    } else {
      newRow = {
        no: nextNo,
        variabel: `Tangki Awal = ${l3WholeA > 0 ? `${l3WholeA} ` : ''}${l3NumA}/${l3DenA} L − Keluar = ${l3NumB}/${l3DenB} L`,
        perhitunganKpk: `${l3Sub.impA.num}/${l3Sub.impA.den} − ${l3Sub.impB.num}/${l3Sub.impB.den} → KPK = ${l3Sub.kpk} (${l3Sub.eqNumA}/${l3Sub.kpk} − ${l3Sub.eqNumB}/${l3Sub.kpk})`,
        hasilPecahan: `${l3Sub.rawDiffNum}/${l3Sub.kpk} = ${l3Sub.simplified.formattedMixed} L`,
        nilaiDesimal: `${l3Sub.simplified.decimal} L`,
        keterangan:
          l3Sub.rawDiffNum >= 0
            ? `Sisa volume positif (${l3Sub.simplified.formattedMixed} L)`
            : 'Defisit volume cairan',
      };
    }

    setTrialsMap((prev) => ({
      ...prev,
      [activeLab]: [...prev[activeLab], newRow],
    }));
    onSavedNotification(`Data percobaan #${nextNo} ditambahkan ke Tabel LKPD.`, true);
  };

  const handleClearTrials = () => {
    setTrialsMap((prev) => ({ ...prev, [activeLab]: [] }));
  };

  const handleSaveLabToDb = async (statusUnduh = 'TERSIMPAN') => {
    setIsSaving(true);
    try {
      const variabelInput =
        activeLab === 'lab1'
          ? { A: `${l1NumA}/${l1DenA}`, B: `${l1NumB}/${l1DenB}`, C: `${l1NumC}/${l1DenC}` }
          : activeLab === 'lab2'
          ? { A: `${l2NumA}/${l2DenA}`, B: `${l2NumB}/${l2DenB}` }
          : { Awal: `${l3WholeA} ${l3NumA}/${l3DenA}`, Dikurangi: `${l3NumB}/${l3DenB}` };

      const hasilSimulasi =
        activeLab === 'lab1'
          ? { kpk: l1Kpk, urutan: l1Sorted.map((s) => s.label).join(' <= ') }
          : activeLab === 'lab2'
          ? { kpk: l2Add.kpk, hasil: l2Add.simplified.formattedMixed }
          : { kpk: l3Sub.kpk, sisa: l3Sub.simplified.formattedMixed };

      const { data } = await safeApiRequest('/api/lab/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_siswa: siswa.id_siswa,
          nama_siswa: siswa.nama_siswa,
          kelas: siswa.kelas,
          asal_sekolah: siswa.asal_sekolah,
          lab_id: labInfo.id,
          nama_lab: labInfo.title,
          hipotesis: hipotesisMap[activeLab],
          variabel_input: variabelInput,
          hasil_simulasi: hasilSimulasi,
          data_tabel_json: trialsMap[activeLab],
          observasi: observasiMap[activeLab],
          kesimpulan: kesimpulanMap[activeLab],
          status_unduh_pdf: statusUnduh,
        }),
      });
      onSavedNotification(
        data?.sheetsStatusMessage || `Data ${labInfo.title} & LKPD berhasil disimpan.`,
        Boolean(data?.savedToGoogleSheets)
      );
    } catch {
      onSavedNotification('Gagal menyimpan data eksperimen Virtual Lab.', false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadLkpdPdf = async () => {
    downloadLkpdPdf({
      siswa,
      labTitle: labInfo.title,
      stemFocus: labInfo.stemContext,
      hipotesis: hipotesisMap[activeLab],
      dataRows: trialsMap[activeLab],
      observasi: observasiMap[activeLab],
      kesimpulan: kesimpulanMap[activeLab],
    });
    await handleSaveLabToDb('DIUNDUH_PDF');
  };

  const handleExportExcel = () => {
    exportLabExcel({
      siswa,
      labTitle: labInfo.title,
      hipotesis: hipotesisMap[activeLab],
      observasi: observasiMap[activeLab],
      kesimpulan: kesimpulanMap[activeLab],
      dataRows: trialsMap[activeLab],
    });
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Unified Compact Top Bar: Lab Selector + Quick LKPD & Export Triggers */}
      <div className="shrink-0 surface-3d-card rounded-2xl px-4 py-2.5 flex flex-wrap xl:flex-nowrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveLab('lab1')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-[#082545] transition-all whitespace-nowrap cursor-pointer ${
              activeLab === 'lab1'
                ? 'bg-[#0066DD] text-white shadow-[0_2px_0_#082545]'
                : 'bg-white text-[#082545] hover:bg-[#BAE6FD]/40'
            }`}
          >
            Lab 1: Membandingkan
          </button>
          <button
            type="button"
            onClick={() => setActiveLab('lab2')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-[#082545] transition-all whitespace-nowrap cursor-pointer ${
              activeLab === 'lab2'
                ? 'bg-[#58CC02] text-white shadow-[0_2px_0_#082545]'
                : 'bg-white text-[#082545] hover:bg-[#BBF7D0]/40'
            }`}
          >
            Lab 2: Penjumlahan
          </button>
          <button
            type="button"
            onClick={() => setActiveLab('lab3')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-[#082545] transition-all whitespace-nowrap cursor-pointer ${
              activeLab === 'lab3'
                ? 'bg-[#FF7A00] text-white shadow-[0_2px_0_#082545]'
                : 'bg-white text-[#082545] hover:bg-[#FEF08A]/50'
            }`}
          >
            Lab 3: Pengurangan
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRecordTrial}
            className="surface-3d-btn-primary px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Catat Data</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLkpdModalOpen(true)}
            className="surface-3d-btn-amber px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Pop-Up LKPD & Tabel ({trialsMap[activeLab].length})</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadLkpdPdf}
            className="surface-3d-btn-emerald px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>LKPD (PDF)</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="surface-3d-btn-neutral px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Two-Zone Single-Screen STEM Lab Stage */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Left Zone: Interactive Three.js 3D Laboratory Viewport (7 cols) */}
        <div className="lg:col-span-7 surface-3d-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-2.5">
          <div className="shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#082545]">
                {labInfo.title}
              </h2>
              <p className="text-xs text-slate-600">{labInfo.stemContext}</p>
            </div>
          </div>

          {/* Real Three.js 3D WebGL Canvas filling available height */}
          <ThreeStemLabCanvas
            activeLab={activeLab}
            l1NumA={l1NumA}
            l1DenA={l1DenA}
            l1NumB={l1NumB}
            l1DenB={l1DenB}
            l1NumC={l1NumC}
            l1DenC={l1DenC}
            l1Kpk={l1Kpk}
            l2NumA={l2NumA}
            l2DenA={l2DenA}
            l2NumB={l2NumB}
            l2DenB={l2DenB}
            l2Kpk={l2Add.kpk}
            l3WholeA={l3WholeA}
            l3NumA={l3NumA}
            l3DenA={l3DenA}
            l3NumB={l3NumB}
            l3DenB={l3DenB}
            l3Kpk={l3Sub.kpk}
          />

          {/* Compact Mathematical Proof Readout Bar */}
          {activeLab === 'lab1' && (
            <div className="shrink-0 p-2.5 rounded-xl bg-[#BAE6FD]/35 border-2 border-[#082545] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="font-extrabold text-[#082545]">
                KPK({l1DenA}, {l1DenB}, {l1DenC}) ={' '}
                <span className="px-2 py-0.5 rounded bg-[#0066DD] text-white font-mono">
                  {l1Kpk}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-extrabold text-[#082545]">
                <span>Urutan:</span>
                {l1Sorted.map((s, idx) => (
                  <React.Fragment key={s.id}>
                    <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-[#082545]">
                      <span>{s.id}</span>
                      <FractionDisplay num={s.num} den={s.den} size="sm" colorClass="text-[#0066DD]" />
                    </span>
                    {idx < 2 && <span className="font-extrabold text-[#FF7A00]">&lt;</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {activeLab === 'lab2' && (
            <div className="shrink-0 p-2.5 rounded-xl bg-[#BBF7D0]/45 border-2 border-[#082545] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 font-extrabold text-[#082545]">
                <span>Reaktor:</span>
                <FractionDisplay num={l2NumA} den={l2DenA} size="sm" colorClass="text-[#0066DD]" />
                <span>+</span>
                <FractionDisplay num={l2NumB} den={l2DenB} size="sm" colorClass="text-[#15803D]" />
                <span>=</span>
                <FractionDisplay num={l2Add.eqNumA} den={l2Add.kpk} size="sm" />
                <span>+</span>
                <FractionDisplay num={l2Add.eqNumB} den={l2Add.kpk} size="sm" />
                <span>=</span>
                <span className="px-2 py-0.5 rounded-lg bg-white border border-[#082545]">
                  <FractionDisplay
                    whole={l2Add.simplified.whole}
                    num={l2Add.simplified.remNum}
                    den={l2Add.simplified.den}
                    size="sm"
                    colorClass="text-[#FF7A00]"
                  />
                </span>
                <span>L ({l2Add.simplified.decimal} L)</span>
              </div>
            </div>
          )}

          {activeLab === 'lab3' && (
            <div className="shrink-0 p-2.5 rounded-xl bg-[#FEF08A]/55 border-2 border-[#082545] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 font-extrabold text-[#082545]">
                <span>Konservasi Air:</span>
                <FractionDisplay
                  whole={l3WholeA}
                  num={l3NumA}
                  den={l3DenA}
                  size="sm"
                  colorClass="text-[#0066DD]"
                />
                <span>−</span>
                <FractionDisplay num={l3NumB} den={l3DenB} size="sm" colorClass="text-[#FF7A00]" />
                <span>=</span>
                <span className="px-2 py-0.5 rounded-lg bg-white border border-[#082545]">
                  <FractionDisplay
                    whole={l3Sub.simplified.whole}
                    num={l3Sub.simplified.remNum}
                    den={l3Sub.simplified.den}
                    size="sm"
                    colorClass="text-[#15803D]"
                  />
                </span>
                <span>Liter</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Zone: Variable Controls & Quick LKPD Access (5 cols) */}
        <div className="lg:col-span-5 surface-3d-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-2.5">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm sm:text-base font-extrabold text-[#082545]">
                Panel Variabel Pecahan 3D
              </h3>
              <button
                type="button"
                onClick={() => {
                  setL1NumA(3); setL1DenA(4); setL1NumB(2); setL1DenB(3); setL1NumC(5); setL1DenC(6);
                  setL2NumA(2); setL2DenA(5); setL2NumB(3); setL2DenB(4);
                  setL3WholeA(1); setL3NumA(3); setL3DenA(4); setL3NumB(5); setL3DenB(6);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-extrabold text-[#082545] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {activeLab === 'lab1' && (
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Tabung A (Biru)', num: l1NumA, setNum: setL1NumA, den: l1DenA, setDen: setL1DenA, color: 'text-[#0066DD]' },
                  { label: 'Tabung B (Hijau)', num: l1NumB, setNum: setL1NumB, den: l1DenB, setDen: setL1DenB, color: 'text-[#15803D]' },
                  { label: 'Tabung C (Oranye)', num: l1NumC, setNum: setL1NumC, den: l1DenC, setDen: setL1DenC, color: 'text-[#FF7A00]' },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-[#082545]/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`font-extrabold ${item.color}`}>{item.label}</span>
                      <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-300">
                        <FractionDisplay num={item.num} den={item.den} size="sm" colorClass={item.color} />
                        <span className="text-[10px] font-bold text-slate-600">L</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700">
                          Pembilang: {item.num}
                        </label>
                        <input
                          type="range"
                          min={1}
                          max={item.den}
                          value={Math.min(item.num, item.den)}
                          onChange={(e) => item.setNum(Number(e.target.value))}
                          className="w-full h-2 accent-[#0066DD] cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700">
                          Penyebut: {item.den}
                        </label>
                        <input
                          type="range"
                          min={2}
                          max={12}
                          value={item.den}
                          onChange={(e) => {
                            const d = Number(e.target.value);
                            item.setDen(d);
                            if (item.num > d) item.setNum(d);
                          }}
                          className="w-full h-2 accent-[#0066DD] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeLab === 'lab2' && (
              <div className="space-y-2.5 text-xs">
                {[
                  { label: 'Cairan A (Biru)', num: l2NumA, setNum: setL2NumA, den: l2DenA, setDen: setL2DenA, color: 'text-[#0066DD]' },
                  { label: 'Cairan B (Hijau)', num: l2NumB, setNum: setL2NumB, den: l2DenB, setDen: setL2DenB, color: 'text-[#15803D]' },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-[#082545]/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`font-extrabold ${item.color}`}>{item.label}</span>
                      <div className="flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-lg border border-slate-300">
                        <FractionDisplay num={item.num} den={item.den} size="sm" colorClass={item.color} />
                        <span className="text-[10px] font-bold text-slate-600">Liter</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700">
                          Pembilang: {item.num}
                        </label>
                        <input
                          type="range"
                          min={1}
                          max={item.den}
                          value={Math.min(item.num, item.den)}
                          onChange={(e) => item.setNum(Number(e.target.value))}
                          className="w-full h-2 accent-[#58CC02] cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700">
                          Penyebut: {item.den}
                        </label>
                        <input
                          type="range"
                          min={2}
                          max={12}
                          value={item.den}
                          onChange={(e) => {
                            const d = Number(e.target.value);
                            item.setDen(d);
                            if (item.num > d) item.setNum(d);
                          }}
                          className="w-full h-2 accent-[#58CC02] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeLab === 'lab3' && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-[#082545]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0066DD]">Tangki Awal (Campuran)</span>
                    <div className="flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-lg border border-slate-300">
                      <FractionDisplay whole={l3WholeA} num={l3NumA} den={l3DenA} size="sm" colorClass="text-[#0066DD]" />
                      <span className="text-[10px] font-bold text-slate-600">L</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700">
                        Utuh: {l3WholeA}
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={2}
                        value={l3WholeA}
                        onChange={(e) => setL3WholeA(Number(e.target.value))}
                        className="w-full h-2 accent-[#0066DD]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700">
                        Atas: {l3NumA}
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={l3DenA - 1}
                        value={Math.min(l3NumA, l3DenA - 1)}
                        onChange={(e) => setL3NumA(Number(e.target.value))}
                        className="w-full h-2 accent-[#0066DD]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700">
                        Bawah: {l3DenA}
                      </label>
                      <input
                        type="range"
                        min={2}
                        max={10}
                        value={l3DenA}
                        onChange={(e) => {
                          const d = Number(e.target.value);
                          setL3DenA(d);
                          if (l3NumA >= d) setL3NumA(d - 1);
                        }}
                        className="w-full h-2 accent-[#0066DD]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-[#082545]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#FF7A00]">Volume Air Dialirkan</span>
                    <div className="flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-lg border border-slate-300">
                      <FractionDisplay num={l3NumB} den={l3DenB} size="sm" colorClass="text-[#FF7A00]" />
                      <span className="text-[10px] font-bold text-slate-600">L</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700">
                        Pembilang: {l3NumB}
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={l3DenB}
                        value={Math.min(l3NumB, l3DenB)}
                        onChange={(e) => setL3NumB(Number(e.target.value))}
                        className="w-full h-2 accent-[#FF7A00]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700">
                        Penyebut: {l3DenB}
                      </label>
                      <input
                        type="range"
                        min={2}
                        max={10}
                        value={l3DenB}
                        onChange={(e) => {
                          const d = Number(e.target.value);
                          setL3DenB(d);
                          if (l3NumB > d) setL3NumB(d);
                        }}
                        className="w-full h-2 accent-[#FF7A00]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Summary of Hypothesis & Recorded Data */}
            <div className="p-2.5 rounded-xl bg-[#FEF9C3]/60 border border-[#082545]/30 text-xs space-y-1">
              <div className="font-extrabold text-[#082545]">
                Ringkasan LKPD ({trialsMap[activeLab].length} Data Percobaan Tercatat):
              </div>
              <p className="text-slate-700 line-clamp-2">{kesimpulanMap[activeLab]}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsLkpdModalOpen(true)}
              className="w-full surface-3d-btn-amber py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Buka Pop-Up LKPD, Tabel Data & Kesimpulan</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleRecordTrial}
                className="surface-3d-btn-primary py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Catat ke Tabel</span>
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveLabToDb('TERSIMPAN')}
                className="surface-3d-btn-emerald py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan LKPD'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* FULL LKPD, DATA TABLE, HYPOTHESIS & CONCLUSION POPUP MODAL           */}
      {/* ==================================================================== */}
      {isLkpdModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#082545]/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-3d-card rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200 pb-4 sticky top-0 bg-white z-10">
              <div>
                <div className="text-xs font-extrabold text-[#0066DD] uppercase">
                  Lembar Kerja Peserta Didik (LKPD) &amp; Laporan Eksperimen Virtual Lab 3D
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#082545]">{labInfo.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadLkpdPdf}
                  className="surface-3d-btn-primary px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Unduh LKPD (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="surface-3d-btn-amber px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Ekspor Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLkpdModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#082545]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Experiment Data Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-[#082545]">
                  1. Tabel Data Hasil Percobaan ({trialsMap[activeLab].length} Baris Tercatat)
                </h4>
                <button
                  type="button"
                  onClick={handleClearTrials}
                  className="text-xs text-red-600 hover:underline flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Tabel</span>
                </button>
              </div>

              <div className="overflow-x-auto border-2 border-[#082545] rounded-xl">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#BAE6FD] text-[#082545] border-b-2 border-[#082545]">
                      <th className="py-2.5 px-3 font-extrabold">No</th>
                      <th className="py-2.5 px-3 font-extrabold">Variabel Pecahan Uji</th>
                      <th className="py-2.5 px-3 font-extrabold">Transformasi KPK</th>
                      <th className="py-2.5 px-3 font-extrabold">Hasil Akhir</th>
                      <th className="py-2.5 px-3 font-extrabold">Desimal</th>
                      <th className="py-2.5 px-3 font-extrabold">Keterangan Hasil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {trialsMap[activeLab].map((row) => (
                      <tr key={row.no}>
                        <td className="py-2.5 px-3 font-bold">{row.no}</td>
                        <td className="py-2.5 px-3">
                          <MathText text={row.variabel} />
                        </td>
                        <td className="py-2.5 px-3">
                          <MathText text={row.perhitunganKpk} />
                        </td>
                        <td className="py-2.5 px-3 font-extrabold text-[#0066DD]">
                          <MathText text={row.hasilPecahan} />
                        </td>
                        <td className="py-2.5 px-3 font-mono">{row.nilaiDesimal}</td>
                        <td className="py-2.5 px-3">
                          <MathText text={row.keterangan} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hypothesis, Observation, and Conclusion Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#082545] mb-1">
                  2. Hipotesis Awal Eksperimen
                </label>
                <textarea
                  rows={3}
                  value={hipotesisMap[activeLab]}
                  onChange={(e) =>
                    setHipotesisMap((prev) => ({ ...prev, [activeLab]: e.target.value }))
                  }
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border-2 border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#082545] mb-1">
                  3. Hasil Observasi Visual 3D
                </label>
                <textarea
                  rows={3}
                  value={observasiMap[activeLab]}
                  onChange={(e) =>
                    setObservasiMap((prev) => ({ ...prev, [activeLab]: e.target.value }))
                  }
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border-2 border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#082545] mb-1">
                  4. Kesimpulan Ilmiah & Matematis
                </label>
                <textarea
                  rows={3}
                  value={kesimpulanMap[activeLab]}
                  onChange={(e) =>
                    setKesimpulanMap((prev) => ({ ...prev, [activeLab]: e.target.value }))
                  }
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border-2 border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveLabToDb('TERSIMPAN')}
                className="surface-3d-btn-emerald px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan LKPD'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLkpdModalOpen(false)}
                className="surface-3d-btn-neutral px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
