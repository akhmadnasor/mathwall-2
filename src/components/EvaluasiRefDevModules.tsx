import React, { useState, useEffect } from 'react';
import {
  Save,
  BookOpen,
  GraduationCap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  X,
  Settings,
  HelpCircle,
  MousePointerClick,
  FlaskConical,
  Gamepad2,
  ChefHat,
  ClipboardCheck,
  MonitorSmartphone,
} from 'lucide-react';
import type { StudentIdentity } from '../utils/fractionMath';
import { safeApiRequest } from '../utils/apiClient';

// ============================================================================
// E. EVALUASI MODULE
// ============================================================================
export const EvaluasiModule: React.FC<{
  siswa: StudentIdentity;
  onSavedNotification: (msg: string, syncedToSheets: boolean) => void;
}> = ({ siswa, onSavedNotification }) => {
  const [records, setRecords] = useState<any>({
    progressMateri: [],
    labPercobaan: [],
    hasilGame: [],
    hasilQuiz: [],
    proyekPjbl: [],
    evaluasi: [],
  });
  const [loading, setLoading] = useState(true);

  const [skorRubrikPjbl, setSkorRubrikPjbl] = useState(90);
  const [refleksiSiswa, setRefleksiSiswa] = useState(
    'Saya merasa senang belajar pecahan menggunakan visualisasi balok 3D, eksperimen Virtual Lab 3D, tiga permainan interaktif (Tarik Tambang, Open Box, dan Bridge Builder), dan proyek Mini Bakery: Master Chef Pecahan. Sekarang saya lebih paham cara mencari KPK untuk membandingkan, menjumlahkan, dan mengurangkan pecahan.'
  );
  const [umpanBalikGuru, setUmpanBalikGuru] = useState(
    'Siswa menunjukkan pemahaman konseptual yang sangat baik pada penyamaan penyebut KPK serta mampu mengaplikasikan operasi pecahan secara nyata dalam proyek Mini Bakery: Master Chef Pecahan.'
  );
  const [savingEval, setSavingEval] = useState(false);

  const fetchStudentRecords = async () => {
    setLoading(true);
    try {
      const { ok, data } = await safeApiRequest(
        `/api/db/records?id_siswa=${encodeURIComponent(siswa.id_siswa)}`
      );
      if (ok && data) {
        setRecords(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentRecords();
  }, [siswa.id_siswa]);

  const skorMateri =
    records.progressMateri?.length > 0
      ? Math.round(
          records.progressMateri.reduce(
            (acc: number, r: any) => acc + Number(r.skor_latihan || 0),
            0
          ) / records.progressMateri.length
        )
      : 85;

  const skorLab = records.labPercobaan?.length > 0 ? Math.min(100, 80 + records.labPercobaan.length * 7) : 85;

  const skorGame =
    records.hasilGame?.length > 0
      ? Math.min(
          100,
          Math.round(
            records.hasilGame.reduce((acc: number, g: any) => acc + Number(g.skor || 0), 0) /
              (records.hasilGame.length * 3)
          ) + 60
        )
      : 85;

  const skorQuiz =
    records.hasilQuiz?.length > 0
      ? Math.max(...records.hasilQuiz.map((q: any) => Number(q.skor_akhir || 0)))
      : 87;

  const nilaiAkhirKomposit = Math.round(
    skorMateri * 0.2 + skorLab * 0.2 + skorGame * 0.15 + skorQuiz * 0.25 + skorRubrikPjbl * 0.2
  );

  const umpanBalikSistem =
    nilaiAkhirKomposit >= 85
      ? 'Capaian Sangat Optimal (Tuntas Mandiri Fase C): Siswa menguasai perbandingan, penjumlahan, dan pengurangan pecahan serta menyelesaikan proyek Mini Bakery: Master Chef Pecahan dengan sangat baik.'
      : nilaiAkhirKomposit >= 75
      ? 'Capaian Baik (Tuntas Fase C): Siswa memahami operasi pecahan berpenyebut berbeda dengan baik.'
      : 'Perlu Penguatan Konsep KPK: Disarankan mengulangi simulasi visual pada Materi Utama dan Virtual Lab 3D.';

  const handleSaveEvaluasi = async () => {
    setSavingEval(true);
    try {
      const { data } = await safeApiRequest('/api/evaluasi/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_siswa: siswa.id_siswa,
          nama_siswa: siswa.nama_siswa,
          kelas: siswa.kelas,
          skor_materi: skorMateri,
          skor_lab: skorLab,
          skor_game: skorGame,
          skor_quiz: skorQuiz,
          skor_pjbl: skorRubrikPjbl,
          nilai_akhir_komposit: nilaiAkhirKomposit,
          refleksi_siswa: refleksiSiswa,
          umpan_balik_sistem: umpanBalikSistem,
          umpan_balik_guru: umpanBalikGuru,
        }),
      });
      await fetchStudentRecords();
      onSavedNotification(
        data?.sheetsStatusMessage ||
          `Evaluasi Akhir Komposit (${nilaiAkhirKomposit}) berhasil disimpan.`,
        Boolean(data?.savedToGoogleSheets)
      );
    } catch {
      onSavedNotification('Gagal menyimpan data evaluasi ke server.', false);
    } finally {
      setSavingEval(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Header */}
      <div className="surface-3d-card rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="text-[10px] font-extrabold text-[#0066DD] uppercase tracking-wider">
            Modul E · Evaluasi Komprehensif · Progress, Quiz, Asesmen Proyek PjBL, Refleksi & Umpan Balik
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#082545]">
            Dashboard Evaluasi & Refleksi Belajar — {siswa.nama_siswa} ({siswa.kelas})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchStudentRecords}
            className="surface-3d-btn-neutral px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
          <button
            type="button"
            disabled={savingEval}
            onClick={handleSaveEvaluasi}
            className="surface-3d-btn-emerald px-4 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingEval ? 'Menyimpan...' : 'Simpan Evaluasi'}</span>
          </button>
        </div>
      </div>

      {/* 6 Compact Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono tabular-nums shrink-0">
        <div className="surface-3d-card rounded-2xl p-3 space-y-0.5">
          <div className="text-[11px] font-sans font-bold text-slate-500">1. Progress Materi</div>
          <div className="text-xl font-extrabold text-[#0066DD]">{skorMateri}</div>
          <div className="text-[10px] font-sans text-slate-500">
            {records.progressMateri?.length || 0} Topik Selesai
          </div>
        </div>

        <div className="surface-3d-card rounded-2xl p-3 space-y-0.5">
          <div className="text-[11px] font-sans font-bold text-slate-500">2. Virtual Lab 3D</div>
          <div className="text-xl font-extrabold text-[#15803D]">{skorLab}</div>
          <div className="text-[10px] font-sans text-slate-500">
            {records.labPercobaan?.length || 0} Eksperimen LKPD
          </div>
        </div>

        <div className="surface-3d-card rounded-2xl p-3 space-y-0.5">
          <div className="text-[11px] font-sans font-bold text-slate-500">3. Game Edukasi</div>
          <div className="text-xl font-extrabold text-[#FF7A00]">{skorGame}</div>
          <div className="text-[10px] font-sans text-slate-500">
            {records.hasilGame?.length || 0} Sesi Permainan
          </div>
        </div>

        <div className="surface-3d-card rounded-2xl p-3 space-y-0.5">
          <div className="text-[11px] font-sans font-bold text-slate-500">4. Evaluasi Quiz</div>
          <div className="text-xl font-extrabold text-indigo-600">{skorQuiz}</div>
          <div className="text-[10px] font-sans text-slate-500">
            {records.hasilQuiz?.length || 0} Rekaman Quiz
          </div>
        </div>

        <div className="surface-3d-card rounded-2xl p-3 space-y-0.5">
          <div className="text-[11px] font-sans font-bold text-slate-500">5. Proyek PjBL</div>
          <div className="text-xl font-extrabold text-emerald-700">{skorRubrikPjbl}</div>
          <div className="text-[10px] font-sans text-slate-500">
            {records.proyekPjbl?.length || 0} Karya Resep
          </div>
        </div>

        <div className="surface-3d-card rounded-2xl p-3 bg-[#082545] text-white space-y-0.5">
          <div className="text-[11px] font-sans font-bold text-[#FFD60A]">NILAI KOMPOSIT</div>
          <div className="text-xl font-extrabold text-white">{nilaiAkhirKomposit} / 100</div>
          <div className="text-[10px] font-sans text-[#BBF7D0]">Tuntas Fase C</div>
        </div>
      </div>

      {/* Rubric, Reflection & Feedback Form Fitting in 1 Screen */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-5 surface-3d-card rounded-2xl p-4 flex flex-col justify-between gap-3 lg:overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#082545]">
              Penilaian Proyek PjBL &ldquo;Mini Bakery: Master Chef Pecahan&rdquo;
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Asesmen autentik berdasarkan ketepatan perbandingan pecahan bahan kue, akurasi
              penjumlahan KPK, pengurangan sisa bahan, dan penyajian kartu resep digital.
            </p>
            <div>
              <div className="flex justify-between text-xs font-extrabold text-[#082545] mb-1">
                <span>Skor Asesmen Proyek PjBL:</span>
                <span className="font-mono text-[#0066DD]">{skorRubrikPjbl} / 100</span>
              </div>
              <input
                type="range"
                min={60}
                max={100}
                value={skorRubrikPjbl}
                onChange={(e) => setSkorRubrikPjbl(Number(e.target.value))}
                className="w-full h-2.5 accent-[#0066DD]"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#BAE6FD]/40 border-2 border-[#082545] space-y-1 text-xs">
            <div className="font-extrabold text-[#0066DD]">Umpan Balik Diagnostik Sistem:</div>
            <p className="text-[#082545] leading-snug">{umpanBalikSistem}</p>
          </div>
        </div>

        <div className="lg:col-span-7 surface-3d-card rounded-2xl p-4 flex flex-col justify-between gap-2.5 lg:overflow-y-auto">
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs font-extrabold text-[#082545] mb-1">
                Refleksi Mandiri Peserta Didik (Student Reflection):
              </label>
              <textarea
                rows={2}
                value={refleksiSiswa}
                onChange={(e) => setRefleksiSiswa(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border-2 border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#082545] mb-1">
                Catatan & Umpan Balik Guru / Peneliti (Feedback):
              </label>
              <textarea
                rows={2}
                value={umpanBalikGuru}
                onChange={(e) => setUmpanBalikGuru(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border-2 border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={savingEval}
              onClick={handleSaveEvaluasi}
              className="surface-3d-btn-emerald px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Refleksi & Evaluasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// F. REFERENSI MODULE (FITS IN 1 SCREEN ON LAPTOP & IFP)
// ============================================================================
export const ReferensiModule: React.FC = () => {
  const references = [
    {
      kategori: 'Buku Teks Utama Resmi Kemendikbudristek (Kurikulum Merdeka)',
      sitasi:
        'Tim Gakko Tosho. (2021). Belajar Bersama Temanmu Matematika untuk Sekolah Dasar Kelas V Volume 1 (Penerjemah: Umirijati). Jakarta: Pusat Perbukuan, BSKAP, Kemendikbudristek.',
      relevansi:
        'Acuan utama materi Membandingkan dan Mengurutkan Pecahan, Penjumlahan Pecahan, serta Pengurangan Pecahan Kelas V SD Semester 1.',
    },
    {
      kategori: 'Buku Panduan Guru Resmi Kemendikbudristek',
      sitasi:
        'Tim Gakko Tosho. (2021). Buku Panduan Guru Matematika untuk Sekolah Dasar Kelas V Volume 1. Jakarta: Pusat Perbukuan, BSKAP, Kemendikbudristek.',
      relevansi:
        'Panduan representasi visual pita pecahan, garis bilangan, dan alur didaktis operasi pecahan berpenyebut berbeda.',
    },
    {
      kategori: 'Regulasi Capaian Pembelajaran Kurikulum Merdeka Fase C',
      sitasi:
        'Keputusan Kepala BSKAP Kemendikbudristek Nomor 032/H/KR/2024 tentang Capaian Pembelajaran pada PAUD, Jenjang Pendidikan Dasar, dan Menengah pada Kurikulum Merdeka.',
      relevansi:
        'Landasan Capaian Pembelajaran (CP) Elemen Bilangan Fase C (Kelas V–VI SD) terkait operasi hitung dan pembandingan bilangan pecahan.',
    },
    {
      kategori: 'Buku Teks Pendamping Matematika SD Kelas V',
      sitasi:
        'Hobri, Susanto, Syaifuddin, M., dkk. (2022). Senang Belajar Matematika untuk SD/MI Kelas V. Jakarta: Kementerian Pendidikan dan Kebudayaan.',
      relevansi:
        'Pengayaan soal cerita kontekstual penjumlahan dan pengurangan pecahan biasa serta pecahan campuran.',
    },
    {
      kategori: 'Referensi Pedagogik Project Based Learning (PjBL)',
      sitasi:
        'Thomas, J. W. (2000). A Review of Research on Project-Based Learning. San Rafael, CA: The Autodesk Foundation.',
      relevansi:
        'Landasan enam tahapan Project Based Learning (PjBL) pada proyek "Mini Bakery: Master Chef Pecahan".',
    },
    {
      kategori: 'Teori Representasi Visual Matematika (CPA Approach)',
      sitasi:
        'Bruner, J. S. (1966). Toward a Theory of Instruction. Cambridge, MA: Harvard University Press.',
      relevansi:
        'Landasan tahapan Enaktif–Ikonik–Simbolik dalam penyajian model balok 3D, lingkaran pecahan, dan simbol algoritma pecahan di MATWALL.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="surface-3d-card rounded-2xl px-4 py-3 shrink-0">
        <div className="text-[10px] font-extrabold text-[#0066DD] uppercase tracking-wider">
          Modul F · Daftar Pustaka & Referensi Kurikulum Terverifikasi
        </div>
        <h2 className="text-base sm:text-lg font-extrabold text-[#082545]">
          Referensi Buku Teks Matematika Kelas V SD & Kajian Pedagogik PjBL
        </h2>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch lg:overflow-y-auto">
        {references.map((ref, idx) => (
          <div
            key={idx}
            className="surface-3d-card rounded-2xl p-4 flex flex-col justify-between gap-2"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0066DD]">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>{ref.kategori}</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#082545] leading-snug">
                {ref.sitasi}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 leading-snug">
              <strong>Relevansi Modul:</strong> {ref.relevansi}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// G. PENGEMBANG MODULE (EXACT DEVELOPER IDENTITY — FITS IN 1 SCREEN)
// ============================================================================
export const PengembangModule: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center py-4">
      <div className="surface-3d-card rounded-3xl p-6 sm:p-8 lg:p-10 w-full max-w-4xl">
        <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-8">
          <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-3xl bg-white p-2 flex flex-col items-center justify-center shrink-0 border-[3px] border-[#082545] shadow-[0_6px_0_#082545] overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/d/15UXWQT0qi-Aph08CDQwsPYB1q7xvNG4M"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.src.endsWith('/hero_lp.png')) {
                  img.src = '/hero_lp.png';
                }
              }}
              alt="Ikon Persegi MATWALL"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          <div className="space-y-2.5 text-center md:text-left">
            <div className="text-xs font-extrabold text-[#0066DD] uppercase tracking-wider">
              Profil Pengembang Multimedia Pembelajaran Interaktif (MPI) MATWALL
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082545] tracking-tight">
                MILA AULIA
              </h2>
              <p className="text-base sm:text-lg font-mono font-extrabold text-[#FF7A00]">
                NIM: 501332956
              </p>
              <p className="text-sm sm:text-base font-extrabold text-[#082545]">
                Mahasiswa S2 MAGISTER PENDIDIKAN DASAR
              </p>
              <p className="text-sm sm:text-base font-bold text-slate-700">
                FAKULTAS ILMU PENDIDIKAN DASAR
              </p>
              <p className="text-base sm:text-lg font-extrabold text-[#0066DD]">
                UNIVERSITAS TERBUKA
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2.5 border-t-2 border-slate-200">
              Aplikasi <strong>MATWALL — Mathematics Interactive Wordwall</strong> ini dikembangkan
              sebagai produk penelitian Tesis Magister Pendidikan Dasar untuk pembelajaran
              Matematika Kelas V Sekolah Dasar (Kurikulum Merdeka, Fase C, Semester 1) berbasis
              <strong> Project Based Learning (PjBL)</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HIDDEN ADMIN & DATABASE CONFIGURATION MODAL (OPENED BY DOUBLE-CLICKING LOGO)
// ============================================================================
export const DatabaseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  dbStatus: any;
  onRefreshStatus: () => void;
}> = ({ isOpen, onClose, dbStatus, onRefreshStatus }) => {
  const [appsScriptUrl, setAppsScriptUrl] = useState(dbStatus?.appsScriptUrl || '');
  const [spreadsheetId, setSpreadsheetId] = useState(dbStatus?.spreadsheetId || '');
  const [serviceAccountJson, setServiceAccountJson] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setStatusFeedback('');
    try {
      const { data } = await safeApiRequest('/api/db/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appsScriptUrl,
          spreadsheetId,
          serviceAccountJson: serviceAccountJson || undefined,
        }),
      });
      setStatusFeedback(data?.message || 'Konfigurasi diperbarui.');
      onRefreshStatus();
    } catch {
      setStatusFeedback('Gagal menyimpan konfigurasi koneksi.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    setStatusFeedback('');
    try {
      const { data } = await safeApiRequest('/api/db/sync-all', { method: 'POST' });
      setStatusFeedback(data?.message || 'Proses sinkronisasi selesai.');
      onRefreshStatus();
    } catch {
      setStatusFeedback('Gagal melakukan sinkronisasi ke Google Sheets.');
    } finally {
      setSyncingAll(false);
    }
  };

  const appsScriptCode = `/**
 * ============================================================================
 * CODE.GS — DATABASE GOOGLE SHEETS "Tesis Bismillah_Mathawall"
 * Aplikasi : MATWALL — Mathematics Interactive Wordwall (Kelas V SD)
 * Pengembang: MILA AULIA (NIM: 501332956) — S2 Magister Pendidikan Dasar UT
 * ============================================================================
 * CARA PAKAI:
 * 1. Buka Google Sheets "Tesis Bismillah_Mathawall" -> Extensions -> Apps Script
 * 2. Hapus isi Code.gs lama, lalu tempel (Paste) seluruh kode ini dan klik Save
 * 3. (Opsional) Pilih fungsi "setupDatabaseMatwall" di toolbar atas lalu klik Run
 *    untuk langsung membuat 13 Tab Wajib beserta format tabelnya
 * 4. Klik Deploy -> New deployment -> Select type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (Wajib Anyone agar aplikasi web dapat terhubung)
 * 5. Salin Web App URL (berakhiran /exec) ke menu Admin MATWALL (Klik 2x Logo)
 * ============================================================================
 */

var MANDATORY_TABS = {
  CONFIG: ['config_key', 'config_value', 'description', 'updated_at'],
  SISWA: ['id_siswa', 'nama_siswa', 'kelas', 'asal_sekolah', 'waktu_daftar', 'terakhir_aktif'],
  SESI: ['id_sesi', 'id_siswa', 'nama_siswa', 'kelas', 'asal_sekolah', 'waktu_mulai', 'waktu_terakhir', 'status_sesi'],
  PROGRESS_MATERI: ['id_progress', 'id_siswa', 'nama_siswa', 'topik_id', 'judul_topik', 'persentase_baca', 'latihan_benar', 'latihan_total', 'skor_latihan', 'status_selesai', 'waktu_simpan'],
  LAB_PERCOBAAN: ['id_percobaan', 'id_siswa', 'nama_siswa', 'lab_id', 'nama_lab', 'hipotesis', 'variabel_input', 'hasil_simulasi', 'observasi', 'kesimpulan', 'waktu_simpan'],
  LKPD: ['id_lkpd', 'id_siswa', 'nama_siswa', 'kelas', 'asal_sekolah', 'lab_id', 'nama_lab', 'hipotesis', 'data_tabel_json', 'analisis_observasi', 'kesimpulan_stem', 'status_unduh_pdf', 'waktu_simpan'],
  HASIL_GAME: ['id_hasil_game', 'id_siswa', 'nama_siswa', 'kelas', 'game_id', 'nama_game', 'level_dicapai', 'skor', 'jawaban_benar', 'total_soal', 'durasi_detik', 'waktu_main'],
  BANK_SOAL: ['id_soal', 'nomor_soal', 'topik', 'level_kognitif', 'pertanyaan', 'opsi_a', 'opsi_b', 'opsi_c', 'opsi_d', 'kunci_jawaban', 'pembahasan'],
  HASIL_QUIZ: ['id_hasil_quiz', 'id_siswa', 'nama_siswa', 'kelas', 'asal_sekolah', 'skor_akhir', 'jumlah_benar', 'jumlah_salah', 'total_soal', 'durasi_detik', 'predikat', 'waktu_selesai'],
  JAWABAN_QUIZ: ['id_jawaban', 'id_hasil_quiz', 'id_siswa', 'nama_siswa', 'nomor_soal', 'topik', 'jawaban_siswa', 'kunci_jawaban', 'status_benar', 'skor_butir', 'waktu_simpan'],
  PROYEK_PJBL: ['id_proyek', 'id_siswa', 'nama_siswa', 'kelas', 'asal_sekolah', 'nama_resep', 'porsi_target', 'fase_1_pertanyaan', 'fase_2_rencana', 'fase_3_jadwal', 'fase_4_bahan_json', 'fase_4_perbandingan', 'fase_4_total_penjumlahan', 'fase_4_sisa_pengurangan', 'fase_5_presentasi', 'fase_6_refleksi', 'persentase_selesai', 'waktu_simpan'],
  EVALUASI: ['id_evaluasi', 'id_siswa', 'nama_siswa', 'kelas', 'skor_materi', 'skor_lab', 'skor_game', 'skor_quiz', 'skor_pjbl', 'nilai_akhir_komposit', 'refleksi_siswa', 'umpan_balik_sistem', 'umpan_balik_guru', 'waktu_simpan'],
  EVENT_LOG: ['id_event', 'id_siswa', 'nama_siswa', 'jenis_event', 'modul', 'detail_aktivitas', 'status_sinkronisasi', 'timestamp']
};

var DEFAULT_CONFIG_ROWS = [
  ['APP_NAME', 'MATWALL — Mathematics Interactive Wordwall', 'Nama Aplikasi Multimedia Pembelajaran Interaktif', new Date().toISOString()],
  ['TARGET_KURIKULUM', 'Matematika Kelas V SD — Kurikulum Merdeka Fase C Semester 1', 'Sasaran Kurikulum dan Jenjang Pendidikan', new Date().toISOString()],
  ['MODEL_PEMBELAJARAN', 'Project Based Learning (PjBL)', 'Model dan Pendekatan Pembelajaran', new Date().toISOString()],
  ['TEMA_PROYEK_PJBL', 'Mini Bakery: Master Chef Pecahan', 'Proyek Utama PjBL 6 Tahapan', new Date().toISOString()],
  ['WAHANA_GAME_3D', '1. Tarik Tambang, 2. Open Box, 3. Bridge Builder', '3 Wahana Game Edukasi 3D Interaktif', new Date().toISOString()],
  ['PENGEMBANG_NAMA', 'MILA AULIA', 'Nama Pengembang Tesis', new Date().toISOString()],
  ['PENGEMBANG_NIM', '501332956', 'Nomor Induk Mahasiswa Pengembang', new Date().toISOString()],
  ['PENGEMBANG_INSTITUSI', 'Mahasiswa S2 MAGISTER PENDIDIKAN DASAR - FAKULTAS ILMU PENDIDIKAN DASAR - UNIVERSITAS TERBUKA', 'Program Studi, Fakultas, dan Perguruan Tinggi', new Date().toISOString()],
  ['DATABASE_NAME', 'Tesis Bismillah_Mathawall', 'Nama Spreadsheet Database Utama', new Date().toISOString()]
];

function setupDatabaseMatwall() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureTabsAndHeaders_(ss, MANDATORY_TABS, null, null);
  return 'Berhasil menginisialisasi 13 Tab Wajib pada ' + ss.getName();
}

function ensureTabsAndHeaders_(ss, tabsMap, initialConfig, initialBankSoal) {
  var schema = tabsMap || MANDATORY_TABS;
  Object.keys(schema).forEach(function(tabName) {
    var headers = schema[tabName];
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#0066DD');
      headerRange.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);

      if (tabName === 'CONFIG') {
        if (initialConfig && initialConfig.length > 0) {
          initialConfig.forEach(function(r) {
            sheet.appendRow(headers.map(function(h) { return r[h] || ''; }));
          });
        } else {
          DEFAULT_CONFIG_ROWS.forEach(function(rowArr) {
            sheet.appendRow(rowArr);
          });
        }
      }
      if (tabName === 'BANK_SOAL' && initialBankSoal && initialBankSoal.length > 0) {
        initialBankSoal.forEach(function(r) {
          sheet.appendRow(headers.map(function(h) { return r[h] || ''; }));
        });
      }
    }
  });
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureTabsAndHeaders_(ss, MANDATORY_TABS, null, null);
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    status: 'ACTIVE',
    spreadsheetTitle: ss.getName(),
    spreadsheetId: ss.getId(),
    tabs: Object.keys(MANDATORY_TABS),
    message: 'Web App Google Apps Script MATWALL aktif dan siap menerima sinkronisasi 13 Tab.'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var body = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var tabs = body.mandatoryTabs || MANDATORY_TABS;

    ensureTabsAndHeaders_(ss, tabs, body.initialConfig, body.initialBankSoal);

    if (body.action === 'APPEND_ROWS' && body.tabName) {
      var target = ss.getSheetByName(body.tabName) || ss.insertSheet(body.tabName);
      if (target.getLastRow() === 0 && body.headers) {
        target.appendRow(body.headers);
      }
      var rowsToAppend = body.rows || [];
      rowsToAppend.forEach(function(r) {
        target.appendRow(r);
      });
    }

    if (body.action === 'SYNC_ALL_TABS' && body.data) {
      Object.keys(tabs).forEach(function(tabName) {
        var sheet = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
        var headers = tabs[tabName];
        var rows = body.data[tabName] || [];
        var existing = sheet.getLastRow() > 1
          ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().map(function(x) { return String(x[0]); })
          : [];
        rows.forEach(function(rec) {
          var pk = String(rec[headers[0]] || '');
          if (existing.indexOf(pk) === -1) {
            sheet.appendRow(headers.map(function(h) { return rec[h] !== undefined && rec[h] !== null ? String(rec[h]) : ''; }));
            existing.push(pk);
          }
        });
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      spreadsheetTitle: ss.getName(),
      spreadsheetId: ss.getId(),
      message: 'Berhasil menyinkronkan data ke Google Sheets ' + ss.getName()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: String(err && err.message ? err.message : err)
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#082545]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="surface-3d-card bg-white rounded-3xl max-w-4xl w-full p-6 lg:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0066DD] text-white border-2 border-[#082545] flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-[#0066DD] uppercase">
                Menu Admin & Konfigurasi Sistem Web (Akses Klik 2x Logo)
              </div>
              <h3 className="text-xl font-extrabold text-[#082545]">
                Konfigurasi Database &ldquo;Tesis Bismillah_Mathawall&rdquo;
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-100 text-[#082545] hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Honest Connection Status Banner (Visible ONLY inside Admin Modal) */}
        <div
          className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            dbStatus?.connected
              ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
              : 'bg-amber-50 border-amber-400 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-3">
            {dbStatus?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-extrabold text-sm">
                {dbStatus?.connected
                  ? `TERHUBUNG KE GOOGLE SHEETS (${dbStatus.spreadsheetTitle})`
                  : 'MODE PENYIMPANAN SERVER LOKAL AKTIF (SIAP SINKRONISASI KE GOOGLE SHEETS)'}
              </div>
              <p>{dbStatus?.message}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={syncingAll}
            onClick={handleSyncAll}
            className="surface-3d-btn-primary px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0"
          >
            {syncingAll ? 'Menyinkronkan...' : 'Sinkronkan 13 Tab ke Google Sheets'}
          </button>
        </div>

        {/* 13 Mandatory Tabs Live Record Counts */}
        <div className="space-y-2">
          <div className="text-xs font-extrabold text-[#082545]">
            Status 13 Tab Wajib Database &ldquo;Tesis Bismillah_Mathawall&rdquo;:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 font-mono text-xs tabular-nums">
            {Object.keys(dbStatus?.tabCounts || {}).map((tab) => (
              <div
                key={tab}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <span className="font-bold text-[#082545] truncate">{tab}</span>
                <span className="px-2 py-0.5 rounded bg-[#BAE6FD] text-[#0066DD] font-extrabold">
                  {dbStatus.tabCounts[tab]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSaveConfig} className="space-y-4 border-t-2 border-slate-200 pt-4">
          <div className="text-sm font-extrabold text-[#082545]">
            Pengaturan Kredensial Backend Google Sheets
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Opsi 1 (Rekomendasi): URL Web App Google Apps Script (https://script.google.com/macros/s/.../exec)
            </label>
            <input
              type="url"
              value={appsScriptUrl}
              onChange={(e) => setAppsScriptUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border-2 border-slate-300 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Opsi 2: Google Sheets Spreadsheet ID
              </label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border-2 border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Service Account JSON (Aman di Backend)
              </label>
              <input
                type="password"
                value={serviceAccountJson}
                onChange={(e) => setServiceAccountJson(e.target.value)}
                placeholder='{"type":"service_account","client_email":"..."}'
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border-2 border-slate-300 bg-white"
              />
            </div>
          </div>

          {statusFeedback && (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs font-bold text-[#082545]">
              {statusFeedback}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(appsScriptCode);
                setCopiedScript(true);
                setTimeout(() => setCopiedScript(false), 2500);
              }}
              className="surface-3d-btn-neutral px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>
                {copiedScript
                  ? '✓ Kode Apps Script Disalin!'
                  : 'Salin Kode Google Apps Script (Otomatis 13 Tab)'}
              </span>
            </button>

            <button
              type="submit"
              disabled={savingConfig}
              className="surface-3d-btn-emerald px-5 py-2.5 rounded-xl text-xs font-extrabold"
            >
              {savingConfig ? 'Memverifikasi Koneksi...' : 'Simpan & Uji Koneksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// H. PETUNJUK PENGGUNAAN MODULE & MODAL (PANDUAN SISWA & GURU)
// ============================================================================
const PETUNJUK_STEPS = [
  {
    no: '01',
    title: 'Cara Masuk & Navigasi Perangkat (Laptop & Layar Sentuh IFP)',
    subtitle: 'Dashboard · Eksplorasi · Login 1-Klik',
    icon: MonitorSmartphone,
    accent: 'from-[#0066DD] to-[#0284C7]',
    badgeBg: 'bg-[#E0F2FE] text-[#0066DD] border-[#0066DD]/30',
    points: [
      'Pada halaman awal, gunakan menu Dashboard untuk melihat pengantar dan menu Eksplorasi untuk mencoba peraga balok pecahan interaktif.',
      'Klik tombol hijau "MASUK PEMBELAJARAN (LOGIN)" untuk langsung masuk ke ruang belajar (atau klik "Ubah Nama Siswa / Kelas" jika ingin mengisi nama lengkap).',
      'Mendukung penuh penggunaan di Laptop/PC, Tablet, maupun Papan Interaktif Digital (IFP/PID) di depan kelas dengan tombol ramah sentuhan.',
    ],
  },
  {
    no: '02',
    title: 'Petunjuk Modul Materi Utama & Pop-Up Latihan',
    subtitle: '3 Topik Pecahan · Simulasi Visual · Latihan Pemahaman',
    icon: BookOpen,
    accent: 'from-[#FF7A00] to-[#EA580C]',
    badgeBg: 'bg-[#FFEDD5] text-[#C2410C] border-[#FF7A00]/30',
    points: [
      'Pilih Topik 1 (Membandingkan & Mengurutkan), Topik 2 (Penjumlahan Pecahan), atau Topik 3 (Pengurangan Pecahan) pada baris tombol atas.',
      'Gunakan tombol + dan − pada simulator untuk mengubah pembilang dan penyebut, lalu amati bagaimana KPK menyamakan ukuran potongan balok dan pai 3D.',
      'Klik tombol "Contoh Konkret", "Jembatan KPK", atau "Latihan" di kanan atas untuk membuka jendela pop-up interaktif, lalu klik "Simpan Progress".',
    ],
  },
  {
    no: '03',
    title: 'Petunjuk Virtual Lab 3D & Unduh LKPD (PDF / Excel)',
    subtitle: 'Simulasi Laboratorium 3D · Tabel Percobaan · Ekspor LKPD',
    icon: FlaskConical,
    accent: 'from-[#0D9488] to-[#059669]',
    badgeBg: 'bg-[#CCFBF1] text-[#0F766E] border-[#0D9488]/30',
    points: [
      'Pilih Lab 1 (Tabung Ukur Hidroponik), Lab 2 (Reaktor Campuran), atau Lab 3 (Tangki Irigasi) lalu atur nilai pecahan menggunakan penggeser (slider).',
      'Klik tombol "+ Catat ke Tabel LKPD" untuk merekam hasil percobaan ke dalam tabel pengamatan.',
      'Isi Hipotesis, Observasi, dan Kesimpulan, kemudian klik "Simpan Lab" atau unduh lembar kerja dalam format "LKPD PDF" maupun "Excel".',
    ],
  },
  {
    no: '04',
    title: 'Petunjuk 3 Wahana Game 3D (Tarik Tambang, Open Box & Bridge Builder)',
    subtitle: 'Tarik Tambang · Open Box · Bridge Builder · Mode 1–2 Pemain',
    icon: Gamepad2,
    accent: 'from-[#7C3AED] to-[#6D28D9]',
    badgeBg: 'bg-[#F3E8FF] text-[#6D28D9] border-[#7C3AED]/30',
    points: [
      'Pilih satu dari 3 wahana utama: 1. Tarik Tambang, 2. Open Box, atau 3. Bridge Builder.',
      'Gunakan tombol "1 Pemain" untuk bermain mandiri, atau "Split-Screen 2 Pemain (IFP)" untuk bertanding berdampingan di layar sentuh kelas.',
      'Pada Bridge Builder, pilih karakter Adit atau Naya lalu susun papan pecahan dan rasio untuk menyeberangi jembatan di 12 level tantangan, kemudian klik "Simpan Skor".',
    ],
  },
  {
    no: '05',
    title: 'Petunjuk Proyek PjBL "Mini Bakery: Master Chef Pecahan"',
    subtitle: '6 Tahapan Proyek · Kalkulator Resep Otomatis · Laporan PDF',
    icon: ChefHat,
    accent: 'from-[#E11D48] to-[#BE123C]',
    badgeBg: 'bg-[#FFE4E6] text-[#BE123C] border-[#E11D48]/30',
    points: [
      'Kerjakan secara berurutan mulai dari Tahap 1 (Memahami Masalah), Tahap 2 (Merancang Resep), Tahap 3 (Jadwal Kerja), hingga Tahap 4 (Menghitung Takaran Bahan).',
      'Pada Tahap 4, masukkan takaran bahan pecahan dan persediaan dapur—sistem akan otomatis menghitung perbandingan KPK, total berat adonan, dan sisa bahan.',
      'Lengkapi Tahap 5 (Presentasi) dan Tahap 6 (Refleksi), lalu klik "Simpan Proyek" atau "Unduh PDF" untuk mencetak laporan proyek.',
    ],
  },
  {
    no: '06',
    title: 'Petunjuk Quiz (15 Soal) & Evaluasi Akhir',
    subtitle: 'Evaluasi Formatif · Pembahasan Langkah demi Langkah · Nilai Komposit',
    icon: ClipboardCheck,
    accent: 'from-[#16A34A] to-[#15803D]',
    badgeBg: 'bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/30',
    points: [
      'Pada menu Quiz (15), jawab 15 soal pilihan ganda menggunakan navigasi nomor soal, lalu klik "Kumpulkan & Simpan Hasil Quiz" untuk melihat skor dan pembahasan.',
      'Buka menu Evaluasi untuk melihat rekapitulasi nilai gabungan dari Materi, Virtual Lab 3D, Game, Proyek Mini Bakery, dan Quiz.',
      'Khusus Guru/Peneliti: Ketuk atau klik cepat 2 kali (double-click) pada logo persegi MATHWALL di pojok kiri atas untuk membuka pengaturan sinkronisasi Google Sheets.',
    ],
  },
];

export const PetunjukModule: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Header Banner */}
      <div className="surface-3d-card rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#FFFDF7] via-[#F0F9FF] to-[#FEF9C3]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0066DD] text-white border-2 border-[#082545] shadow-[0_3px_0_#082545] flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-[#0066DD] uppercase tracking-wider">
              Panduan Penggunaan Aplikasi · Siswa & Guru Kelas V SD
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#082545]">
              Petunjuk Lengkap Penggunaan Media Pembelajaran MATWALL
            </h2>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-[#082545] text-xs font-extrabold text-[#082545] self-start sm:self-center">
          <MousePointerClick className="w-4 h-4 text-[#FF7A00]" />
          <span>6 Langkah Mudah Belajar Pecahan</span>
        </div>
      </div>

      {/* 6 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {PETUNJUK_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.no}
              className="surface-3d-card rounded-2xl p-5 bg-white flex flex-col justify-between gap-4 hover:-translate-y-0.5 transition-transform"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${step.accent} text-white border-2 border-[#082545] shadow-[0_3px_0_#082545] flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${step.badgeBg}`}
                  >
                    LANGKAH {step.no}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#082545] leading-snug">
                    {step.title}
                  </h3>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">{step.subtitle}</div>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 leading-relaxed pt-1 border-t border-slate-100">
                  {step.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#BAE6FD] text-[#082545] font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PetunjukModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#082545]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="surface-3d-card bg-[#FFFDF7] rounded-3xl max-w-6xl w-full p-5 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4 sticky top-0 bg-[#FFFDF7] z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0066DD] text-white border-2 border-[#082545] flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-[#0066DD] uppercase">
                Panduan Belajar Interaktif · Kelas V SD
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#082545]">
                Petunjuk Penggunaan Aplikasi MATWALL
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="surface-3d-btn-neutral px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Tutup Petunjuk</span>
          </button>
        </div>

        <PetunjukModule />
      </div>
    </div>
  );
};

