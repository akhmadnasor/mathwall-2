# PANDUAN INSTALASI DAN KONFIGURASI DATABASE GOOGLE SHEETS
## MATWALL — Mathematics Interactive Wordwall
**Target:** Matematika Kelas V SD (Kurikulum Merdeka, Fase C, Semester 1)  
**Model Pembelajaran:** Project Based Learning (PjBL) Terintegrasi STEM  
**Nama Database Google Sheets:** `Tesis Bismillah_Mathawall`  

---

### Identitas Pengembang
- **Nama:** MILA AULIA
- **NIM:** 501332956
- **Program Studi:** Mahasiswa S2 MAGISTER PENDIDIKAN DASAR
- **Fakultas:** FAKULTAS ILMU PENDIDIKAN DASAR
- **Perguruan Tinggi:** UNIVERSITAS TERBUKA

---

## 1. Persiapan & Menjalankan Aplikasi secara Lokal

1. Pastikan **Node.js v20+** sudah terpasang.
2. Instal seluruh dependensi dengan perintah:
   ```bash
   npm install
   ```
3. Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
4. Jalankan server pengembangan Full-Stack (Express + Vite pada Port 3000):
   ```bash
   npm run dev
   ```

---

## 2. Struktur 13 Tab Wajib pada Spreadsheet `Tesis Bismillah_Mathawall`

Sistem backend MATWALL dirancang untuk otomatis memeriksa dan membuat tab serta baris judul kolom (*header*) berikut tanpa menghapus data yang sudah ada:

1. **`CONFIG`**: `config_key`, `config_value`, `description`, `updated_at`
2. **`SISWA`**: `id_siswa`, `nama_siswa`, `kelas`, `asal_sekolah`, `waktu_daftar`, `terakhir_aktif`
3. **`SESI`**: `id_sesi`, `id_siswa`, `nama_siswa`, `kelas`, `asal_sekolah`, `waktu_mulai`, `waktu_terakhir`, `status_sesi`
4. **`PROGRESS_MATERI`**: `id_progress`, `id_siswa`, `nama_siswa`, `topik_id`, `judul_topik`, `persentase_baca`, `latihan_benar`, `latihan_total`, `skor_latihan`, `status_selesai`, `waktu_simpan`
5. **`LAB_PERCOBAAN`**: `id_percobaan`, `id_siswa`, `nama_siswa`, `lab_id`, `nama_lab`, `hipotesis`, `variabel_input`, `hasil_simulasi`, `observasi`, `kesimpulan`, `waktu_simpan`
6. **`LKPD`**: `id_lkpd`, `id_siswa`, `nama_siswa`, `kelas`, `asal_sekolah`, `lab_id`, `nama_lab`, `hipotesis`, `data_tabel_json`, `analisis_observasi`, `kesimpulan_stem`, `status_unduh_pdf`, `waktu_simpan`
7. **`HASIL_GAME`**: `id_hasil_game`, `id_siswa`, `nama_siswa`, `kelas`, `game_id`, `nama_game`, `level_dicapai`, `skor`, `jawaban_benar`, `total_soal`, `durasi_detik`, `waktu_main`
8. **`BANK_SOAL`**: `id_soal`, `nomor_soal`, `topik`, `level_kognitif`, `pertanyaan`, `opsi_a`, `opsi_b`, `opsi_c`, `opsi_d`, `kunci_jawaban`, `pembahasan`
9. **`HASIL_QUIZ`**: `id_hasil_quiz`, `id_siswa`, `nama_siswa`, `kelas`, `asal_sekolah`, `skor_akhir`, `jumlah_benar`, `jumlah_salah`, `total_soal`, `durasi_detik`, `predikat`, `waktu_selesai`
10. **`JAWABAN_QUIZ`**: `id_jawaban`, `id_hasil_quiz`, `id_siswa`, `nama_siswa`, `nomor_soal`, `topik`, `jawaban_siswa`, `kunci_jawaban`, `status_benar`, `skor_butir`, `waktu_simpan`
11. **`PROYEK_PJBL`**: `id_proyek`, `id_siswa`, `nama_siswa`, `kelas`, `asal_sekolah`, `nama_resep`, `porsi_target`, `fase_1_pertanyaan`, `fase_2_rencana`, `fase_3_jadwal`, `fase_4_bahan_json`, `fase_4_perbandingan`, `fase_4_total_penjumlahan`, `fase_4_sisa_pengurangan`, `fase_5_presentasi`, `fase_6_refleksi`, `persentase_selesai`, `waktu_simpan`
12. **`EVALUASI`**: `id_evaluasi`, `id_siswa`, `nama_siswa`, `kelas`, `skor_materi`, `skor_lab`, `skor_game`, `skor_quiz`, `skor_pjbl`, `nilai_akhir_komposit`, `refleksi_siswa`, `umpan_balik_sistem`, `umpan_balik_guru`, `waktu_simpan`
13. **`EVENT_LOG`**: `id_event`, `id_siswa`, `nama_siswa`, `jenis_event`, `modul`, `detail_aktivitas`, `status_sinkronisasi`, `timestamp`

---

## 3. Cara Menghubungkan ke Google Sheets `Tesis Bismillah_Mathawall`

Anda dapat memilih **Opsi A (Google Apps Script — Paling Mudah & Tanpa Billing Cloud)** atau **Opsi B (Google Cloud Service Account API v4)**.

### Opsi A: Menggunakan Google Apps Script Web App (Direkomendasikan)

1. Buka file Google Sheets Anda yang bernama **`Tesis Bismillah_Mathawall`** di Google Drive.
2. Klik menu **Ekstensi (Extensions)** -> **Apps Script**.
3. Hapus kode bawaan, lalu tempel (*paste*) kode `Code.gs` berikut:

```javascript
const MANDATORY_TABS = {
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

function ensureTabsAndHeaders(ss, tabsSpec, initialConfig, initialBankSoal) {
  const keys = Object.keys(tabsSpec || MANDATORY_TABS);
  keys.forEach(function(tabName) {
    const headers = (tabsSpec || MANDATORY_TABS)[tabName];
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#E0F2FE');
      if (tabName === 'CONFIG' && Array.isArray(initialConfig)) {
        initialConfig.forEach(function(item) {
          sheet.appendRow(headers.map(function(h) { return item[h] || ''; }));
        });
      }
      if (tabName === 'BANK_SOAL' && Array.isArray(initialBankSoal)) {
        initialBankSoal.forEach(function(item) {
          sheet.appendRow(headers.map(function(h) { return item[h] || ''; }));
        });
      }
    }
  });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureTabsAndHeaders(ss, body.mandatoryTabs, body.initialConfig, body.initialBankSoal);

    if (body.action === 'ENSURE_STRUCTURE') {
      return ContentService.createTextOutput(JSON.stringify({
        ok: true,
        spreadsheetTitle: ss.getName(),
        spreadsheetId: ss.getId()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (body.action === 'APPEND_ROWS') {
      const sheet = ss.getSheetByName(body.tabName);
      (body.rows || []).forEach(function(row) {
        sheet.appendRow(row);
      });
      return ContentService.createTextOutput(JSON.stringify({
        ok: true,
        appended: (body.rows || []).length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (body.action === 'SYNC_ALL_TABS' && body.data) {
      Object.keys(MANDATORY_TABS).forEach(function(tabName) {
        const sheet = ss.getSheetByName(tabName);
        const headers = MANDATORY_TABS[tabName];
        const rows = body.data[tabName] || [];
        const existingValues = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().map(function(r) { return String(r[0]); }) : [];
        rows.forEach(function(rec) {
          const pk = String(rec[headers[0]] || '');
          if (existingValues.indexOf(pk) === -1) {
            sheet.appendRow(headers.map(function(h) { return rec[h] || ''; }));
          }
        });
      });
      return ContentService.createTextOutput(JSON.stringify({
        ok: true,
        message: 'Seluruh 13 tab berhasil disinkronkan ke Google Sheets ' + ss.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: String(err)
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Klik **Terapkan (Deploy)** -> **Deployment baru (New deployment)**.
5. Pilih jenis: **Aplikasi Web (Web App)**.
   - **Jalankan sebagai (Execute as):** *Saya (Me)*
   - **Siapa yang memiliki akses (Who has access):** *Siapa saja (Anyone)*
6. Salin **URL Aplikasi Web (`https://script.google.com/macros/s/.../exec`)** lalu masukkan ke variabel `.env` `GOOGLE_APPS_SCRIPT_URL` atau tempel langsung pada tombol **Status Database Google Sheets** di pojok kanan atas aplikasi MATWALL.

### Opsi B: Menggunakan Google Cloud Service Account (Google Sheets API v4)

1. Buat *Service Account* di Google Cloud Console dan aktifkan **Google Sheets API** serta **Google Drive API**.
2. Bagikan (*Share*) file Google Sheets **`Tesis Bismillah_Mathawall`** ke alamat email *Service Account* sebagai **Editor**.
3. Isi variabel `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, dan `GOOGLE_PRIVATE_KEY` di `.env` atau melalui panel Konfigurasi Database di aplikasi.

---

## 4. Panduan Deploy ke Netlify (Mengatasi Error "Page Not Found / 404")

Pesan **`Page not found (404)`** di Netlify biasanya terjadi karena folder kode sumber (*source code* mentah yang masih berisi `/src/main.tsx`) di-upload langsung melalui *Drag & Drop* tanpa proses *build*, atau *Publish directory* di pengaturan Netlify belum diarahkan ke **`dist`**.

### Cara 1: Deploy via GitHub / Git ke Netlify (Otomatis & Paling Direkomendasikan)
1. Unggah (*push*) seluruh kode proyek ini ke repositori **GitHub** Anda.
2. Masuk ke dashboard **Netlify** -> **Add new site** -> **Import an existing project** -> pilih repositori GitHub Anda.
3. File `netlify.toml` di proyek ini akan otomatis mengatur:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
4. Jika Anda mengatur manual di **Site configuration -> Build & deploy -> Build settings**, pastikan:
   - **Base directory:** *(kosongkan)*
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Klik **Deploy site** (atau **Trigger deploy -> Deploy site**).

### Cara 2: Deploy Manual (*Drag & Drop* / Netlify Drop)
Jika Anda menggunakan fitur **Deploy manually (Drag & Drop)** di Netlify:
1. **Jangan** meng-upload folder proyek mentah secara langsung (karena browser tidak bisa menjalankan file `.tsx` tanpa di-*build*).
2. Jalankan perintah berikut di terminal komputer Anda terlebih dahulu:
   ```bash
   npm install
   npm run build
   ```
3. Perintah di atas akan menghasilkan folder **`dist/`** yang sudah berisi `index.html`, `404.html`, `_redirects`, dan seluruh aset gambar/suara game.
4. Tarik dan lepaskan (**Drag & Drop**) folder **`dist`** tersebut ke halaman **Netlify Deploys**.

