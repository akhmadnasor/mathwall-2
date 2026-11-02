import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'matwall_db.json');
const RUNTIME_CONFIG_FILE = path.join(DATA_DIR, 'sheets_runtime_config.json');

export const SPREADSHEET_TARGET_NAME = 'Tesis Bismillah_Mathawall';

export const MANDATORY_TABS: Record<string, string[]> = {
  CONFIG: ['config_key', 'config_value', 'description', 'updated_at'],
  SISWA: ['id_siswa', 'nama_siswa', 'kelas', 'asal_sekolah', 'waktu_daftar', 'terakhir_aktif'],
  SESI: ['id_sesi', 'id_siswa', 'nama_siswa', 'kelas', 'asal_sekolah', 'waktu_mulai', 'waktu_terakhir', 'status_sesi'],
  PROGRESS_MATERI: [
    'id_progress',
    'id_siswa',
    'nama_siswa',
    'topik_id',
    'judul_topik',
    'persentase_baca',
    'latihan_benar',
    'latihan_total',
    'skor_latihan',
    'status_selesai',
    'waktu_simpan',
  ],
  LAB_PERCOBAAN: [
    'id_percobaan',
    'id_siswa',
    'nama_siswa',
    'lab_id',
    'nama_lab',
    'hipotesis',
    'variabel_input',
    'hasil_simulasi',
    'observasi',
    'kesimpulan',
    'waktu_simpan',
  ],
  LKPD: [
    'id_lkpd',
    'id_siswa',
    'nama_siswa',
    'kelas',
    'asal_sekolah',
    'lab_id',
    'nama_lab',
    'hipotesis',
    'data_tabel_json',
    'analisis_observasi',
    'kesimpulan_stem',
    'status_unduh_pdf',
    'waktu_simpan',
  ],
  HASIL_GAME: [
    'id_hasil_game',
    'id_siswa',
    'nama_siswa',
    'kelas',
    'game_id',
    'nama_game',
    'level_dicapai',
    'skor',
    'jawaban_benar',
    'total_soal',
    'durasi_detik',
    'waktu_main',
  ],
  BANK_SOAL: [
    'id_soal',
    'nomor_soal',
    'topik',
    'level_kognitif',
    'pertanyaan',
    'opsi_a',
    'opsi_b',
    'opsi_c',
    'opsi_d',
    'kunci_jawaban',
    'pembahasan',
  ],
  HASIL_QUIZ: [
    'id_hasil_quiz',
    'id_siswa',
    'nama_siswa',
    'kelas',
    'asal_sekolah',
    'skor_akhir',
    'jumlah_benar',
    'jumlah_salah',
    'total_soal',
    'durasi_detik',
    'predikat',
    'waktu_selesai',
  ],
  JAWABAN_QUIZ: [
    'id_jawaban',
    'id_hasil_quiz',
    'id_siswa',
    'nama_siswa',
    'nomor_soal',
    'topik',
    'jawaban_siswa',
    'kunci_jawaban',
    'status_benar',
    'skor_butir',
    'waktu_simpan',
  ],
  PROYEK_PJBL: [
    'id_proyek',
    'id_siswa',
    'nama_siswa',
    'kelas',
    'asal_sekolah',
    'nama_resep',
    'porsi_target',
    'fase_1_pertanyaan',
    'fase_2_rencana',
    'fase_3_jadwal',
    'fase_4_bahan_json',
    'fase_4_perbandingan',
    'fase_4_total_penjumlahan',
    'fase_4_sisa_pengurangan',
    'fase_5_presentasi',
    'fase_6_refleksi',
    'persentase_selesai',
    'waktu_simpan',
  ],
  EVALUASI: [
    'id_evaluasi',
    'id_siswa',
    'nama_siswa',
    'kelas',
    'skor_materi',
    'skor_lab',
    'skor_game',
    'skor_quiz',
    'skor_pjbl',
    'nilai_akhir_komposit',
    'refleksi_siswa',
    'umpan_balik_sistem',
    'umpan_balik_guru',
    'waktu_simpan',
  ],
  EVENT_LOG: [
    'id_event',
    'id_siswa',
    'nama_siswa',
    'jenis_event',
    'modul',
    'detail_aktivitas',
    'status_sinkronisasi',
    'timestamp',
  ],
};

const INITIAL_CONFIG_ROWS = [
  {
    config_key: 'APP_NAME',
    config_value: 'MATWALL — Mathematics Interactive Wordwall',
    description: 'Nama Aplikasi Multimedia Pembelajaran Interaktif',
    updated_at: new Date().toISOString(),
  },
  {
    config_key: 'TARGET_KURIKULUM',
    config_value: 'Matematika Kelas V SD — Kurikulum Merdeka Fase C Semester 1',
    description: 'Sasaran Kurikulum dan Jenjang Pendidikan',
    updated_at: new Date().toISOString(),
  },
  {
    config_key: 'MODEL_PEMBELAJARAN',
    config_value: 'Project Based Learning (PjBL)',
    description: 'Model dan Pendekatan Pembelajaran',
    updated_at: new Date().toISOString(),
  },
  {
    config_key: 'TEMA_PROYEK_PJBL',
    config_value: 'Mini Bakery: Master Chef Pecahan',
    description: 'Proyek Utama PjBL 6 Tahapan',
    updated_at: new Date().toISOString(),
  },
  {
    config_key: 'WAHANA_GAME_3D',
    config_value: '1. Tarik Tambang, 2. Open Box, 3. Bridge Builder',
    description: '3 Wahana Game Edukasi 3D Interaktif',
    updated_at: new Date().toISOString(),
  },
  {
    config_key: 'PENGEMBANG_NAMA',
    config_value: 'MILA AULIA',
    description: 'Nama Pengembang Tesis',
    updated_at: new Date().toISOString(),
  },
  {
    config_key: 'PENGEMBANG_NIM',
    config_value: '501332956',
    description: 'Nomor Induk Mahasiswa Pengembang',
    updated_at: new Date().toISOString(),
  },
  {
    config_key: 'PENGEMBANG_INSTITUSI',
    config_value: 'Mahasiswa S2 MAGISTER PENDIDIKAN DASAR - FAKULTAS ILMU PENDIDIKAN DASAR - UNIVERSITAS TERBUKA',
    description: 'Program Studi, Fakultas, dan Perguruan Tinggi',
    updated_at: new Date().toISOString(),
  },
  {
    config_key: 'DATABASE_NAME',
    config_value: 'Tesis Bismillah_Mathawall',
    description: 'Nama Spreadsheet Database Utama',
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_BANK_SOAL_ROWS = [
  {
    id_soal: 'SOAL-01',
    nomor_soal: '1',
    topik: 'Membandingkan dan Mengurutkan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Dalam persiapan Festival Resep Pecahan, Siti menyiapkan 3/4 liter santan dan 2/3 liter air kelapa. Tanda perbandingan yang tepat antara 3/4 dan 2/3 adalah ...',
    opsi_a: '3/4 < 2/3',
    opsi_b: '3/4 > 2/3',
    opsi_c: '3/4 = 2/3',
    opsi_d: '3/4 <= 2/3',
    kunci_jawaban: 'B',
    pembahasan: 'Samakan penyebut dengan KPK dari 4 dan 3 yaitu 12. 3/4 = 9/12 dan 2/3 = 8/12. Karena 9/12 > 8/12, maka 3/4 > 2/3.',
  },
  {
    id_soal: 'SOAL-02',
    nomor_soal: '2',
    topik: 'Membandingkan dan Mengurutkan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Perhatikan empat takaran bahan kue berikut: 1/2 kg tepung, 3/8 kg gula pasir, 3/4 kg ubi ungu, dan 5/8 kg santan. Urutan pecahan dari yang terkecil ke terbesar adalah ...',
    opsi_a: '3/8, 1/2, 5/8, 3/4',
    opsi_b: '1/2, 3/8, 3/4, 5/8',
    opsi_c: '3/8, 5/8, 1/2, 3/4',
    opsi_d: '3/4, 5/8, 1/2, 3/8',
    kunci_jawaban: 'A',
    pembahasan: 'Ubah ke penyebut 8: 1/2 = 4/8; 3/8 tetap 3/8; 3/4 = 6/8; 5/8 tetap 5/8. Urutan dari terkecil: 3/8, 4/8 (1/2), 5/8, 6/8 (3/4).',
  },
  {
    id_soal: 'SOAL-03',
    nomor_soal: '3',
    topik: 'Membandingkan dan Mengurutkan Pecahan',
    level_kognitif: 'C2 (Pemahaman)',
    pertanyaan: 'Pecahan di bawah ini yang nilainya lebih besar dari 3/5 tetapi lebih kecil dari 4/5 adalah ...',
    opsi_a: '5/10',
    opsi_b: '7/10',
    opsi_c: '8/10',
    opsi_d: '9/10',
    kunci_jawaban: 'B',
    pembahasan: 'Ubah 3/5 dan 4/5 ke penyebut 10: 3/5 = 6/10 dan 4/5 = 8/10. Pecahan di antara 6/10 dan 8/10 adalah 7/10.',
  },
  {
    id_soal: 'SOAL-04',
    nomor_soal: '4',
    topik: 'Membandingkan dan Mengurutkan Pecahan',
    level_kognitif: 'C4 (Analisis - HOTS)',
    pertanyaan: 'Empat kelompok siswa membuat adonan klepon. Kelompok A memakai 5/6 kg tepung ketan, Kelompok B memakai 7/9 kg, Kelompok C memakai 2/3 kg, dan Kelompok D memakai 13/18 kg. Kelompok yang menggunakan tepung ketan paling banyak adalah ...',
    opsi_a: 'Kelompok A',
    opsi_b: 'Kelompok B',
    opsi_c: 'Kelompok C',
    opsi_d: 'Kelompok D',
    kunci_jawaban: 'A',
    pembahasan: 'KPK dari 6, 9, 3, dan 18 adalah 18. Kelompok A = 5/6 = 15/18; Kelompok B = 7/9 = 14/18; Kelompok C = 2/3 = 12/18; Kelompok D = 13/18. Nilai terbesar adalah 15/18 (Kelompok A).',
  },
  {
    id_soal: 'SOAL-05',
    nomor_soal: '5',
    topik: 'Membandingkan dan Mengurutkan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Manakah pasangan pecahan berikut yang merupakan pecahan senilai (ekuivalen)?',
    opsi_a: '4/6 dan 8/10',
    opsi_b: '6/9 dan 10/15',
    opsi_c: '3/7 dan 6/12',
    opsi_d: '5/8 dan 15/20',
    kunci_jawaban: 'B',
    pembahasan: 'Sederhanakan 6/9 (dibagi 3) = 2/3, dan 10/15 (dibagi 5) = 2/3. Keduanya bernilai 2/3 sehingga senilai.',
  },
  {
    id_soal: 'SOAL-06',
    nomor_soal: '6',
    topik: 'Penjumlahan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Hasil penjumlahan dari 2/5 + 3/10 dalam bentuk paling sederhana adalah ...',
    opsi_a: '5/15',
    opsi_b: '1/2',
    opsi_c: '7/10',
    opsi_d: '4/5',
    kunci_jawaban: 'C',
    pembahasan: 'Samakan penyebut menjadi 10: 2/5 = 4/10. Maka 4/10 + 3/10 = 7/10.',
  },
  {
    id_soal: 'SOAL-07',
    nomor_soal: '7',
    topik: 'Penjumlahan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Untuk membuat es buah, Rina mencampurkan 3/4 liter sari jeruk dan 5/6 liter air kelapa muda. Total volume campuran minuman tersebut adalah ...',
    opsi_a: '1 5/12 liter',
    opsi_b: '1 7/12 liter',
    opsi_c: '8/10 liter',
    opsi_d: '1 9/12 liter',
    kunci_jawaban: 'B',
    pembahasan: 'KPK dari 4 dan 6 adalah 12. 3/4 = 9/12 dan 5/6 = 10/12. Jumlah = 9/12 + 10/12 = 19/12 = 1 7/12 liter.',
  },
  {
    id_soal: 'SOAL-08',
    nomor_soal: '8',
    topik: 'Penjumlahan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Hasil dari penjumlahan pecahan campuran 1 1/3 + 2 1/4 adalah ...',
    opsi_a: '3 2/7',
    opsi_b: '3 5/12',
    opsi_c: '3 7/12',
    opsi_d: '4 1/12',
    kunci_jawaban: 'C',
    pembahasan: 'Jumlahkan bilangan bulat: 1 + 2 = 3. Jumlahkan pecahan: 1/3 + 1/4 = 4/12 + 3/12 = 7/12. Total = 3 7/12.',
  },
  {
    id_soal: 'SOAL-09',
    nomor_soal: '9',
    topik: 'Penjumlahan Bilangan Pecahan',
    level_kognitif: 'C4 (Analisis - HOTS)',
    pertanyaan: 'Dalam proyek resep sehat, Budi menimbang 1/2 kg tepung beras, 3/8 kg tepung tapioka, dan 1/4 kg gula aren. Berat seluruh bahan yang ditimbang Budi adalah ...',
    opsi_a: '1 1/8 kg',
    opsi_b: '1 3/8 kg',
    opsi_c: '7/8 kg',
    opsi_d: '1 1/4 kg',
    kunci_jawaban: 'A',
    pembahasan: 'Samakan penyebut menjadi 8: 1/2 = 4/8; 3/8 = 3/8; 1/4 = 2/8. Jumlah = (4 + 3 + 2)/8 = 9/8 = 1 1/8 kg.',
  },
  {
    id_soal: 'SOAL-10',
    nomor_soal: '10',
    topik: 'Penjumlahan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Hasil dari 5/12 + 3/8 adalah ...',
    opsi_a: '8/20',
    opsi_b: '19/24',
    opsi_c: '17/24',
    opsi_d: '21/24',
    kunci_jawaban: 'B',
    pembahasan: 'KPK dari 12 dan 8 adalah 24. 5/12 = 10/24 dan 3/8 = 9/24. Maka 10/24 + 9/24 = 19/24.',
  },
  {
    id_soal: 'SOAL-11',
    nomor_soal: '11',
    topik: 'Pengurangan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Hasil pengurangan dari 7/8 - 1/4 adalah ...',
    opsi_a: '6/4',
    opsi_b: '5/8',
    opsi_c: '3/8',
    opsi_d: '3/4',
    kunci_jawaban: 'B',
    pembahasan: 'Ubah 1/4 menjadi 2/8. Maka 7/8 - 2/8 = 5/8.',
  },
  {
    id_soal: 'SOAL-12',
    nomor_soal: '12',
    topik: 'Pengurangan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Ibu memiliki persediaan 5/6 kg gula pasir. Sebanyak 3/9 kg digunakan untuk membuat sirup pandan. Sisa gula pasir Ibu sekarang adalah ...',
    opsi_a: '1/2 kg',
    opsi_b: '2/3 kg',
    opsi_c: '5/18 kg',
    opsi_d: '7/18 kg',
    kunci_jawaban: 'A',
    pembahasan: 'Sederhanakan 3/9 menjadi 1/3 = 2/6. Maka 5/6 - 2/6 = 3/6 = 1/2 kg.',
  },
  {
    id_soal: 'SOAL-13',
    nomor_soal: '13',
    topik: 'Pengurangan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Hasil dari pengurangan pecahan campuran 3 3/4 - 1 2/5 adalah ...',
    opsi_a: '2 1/20',
    opsi_b: '2 7/20',
    opsi_c: '2 9/20',
    opsi_d: '1 7/20',
    kunci_jawaban: 'B',
    pembahasan: 'Kurangkan bilangan bulat: 3 - 1 = 2. Kurangkan pecahan: 3/4 - 2/5 = 15/20 - 8/20 = 7/20. Hasilnya adalah 2 7/20.',
  },
  {
    id_soal: 'SOAL-14',
    nomor_soal: '14',
    topik: 'Pengurangan Bilangan Pecahan',
    level_kognitif: 'C4 (Analisis - HOTS)',
    pertanyaan: 'Tangki laboratorium hidroponik berisi 4 1/6 liter larutan nutrisi. Setelah dialirkan ke tanaman sebanyak 1 2/3 liter, sisa larutan di dalam tangki adalah ...',
    opsi_a: '2 1/2 liter',
    opsi_b: '2 2/6 liter',
    opsi_c: '3 1/2 liter',
    opsi_d: '2 1/6 liter',
    kunci_jawaban: 'A',
    pembahasan: 'Ubah ke pecahan biasa: 4 1/6 = 25/6 dan 1 2/3 = 5/3 = 10/6. Kurangkan: 25/6 - 10/6 = 15/6 = 5/2 = 2 1/2 liter.',
  },
  {
    id_soal: 'SOAL-15',
    nomor_soal: '15',
    topik: 'Pengurangan Bilangan Pecahan',
    level_kognitif: 'C4 (Analisis - HOTS)',
    pertanyaan: 'Dalam Festival Resep Pecahan, kelompok Dinda menyiapkan 2 1/2 liter jus mangga. Pada sesi pertama terjual 3/4 liter dan sesi kedua terjual 7/8 liter. Sisa jus mangga kelompok Dinda adalah ...',
    opsi_a: '5/8 liter',
    opsi_b: '7/8 liter',
    opsi_c: '3/4 liter',
    opsi_d: '1 1/8 liter',
    kunci_jawaban: 'B',
    pembahasan: 'Samakan penyebut ke 8: 2 1/2 = 5/2 = 20/8. Terjual: 3/4 = 6/8 dan 7/8. Sisa = 20/8 - 6/8 - 7/8 = 7/8 liter.',
  },
];

interface LocalDatabase {
  CONFIG: Record<string, string>[];
  SISWA: Record<string, string>[];
  SESI: Record<string, string>[];
  PROGRESS_MATERI: Record<string, string>[];
  LAB_PERCOBAAN: Record<string, string>[];
  LKPD: Record<string, string>[];
  HASIL_GAME: Record<string, string>[];
  BANK_SOAL: Record<string, string>[];
  HASIL_QUIZ: Record<string, string>[];
  JAWABAN_QUIZ: Record<string, string>[];
  PROYEK_PJBL: Record<string, string>[];
  EVALUASI: Record<string, string>[];
  EVENT_LOG: Record<string, string>[];
}

interface RuntimeSheetsConfig {
  appsScriptUrl?: string;
  spreadsheetId?: string;
  serviceAccountEmail?: string;
  privateKey?: string;
  serviceAccountJson?: string;
  lastVerifiedAt?: string;
  lastError?: string;
  connectedTitle?: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadRuntimeConfig(): RuntimeSheetsConfig {
  ensureDataDir();
  let fileCfg: RuntimeSheetsConfig = {};
  if (fs.existsSync(RUNTIME_CONFIG_FILE)) {
    try {
      fileCfg = JSON.parse(fs.readFileSync(RUNTIME_CONFIG_FILE, 'utf-8'));
    } catch {
      fileCfg = {};
    }
  }
  return {
    appsScriptUrl: fileCfg.appsScriptUrl || process.env.GOOGLE_APPS_SCRIPT_URL || '',
    spreadsheetId: fileCfg.spreadsheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '',
    serviceAccountEmail: fileCfg.serviceAccountEmail || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    privateKey: fileCfg.privateKey || process.env.GOOGLE_PRIVATE_KEY || '',
    serviceAccountJson: fileCfg.serviceAccountJson || process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '',
    lastVerifiedAt: fileCfg.lastVerifiedAt,
    lastError: fileCfg.lastError,
    connectedTitle: fileCfg.connectedTitle,
  };
}

function saveRuntimeConfig(cfg: RuntimeSheetsConfig) {
  ensureDataDir();
  fs.writeFileSync(RUNTIME_CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
}

function loadLocalDb(): LocalDatabase {
  ensureDataDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      for (const tab of Object.keys(MANDATORY_TABS)) {
        if (!Array.isArray(parsed[tab])) {
          parsed[tab] = [];
        }
      }
      if (parsed.CONFIG.length === 0) parsed.CONFIG = [...INITIAL_CONFIG_ROWS];
      if (parsed.BANK_SOAL.length === 0) parsed.BANK_SOAL = [...INITIAL_BANK_SOAL_ROWS];
      return parsed;
    } catch {
      // fallback to fresh structure
    }
  }
  const initialDb: LocalDatabase = {
    CONFIG: [...INITIAL_CONFIG_ROWS],
    SISWA: [],
    SESI: [],
    PROGRESS_MATERI: [],
    LAB_PERCOBAAN: [],
    LKPD: [],
    HASIL_GAME: [],
    BANK_SOAL: [...INITIAL_BANK_SOAL_ROWS],
    HASIL_QUIZ: [],
    JAWABAN_QUIZ: [],
    PROYEK_PJBL: [],
    EVALUASI: [],
    EVENT_LOG: [],
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  return initialDb;
}

function saveLocalDb(db: LocalDatabase) {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Google Sheets Service Account client helper
async function getSheetsClient(cfg: RuntimeSheetsConfig) {
  let clientEmail = cfg.serviceAccountEmail;
  let privateKey = cfg.privateKey;

  if (cfg.serviceAccountJson) {
    try {
      const parsed = JSON.parse(cfg.serviceAccountJson);
      clientEmail = parsed.client_email || clientEmail;
      privateKey = parsed.private_key || privateKey;
    } catch {
      // ignore invalid JSON
    }
  }

  if (!clientEmail || !privateKey) {
    return null;
  }

  const { google } = await import('googleapis');
  const formattedKey = privateKey.replace(/\\n/g, '\n');
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: formattedKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  let spreadsheetId = cfg.spreadsheetId;
  if (!spreadsheetId) {
    // Try finding "Tesis Bismillah_Mathawall" via Drive API
    try {
      const searchRes = await drive.files.list({
        q: `name = '${SPREADSHEET_TARGET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
        fields: 'files(id, name)',
        pageSize: 5,
      });
      if (searchRes.data.files && searchRes.data.files.length > 0 && searchRes.data.files[0].id) {
        spreadsheetId = searchRes.data.files[0].id;
        cfg.spreadsheetId = spreadsheetId;
        saveRuntimeConfig(cfg);
      }
    } catch {
      // Cannot search Drive without spreadsheetId
    }
  }

  if (!spreadsheetId) {
    return null;
  }

  return { sheets, spreadsheetId };
}

// Ensure all 13 mandatory tabs and headers exist in Google Sheets without deleting existing data
async function safeParseAppsScriptResponse(res: Response): Promise<{
  isJson: boolean;
  data: any;
  rawText: string;
}> {
  const rawText = await res.text();
  const trimmed = rawText.trim();
  if (!trimmed || trimmed.startsWith('<')) {
    return { isJson: false, data: null, rawText: trimmed };
  }
  try {
    return { isJson: true, data: JSON.parse(trimmed), rawText: trimmed };
  } catch {
    return { isJson: false, data: null, rawText: trimmed };
  }
}

async function ensureSheetsStructure(): Promise<{
  connected: boolean;
  mode: 'SERVICE_ACCOUNT' | 'APPS_SCRIPT' | 'UNCONFIGURED';
  spreadsheetTitle: string;
  spreadsheetId?: string;
  message: string;
  tabsVerified: string[];
}> {
  const cfg = loadRuntimeConfig();

  // Mode 1: Google Apps Script Web App URL
  if (cfg.appsScriptUrl && cfg.appsScriptUrl.startsWith('https://script.google.com/')) {
    try {
      const res = await fetch(cfg.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ENSURE_STRUCTURE',
          spreadsheetName: SPREADSHEET_TARGET_NAME,
          mandatoryTabs: MANDATORY_TABS,
          initialConfig: INITIAL_CONFIG_ROWS,
          initialBankSoal: INITIAL_BANK_SOAL_ROWS,
        }),
      });
      const parsed = await safeParseAppsScriptResponse(res);
      if (res.ok && parsed.isJson && parsed.data && parsed.data.ok) {
        const data = parsed.data;
        cfg.lastVerifiedAt = new Date().toISOString();
        cfg.lastError = undefined;
        cfg.connectedTitle = data.spreadsheetTitle || SPREADSHEET_TARGET_NAME;
        saveRuntimeConfig(cfg);
        return {
          connected: true,
          mode: 'APPS_SCRIPT',
          spreadsheetTitle: cfg.connectedTitle || SPREADSHEET_TARGET_NAME,
          spreadsheetId: data.spreadsheetId || cfg.spreadsheetId,
          message: `Terhubung langsung ke Google Sheets "${cfg.connectedTitle || SPREADSHEET_TARGET_NAME}" melalui Google Apps Script Web App (13 Tab Aktif).`,
          tabsVerified: Object.keys(MANDATORY_TABS),
        };
      }
      cfg.lastError = parsed.rawText.startsWith('<')
        ? 'URL Google Apps Script mengembalikan halaman HTML. Pastikan saat Deploy dipilih "Who has access: Anyone" dan gunakan URL berakhiran /exec.'
        : `Apps Script merespons status ${res.status}: ${parsed.rawText.slice(0, 140)}`;
      saveRuntimeConfig(cfg);
    } catch (err: any) {
      cfg.lastError = `Gagal menghubungi Google Apps Script URL: ${err?.message || String(err)}`;
      saveRuntimeConfig(cfg);
    }
  }

  // Mode 2: Google Service Account + Sheets API v4
  try {
    const client = await getSheetsClient(cfg);
    if (client) {
      const { sheets, spreadsheetId } = client;
      const meta = await sheets.spreadsheets.get({ spreadsheetId });
      const title = meta.data.properties?.title || SPREADSHEET_TARGET_NAME;
      const existingSheets = new Set(
        (meta.data.sheets || []).map((s) => s.properties?.title || '')
      );

      const addSheetRequests: any[] = [];
      for (const tabName of Object.keys(MANDATORY_TABS)) {
        if (!existingSheets.has(tabName)) {
          addSheetRequests.push({
            addSheet: {
              properties: { title: tabName },
            },
          });
        }
      }

      if (addSheetRequests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: { requests: addSheetRequests },
        });
      }

      // Check headers for each mandatory tab without deleting existing rows
      for (const [tabName, headers] of Object.entries(MANDATORY_TABS)) {
        const rangeRes = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${tabName}!A1:Z2`,
        });
        const rows = rangeRes.data.values || [];
        if (rows.length === 0) {
          // Tab is completely empty: write headers
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${tabName}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [headers] },
          });

          // Seed CONFIG and BANK_SOAL if newly created and empty
          if (tabName === 'CONFIG') {
            const configValues = INITIAL_CONFIG_ROWS.map((r) =>
              headers.map((h) => (r as Record<string, string>)[h] || '')
            );
            await sheets.spreadsheets.values.append({
              spreadsheetId,
              range: `${tabName}!A2`,
              valueInputOption: 'USER_ENTERED',
              requestBody: { values: configValues },
            });
          } else if (tabName === 'BANK_SOAL') {
            const soalValues = INITIAL_BANK_SOAL_ROWS.map((r) =>
              headers.map((h) => (r as Record<string, string>)[h] || '')
            );
            await sheets.spreadsheets.values.append({
              spreadsheetId,
              range: `${tabName}!A2`,
              valueInputOption: 'USER_ENTERED',
              requestBody: { values: soalValues },
            });
          }
        }
      }

      cfg.lastVerifiedAt = new Date().toISOString();
      cfg.lastError = undefined;
      cfg.connectedTitle = title;
      saveRuntimeConfig(cfg);

      return {
        connected: true,
        mode: 'SERVICE_ACCOUNT',
        spreadsheetTitle: title,
        spreadsheetId,
        message: `Terhubung langsung ke Google Sheets "${title}" via Google Sheets API v4 (13 Tab Terverifikasi).`,
        tabsVerified: Object.keys(MANDATORY_TABS),
      };
    }
  } catch (err: any) {
    cfg.lastError = `Google Sheets API Error: ${err?.message || String(err)}`;
    saveRuntimeConfig(cfg);
  }

  return {
    connected: false,
    mode: 'UNCONFIGURED',
    spreadsheetTitle: SPREADSHEET_TARGET_NAME,
    spreadsheetId: cfg.spreadsheetId || undefined,
    message: cfg.lastError
      ? `Koneksi Google Sheets gagal: ${cfg.lastError}. Data disimpan di penyimpanan persisten server dan siap disinkronkan.`
      : `Kredensial Google Sheets ("${SPREADSHEET_TARGET_NAME}") belum dikonfigurasi. Data tersimpan aman di server lokal dan dapat disinkronkan ke Google Sheets kapan saja.`,
    tabsVerified: Object.keys(MANDATORY_TABS),
  };
}

// Append one or more records to a specific tab in Google Sheets + Local Server DB
async function appendRecordsToTab(
  tabName: keyof LocalDatabase,
  records: Record<string, string>[]
): Promise<{
  savedLocal: boolean;
  savedToGoogleSheets: boolean;
  sheetsStatusMessage: string;
}> {
  const db = loadLocalDb();
  const headers = MANDATORY_TABS[tabName];

  for (const rec of records) {
    const normalized: Record<string, string> = {};
    for (const h of headers) {
      normalized[h] = rec[h] !== undefined && rec[h] !== null ? String(rec[h]) : '';
    }
    db[tabName].push(normalized);
  }
  saveLocalDb(db);

  const cfg = loadRuntimeConfig();

  // Try Mode 1: Apps Script Web App
  if (cfg.appsScriptUrl && cfg.appsScriptUrl.startsWith('https://script.google.com/')) {
    try {
      const rowsMatrix = records.map((rec) =>
        headers.map((h) => (rec[h] !== undefined && rec[h] !== null ? String(rec[h]) : ''))
      );
      const res = await fetch(cfg.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPEND_ROWS',
          tabName,
          headers,
          rows: rowsMatrix,
        }),
      });
      const parsed = await safeParseAppsScriptResponse(res);
      if (res.ok && parsed.isJson && parsed.data && parsed.data.ok) {
        cfg.lastVerifiedAt = new Date().toISOString();
        cfg.lastError = undefined;
        saveRuntimeConfig(cfg);
        return {
          savedLocal: true,
          savedToGoogleSheets: true,
          sheetsStatusMessage: `Berhasil disimpan ke Google Sheets "${SPREADSHEET_TARGET_NAME}" pada tab ${tabName}.`,
        };
      }
    } catch (err: any) {
      cfg.lastError = err?.message || String(err);
      saveRuntimeConfig(cfg);
    }
  }

  // Try Mode 2: Google Sheets API v4
  try {
    const client = await getSheetsClient(cfg);
    if (client) {
      const { sheets, spreadsheetId } = client;
      const rowsMatrix = records.map((rec) =>
        headers.map((h) => (rec[h] !== undefined && rec[h] !== null ? String(rec[h]) : ''))
      );
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${tabName}!A1`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: rowsMatrix },
      });
      cfg.lastVerifiedAt = new Date().toISOString();
      cfg.lastError = undefined;
      saveRuntimeConfig(cfg);
      return {
        savedLocal: true,
        savedToGoogleSheets: true,
        sheetsStatusMessage: `Berhasil disimpan ke Google Sheets "${SPREADSHEET_TARGET_NAME}" pada tab ${tabName}.`,
      };
    }
  } catch (err: any) {
    cfg.lastError = err?.message || String(err);
    saveRuntimeConfig(cfg);
  }

  return {
    savedLocal: true,
    savedToGoogleSheets: false,
    sheetsStatusMessage: `Tersimpan di database server lokal (Tab ${tabName}). Hubungkan Google Sheets "${SPREADSHEET_TARGET_NAME}" untuk sinkronisasi cloud otomatis.`,
  };
}

async function logEvent(
  id_siswa: string,
  nama_siswa: string,
  jenis_event: string,
  modul: string,
  detail_aktivitas: string,
  synced: boolean
) {
  await appendRecordsToTab('EVENT_LOG', [
    {
      id_event: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      id_siswa,
      nama_siswa,
      jenis_event,
      modul,
      detail_aktivitas,
      status_sinkronisasi: synced ? 'TERSIMPAN_GOOGLE_SHEETS' : 'TERSIMPAN_LOKAL_ANTREAN',
      timestamp: new Date().toISOString(),
    },
  ]);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // Initialize local DB & verify Google Sheets structure on boot
  loadLocalDb();

  // 1. GET /api/db/status — Returns real, non-simulated Google Sheets & Local DB status
  app.get('/api/db/status', async (_req, res) => {
    try {
      const status = await ensureSheetsStructure();
      const db = loadLocalDb();
      const tabCounts: Record<string, number> = {};
      for (const tab of Object.keys(MANDATORY_TABS)) {
        tabCounts[tab] = db[tab as keyof LocalDatabase]?.length || 0;
      }
      const cfg = loadRuntimeConfig();
      res.json({
        ...status,
        targetSpreadsheetName: SPREADSHEET_TARGET_NAME,
        mandatoryTabs: MANDATORY_TABS,
        tabCounts,
        hasAppsScriptUrl: Boolean(cfg.appsScriptUrl),
        hasServiceAccount: Boolean(
          (cfg.serviceAccountEmail && cfg.privateKey) || cfg.serviceAccountJson
        ),
        spreadsheetId: cfg.spreadsheetId || '',
        lastVerifiedAt: cfg.lastVerifiedAt || null,
      });
    } catch (err: any) {
      res.status(500).json({
        connected: false,
        mode: 'UNCONFIGURED',
        message: err?.message || 'Gagal memeriksa status database',
      });
    }
  });

  // 2. POST /api/db/configure — Configure Google Apps Script URL or Service Account at runtime
  app.post('/api/db/configure', async (req, res) => {
    try {
      const {
        appsScriptUrl,
        spreadsheetId,
        serviceAccountEmail,
        privateKey,
        serviceAccountJson,
      } = req.body || {};

      const current = loadRuntimeConfig();
      const updated: RuntimeSheetsConfig = {
        ...current,
        appsScriptUrl: appsScriptUrl !== undefined ? String(appsScriptUrl).trim() : current.appsScriptUrl,
        spreadsheetId: spreadsheetId !== undefined ? String(spreadsheetId).trim() : current.spreadsheetId,
        serviceAccountEmail:
          serviceAccountEmail !== undefined ? String(serviceAccountEmail).trim() : current.serviceAccountEmail,
        privateKey: privateKey !== undefined ? String(privateKey).trim() : current.privateKey,
        serviceAccountJson:
          serviceAccountJson !== undefined ? String(serviceAccountJson).trim() : current.serviceAccountJson,
      };
      saveRuntimeConfig(updated);

      const verification = await ensureSheetsStructure();
      res.json(verification);
    } catch (err: any) {
      res.status(500).json({
        connected: false,
        message: `Gagal menyimpan konfigurasi: ${err?.message || String(err)}`,
      });
    }
  });

  // 3. POST /api/db/sync-all — Push all local records to Google Sheets without deleting existing rows
  app.post('/api/db/sync-all', async (_req, res) => {
    try {
      const structure = await ensureSheetsStructure();
      if (!structure.connected) {
        return res.status(400).json({
          ok: false,
          connected: false,
          message: structure.message,
        });
      }

      const db = loadLocalDb();
      const cfg = loadRuntimeConfig();
      const syncedCounts: Record<string, number> = {};

      if (structure.mode === 'APPS_SCRIPT' && cfg.appsScriptUrl) {
        const resp = await fetch(cfg.appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SYNC_ALL_TABS',
            spreadsheetName: SPREADSHEET_TARGET_NAME,
            mandatoryTabs: MANDATORY_TABS,
            data: db,
          }),
        });
        const parsed = await safeParseAppsScriptResponse(resp);
        const result = parsed.data;
        return res.json({
          ok: Boolean(result?.ok),
          connected: Boolean(result?.ok),
          message:
            result?.message ||
            (parsed.isJson
              ? `Seluruh data pada 13 tab berhasil disinkronkan ke Google Sheets "${SPREADSHEET_TARGET_NAME}".`
              : 'Respons Google Apps Script bukan JSON valid. Pastikan izin Web App disetel ke Anyone.'),
        });
      }

      const client = await getSheetsClient(cfg);
      if (client) {
        const { sheets, spreadsheetId } = client;
        for (const [tabName, headers] of Object.entries(MANDATORY_TABS)) {
          const rows = db[tabName as keyof LocalDatabase] || [];
          if (rows.length === 0) {
            syncedCounts[tabName] = 0;
            continue;
          }
          const existingRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${tabName}!A2:A5000`,
          });
          const existingIds = new Set(
            (existingRes.data.values || []).map((r) => String(r[0] || '').trim())
          );
          const newRows = rows.filter((r) => !existingIds.has(String(r[headers[0]] || '').trim()));
          if (newRows.length > 0) {
            const valuesMatrix = newRows.map((r) => headers.map((h) => r[h] || ''));
            await sheets.spreadsheets.values.append({
              spreadsheetId,
              range: `${tabName}!A1`,
              valueInputOption: 'USER_ENTERED',
              insertDataOption: 'INSERT_ROWS',
              requestBody: { values: valuesMatrix },
            });
          }
          syncedCounts[tabName] = newRows.length;
        }
        return res.json({
          ok: true,
          connected: true,
          syncedCounts,
          message: `Berhasil menyinkronkan data ke Google Sheets "${SPREADSHEET_TARGET_NAME}" tanpa menghapus data lama.`,
        });
      }

      return res.status(400).json({
        ok: false,
        connected: false,
        message: 'Tidak dapat menginisialisasi klien Google Sheets.',
      });
    } catch (err: any) {
      res.status(500).json({
        ok: false,
        message: `Gagal sinkronisasi: ${err?.message || String(err)}`,
      });
    }
  });

  // 4. GET /api/db/records — Inspect all tabs and records (for Evaluasi, History, & Database Inspector)
  app.get('/api/db/records', (req, res) => {
    const db = loadLocalDb();
    const id_siswa = req.query.id_siswa ? String(req.query.id_siswa) : '';
    if (!id_siswa) {
      return res.json({ ok: true, db });
    }
    res.json({
      ok: true,
      siswa: db.SISWA.filter((s) => s.id_siswa === id_siswa),
      progressMateri: db.PROGRESS_MATERI.filter((p) => p.id_siswa === id_siswa),
      labPercobaan: db.LAB_PERCOBAAN.filter((l) => l.id_siswa === id_siswa),
      lkpd: db.LKPD.filter((l) => l.id_siswa === id_siswa),
      hasilGame: db.HASIL_GAME.filter((g) => g.id_siswa === id_siswa),
      hasilQuiz: db.HASIL_QUIZ.filter((q) => q.id_siswa === id_siswa),
      jawabanQuiz: db.JAWABAN_QUIZ.filter((j) => j.id_siswa === id_siswa),
      proyekPjbl: db.PROYEK_PJBL.filter((p) => p.id_siswa === id_siswa),
      evaluasi: db.EVALUASI.filter((e) => e.id_siswa === id_siswa),
      bankSoal: db.BANK_SOAL,
    });
  });

  // 5. POST /api/siswa/masuk — Guest Student Entry (Nama Siswa, Kelas, Asal Sekolah)
  app.post('/api/siswa/masuk', async (req, res) => {
    try {
      const rawBody = req.body || {};
      const cleanNama = String(rawBody.nama_siswa || 'Siswa Kelas V SD').trim() || 'Siswa Kelas V SD';
      const cleanKelas = String(rawBody.kelas || 'Kelas V-A').trim() || 'Kelas V-A';
      const cleanSekolah =
        String(rawBody.asal_sekolah || 'SD Negeri Merdeka').trim() || 'SD Negeri Merdeka';

      const now = new Date().toISOString();
      const db = loadLocalDb();
      let existing = db.SISWA.find(
        (s) =>
          s.nama_siswa.toLowerCase() === cleanNama.toLowerCase() &&
          s.kelas.toLowerCase() === cleanKelas.toLowerCase() &&
          s.asal_sekolah.toLowerCase() === cleanSekolah.toLowerCase()
      );

      let id_siswa = existing?.id_siswa || `SISWA-${Date.now().toString().slice(-6)}`;
      const siswaRecord = {
        id_siswa,
        nama_siswa: cleanNama,
        kelas: cleanKelas,
        asal_sekolah: cleanSekolah,
        waktu_daftar: existing?.waktu_daftar || now,
        terakhir_aktif: now,
      };

      const saveSiswaResult = await appendRecordsToTab('SISWA', [siswaRecord]);

      const sesiRecord = {
        id_sesi: `SESI-${Date.now().toString().slice(-6)}`,
        id_siswa,
        nama_siswa: siswaRecord.nama_siswa,
        kelas: siswaRecord.kelas,
        asal_sekolah: siswaRecord.asal_sekolah,
        waktu_mulai: now,
        waktu_terakhir: now,
        status_sesi: 'AKTIF',
      };
      await appendRecordsToTab('SESI', [sesiRecord]);

      await logEvent(
        id_siswa,
        siswaRecord.nama_siswa,
        'LOGIN_TAMU_MPI',
        'LANDING_PAGE',
        `Siswa ${siswaRecord.nama_siswa} (${siswaRecord.kelas} - ${siswaRecord.asal_sekolah}) masuk ke MATWALL.`,
        saveSiswaResult.savedToGoogleSheets
      );

      res.json({
        ok: true,
        siswa: siswaRecord,
        sesi: sesiRecord,
        ...saveSiswaResult,
      });
    } catch (err: any) {
      res.status(500).json({
        ok: false,
        message: err?.message || 'Gagal menyimpan identitas siswa.',
      });
    }
  });

  // 6. POST /api/materi/progress — Save PROGRESS_MATERI
  app.post('/api/materi/progress', async (req, res) => {
    try {
      const {
        id_siswa,
        nama_siswa,
        topik_id,
        judul_topik,
        persentase_baca,
        latihan_benar,
        latihan_total,
        skor_latihan,
        status_selesai,
      } = req.body || {};

      const record = {
        id_progress: `PROG-${Date.now().toString().slice(-6)}`,
        id_siswa: String(id_siswa || 'TAMU'),
        nama_siswa: String(nama_siswa || 'Siswa'),
        topik_id: String(topik_id || ''),
        judul_topik: String(judul_topik || ''),
        persentase_baca: String(persentase_baca ?? 100),
        latihan_benar: String(latihan_benar ?? 0),
        latihan_total: String(latihan_total ?? 5),
        skor_latihan: String(skor_latihan ?? 0),
        status_selesai: String(status_selesai || 'SELESAI'),
        waktu_simpan: new Date().toISOString(),
      };

      const result = await appendRecordsToTab('PROGRESS_MATERI', [record]);
      await logEvent(
        record.id_siswa,
        record.nama_siswa,
        'SIMPAN_PROGRESS_MATERI',
        'MATERI_UTAMA',
        `Menyelesaikan ${record.judul_topik} dengan skor latihan ${record.skor_latihan}`,
        result.savedToGoogleSheets
      );

      res.json({ ok: true, record, ...result });
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || 'Gagal menyimpan progress materi' });
    }
  });

  // 7. POST /api/lab/save — Save LAB_PERCOBAAN & LKPD
  app.post('/api/lab/save', async (req, res) => {
    try {
      const {
        id_siswa,
        nama_siswa,
        kelas,
        asal_sekolah,
        lab_id,
        nama_lab,
        hipotesis,
        variabel_input,
        hasil_simulasi,
        data_tabel_json,
        observasi,
        kesimpulan,
        status_unduh_pdf,
      } = req.body || {};

      const now = new Date().toISOString();
      const percobaanRecord = {
        id_percobaan: `LAB-${Date.now().toString().slice(-6)}`,
        id_siswa: String(id_siswa || 'TAMU'),
        nama_siswa: String(nama_siswa || 'Siswa'),
        lab_id: String(lab_id || ''),
        nama_lab: String(nama_lab || ''),
        hipotesis: String(hipotesis || ''),
        variabel_input:
          typeof variabel_input === 'string' ? variabel_input : JSON.stringify(variabel_input || {}),
        hasil_simulasi:
          typeof hasil_simulasi === 'string' ? hasil_simulasi : JSON.stringify(hasil_simulasi || {}),
        observasi: String(observasi || ''),
        kesimpulan: String(kesimpulan || ''),
        waktu_simpan: now,
      };

      const lkpdRecord = {
        id_lkpd: `LKPD-${Date.now().toString().slice(-6)}`,
        id_siswa: String(id_siswa || 'TAMU'),
        nama_siswa: String(nama_siswa || 'Siswa'),
        kelas: String(kelas || 'V'),
        asal_sekolah: String(asal_sekolah || 'SD'),
        lab_id: String(lab_id || ''),
        nama_lab: String(nama_lab || ''),
        hipotesis: String(hipotesis || ''),
        data_tabel_json:
          typeof data_tabel_json === 'string'
            ? data_tabel_json
            : JSON.stringify(data_tabel_json || []),
        analisis_observasi: String(observasi || ''),
        kesimpulan_stem: String(kesimpulan || ''),
        status_unduh_pdf: String(status_unduh_pdf || 'TERSIMPAN'),
        waktu_simpan: now,
      };

      const resLab = await appendRecordsToTab('LAB_PERCOBAAN', [percobaanRecord]);
      await appendRecordsToTab('LKPD', [lkpdRecord]);

      await logEvent(
        percobaanRecord.id_siswa,
        percobaanRecord.nama_siswa,
        'SIMPAN_LAB_STEM_LKPD',
        'STEM_VIRTUAL_LAB',
        `Menyimpan eksperimen & LKPD ${percobaanRecord.nama_lab}`,
        resLab.savedToGoogleSheets
      );

      res.json({ ok: true, percobaanRecord, lkpdRecord, ...resLab });
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || 'Gagal menyimpan data Lab STEM' });
    }
  });

  // 8. POST /api/game/save — Save HASIL_GAME
  app.post('/api/game/save', async (req, res) => {
    try {
      const {
        id_siswa,
        nama_siswa,
        kelas,
        game_id,
        nama_game,
        level_dicapai,
        skor,
        jawaban_benar,
        total_soal,
        durasi_detik,
      } = req.body || {};

      const record = {
        id_hasil_game: `GAME-${Date.now().toString().slice(-6)}`,
        id_siswa: String(id_siswa || 'TAMU'),
        nama_siswa: String(nama_siswa || 'Siswa'),
        kelas: String(kelas || 'V'),
        game_id: String(game_id || ''),
        nama_game: String(nama_game || ''),
        level_dicapai: String(level_dicapai ?? 1),
        skor: String(skor ?? 0),
        jawaban_benar: String(jawaban_benar ?? 0),
        total_soal: String(total_soal ?? 0),
        durasi_detik: String(durasi_detik ?? 0),
        waktu_main: new Date().toISOString(),
      };

      const result = await appendRecordsToTab('HASIL_GAME', [record]);
      await logEvent(
        record.id_siswa,
        record.nama_siswa,
        'SELESAI_GAME_EDUKASI',
        'GAME_INTERAKTIF',
        `Menyelesaikan ${record.nama_game} (Level ${record.level_dicapai}) dengan skor ${record.skor}`,
        result.savedToGoogleSheets
      );

      res.json({ ok: true, record, ...result });
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || 'Gagal menyimpan skor game' });
    }
  });

  // 9. POST /api/quiz/save — Save HASIL_QUIZ & JAWABAN_QUIZ
  app.post('/api/quiz/save', async (req, res) => {
    try {
      const {
        id_siswa,
        nama_siswa,
        kelas,
        asal_sekolah,
        skor_akhir,
        jumlah_benar,
        jumlah_salah,
        total_soal,
        durasi_detik,
        predikat,
        detail_jawaban,
      } = req.body || {};

      const now = new Date().toISOString();
      const id_hasil_quiz = `QUIZ-${Date.now().toString().slice(-6)}`;

      const hasilRecord = {
        id_hasil_quiz,
        id_siswa: String(id_siswa || 'TAMU'),
        nama_siswa: String(nama_siswa || 'Siswa'),
        kelas: String(kelas || 'V'),
        asal_sekolah: String(asal_sekolah || 'SD'),
        skor_akhir: String(skor_akhir ?? 0),
        jumlah_benar: String(jumlah_benar ?? 0),
        jumlah_salah: String(jumlah_salah ?? 0),
        total_soal: String(total_soal ?? 15),
        durasi_detik: String(durasi_detik ?? 0),
        predikat: String(predikat || 'Baik'),
        waktu_selesai: now,
      };

      const resQuiz = await appendRecordsToTab('HASIL_QUIZ', [hasilRecord]);

      if (Array.isArray(detail_jawaban) && detail_jawaban.length > 0) {
        const jawabanRecords = detail_jawaban.map((item: any, idx: number) => ({
          id_jawaban: `${id_hasil_quiz}-J${idx + 1}`,
          id_hasil_quiz,
          id_siswa: hasilRecord.id_siswa,
          nama_siswa: hasilRecord.nama_siswa,
          nomor_soal: String(item.nomor_soal ?? idx + 1),
          topik: String(item.topik || ''),
          jawaban_siswa: String(item.jawaban_siswa || '-'),
          kunci_jawaban: String(item.kunci_jawaban || ''),
          status_benar: item.status_benar ? 'BENAR' : 'SALAH',
          skor_butir: item.status_benar ? '1' : '0',
          waktu_simpan: now,
        }));
        await appendRecordsToTab('JAWABAN_QUIZ', jawabanRecords);
      }

      await logEvent(
        hasilRecord.id_siswa,
        hasilRecord.nama_siswa,
        'SELESAI_QUIZ_15_SOAL',
        'QUIZ',
        `Menyelesaikan Quiz 15 Soal dengan nilai ${hasilRecord.skor_akhir} (${hasilRecord.jumlah_benar}/15 benar)`,
        resQuiz.savedToGoogleSheets
      );

      res.json({ ok: true, hasilRecord, ...resQuiz });
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || 'Gagal menyimpan hasil quiz' });
    }
  });

  // 10. POST /api/pjbl/save — Save PROYEK_PJBL ("Festival Resep Pecahan")
  app.post('/api/pjbl/save', async (req, res) => {
    try {
      const {
        id_siswa,
        nama_siswa,
        kelas,
        asal_sekolah,
        nama_resep,
        porsi_target,
        fase_1_pertanyaan,
        fase_2_rencana,
        fase_3_jadwal,
        fase_4_bahan_json,
        fase_4_perbandingan,
        fase_4_total_penjumlahan,
        fase_4_sisa_pengurangan,
        fase_5_presentasi,
        fase_6_refleksi,
        persentase_selesai,
      } = req.body || {};

      const record = {
        id_proyek: `PJBL-${Date.now().toString().slice(-6)}`,
        id_siswa: String(id_siswa || 'TAMU'),
        nama_siswa: String(nama_siswa || 'Siswa'),
        kelas: String(kelas || 'V'),
        asal_sekolah: String(asal_sekolah || 'SD'),
        nama_resep: String(nama_resep || 'Festival Resep Pecahan'),
        porsi_target: String(porsi_target || '4 Porsi'),
        fase_1_pertanyaan: String(fase_1_pertanyaan || ''),
        fase_2_rencana: String(fase_2_rencana || ''),
        fase_3_jadwal:
          typeof fase_3_jadwal === 'string' ? fase_3_jadwal : JSON.stringify(fase_3_jadwal || []),
        fase_4_bahan_json:
          typeof fase_4_bahan_json === 'string'
            ? fase_4_bahan_json
            : JSON.stringify(fase_4_bahan_json || []),
        fase_4_perbandingan: String(fase_4_perbandingan || ''),
        fase_4_total_penjumlahan: String(fase_4_total_penjumlahan || ''),
        fase_4_sisa_pengurangan: String(fase_4_sisa_pengurangan || ''),
        fase_5_presentasi: String(fase_5_presentasi || ''),
        fase_6_refleksi: String(fase_6_refleksi || ''),
        persentase_selesai: String(persentase_selesai ?? 100),
        waktu_simpan: new Date().toISOString(),
      };

      const result = await appendRecordsToTab('PROYEK_PJBL', [record]);
      await logEvent(
        record.id_siswa,
        record.nama_siswa,
        'SIMPAN_PROYEK_PJBL',
        'PJBL_FESTIVAL_RESEP',
        `Menyimpan Proyek PjBL "${record.nama_resep}" (${record.persentase_selesai}% selesai)`,
        result.savedToGoogleSheets
      );

      res.json({ ok: true, record, ...result });
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || 'Gagal menyimpan proyek PjBL' });
    }
  });

  // 11. POST /api/evaluasi/save — Save EVALUASI
  app.post('/api/evaluasi/save', async (req, res) => {
    try {
      const {
        id_siswa,
        nama_siswa,
        kelas,
        skor_materi,
        skor_lab,
        skor_game,
        skor_quiz,
        skor_pjbl,
        nilai_akhir_komposit,
        refleksi_siswa,
        umpan_balik_sistem,
        umpan_balik_guru,
      } = req.body || {};

      const record = {
        id_evaluasi: `EVAL-${Date.now().toString().slice(-6)}`,
        id_siswa: String(id_siswa || 'TAMU'),
        nama_siswa: String(nama_siswa || 'Siswa'),
        kelas: String(kelas || 'V'),
        skor_materi: String(skor_materi ?? 0),
        skor_lab: String(skor_lab ?? 0),
        skor_game: String(skor_game ?? 0),
        skor_quiz: String(skor_quiz ?? 0),
        skor_pjbl: String(skor_pjbl ?? 0),
        nilai_akhir_komposit: String(nilai_akhir_komposit ?? 0),
        refleksi_siswa: String(refleksi_siswa || ''),
        umpan_balik_sistem: String(umpan_balik_sistem || ''),
        umpan_balik_guru: String(umpan_balik_guru || ''),
        waktu_simpan: new Date().toISOString(),
      };

      const result = await appendRecordsToTab('EVALUASI', [record]);
      await logEvent(
        record.id_siswa,
        record.nama_siswa,
        'SIMPAN_EVALUASI_AKHIR',
        'EVALUASI',
        `Menyimpan Evaluasi Komposit (Nilai Akhir: ${record.nilai_akhir_komposit})`,
        result.savedToGoogleSheets
      );

      res.json({ ok: true, record, ...result });
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || 'Gagal menyimpan evaluasi' });
    }
  });

  // Ensure any unmatched /api/* route always returns JSON, never HTML
  app.use('/api', (req, res) => {
    res.status(404).json({
      ok: false,
      message: `Endpoint API tidak ditemukan: ${req.method} ${req.originalUrl}`,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MATWALL Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
