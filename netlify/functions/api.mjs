// ============================================================================
// NETLIFY SERVERLESS FUNCTION — MATWALL API & GOOGLE SHEETS SYNC
// Handles all /api/* routes when hosted on Netlify
// ============================================================================

const SPREADSHEET_TARGET_NAME = 'Tesis Bismillah_Mathawall';

const MANDATORY_TABS = {
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

// Warm-instance memory store (merged with client-side localStorage in apiClient.ts)
const memoryDb = {
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
      description: 'Nama Pengembang Tesis',
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

let runtimeAppsScriptUrl =
  process.env.GOOGLE_APPS_SCRIPT_URL ||
  process.env.VITE_GOOGLE_APPS_SCRIPT_URL ||
  '';
let runtimeSpreadsheetId =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
  process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID ||
  '';
let runtimeConnected = Boolean(runtimeAppsScriptUrl);
let runtimeLastVerifiedAt = runtimeAppsScriptUrl ? new Date().toISOString() : null;

async function forwardToAppsScript(appsScriptUrl, payload) {
  const targetUrl = appsScriptUrl || runtimeAppsScriptUrl;
  if (!targetUrl || !targetUrl.startsWith('https://script.google.com/')) {
    return false;
  }
  try {
    const res = await fetch(targetUrl, {
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
        // ignore JSON parse error
      }
    }
    return res.ok && !text.trim().startsWith('<');
  } catch {
    return false;
  }
}

async function appendRecords(tabName, records, clientAppsScriptUrl) {
  const headers = MANDATORY_TABS[tabName] || [];
  const normalized = records.map((rec) => {
    const clean = {};
    for (const h of headers) {
      clean[h] = rec[h] !== undefined && rec[h] !== null ? String(rec[h]) : '';
    }
    return clean;
  });

  if (memoryDb[tabName]) {
    memoryDb[tabName].push(...normalized);
  }

  const activeScriptUrl = clientAppsScriptUrl || runtimeAppsScriptUrl;
  if (activeScriptUrl && activeScriptUrl.startsWith('https://script.google.com/')) {
    const rowsMatrix = normalized.map((rec) => headers.map((h) => rec[h] || ''));
    const ok = await forwardToAppsScript(activeScriptUrl, {
      action: 'APPEND_ROWS',
      tabName,
      headers,
      rows: rowsMatrix,
      mandatoryTabs: MANDATORY_TABS,
    });
    if (ok) {
      runtimeConnected = true;
      runtimeLastVerifiedAt = new Date().toISOString();
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

function jsonResponse(statusCode, bodyObj) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Apps-Script-Url',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
    body: JSON.stringify(bodyObj),
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  const rawPath = event.path || '';
  const apiPath = rawPath
    .replace(/^\/\.netlify\/functions\/api/, '/api')
    .replace(/^\/api\/api/, '/api');

  let bodyObj = {};
  if (event.body) {
    try {
      bodyObj = JSON.parse(event.body);
    } catch {
      bodyObj = {};
    }
  }

  const headerAppsScriptUrl =
    (event.headers && (event.headers['x-apps-script-url'] || event.headers['X-Apps-Script-Url'])) ||
    bodyObj._appsScriptUrl ||
    '';

  if (headerAppsScriptUrl && headerAppsScriptUrl.startsWith('https://script.google.com/')) {
    runtimeAppsScriptUrl = headerAppsScriptUrl;
  }

  // 1. GET /api/db/status
  if (apiPath.startsWith('/api/db/status')) {
    const tabCounts = {};
    for (const tab of Object.keys(MANDATORY_TABS)) {
      tabCounts[tab] = memoryDb[tab]?.length || 0;
    }
    const hasScript = Boolean(runtimeAppsScriptUrl);
    return jsonResponse(200, {
      ok: true,
      connected: Boolean(runtimeConnected && hasScript),
      mode: hasScript ? 'APPS_SCRIPT' : 'UNCONFIGURED',
      spreadsheetTitle: SPREADSHEET_TARGET_NAME,
      spreadsheetId: runtimeSpreadsheetId || '',
      appsScriptUrl: runtimeAppsScriptUrl ? '***TERKONFIGURASI***' : '',
      message: hasScript
        ? `Terhubung ke Google Sheets "${SPREADSHEET_TARGET_NAME}" melalui Netlify Function & Google Apps Script.`
        : `Server Netlify aktif. Siap dihubungkan ke Google Sheets "${SPREADSHEET_TARGET_NAME}".`,
      mandatoryTabs: MANDATORY_TABS,
      tabCounts,
      lastVerifiedAt: runtimeLastVerifiedAt,
    });
  }

  // 2. POST /api/db/configure
  if (apiPath.startsWith('/api/db/configure')) {
    const nextUrl = String(bodyObj.appsScriptUrl || '').trim();
    const nextSheetId = String(bodyObj.spreadsheetId || '').trim();

    if (nextUrl && !nextUrl.includes('/exec')) {
      return jsonResponse(400, {
        ok: false,
        connected: false,
        message:
          'Pastikan URL Google Apps Script merupakan URL Web App yang berakhiran "/exec" (bukan "/edit") dan akses diset ke "Anyone / Siapa saja".',
      });
    }

    if (nextUrl) runtimeAppsScriptUrl = nextUrl;
    if (nextSheetId) runtimeSpreadsheetId = nextSheetId;

    let verified = false;
    if (runtimeAppsScriptUrl) {
      verified = await forwardToAppsScript(runtimeAppsScriptUrl, {
        action: 'ENSURE_STRUCTURE',
        spreadsheetName: SPREADSHEET_TARGET_NAME,
        mandatoryTabs: MANDATORY_TABS,
        initialConfig: memoryDb.CONFIG,
      });
    }
    runtimeConnected = verified;
    if (verified) runtimeLastVerifiedAt = new Date().toISOString();

    return jsonResponse(200, {
      ok: true,
      connected: verified,
      message: verified
        ? `Berhasil terhubung ke Google Sheets "${SPREADSHEET_TARGET_NAME}" (13 Tab Aktif)!`
        : 'Konfigurasi disimpan. Pastikan URL Apps Script berakhiran /exec dan Who has access: Anyone.',
    });
  }

  // 3. POST /api/db/sync-all
  if (apiPath.startsWith('/api/db/sync-all')) {
    const syncData = bodyObj.clientDb || memoryDb;
    if (runtimeAppsScriptUrl) {
      const ok = await forwardToAppsScript(runtimeAppsScriptUrl, {
        action: 'SYNC_ALL_TABS',
        spreadsheetName: SPREADSHEET_TARGET_NAME,
        mandatoryTabs: MANDATORY_TABS,
        data: syncData,
      });
      if (ok) {
        runtimeConnected = true;
        runtimeLastVerifiedAt = new Date().toISOString();
        return jsonResponse(200, {
          ok: true,
          message: `Seluruh 13 tab berhasil disinkronkan ke Google Sheets "${SPREADSHEET_TARGET_NAME}".`,
        });
      }
    }
    return jsonResponse(200, {
      ok: true,
      message:
        'Data tersimpan. Masukkan URL Apps Script (/exec) di menu Admin untuk sinkronisasi ke Google Sheets.',
    });
  }

  // 4. GET /api/db/records
  if (apiPath.startsWith('/api/db/records')) {
    const idSiswa = (event.queryStringParameters && event.queryStringParameters.id_siswa) || '';
    const filterBySiswa = (list) =>
      idSiswa ? list.filter((r) => r.id_siswa === idSiswa) : list;

    return jsonResponse(200, {
      ok: true,
      siswa: memoryDb.SISWA,
      progressMateri: filterBySiswa(memoryDb.PROGRESS_MATERI),
      labPercobaan: filterBySiswa(memoryDb.LAB_PERCOBAAN),
      lkpd: filterBySiswa(memoryDb.LKPD),
      hasilGame: filterBySiswa(memoryDb.HASIL_GAME),
      hasilQuiz: filterBySiswa(memoryDb.HASIL_QUIZ),
      proyekPjbl: filterBySiswa(memoryDb.PROYEK_PJBL),
      evaluasi: filterBySiswa(memoryDb.EVALUASI),
    });
  }

  // 5. POST /api/siswa/masuk
  if (apiPath.startsWith('/api/siswa/masuk')) {
    const cleanNama = String(bodyObj.nama_siswa || 'Siswa Kelas V SD').trim();
    const cleanKelas = String(bodyObj.kelas || 'Kelas V-A').trim();
    const cleanSekolah = String(bodyObj.asal_sekolah || 'SD Negeri Merdeka').trim();
    const nowIso = new Date().toISOString();

    const id_siswa =
      bodyObj.id_siswa ||
      `SISWA-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 899)}`;

    const siswaRecord = {
      id_siswa,
      nama_siswa: cleanNama,
      kelas: cleanKelas,
      asal_sekolah: cleanSekolah,
      waktu_daftar: nowIso,
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

    const resSiswa = await appendRecords('SISWA', [siswaRecord], headerAppsScriptUrl);
    await appendRecords('SESI', [sesiRecord], headerAppsScriptUrl);

    return jsonResponse(200, {
      ok: true,
      siswa: siswaRecord,
      sesi: sesiRecord,
      ...resSiswa,
    });
  }

  // 6. POST /api/materi/progress
  if (apiPath.startsWith('/api/materi/progress')) {
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
    const result = await appendRecords('PROGRESS_MATERI', [record], headerAppsScriptUrl);
    return jsonResponse(200, { ok: true, record, ...result });
  }

  // 7. POST /api/lab/save
  if (apiPath.startsWith('/api/lab/save')) {
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
    const res1 = await appendRecords('LAB_PERCOBAAN', [labRecord], headerAppsScriptUrl);
    await appendRecords('LKPD', [lkpdRecord], headerAppsScriptUrl);
    return jsonResponse(200, { ok: true, labRecord, lkpdRecord, ...res1 });
  }

  // 8. POST /api/game/save
  if (apiPath.startsWith('/api/game/save')) {
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
    const result = await appendRecords('HASIL_GAME', [record], headerAppsScriptUrl);
    return jsonResponse(200, { ok: true, record, ...result });
  }

  // 9. POST /api/quiz/save
  if (apiPath.startsWith('/api/quiz/save')) {
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
    const result = await appendRecords('HASIL_QUIZ', [hasilRecord], headerAppsScriptUrl);
    if (Array.isArray(bodyObj.detail_jawaban) && bodyObj.detail_jawaban.length > 0) {
      const detailRecords = bodyObj.detail_jawaban.map((d, idx) => ({
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
      await appendRecords('JAWABAN_QUIZ', detailRecords, headerAppsScriptUrl);
    }
    return jsonResponse(200, { ok: true, hasilRecord, ...result });
  }

  // 10. POST /api/pjbl/save
  if (apiPath.startsWith('/api/pjbl/save')) {
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
    const result = await appendRecords('PROYEK_PJBL', [record], headerAppsScriptUrl);
    return jsonResponse(200, { ok: true, record, ...result });
  }

  // 11. POST /api/evaluasi/save
  if (apiPath.startsWith('/api/evaluasi/save')) {
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
    const result = await appendRecords('EVALUASI', [record], headerAppsScriptUrl);
    return jsonResponse(200, { ok: true, record, ...result });
  }

  return jsonResponse(200, { ok: true, path: apiPath });
}
