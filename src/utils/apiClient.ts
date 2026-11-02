import type { StudentIdentity } from './fractionMath';

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
    'waktu_jawab',
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

const STORAGE_DB_KEY = 'matwall_local_db_v1';
const STORAGE_CFG_KEY = 'matwall_sheets_cfg_v1';

// Support Netlify / Vite build-time environment variables if provided
const ENV_APPS_SCRIPT_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '')) ||
  '';
const ENV_SPREADSHEET_ID =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID || '')) ||
  '';

interface ClientDbStore {
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

interface ClientSheetsConfig {
  appsScriptUrl?: string;
  spreadsheetId?: string;
  connected?: boolean;
  lastVerifiedAt?: string;
}

function getClientDb(): ClientDbStore {
  try {
    const raw = localStorage.getItem(STORAGE_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        CONFIG: parsed.CONFIG || [],
        SISWA: parsed.SISWA || [],
        SESI: parsed.SESI || [],
        PROGRESS_MATERI: parsed.PROGRESS_MATERI || [],
        LAB_PERCOBAAN: parsed.LAB_PERCOBAAN || [],
        LKPD: parsed.LKPD || [],
        HASIL_GAME: parsed.HASIL_GAME || [],
        BANK_SOAL: parsed.BANK_SOAL || [],
        HASIL_QUIZ: parsed.HASIL_QUIZ || [],
        JAWABAN_QUIZ: parsed.JAWABAN_QUIZ || [],
        PROYEK_PJBL: parsed.PROYEK_PJBL || [],
        EVALUASI: parsed.EVALUASI || [],
        EVENT_LOG: parsed.EVENT_LOG || [],
      };
    }
  } catch {
    // ignore storage errors
  }
  const initial: ClientDbStore = {
    CONFIG: [
      {
        config_key: 'APP_NAME',
        config_value: 'MATWALL — Mathematics Interactive Wordwall',
        description: 'Nama Aplikasi MPI',
        updated_at: new Date().toISOString(),
      },
      {
        config_key: 'PENGEMBANG_NAMA',
        config_value: 'MILA AULIA',
        description: 'Nama Pengembang MPI',
        updated_at: new Date().toISOString(),
      },
      {
        config_key: 'PENGEMBANG_NIM',
        config_value: '501332956',
        description: 'NIM Pengembang',
        updated_at: new Date().toISOString(),
      },
    ],
    SISWA: [],
    SESI: [],
    PROGRESS_MATERI: [],
    LAB_PERCOBAAN: [],
    LKPD: [],
    HASIL_GAME: [],
    BANK_SOAL: [],
    HASIL_QUIZ: [],
    JAWABAN_QUIZ: [],
    PROYEK_PJBL: [],
    EVALUASI: [],
    EVENT_LOG: [],
  };
  saveClientDb(initial);
  return initial;
}

function saveClientDb(db: ClientDbStore) {
  try {
    localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));
  } catch {
    // ignore storage quota errors
  }
}

function getClientCfg(): ClientSheetsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_CFG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        appsScriptUrl: parsed.appsScriptUrl || ENV_APPS_SCRIPT_URL,
        spreadsheetId: parsed.spreadsheetId || ENV_SPREADSHEET_ID,
        connected: parsed.connected ?? Boolean(parsed.appsScriptUrl || ENV_APPS_SCRIPT_URL),
        lastVerifiedAt: parsed.lastVerifiedAt,
      };
    }
  } catch {
    // ignore
  }
  return {
    appsScriptUrl: ENV_APPS_SCRIPT_URL || undefined,
    spreadsheetId: ENV_SPREADSHEET_ID || undefined,
    connected: Boolean(ENV_APPS_SCRIPT_URL),
  };
}

function saveClientCfg(cfg: ClientSheetsConfig) {
  try {
    localStorage.setItem(STORAGE_CFG_KEY, JSON.stringify(cfg));
  } catch {
    // ignore
  }
}

async function postToAppsScriptFromBrowser(
  appsScriptUrl: string,
  payload: Record<string, any>
): Promise<boolean> {
  if (!appsScriptUrl || !appsScriptUrl.startsWith('https://script.google.com/')) {
    return false;
  }
  try {
    // Using text/plain avoids CORS preflight rejection on Google Apps Script Web Apps
    const res = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!text.trim().startsWith('<')) {
      try {
        const parsed = JSON.parse(text);
        if (parsed && parsed.ok) return true;
      } catch {
        // ignore
      }
    }
    return res.ok && !text.trim().startsWith('<');
  } catch {
    return false;
  }
}

function storeRecordsLocallyOnly(
  tabName: keyof ClientDbStore,
  records: Record<string, any>[]
): Record<string, string>[] {
  const db = getClientDb();
  const headers = MANDATORY_TABS[tabName] || [];
  const pkField = headers[0];
  const normalized = records.map((rec) => {
    const clean: Record<string, string> = {};
    for (const h of headers) {
      clean[h] = rec[h] !== undefined && rec[h] !== null ? String(rec[h]) : '';
    }
    return clean;
  });

  for (const item of normalized) {
    const pkVal = pkField ? item[pkField] : '';
    if (pkField && pkVal) {
      const existingIdx = db[tabName].findIndex((r) => r[pkField] === pkVal);
      if (existingIdx >= 0) {
        db[tabName][existingIdx] = item;
      } else {
        db[tabName].push(item);
      }
    } else {
      db[tabName].push(item);
    }
  }
  saveClientDb(db);
  return normalized;
}

async function appendClientRecords(
  tabName: keyof ClientDbStore,
  records: Record<string, any>[],
  skipBrowserAppsScriptPost = false
): Promise<{
  savedLocal: boolean;
  savedToGoogleSheets: boolean;
  sheetsStatusMessage: string;
}> {
  const normalized = storeRecordsLocallyOnly(tabName, records);
  const headers = MANDATORY_TABS[tabName] || [];

  const cfg = getClientCfg();
  if (
    !skipBrowserAppsScriptPost &&
    cfg.appsScriptUrl &&
    cfg.appsScriptUrl.startsWith('https://script.google.com/')
  ) {
    const rowsMatrix = normalized.map((rec) => headers.map((h) => rec[h] || ''));
    const ok = await postToAppsScriptFromBrowser(cfg.appsScriptUrl, {
      action: 'APPEND_ROWS',
      tabName,
      headers,
      rows: rowsMatrix,
      mandatoryTabs: MANDATORY_TABS,
    });
    if (ok) {
      cfg.connected = true;
      cfg.lastVerifiedAt = new Date().toISOString();
      saveClientCfg(cfg);
      return {
        savedLocal: true,
        savedToGoogleSheets: true,
        sheetsStatusMessage: `Berhasil disimpan ke Google Sheets "${SPREADSHEET_TARGET_NAME}" pada tab ${tabName}.`,
      };
    }
  }

  return {
    savedLocal: true,
    savedToGoogleSheets: false,
    sheetsStatusMessage: `Data berhasil disimpan pada tab ${tabName}.`,
  };
}

function mergeRecordArrays(
  serverArr: Record<string, string>[] = [],
  localArr: Record<string, string>[] = [],
  pkField: string
): Record<string, string>[] {
  const map = new Map<string, Record<string, string>>();
  for (const r of localArr) {
    const key = r[pkField] || JSON.stringify(r);
    map.set(key, r);
  }
  for (const r of serverArr) {
    const key = r[pkField] || JSON.stringify(r);
    map.set(key, r);
  }
  return Array.from(map.values());
}

function wrapApiResponse<T = any>(payload: any, defaultOk = true): T {
  const safePayload =
    payload && typeof payload === 'object' ? payload : { value: payload };
  const isOk =
    typeof safePayload.ok === 'boolean' ? safePayload.ok : defaultOk;
  const normalizedData = {
    ...safePayload,
    ok: isOk,
  };
  return {
    ...normalizedData,
    ok: isOk,
    data: normalizedData,
  } as unknown as T;
}

/**
 * Universal API Request Helper (Supports AI Studio Express Server + Netlify Hosting + Static SPA):
 * 1. Mirrors client state to `localStorage` so stateless serverless functions on Netlify
 *    never lose student progress between cold starts.
 * 2. Sends requests to `/api/*` (which routes to Express in dev or `/.netlify/functions/api` on Netlify)
 *    with `X-Apps-Script-Url` header if configured.
 * 3. Safely parses JSON to prevent `SyntaxError: Unexpected token '<'` and seamlessly falls back
 *    to client-side execution + direct Google Apps Script Web App sync if `/api/*` is static.
 */
export async function safeApiRequest<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const cfg = getClientCfg();
  let bodyObj: any = {};
  if (options?.body && typeof options.body === 'string') {
    try {
      bodyObj = JSON.parse(options.body);
    } catch {
      bodyObj = {};
    }
  }

  // Attach clientDb on sync-all so Netlify serverless function can sync all browser records
  if (url.startsWith('/api/db/sync-all')) {
    bodyObj = {
      ...bodyObj,
      clientDb: getClientDb(),
      _appsScriptUrl: cfg.appsScriptUrl || '',
    };
  }

  const mergedHeaders: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (cfg.appsScriptUrl && cfg.appsScriptUrl.startsWith('https://script.google.com/')) {
    mergedHeaders['X-Apps-Script-Url'] = cfg.appsScriptUrl;
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers: mergedHeaders,
    body:
      options?.method === 'POST'
        ? JSON.stringify({
            ...bodyObj,
            _appsScriptUrl: cfg.appsScriptUrl || undefined,
          })
        : options?.body,
  };

  try {
    const res = await fetch(url, fetchOptions);
    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();

    // Ensure response is actual JSON and not an HTML fallback ("<!doctype html>...")
    if (
      !rawText.trim().startsWith('<') &&
      (contentType.includes('application/json') || rawText.trim().startsWith('{'))
    ) {
      const parsed = JSON.parse(rawText);

      if (res.ok && parsed && typeof parsed === 'object' && parsed.ok !== false) {
        // Mirror write operations into localStorage so stateless Netlify Functions keep full history
        if (url.startsWith('/api/siswa/masuk') && parsed.siswa) {
          storeRecordsLocallyOnly('SISWA', [parsed.siswa]);
          if (parsed.sesi) storeRecordsLocallyOnly('SESI', [parsed.sesi]);
        } else if (url.startsWith('/api/materi/progress') && parsed.record) {
          storeRecordsLocallyOnly('PROGRESS_MATERI', [parsed.record]);
        } else if (url.startsWith('/api/lab/save') && parsed.labRecord) {
          storeRecordsLocallyOnly('LAB_PERCOBAAN', [parsed.labRecord]);
          if (parsed.lkpdRecord) storeRecordsLocallyOnly('LKPD', [parsed.lkpdRecord]);
        } else if (url.startsWith('/api/game/save') && parsed.record) {
          storeRecordsLocallyOnly('HASIL_GAME', [parsed.record]);
        } else if (url.startsWith('/api/quiz/save') && parsed.hasilRecord) {
          storeRecordsLocallyOnly('HASIL_QUIZ', [parsed.hasilRecord]);
        } else if (url.startsWith('/api/pjbl/save') && parsed.record) {
          storeRecordsLocallyOnly('PROYEK_PJBL', [parsed.record]);
        } else if (url.startsWith('/api/evaluasi/save') && parsed.record) {
          storeRecordsLocallyOnly('EVALUASI', [parsed.record]);
        } else if (url.startsWith('/api/db/configure')) {
          const nextUrl = String(bodyObj.appsScriptUrl || '').trim();
          const nextSheetId = String(bodyObj.spreadsheetId || '').trim();
          saveClientCfg({
            ...cfg,
            appsScriptUrl: nextUrl || cfg.appsScriptUrl,
            spreadsheetId: nextSheetId || cfg.spreadsheetId,
            connected: Boolean(parsed.connected),
            lastVerifiedAt: parsed.connected ? new Date().toISOString() : cfg.lastVerifiedAt,
          });
        }

        // Merge local records with server records on GET /api/db/records & /api/db/status
        if (url.startsWith('/api/db/records')) {
          const db = getClientDb();
          const urlObj = new URL(url, window.location.origin);
          const idSiswa = urlObj.searchParams.get('id_siswa') || '';
          const filterBySiswa = (list: Record<string, string>[]) =>
            idSiswa ? list.filter((r) => r.id_siswa === idSiswa) : list;

          return wrapApiResponse<T>({
            ...parsed,
            ok: true,
            siswa: mergeRecordArrays(parsed.siswa, db.SISWA, 'id_siswa'),
            progressMateri: mergeRecordArrays(
              parsed.progressMateri,
              filterBySiswa(db.PROGRESS_MATERI),
              'id_progress'
            ),
            labPercobaan: mergeRecordArrays(
              parsed.labPercobaan,
              filterBySiswa(db.LAB_PERCOBAAN),
              'id_percobaan'
            ),
            lkpd: mergeRecordArrays(parsed.lkpd, filterBySiswa(db.LKPD), 'id_lkpd'),
            hasilGame: mergeRecordArrays(
              parsed.hasilGame,
              filterBySiswa(db.HASIL_GAME),
              'id_hasil_game'
            ),
            hasilQuiz: mergeRecordArrays(
              parsed.hasilQuiz,
              filterBySiswa(db.HASIL_QUIZ),
              'id_hasil_quiz'
            ),
            proyekPjbl: mergeRecordArrays(
              parsed.proyekPjbl,
              filterBySiswa(db.PROYEK_PJBL),
              'id_proyek'
            ),
            evaluasi: mergeRecordArrays(
              parsed.evaluasi,
              filterBySiswa(db.EVALUASI),
              'id_evaluasi'
            ),
          });
        }

        if (url.startsWith('/api/db/status')) {
          const db = getClientDb();
          const mergedCounts: Record<string, number> = { ...(parsed.tabCounts || {}) };
          for (const tab of Object.keys(MANDATORY_TABS)) {
            const localLen = db[tab as keyof ClientDbStore]?.length || 0;
            mergedCounts[tab] = Math.max(mergedCounts[tab] || 0, localLen);
          }
          return wrapApiResponse<T>({
            ...parsed,
            connected: Boolean(parsed.connected || (cfg.connected && cfg.appsScriptUrl)),
            appsScriptUrl: cfg.appsScriptUrl || parsed.appsScriptUrl || '',
            spreadsheetId: cfg.spreadsheetId || parsed.spreadsheetId || '',
            tabCounts: mergedCounts,
          });
        }

        return wrapApiResponse<T>(parsed, true);
      }

      if (url.startsWith('/api/db/configure') && parsed && typeof parsed === 'object') {
        return wrapApiResponse<T>(parsed, Boolean(parsed.ok));
      }
    }
  } catch {
    // Fall through to client-side fallback handler below
  }

  // ============================================================================
  // RESILIENT CLIENT-SIDE FALLBACK (STATIC HOSTING / OFFLINE / DIRECT APPS SCRIPT)
  // ============================================================================
  const db = getClientDb();

  if (url.startsWith('/api/db/status')) {
    const tabCounts: Record<string, number> = {};
    for (const tab of Object.keys(MANDATORY_TABS)) {
      tabCounts[tab] = db[tab as keyof ClientDbStore]?.length || 0;
    }
    return wrapApiResponse<T>({
      ok: true,
      connected: Boolean(cfg.connected && cfg.appsScriptUrl),
      mode: cfg.appsScriptUrl ? 'APPS_SCRIPT' : 'UNCONFIGURED',
      spreadsheetTitle: SPREADSHEET_TARGET_NAME,
      spreadsheetId: cfg.spreadsheetId || '',
      appsScriptUrl: cfg.appsScriptUrl || '',
      message: cfg.appsScriptUrl
        ? `Terhubung ke Google Sheets "${SPREADSHEET_TARGET_NAME}" melalui URL Web App Apps Script.`
        : `Penyimpanan aktif (Siap dihubungkan ke Google Sheets "${SPREADSHEET_TARGET_NAME}").`,
      mandatoryTabs: MANDATORY_TABS,
      tabCounts,
      lastVerifiedAt: cfg.lastVerifiedAt || null,
    });
  }

  if (url.startsWith('/api/db/configure')) {
    const nextUrl = String(bodyObj.appsScriptUrl || '').trim();
    const nextSheetId = String(bodyObj.spreadsheetId || '').trim();

    if (nextUrl && !nextUrl.includes('/exec')) {
      return wrapApiResponse<T>(
        {
          ok: false,
          connected: false,
          message:
            'Pastikan URL Google Apps Script merupakan URL Web App yang berakhiran "/exec" (bukan "/edit") dan akses diset ke "Anyone / Siapa saja".',
        },
        false
      );
    }

    const updatedCfg: ClientSheetsConfig = {
      ...cfg,
      appsScriptUrl: nextUrl || cfg.appsScriptUrl,
      spreadsheetId: nextSheetId || cfg.spreadsheetId,
    };

    let verified = false;
    if (updatedCfg.appsScriptUrl) {
      verified = await postToAppsScriptFromBrowser(updatedCfg.appsScriptUrl, {
        action: 'ENSURE_STRUCTURE',
        spreadsheetName: SPREADSHEET_TARGET_NAME,
        mandatoryTabs: MANDATORY_TABS,
        initialConfig: db.CONFIG,
      });
    }
    updatedCfg.connected = verified;
    if (verified) updatedCfg.lastVerifiedAt = new Date().toISOString();
    saveClientCfg(updatedCfg);

    return wrapApiResponse<T>({
      ok: true,
      connected: verified,
      message: verified
        ? `Berhasil terhubung ke Google Sheets "${SPREADSHEET_TARGET_NAME}" (13 Tab Aktif)!`
        : 'Konfigurasi tersimpan. Jika menggunakan Apps Script, pastikan URL berakhiran /exec dan Who has access: Anyone.',
    });
  }

  if (url.startsWith('/api/db/sync-all')) {
    if (cfg.appsScriptUrl) {
      const ok = await postToAppsScriptFromBrowser(cfg.appsScriptUrl, {
        action: 'SYNC_ALL_TABS',
        spreadsheetName: SPREADSHEET_TARGET_NAME,
        mandatoryTabs: MANDATORY_TABS,
        data: db,
      });
      if (ok) {
        cfg.connected = true;
        cfg.lastVerifiedAt = new Date().toISOString();
        saveClientCfg(cfg);
        return wrapApiResponse<T>({
          ok: true,
          message: `Seluruh 13 tab berhasil disinkronkan ke Google Sheets "${SPREADSHEET_TARGET_NAME}".`,
        });
      }
    }
    return wrapApiResponse<T>({
      ok: true,
      message:
        'Seluruh data 13 tab telah diamankan. Masukkan URL Apps Script (/exec) untuk sinkronisasi ke Google Sheets.',
    });
  }

  if (url.startsWith('/api/db/records')) {
    const urlObj = new URL(url, window.location.origin);
    const idSiswa = urlObj.searchParams.get('id_siswa') || '';
    const filterBySiswa = (list: Record<string, string>[]) =>
      idSiswa ? list.filter((r) => r.id_siswa === idSiswa) : list;

    return wrapApiResponse<T>({
      ok: true,
      siswa: db.SISWA,
      progressMateri: filterBySiswa(db.PROGRESS_MATERI),
      labPercobaan: filterBySiswa(db.LAB_PERCOBAAN),
      lkpd: filterBySiswa(db.LKPD),
      hasilGame: filterBySiswa(db.HASIL_GAME),
      hasilQuiz: filterBySiswa(db.HASIL_QUIZ),
      proyekPjbl: filterBySiswa(db.PROYEK_PJBL),
      evaluasi: filterBySiswa(db.EVALUASI),
    });
  }

  if (url.startsWith('/api/siswa/masuk')) {
    const cleanNama = String(bodyObj.nama_siswa || 'Siswa Kelas V SD').trim();
    const cleanKelas = String(bodyObj.kelas || 'Kelas V-A').trim();
    const cleanSekolah = String(bodyObj.asal_sekolah || 'SD Negeri Merdeka').trim();
    const nowIso = new Date().toISOString();

    const existing = db.SISWA.find(
      (s) =>
        s.nama_siswa.toLowerCase() === cleanNama.toLowerCase() &&
        s.asal_sekolah.toLowerCase() === cleanSekolah.toLowerCase()
    );

    const id_siswa = existing
      ? existing.id_siswa
      : `SISWA-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 899)}`;

    const siswaRecord: StudentIdentity & { waktu_daftar: string; terakhir_aktif: string } = {
      id_siswa,
      nama_siswa: cleanNama,
      kelas: cleanKelas,
      asal_sekolah: cleanSekolah,
      waktu_daftar: existing ? existing.waktu_daftar : nowIso,
      terakhir_aktif: nowIso,
    };

    const sesiRecord = {
      id_sesi: `SESI-${Date.now().toString().slice(-6)}`,
      id_siswa,
      nama_siswa: cleanNama,
      kelas: cleanKelas,
      asal_sekolah: cleanSekolah,
      waktu_mulai: nowIso,
      waktu_terakhir: nowIso,
      status_sesi: 'AKTIF',
    };

    const resSiswa = await appendClientRecords('SISWA', [siswaRecord]);
    await appendClientRecords('SESI', [sesiRecord]);

    return wrapApiResponse<T>({
      ok: true,
      siswa: siswaRecord,
      sesi: sesiRecord,
      ...resSiswa,
    });
  }

  if (url.startsWith('/api/materi/progress')) {
    const record = {
      id_progress: `PROG-${Date.now().toString().slice(-6)}`,
      id_siswa: String(bodyObj.id_siswa || 'TAMU'),
      nama_siswa: String(bodyObj.nama_siswa || 'Siswa'),
      topik_id: String(bodyObj.topik_id || 'TOPIK-1'),
      judul_topik: String(bodyObj.judul_topik || ''),
      persentase_baca: String(bodyObj.persentase_baca ?? 100),
      latihan_benar: String(bodyObj.latihan_benar ?? 0),
      latihan_total: String(bodyObj.latihan_total ?? 3),
      skor_latihan: String(bodyObj.skor_latihan ?? 0),
      status_selesai: String(bodyObj.status_selesai || 'SELESAI'),
      waktu_simpan: new Date().toISOString(),
    };
    const result = await appendClientRecords('PROGRESS_MATERI', [record]);
    return wrapApiResponse<T>({ ok: true, record, ...result });
  }

  if (url.startsWith('/api/lab/save')) {
    const nowIso = new Date().toISOString();
    const labRecord = {
      id_percobaan: `LAB-${Date.now().toString().slice(-6)}`,
      id_siswa: String(bodyObj.id_siswa || 'TAMU'),
      nama_siswa: String(bodyObj.nama_siswa || 'Siswa'),
      lab_id: String(bodyObj.lab_id || 'LAB-1'),
      nama_lab: String(bodyObj.nama_lab || ''),
      hipotesis: String(bodyObj.hipotesis || ''),
      variabel_input: JSON.stringify(bodyObj.variabel_input || {}),
      hasil_simulasi: JSON.stringify(bodyObj.hasil_simulasi || {}),
      observasi: String(bodyObj.observasi || ''),
      kesimpulan: String(bodyObj.kesimpulan || ''),
      waktu_simpan: nowIso,
    };
    const lkpdRecord = {
      id_lkpd: `LKPD-${Date.now().toString().slice(-6)}`,
      id_siswa: String(bodyObj.id_siswa || 'TAMU'),
      nama_siswa: String(bodyObj.nama_siswa || 'Siswa'),
      kelas: String(bodyObj.kelas || 'Kelas V'),
      asal_sekolah: String(bodyObj.asal_sekolah || 'SD'),
      lab_id: String(bodyObj.lab_id || 'LAB-1'),
      nama_lab: String(bodyObj.nama_lab || ''),
      hipotesis: String(bodyObj.hipotesis || ''),
      data_tabel_json: JSON.stringify(bodyObj.data_tabel_json || []),
      analisis_observasi: String(bodyObj.observasi || ''),
      kesimpulan_stem: String(bodyObj.kesimpulan || ''),
      status_unduh_pdf: String(bodyObj.status_unduh_pdf || 'TERSIMPAN'),
      waktu_simpan: nowIso,
    };
    const res1 = await appendClientRecords('LAB_PERCOBAAN', [labRecord]);
    await appendClientRecords('LKPD', [lkpdRecord]);
    return wrapApiResponse<T>({ ok: true, labRecord, lkpdRecord, ...res1 });
  }

  if (url.startsWith('/api/game/save')) {
    const record = {
      id_hasil_game: `GAME-${Date.now().toString().slice(-6)}`,
      id_siswa: String(bodyObj.id_siswa || 'TAMU'),
      nama_siswa: String(bodyObj.nama_siswa || 'Siswa'),
      kelas: String(bodyObj.kelas || 'V'),
      game_id: String(bodyObj.game_id || 'GAME-1'),
      nama_game: String(bodyObj.nama_game || ''),
      level_dicapai: String(bodyObj.level_dicapai ?? 1),
      skor: String(bodyObj.skor ?? 0),
      jawaban_benar: String(bodyObj.jawaban_benar ?? 0),
      total_soal: String(bodyObj.total_soal ?? 0),
      durasi_detik: String(bodyObj.durasi_detik ?? 0),
      waktu_main: new Date().toISOString(),
    };
    const result = await appendClientRecords('HASIL_GAME', [record]);
    return wrapApiResponse<T>({ ok: true, record, ...result });
  }

  if (url.startsWith('/api/quiz/save')) {
    const nowIso = new Date().toISOString();
    const id_hasil_quiz = `QUIZ-${Date.now().toString().slice(-6)}`;
    const hasilRecord = {
      id_hasil_quiz,
      id_siswa: String(bodyObj.id_siswa || 'TAMU'),
      nama_siswa: String(bodyObj.nama_siswa || 'Siswa'),
      kelas: String(bodyObj.kelas || 'V'),
      asal_sekolah: String(bodyObj.asal_sekolah || 'SD'),
      skor_akhir: String(bodyObj.skor_akhir ?? 0),
      jumlah_benar: String(bodyObj.jumlah_benar ?? 0),
      jumlah_salah: String(bodyObj.jumlah_salah ?? 0),
      total_soal: String(bodyObj.total_soal ?? 15),
      durasi_detik: String(bodyObj.durasi_detik ?? 0),
      predikat: String(bodyObj.predikat || 'Baik'),
      waktu_selesai: nowIso,
    };
    const result = await appendClientRecords('HASIL_QUIZ', [hasilRecord]);
    if (Array.isArray(bodyObj.detail_jawaban) && bodyObj.detail_jawaban.length > 0) {
      const detailRecords = bodyObj.detail_jawaban.map((d: any, idx: number) => ({
        id_jawaban: `JWB-${Date.now().toString().slice(-5)}-${idx + 1}`,
        id_hasil_quiz,
        id_siswa: hasilRecord.id_siswa,
        nama_siswa: hasilRecord.nama_siswa,
        nomor_soal: String(d.nomor_soal ?? idx + 1),
        topik: String(d.topik || ''),
        jawaban_siswa: String(d.jawaban_siswa || ''),
        kunci_jawaban: String(d.kunci_jawaban || ''),
        status_benar: d.status_benar ? 'BENAR' : 'SALAH',
        skor_butir: d.status_benar ? '1' : '0',
        waktu_jawab: nowIso,
      }));
      await appendClientRecords('JAWABAN_QUIZ', detailRecords);
    }
    return wrapApiResponse<T>({ ok: true, hasilRecord, ...result });
  }

  if (url.startsWith('/api/pjbl/save')) {
    const record = {
      id_proyek: `PJBL-${Date.now().toString().slice(-6)}`,
      id_siswa: String(bodyObj.id_siswa || 'TAMU'),
      nama_siswa: String(bodyObj.nama_siswa || 'Siswa'),
      kelas: String(bodyObj.kelas || 'V'),
      asal_sekolah: String(bodyObj.asal_sekolah || 'SD'),
      nama_resep: String(bodyObj.nama_resep || 'Mini Bakery: Master Chef Pecahan'),
      porsi_target: String(bodyObj.porsi_target || '12 Cupcake'),
      fase_1_pertanyaan: String(bodyObj.fase_1_pertanyaan || ''),
      fase_2_rencana: String(bodyObj.fase_2_rencana || ''),
      fase_3_jadwal: JSON.stringify(bodyObj.fase_3_jadwal || []),
      fase_4_bahan_json: JSON.stringify(bodyObj.fase_4_bahan_json || []),
      fase_4_perbandingan: String(bodyObj.fase_4_perbandingan || ''),
      fase_4_total_penjumlahan: String(bodyObj.fase_4_total_penjumlahan || ''),
      fase_4_sisa_pengurangan: String(bodyObj.fase_4_sisa_pengurangan || ''),
      fase_5_presentasi: String(bodyObj.fase_5_presentasi || ''),
      fase_6_refleksi: String(bodyObj.fase_6_refleksi || ''),
      persentase_selesai: String(bodyObj.persentase_selesai ?? 100),
      waktu_simpan: new Date().toISOString(),
    };
    const result = await appendClientRecords('PROYEK_PJBL', [record]);
    return wrapApiResponse<T>({ ok: true, record, ...result });
  }

  if (url.startsWith('/api/evaluasi/save')) {
    const record = {
      id_evaluasi: `EVAL-${Date.now().toString().slice(-6)}`,
      id_siswa: String(bodyObj.id_siswa || 'TAMU'),
      nama_siswa: String(bodyObj.nama_siswa || 'Siswa'),
      kelas: String(bodyObj.kelas || 'V'),
      skor_materi: String(bodyObj.skor_materi ?? 0),
      skor_lab: String(bodyObj.skor_lab ?? 0),
      skor_game: String(bodyObj.skor_game ?? 0),
      skor_quiz: String(bodyObj.skor_quiz ?? 0),
      skor_pjbl: String(bodyObj.skor_pjbl ?? 0),
      nilai_akhir_komposit: String(bodyObj.nilai_akhir_komposit ?? 0),
      refleksi_siswa: String(bodyObj.refleksi_siswa || ''),
      umpan_balik_sistem: String(bodyObj.umpan_balik_sistem || ''),
      umpan_balik_guru: String(bodyObj.umpan_balik_guru || ''),
      waktu_simpan: new Date().toISOString(),
    };
    const result = await appendClientRecords('EVALUASI', [record]);
    return wrapApiResponse<T>({ ok: true, record, ...result });
  }

  return wrapApiResponse<T>({ ok: true });
}
