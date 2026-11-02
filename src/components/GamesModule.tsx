import React, { useState, useEffect } from 'react';
import {
  Save,
  Users,
  User,
  Gamepad2,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  CheckCircle2,
  Eye,
  X,
} from 'lucide-react';
import { GameIcon3D, MathText, FractionDisplay } from './FractionVisuals';
import type { StudentIdentity } from '../utils/fractionMath';
import { safeApiRequest } from '../utils/apiClient';

interface GamesModuleProps {
  siswa: StudentIdentity;
  onSavedNotification: (msg: string, syncedToSheets: boolean) => void;
}

type GameId = 'tariktambang' | 'openbox' | 'bridgebuilder';

// ============================================================================
// OFFICIAL SAKTI ASSET MAP (FROM /public/assets/aistudio)
// ============================================================================
const ASSETS = {
  // Audio
  audio: {
    klik: '/assets/aistudio/klik_b54508db.wav',
    benar: '/assets/aistudio/benar_18358031.wav',
    salah: '/assets/aistudio/salah_1c572570.wav',
    pasang_papan: '/assets/aistudio/pasang_papan_e7ec4509.wav',
    langkah_kaki: '/assets/aistudio/langkah_kaki_4f8f54b6.wav',
    peti_terbuka: '/assets/aistudio/peti_terbuka_d411e05c.wav',
    ambil_bintang: '/assets/aistudio/ambil_bintang_5ebc8c98.wav',
    naik_level: '/assets/aistudio/naik_level_311e667a.wav',
  },
  // Tarik Tambang 3D Sprites
  tarikTambang: {
    biruTarik: '/assets/aistudio/tt-biru-tarik_ee35d8e6.webp',
    biruHentak: '/assets/aistudio/tt-biru-hentak_eef121a7.webp',
    biruMenang: '/assets/aistudio/tt-biru-menang_6ddaf54f.webp',
    biruKalah: '/assets/aistudio/tt-biru-kalah_ff3de66a.webp',
    merahTarik: '/assets/aistudio/tt-merah-tarik_eb97556a.webp',
    merahHentak: '/assets/aistudio/tt-merah-hentak_99c60a6c.webp',
    merahMenang: '/assets/aistudio/tt-merah-menang_eae03677.webp',
    merahKalah: '/assets/aistudio/tt-merah-kalah_7b0a0bb0.webp',
  },
  // Karakter 3D & Variasi Efek
  karakter: {
    adit3d: '/assets/aistudio/adit_builder_3d_31ebe636.webp',
    naya3d: '/assets/aistudio/naya_builder_3d_9686708a.webp',
    profesor3d: '/assets/aistudio/profesor_mentor_3d_8626cf18.webp',
    batuRintangan3d: '/assets/aistudio/batu_rintangan_3d_785432dc.webp',
    aditJalan: '/assets/aistudio/adit_jalan_efek_ef3b1d8b.webp',
    aditBerpikir: '/assets/aistudio/adit_berpikir_efek_0e7f6c15.webp',
    aditBerhasil: '/assets/aistudio/adit_berhasil_efek_6f65b80e.webp',
    nayaJalan: '/assets/aistudio/naya_jalan_efek_d26d3174.webp',
    nayaBerpikir: '/assets/aistudio/naya_berpikir_efek_6bd45d45.webp',
    nayaBerhasil: '/assets/aistudio/naya_berhasil_efek_eca49f68.webp',
  },
  // Lingkungan & Struktur Jembatan
  lingkungan: {
    latarSungai: '/assets/aistudio/latar_sungai_b1e99bf9.png',
    latarAirTerjun: '/assets/aistudio/latar_air_terjun_27b1538d.png',
    tebingKiri: '/assets/aistudio/tebing_kiri_41191741.png',
    tebingKanan: '/assets/aistudio/tebing_kanan_69e635b3.png',
    pohonRimbun: '/assets/aistudio/pohon_rimbun_45daf1d3.png',
    semak: '/assets/aistudio/semak_a1917567.png',
    bunga: '/assets/aistudio/bunga_e864394e.png',
    batuDekorasi: '/assets/aistudio/batu_dekorasi_5c615c71.png',
    awanPutih: '/assets/aistudio/awan_putih_3ad24f29.png',
    awanKecil: '/assets/aistudio/awan_kecil_c3063eb9.png',
    tiangPenyanggaKayu: '/assets/aistudio/tiang_penyangga_kayu_045d8758.png',
    tiangBatu: '/assets/aistudio/tiang_batu_88989d52.png',
    pagarTali: '/assets/aistudio/pagar_tali_4f0ad932.png',
    penandaTargetJembatan: '/assets/aistudio/penanda_target_jembatan_b4aca7fd.png',
    jembatanSelesai: '/assets/aistudio/jembatan_selesai_50c3af98.png',
    perbandinganPapan: '/assets/aistudio/perbandingan_panjang_papan_f3773da5.png',
  },
  // Hadiah & Efek
  hadiah: {
    petiHarta: '/assets/aistudio/peti_harta_02e5e276.png',
    benderaFinishing: '/assets/aistudio/bendera_finishing_30286740.png',
    bintangEmas: '/assets/aistudio/bintang_emas_e146828e.png',
    koinBintang: '/assets/aistudio/koin_bintang_3d0b0a2c.png',
    permataBiru: '/assets/aistudio/permata_biru_d998724f.png',
    piala: '/assets/aistudio/piala_48c4c97b.png',
    medaliBenar: '/assets/aistudio/medali_benar_79faa335.png',
    medaliSalah: '/assets/aistudio/medali_salah_0ff8e91d.png',
    kilauBintang: '/assets/aistudio/kilau_bintang_0c99eac6.png',
    debuLompatan: '/assets/aistudio/debu_lompatan_4f90815e.png',
  },
  // UI Tombol & Kartu Pecahan
  ui: {
    tombolMulai: '/assets/aistudio/tombol_mulai_e03cf97b.png',
    tombolCek: '/assets/aistudio/tombol_cek_21f4d537.png',
    tombolUlang: '/assets/aistudio/tombol_ulang_37564e97.png',
    tombolReset: '/assets/aistudio/tombol_reset_65d835f4.png',
    tombolPetunjuk: '/assets/aistudio/tombol_petunjuk_d9c9ea87.png',
    tombolSuara: '/assets/aistudio/tombol_suara_46741ac6.png',
    tombolBeranda: '/assets/aistudio/tombol_beranda_30ba422b.png',
    tombolBerikutnya: '/assets/aistudio/tombol_berikutnya_bf9b17cd.png',
    tombolKembali: '/assets/aistudio/tombol_kembali_abfcba64.png',
    tombolPilihKarakter: '/assets/aistudio/tombol_pilih_karakter_b96e834a.png',
    tombolInformasi: '/assets/aistudio/tombol_informasi_b2c45291.png',
    kartuKosong: '/assets/aistudio/kartu_pecahan_kosong_c2ae1172.png',
    kartu1_2: '/assets/aistudio/kartu_1_2_bcdc13b6.png',
    kartu1_3: '/assets/aistudio/kartu_1_3_36de1128.png',
    kartu1_4: '/assets/aistudio/kartu_1_4_8eef1bbc.png',
    kartu1_5: '/assets/aistudio/kartu_1_5_9ce55f9d.png',
    kartu1_6: '/assets/aistudio/kartu_1_6_aae8b445.png',
    kartu1_8: '/assets/aistudio/kartu_1_8_4972c6c6.png',
    kartu2_3: '/assets/aistudio/kartu_2_3_c0f7e55d.png',
    kartu3_4: '/assets/aistudio/kartu_3_4_f81364ef.png',
    kartu5_6: '/assets/aistudio/kartu_5_6_aa2ea30b.png',
    kartuUtuh: '/assets/aistudio/kartu_utuh_77d9abc9.png',
  },
};

const BOARD_ASSET_MAP: Record<string, string> = {
  'jembatan/papan_pecahan/papan_utuh.png': '/assets/aistudio/papan_utuh_bfa5a5a7.png',
  'jembatan/papan_pecahan/papan_1_2.png': '/assets/aistudio/papan_1_2_15c6cdab.png',
  'jembatan/papan_pecahan/papan_1_3.png': '/assets/aistudio/papan_1_3_cf07a2c4.png',
  'jembatan/papan_pecahan/papan_1_4.png': '/assets/aistudio/papan_1_4_3fb6ecfd.png',
  'jembatan/papan_pecahan/papan_1_5.png': '/assets/aistudio/papan_1_5_f9735130.png',
  'jembatan/papan_pecahan/papan_1_6.png': '/assets/aistudio/papan_1_6_1c48e76d.png',
  'jembatan/papan_pecahan/papan_1_8.png': '/assets/aistudio/papan_1_8_004b260d.png',
  'jembatan/papan_rasio/papan_merah_1_2.png': '/assets/aistudio/papan_merah_1_2_9d3dba1a.png',
  'jembatan/papan_rasio/papan_merah_1_3.png': '/assets/aistudio/papan_merah_1_3_a4e8462f.png',
  'jembatan/papan_rasio/papan_merah_1_4.png': '/assets/aistudio/papan_merah_1_4_fa40ecbd.png',
  'jembatan/papan_rasio/papan_merah_1_5.png': '/assets/aistudio/papan_merah_1_5_1a7b39bf.png',
  'jembatan/papan_rasio/papan_merah_1_6.png': '/assets/aistudio/papan_merah_1_6_08bf97e1.png',
  'jembatan/papan_rasio/papan_merah_1_8.png': '/assets/aistudio/papan_merah_1_8_69c332fe.png',
  'jembatan/papan_rasio/papan_biru_1_2.png': '/assets/aistudio/papan_biru_1_2_f58ad3af.png',
  'jembatan/papan_rasio/papan_biru_1_3.png': '/assets/aistudio/papan_biru_1_3_bf31b6ab.png',
  'jembatan/papan_rasio/papan_biru_1_4.png': '/assets/aistudio/papan_biru_1_4_4783de7b.png',
  'jembatan/papan_rasio/papan_biru_1_5.png': '/assets/aistudio/papan_biru_1_5_a7d46663.png',
  'jembatan/papan_rasio/papan_biru_1_6.png': '/assets/aistudio/papan_biru_1_6_be15484b.png',
  'jembatan/papan_rasio/papan_biru_1_8.png': '/assets/aistudio/papan_biru_1_8_fc7e2471.png',
};

const FRACTION_CARD_MAP: Record<string, string> = {
  '1/2': ASSETS.ui.kartu1_2,
  '1/3': ASSETS.ui.kartu1_3,
  '1/4': ASSETS.ui.kartu1_4,
  '1/5': ASSETS.ui.kartu1_5,
  '1/6': ASSETS.ui.kartu1_6,
  '1/8': ASSETS.ui.kartu1_8,
  '2/3': ASSETS.ui.kartu2_3,
  '3/4': ASSETS.ui.kartu3_4,
  '5/6': ASSETS.ui.kartu5_6,
  '1': ASSETS.ui.kartuUtuh,
  '1/1': ASSETS.ui.kartuUtuh,
};

// ============================================================================
// EXACT FRACTION ARITHMETIC & VALIDATOR FOR BRIDGE BUILDER (FROM game_logic.js)
// ============================================================================
export interface ExactFrac {
  pembilang: number;
  penyebut: number;
}

const fracTuple = (f: ExactFrac): [number, number] => {
  if (!f || !Number.isInteger(f.pembilang) || !Number.isInteger(f.penyebut) || f.penyebut <= 0) {
    return [0, 1];
  }
  return [f.pembilang, f.penyebut];
};

const fracEq = (a: ExactFrac, b: ExactFrac): boolean => {
  const x = fracTuple(a);
  const y = fracTuple(b);
  return x[0] * y[1] === y[0] * x[1];
};

const fracPlus = (a: ExactFrac, b: ExactFrac): ExactFrac => {
  const x = fracTuple(a);
  const y = fracTuple(b);
  return { pembilang: x[0] * y[1] + y[0] * x[1], penyebut: x[1] * y[1] };
};

const fracMinus = (a: ExactFrac, b: ExactFrac): ExactFrac => {
  const x = fracTuple(a);
  const y = fracTuple(b);
  return { pembilang: x[0] * y[1] - y[0] * x[1], penyebut: x[1] * y[1] };
};

const fracZero = (): ExactFrac => ({ pembilang: 0, penyebut: 1 });

const fracSum = (arr: ExactFrac[]): ExactFrac => arr.reduce((a, b) => fracPlus(a, b), fracZero());

const gcdNum = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcdNum(b, a % b));

const simplifyFrac = (f: ExactFrac): ExactFrac => {
  if (f.pembilang === 0) return { pembilang: 0, penyebut: 1 };
  const g = gcdNum(f.pembilang, f.penyebut);
  return { pembilang: f.pembilang / g, penyebut: f.penyebut / g };
};

const calcStars = (wrong: number, hint: number): 1 | 2 | 3 => {
  if (wrong === 0 && hint === 0) return 3;
  if (wrong <= 1 && hint <= 1) return 2;
  return 1;
};

// ============================================================================
// 12 OFFICIAL BRIDGE BUILDER LEVELS (FROM aturan_bermain.json)
// ============================================================================
export interface BridgeInventoryItem {
  warna?: 'merah' | 'biru';
  aset: string;
  jumlah: number;
  pecahan: ExactFrac;
}

export interface BridgeLevelConfig {
  level: number;
  materi: 'rasio' | 'penjumlahan' | 'pengurangan';
  mode: 'susun_rasio' | 'susun_per_kelompok' | 'hapus_papan';
  judul: string;
  instruksi: string;
  rasio_target?: { merah: number; biru: number };
  jumlah_wajib?: { merah: number; biru: number };
  ukuran_setiap_papan?: ExactFrac;
  inventaris?: BridgeInventoryItem[];
  operasi?: {
    jenis: 'tambah' | 'kurang';
    suku?: ExactFrac[];
    awal?: ExactFrac;
    dikurangi?: ExactFrac;
    hasil: ExactFrac;
  };
  kelompok_penyusun?: Array<{
    label: string;
    nilai: ExactFrac;
  }>;
  jembatan_awal?: {
    aset: string;
    jumlah: number;
    nilai_setiap_papan: ExactFrac;
  };
  jumlah_papan_dihapus?: number;
  target_panjang: ExactFrac;
  petunjuk: string;
  scene: 'latar_sungai' | 'latar_air_terjun';
}

const BRIDGE_LEVELS: BridgeLevelConfig[] = [
  {
    level: 1,
    materi: 'rasio',
    mode: 'susun_rasio',
    judul: 'Rasio Merah-Biru',
    instruksi: 'Mulailah dari rasio 2 : 3. Susun dua papan merah dan tiga papan biru.',
    rasio_target: { merah: 2, biru: 3 },
    jumlah_wajib: { merah: 2, biru: 3 },
    ukuran_setiap_papan: { pembilang: 1, penyebut: 5 },
    inventaris: [
      { warna: 'merah', aset: 'jembatan/papan_rasio/papan_merah_1_5.png', jumlah: 3, pecahan: { pembilang: 1, penyebut: 5 } },
      { warna: 'biru', aset: 'jembatan/papan_rasio/papan_biru_1_5.png', jumlah: 4, pecahan: { pembilang: 1, penyebut: 5 } },
    ],
    target_panjang: { pembilang: 1, penyebut: 1 },
    petunjuk: 'Perbandingan merah:biru adalah 2:3. Pilih 2 merah dan 3 biru; panjang penuh adalah 5/5.',
    scene: 'latar_sungai',
  },
  {
    level: 2,
    materi: 'rasio',
    mode: 'susun_rasio',
    judul: 'Jembatan Kembar',
    instruksi: 'Dua papan merah berpasangan dengan empat papan biru, yaitu 1 : 2.',
    rasio_target: { merah: 1, biru: 2 },
    jumlah_wajib: { merah: 2, biru: 4 },
    ukuran_setiap_papan: { pembilang: 1, penyebut: 6 },
    inventaris: [
      { warna: 'merah', aset: 'jembatan/papan_rasio/papan_merah_1_6.png', jumlah: 3, pecahan: { pembilang: 1, penyebut: 6 } },
      { warna: 'biru', aset: 'jembatan/papan_rasio/papan_biru_1_6.png', jumlah: 5, pecahan: { pembilang: 1, penyebut: 6 } },
    ],
    target_panjang: { pembilang: 1, penyebut: 1 },
    petunjuk: 'Perbandingan merah:biru adalah 1:2. Pilih 2 merah dan 4 biru; panjang penuh adalah 6/6.',
    scene: 'latar_sungai',
  },
  {
    level: 3,
    materi: 'rasio',
    mode: 'susun_rasio',
    judul: 'Misi 3 Banding 2',
    instruksi: 'Bangun jembatan dengan tiga papan merah dan dua papan biru.',
    rasio_target: { merah: 3, biru: 2 },
    jumlah_wajib: { merah: 3, biru: 2 },
    ukuran_setiap_papan: { pembilang: 1, penyebut: 5 },
    inventaris: [
      { warna: 'merah', aset: 'jembatan/papan_rasio/papan_merah_1_5.png', jumlah: 4, pecahan: { pembilang: 1, penyebut: 5 } },
      { warna: 'biru', aset: 'jembatan/papan_rasio/papan_biru_1_5.png', jumlah: 3, pecahan: { pembilang: 1, penyebut: 5 } },
    ],
    target_panjang: { pembilang: 1, penyebut: 1 },
    petunjuk: 'Perbandingan merah:biru adalah 3:2. Pilih 3 merah dan 2 biru; panjang penuh adalah 5/5.',
    scene: 'latar_sungai',
  },
  {
    level: 4,
    materi: 'penjumlahan',
    mode: 'susun_per_kelompok',
    judul: 'Dua Bagian Jembatan',
    instruksi: 'Gabungkan 1/2 dan 1/4 menjadi 3/4.',
    operasi: {
      jenis: 'tambah',
      suku: [
        { pembilang: 1, penyebut: 2 },
        { pembilang: 1, penyebut: 4 },
      ],
      hasil: { pembilang: 3, penyebut: 4 },
    },
    kelompok_penyusun: [
      { label: 'Suku 1 (1/2)', nilai: { pembilang: 1, penyebut: 2 } },
      { label: 'Suku 2 (1/4)', nilai: { pembilang: 1, penyebut: 4 } },
    ],
    inventaris: [
      { aset: 'jembatan/papan_pecahan/papan_1_2.png', jumlah: 1, pecahan: { pembilang: 1, penyebut: 2 } },
      { aset: 'jembatan/papan_pecahan/papan_1_4.png', jumlah: 2, pecahan: { pembilang: 1, penyebut: 4 } },
      { aset: 'jembatan/papan_pecahan/papan_1_6.png', jumlah: 1, pecahan: { pembilang: 1, penyebut: 6 } },
    ],
    target_panjang: { pembilang: 3, penyebut: 4 },
    petunjuk: 'Samakan penyebut jika perlu. Susun setiap suku pada kelompoknya masing-masing, lalu gabungkan panjangnya.',
    scene: 'latar_sungai',
  },
  {
    level: 5,
    materi: 'penjumlahan',
    mode: 'susun_per_kelompok',
    judul: 'Jembatan Setengah',
    instruksi: 'Gabungkan 1/3 dan 1/6 menjadi 1/2.',
    operasi: {
      jenis: 'tambah',
      suku: [
        { pembilang: 1, penyebut: 3 },
        { pembilang: 1, penyebut: 6 },
      ],
      hasil: { pembilang: 1, penyebut: 2 },
    },
    kelompok_penyusun: [
      { label: 'Suku 1 (1/3)', nilai: { pembilang: 1, penyebut: 3 } },
      { label: 'Suku 2 (1/6)', nilai: { pembilang: 1, penyebut: 6 } },
    ],
    inventaris: [
      { aset: 'jembatan/papan_pecahan/papan_1_3.png', jumlah: 1, pecahan: { pembilang: 1, penyebut: 3 } },
      { aset: 'jembatan/papan_pecahan/papan_1_6.png', jumlah: 3, pecahan: { pembilang: 1, penyebut: 6 } },
      { aset: 'jembatan/papan_pecahan/papan_1_4.png', jumlah: 1, pecahan: { pembilang: 1, penyebut: 4 } },
    ],
    target_panjang: { pembilang: 1, penyebut: 2 },
    petunjuk: 'Samakan penyebut jika perlu. Susun setiap suku pada kelompoknya masing-masing, lalu gabungkan panjangnya.',
    scene: 'latar_sungai',
  },
  {
    level: 6,
    materi: 'penjumlahan',
    mode: 'susun_per_kelompok',
    judul: 'Jembatan Utuh',
    instruksi: 'Tiga kelompok pecahan (1/4 + 1/4 + 1/2) akan membangun satu jembatan utuh.',
    operasi: {
      jenis: 'tambah',
      suku: [
        { pembilang: 1, penyebut: 4 },
        { pembilang: 1, penyebut: 4 },
        { pembilang: 1, penyebut: 2 },
      ],
      hasil: { pembilang: 1, penyebut: 1 },
    },
    kelompok_penyusun: [
      { label: 'Suku 1 (1/4)', nilai: { pembilang: 1, penyebut: 4 } },
      { label: 'Suku 2 (1/4)', nilai: { pembilang: 1, penyebut: 4 } },
      { label: 'Suku 3 (1/2)', nilai: { pembilang: 1, penyebut: 2 } },
    ],
    inventaris: [
      { aset: 'jembatan/papan_pecahan/papan_1_4.png', jumlah: 3, pecahan: { pembilang: 1, penyebut: 4 } },
      { aset: 'jembatan/papan_pecahan/papan_1_2.png', jumlah: 1, pecahan: { pembilang: 1, penyebut: 2 } },
      { aset: 'jembatan/papan_pecahan/papan_1_3.png', jumlah: 1, pecahan: { pembilang: 1, penyebut: 3 } },
      { aset: 'jembatan/papan_pecahan/papan_1_6.png', jumlah: 1, pecahan: { pembilang: 1, penyebut: 6 } },
    ],
    target_panjang: { pembilang: 1, penyebut: 1 },
    petunjuk: 'Susun 1/4 pada Suku 1, 1/4 pada Suku 2, dan 1/2 pada Suku 3 sehingga totalnya 1 utuh.',
    scene: 'latar_sungai',
  },
  {
    level: 7,
    materi: 'penjumlahan',
    mode: 'susun_per_kelompok',
    judul: 'Lima per Enam',
    instruksi: 'Gunakan dua potong 1/3 untuk mewakili 2/3, lalu tambah 1/6 menjadi 5/6.',
    operasi: {
      jenis: 'tambah',
      suku: [
        { pembilang: 2, penyebut: 3 },
        { pembilang: 1, penyebut: 6 },
      ],
      hasil: { pembilang: 5, penyebut: 6 },
    },
    kelompok_penyusun: [
      { label: 'Suku 1 (2/3)', nilai: { pembilang: 2, penyebut: 3 } },
      { label: 'Suku 2 (1/6)', nilai: { pembilang: 1, penyebut: 6 } },
    ],
    inventaris: [
      { aset: 'jembatan/papan_pecahan/papan_1_3.png', jumlah: 3, pecahan: { pembilang: 1, penyebut: 3 } },
      { aset: 'jembatan/papan_pecahan/papan_1_6.png', jumlah: 2, pecahan: { pembilang: 1, penyebut: 6 } },
      { aset: 'jembatan/papan_pecahan/papan_1_2.png', jumlah: 1, pecahan: { pembilang: 1, penyebut: 2 } },
    ],
    target_panjang: { pembilang: 5, penyebut: 6 },
    petunjuk: 'Masukkan 2 papan 1/3 ke Suku 1 (= 2/3) dan 1 papan 1/6 ke Suku 2 (= 1/6). Totalnya 5/6!',
    scene: 'latar_sungai',
  },
  {
    level: 8,
    materi: 'pengurangan',
    mode: 'hapus_papan',
    judul: 'Jembatan yang Menyusut',
    instruksi: 'Hapus 2 papan 1/6 (= 1/3) dari 5 papan 1/6; 3 papan yang tersisa = 1/2.',
    operasi: {
      jenis: 'kurang',
      awal: { pembilang: 5, penyebut: 6 },
      dikurangi: { pembilang: 1, penyebut: 3 },
      hasil: { pembilang: 1, penyebut: 2 },
    },
    jembatan_awal: {
      aset: 'jembatan/papan_pecahan/papan_1_6.png',
      jumlah: 5,
      nilai_setiap_papan: { pembilang: 1, penyebut: 6 },
    },
    jumlah_papan_dihapus: 2,
    target_panjang: { pembilang: 1, penyebut: 2 },
    petunjuk: 'Ketuk 2 papan 1/6 pada jembatan awal untuk menguranginya (2/6 = 1/3). Sisanya 3/6 = 1/2.',
    scene: 'latar_sungai',
  },
  {
    level: 9,
    materi: 'pengurangan',
    mode: 'hapus_papan',
    judul: 'Sisa Seperempat',
    instruksi: 'Hapus 2 papan 1/4 (= 1/2) dari 3 papan 1/4; sisanya 1/4.',
    operasi: {
      jenis: 'kurang',
      awal: { pembilang: 3, penyebut: 4 },
      dikurangi: { pembilang: 1, penyebut: 2 },
      hasil: { pembilang: 1, penyebut: 4 },
    },
    jembatan_awal: {
      aset: 'jembatan/papan_pecahan/papan_1_4.png',
      jumlah: 3,
      nilai_setiap_papan: { pembilang: 1, penyebut: 4 },
    },
    jumlah_papan_dihapus: 2,
    target_panjang: { pembilang: 1, penyebut: 4 },
    petunjuk: 'Ketuk 2 papan 1/4 pada jembatan awal untuk menguranginya. Sisanya tinggal 1/4.',
    scene: 'latar_sungai',
  },
  {
    level: 10,
    materi: 'pengurangan',
    mode: 'hapus_papan',
    judul: 'Dua Pertiga Tersisa',
    instruksi: 'Dari 3 papan 1/3 (1 utuh), hapus 1 papan 1/3. Sisanya 2/3.',
    operasi: {
      jenis: 'kurang',
      awal: { pembilang: 1, penyebut: 1 },
      dikurangi: { pembilang: 1, penyebut: 3 },
      hasil: { pembilang: 2, penyebut: 3 },
    },
    jembatan_awal: {
      aset: 'jembatan/papan_pecahan/papan_1_3.png',
      jumlah: 3,
      nilai_setiap_papan: { pembilang: 1, penyebut: 3 },
    },
    jumlah_papan_dihapus: 1,
    target_panjang: { pembilang: 2, penyebut: 3 },
    petunjuk: 'Ketuk 1 papan 1/3 pada jembatan awal untuk menguranginya sehingga tersisa 2/3.',
    scene: 'latar_sungai',
  },
  {
    level: 11,
    materi: 'pengurangan',
    mode: 'hapus_papan',
    judul: 'Tantangan Delapan',
    instruksi: 'Dari 7 papan 1/8, hapus 3 papan 1/8. Sisanya 4/8 = 1/2.',
    operasi: {
      jenis: 'kurang',
      awal: { pembilang: 7, penyebut: 8 },
      dikurangi: { pembilang: 3, penyebut: 8 },
      hasil: { pembilang: 1, penyebut: 2 },
    },
    jembatan_awal: {
      aset: 'jembatan/papan_pecahan/papan_1_8.png',
      jumlah: 7,
      nilai_setiap_papan: { pembilang: 1, penyebut: 8 },
    },
    jumlah_papan_dihapus: 3,
    target_panjang: { pembilang: 1, penyebut: 2 },
    petunjuk: 'Ketuk 3 papan 1/8 pada jembatan awal untuk menguranginya. Sisanya 4 papan 1/8 = 1/2.',
    scene: 'latar_air_terjun',
  },
  {
    level: 12,
    materi: 'pengurangan',
    mode: 'hapus_papan',
    judul: 'Misi Akhir Pahlawan',
    instruksi: 'Dari 5 papan 1/6, hapus 1 papan 1/6. Sisanya 4/6 = 2/3.',
    operasi: {
      jenis: 'kurang',
      awal: { pembilang: 5, penyebut: 6 },
      dikurangi: { pembilang: 1, penyebut: 6 },
      hasil: { pembilang: 2, penyebut: 3 },
    },
    jembatan_awal: {
      aset: 'jembatan/papan_pecahan/papan_1_6.png',
      jumlah: 5,
      nilai_setiap_papan: { pembilang: 1, penyebut: 6 },
    },
    jumlah_papan_dihapus: 1,
    target_panjang: { pembilang: 2, penyebut: 3 },
    petunjuk: 'Ketuk 1 papan 1/6 pada jembatan awal untuk menguranginya. Sisanya 4/6 = 2/3.',
    scene: 'latar_air_terjun',
  },
];

// Official validator matching game_logic.js
function validateBridgeLevel(
  level: BridgeLevelConfig,
  play: {
    papan?: Array<{ warna?: 'merah' | 'biru'; pecahan: ExactFrac; aset: string }>;
    kelompok?: Array<Array<{ pecahan: ExactFrac; aset: string }>>;
    indeks_dihapus?: number[];
  }
): { benar: boolean; alasan: string; pesan: string } {
  if (level.mode === 'susun_rasio') {
    const arr = play.papan || [];
    if (arr.length === 0) {
      return {
        benar: false,
        alasan: 'kurang_panjang',
        pesan: 'Jembatan belum mencapai target. Tambahkan papan merah dan biru sesuai rasio.',
      };
    }
    const nRed = arr.filter((v) => v.warna === 'merah').length;
    const nBlue = arr.filter((v) => v.warna === 'biru').length;
    const totalLen = fracSum(arr.map((v) => v.pecahan));
    if (!fracEq(totalLen, level.target_panjang)) {
      const isOver = totalLen.pembilang * level.target_panjang.penyebut > level.target_panjang.pembilang * totalLen.penyebut;
      return {
        benar: false,
        alasan: 'panjang_belum_tepat',
        pesan: isOver
          ? 'Papan melewati target. Coba kurangi papan.'
          : 'Jembatan belum mencapai panjang 1 utuh. Tambahkan papan yang sesuai.',
      };
    }
    if (
      level.jumlah_wajib &&
      (nRed !== level.jumlah_wajib.merah || nBlue !== level.jumlah_wajib.biru)
    ) {
      return {
        benar: false,
        alasan: 'jumlah_warna_salah',
        pesan: `Periksa banyak papan merah (${nRed}) dibandingkan papan biru (${nBlue}). Target: ${level.jumlah_wajib.merah} merah & ${level.jumlah_wajib.biru} biru.`,
      };
    }
    const ratioOk =
      level.rasio_target &&
      nRed * level.rasio_target.biru === nBlue * level.rasio_target.merah;
    return {
      benar: Boolean(ratioOk),
      alasan: 'rasio',
      pesan: ratioOk
        ? 'Hebat! Jembatan rasio merah-biru tepat 1 utuh. Ayo menyeberang!'
        : 'Periksa kembali perbandingan papan merah dan biru.',
    };
  }

  if (level.mode === 'susun_per_kelompok') {
    const groups = play.kelompok || [];
    const targetGroups = level.kelompok_penyusun || [];
    if (groups.length !== targetGroups.length) {
      return {
        benar: false,
        alasan: 'kelompok_belum_lengkap',
        pesan: 'Isi setiap kelompok suku pecahan terlebih dahulu.',
      };
    }
    const total: ExactFrac[] = [];
    for (let i = 0; i < targetGroups.length; i++) {
      const g = groups[i] || [];
      const s = fracSum(g.map((v) => v.pecahan));
      if (!fracEq(s, targetGroups[i].nilai)) {
        return {
          benar: false,
          alasan: 'isi_kelompok_salah',
          pesan: `Periksa kembali papan pada ${targetGroups[i].label}. Nilai saat ini belum sama dengan ${targetGroups[i].nilai.pembilang}/${targetGroups[i].nilai.penyebut}.`,
        };
      }
      total.push(s);
    }
    const grandTotal = fracSum(total);
    const ok = fracEq(grandTotal, level.target_panjang);
    return {
      benar: ok,
      alasan: 'total_kelompok',
      pesan: ok
        ? 'Hebat! Penjumlahan kelompok papan jembatanmu tepat. Ayo menyeberang!'
        : 'Gabungan seluruh kelompok belum mencapai panjang target.',
    };
  }

  if (level.mode === 'hapus_papan') {
    const arr = play.indeks_dihapus || [];
    const init = level.jembatan_awal!;
    const each = init.nilai_setiap_papan;
    const removed = fracSum(arr.map(() => each));
    const initial = fracSum(Array(init.jumlah).fill(each));
    if (!fracEq(removed, level.operasi!.dikurangi!)) {
      return {
        benar: false,
        alasan: 'bagian_dihapus_tidak_tepat',
        pesan: `Bandingkan jumlah papan yang dilepas (${arr.length} papan) dengan pecahan pengurangnya (${level.operasi!.dikurangi!.pembilang}/${level.operasi!.dikurangi!.penyebut}).`,
      };
    }
    const remaining = fracMinus(initial, removed);
    const ok = fracEq(remaining, level.operasi!.hasil);
    return {
      benar: ok,
      alasan: 'hasil_pengurangan',
      pesan: ok
        ? 'Hebat! Pengurangan papan jembatanmu tepat. Ayo menyeberang!'
        : 'Sisa panjang papan belum sesuai hasil pengurangan.',
    };
  }

  return { benar: false, alasan: 'mode_tidak_dikenal', pesan: 'Mode tidak dikenal.' };
}

// ============================================================================
// QUESTION BANK FOR TARIK TAMBANG & OPEN BOX (USING FRACTION CARD ASSETS)
// ============================================================================
interface MathChallenge {
  prompt: string;
  options: string[];
  correct: string;
  hint: string;
}

const LEVEL_CHALLENGES: Record<1 | 2 | 3, MathChallenge[]> = {
  1: [
    {
      prompt: 'Pecahan manakah yang nilainya PALING BESAR?',
      options: ['3/4', '1/2', '1/4', '1/8'],
      correct: '3/4',
      hint: 'Samakan penyebut ke 8: 3/4 = 6/8, 1/2 = 4/8, 1/4 = 2/8, 1/8 = 1/8.',
    },
    {
      prompt: 'Hasil penjumlahan dari 1/4 + 2/4 adalah ...',
      options: ['3/4', '1/2', '1/4', '2/3'],
      correct: '3/4',
      hint: 'Penyebut sudah sama (4), jumlahkan pembilang: 1/4 + 2/4 = 3/4.',
    },
    {
      prompt: 'Hasil pengurangan 5/6 - 2/6 dalam bentuk paling sederhana adalah ...',
      options: ['1/2', '1/3', '1/6', '5/6'],
      correct: '1/2',
      hint: '5/6 - 2/6 = 3/6. Disederhanakan dibagi 3 menjadi 1/2.',
    },
    {
      prompt: 'Dua potong papan 1/2 jika digabungkan menghasilkan panjang ...',
      options: ['1', '1/2', '3/4', '2/3'],
      correct: '1',
      hint: '1/2 + 1/2 = 2/2 = 1 utuh.',
    },
  ],
  2: [
    {
      prompt: 'Hasil penjumlahan berpenyebut berbeda: 1/2 + 1/3 = ...',
      options: ['5/6', '2/3', '3/4', '1/6'],
      correct: '5/6',
      hint: 'KPK(2,3) = 6 → 3/6 + 2/6 = 5/6.',
    },
    {
      prompt: 'Hasil penjumlahan 1/2 + 1/4 adalah ...',
      options: ['3/4', '1/3', '5/6', '1/8'],
      correct: '3/4',
      hint: 'Ubah 1/2 menjadi 2/4. Maka 2/4 + 1/4 = 3/4.',
    },
    {
      prompt: 'Manakah pecahan yang SENILAI dengan 4/6?',
      options: ['2/3', '3/4', '1/2', '1/3'],
      correct: '2/3',
      hint: 'Bagi pembilang dan penyebut 4/6 dengan FPB 2 → 2/3.',
    },
    {
      prompt: 'Hasil penjumlahan 1/3 + 1/6 dalam bentuk paling sederhana adalah ...',
      options: ['1/2', '2/3', '5/6', '1/4'],
      correct: '1/2',
      hint: '1/3 = 2/6. Maka 2/6 + 1/6 = 3/6 = 1/2.',
    },
  ],
  3: [
    {
      prompt: 'Hasil dari 2/3 + 1/6 dalam bentuk paling sederhana = ...',
      options: ['5/6', '2/3', '3/4', '1/2'],
      correct: '5/6',
      hint: '2/3 = 4/6. Maka 4/6 + 1/6 = 5/6.',
    },
    {
      prompt: 'Hasil pengurangan 5/6 - 1/3 dalam bentuk paling sederhana = ...',
      options: ['1/2', '2/3', '1/6', '1/4'],
      correct: '1/2',
      hint: '1/3 = 2/6. Maka 5/6 - 2/6 = 3/6 = 1/2.',
    },
    {
      prompt: 'Hasil pengurangan 7/8 - 3/8 dalam bentuk paling sederhana = ...',
      options: ['1/2', '3/4', '1/4', '1/8'],
      correct: '1/2',
      hint: '7/8 - 3/8 = 4/8 = 1/2.',
    },
    {
      prompt: 'Hasil pengurangan 1 - 1/3 adalah ...',
      options: ['2/3', '1/3', '3/4', '5/6'],
      correct: '2/3',
      hint: '1 utuh = 3/3. Maka 3/3 - 1/3 = 2/3.',
    },
  ],
};

const STORAGE_KEY_BRIDGE = 'sakti_bridge_builder_pecahan_v1';

export const GamesModule: React.FC<GamesModuleProps> = ({
  siswa,
  onSavedNotification,
}) => {
  const [launchedGame, setLaunchedGame] = useState<GameId | null>(null);
  const [isSplitScreen, setIsSplitScreen] = useState<boolean>(false);
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const playSound = (audioUrl: string) => {
    if (!soundEnabled) return;
    try {
      const a = new Audio(audioUrl);
      a.volume = 0.7;
      a.play().catch(() => {});
    } catch {
      // ignore audio autoplay restrictions
    }
  };

  // Player 1 & Player 2 Shared State
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [questionIdx, setQuestionIdx] = useState<number>(0);
  const [feedbackBanner, setFeedbackBanner] = useState<string>('');
  const [lastOutcomeStatus, setLastOutcomeStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const [p2Score, setP2Score] = useState<number>(0);
  const [p2CorrectCount, setP2CorrectCount] = useState<number>(0);
  const [p2TotalAnswered, setP2TotalAnswered] = useState<number>(0);
  const [p2QuestionIdx, setP2QuestionIdx] = useState<number>(1);
  const [p2Feedback, setP2Feedback] = useState<string>('Tim Merah siap bertanding di layar kanan!');

  const [startTime, setStartTime] = useState<number>(Date.now());
  const [savingScore, setSavingScore] = useState<boolean>(false);
  const [highScores, setHighScores] = useState<Record<GameId, number>>({
    tariktambang: 0,
    openbox: 0,
    bridgebuilder: 0,
  });

  // ============================================================================
  // GAME 1 STATE: TARIK TAMBANG 3D
  // ============================================================================
  const [ropeOffset, setRopeOffset] = useState<number>(0); // -100 (Tim Biru Menang) to +100 (Tim Merah Menang)
  const [blueAction, setBlueAction] = useState<'tarik' | 'hentak' | 'menang' | 'kalah'>('tarik');
  const [redAction, setRedAction] = useState<'tarik' | 'hentak' | 'menang' | 'kalah'>('tarik');

  // ============================================================================
  // GAME 2 STATE: OPEN BOX 3D (PETI HARTA MISTERI)
  // ============================================================================
  const [openedBoxes, setOpenedBoxes] = useState<
    Record<number, { points: number; solved: boolean; rewardType: 'gem' | 'star' | 'coin'; owner?: 'P1' | 'P2' }>
  >({});
  const [activeBoxModal, setActiveBoxModal] = useState<{ boxNum: number; player: 'P1' | 'P2' } | null>(null);

  // ============================================================================
  // GAME 3 STATE: BRIDGE BUILDER PECAHAN SAKTI (12 LEVELS)
  // ============================================================================
  const [bridgeCharacter, setBridgeCharacter] = useState<'adit' | 'naya'>('adit');
  const [bridgeLevelNum, setBridgeLevelNum] = useState<number>(1);
  const [unlockedBridgeLevel, setUnlockedBridgeLevel] = useState<number>(1);
  const [bridgeStarsByLevel, setBridgeStarsByLevel] = useState<Record<number, number>>({});
  const [bridgeWrongCount, setBridgeWrongCount] = useState<number>(0);
  const [bridgeHintCount, setBridgeHintCount] = useState<number>(0);
  const [showBridgeHint, setShowBridgeHint] = useState<boolean>(false);
  const [showBoardReferenceModal, setShowBoardReferenceModal] = useState<boolean>(false);
  const [bridgeCrossingAnim, setBridgeCrossingAnim] = useState<boolean>(false);

  // Mode 1: susun_rasio placed boards
  const [ratioPlacedBoards, setRatioPlacedBoards] = useState<
    Array<{ warna: 'merah' | 'biru'; pecahan: ExactFrac; aset: string }>
  >([]);
  // Mode 2: susun_per_kelompok placed boards per group
  const [groupPlacedBoards, setGroupPlacedBoards] = useState<
    Array<Array<{ pecahan: ExactFrac; aset: string }>>
  >([[], []]);
  const [activeGroupIdx, setActiveGroupIdx] = useState<number>(0);
  // Mode 3: hapus_papan removed indices
  const [removedBoardIndices, setRemovedBoardIndices] = useState<number[]>([]);

  // Load saved Bridge Builder progress from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BRIDGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.karakter === 'adit' || parsed.karakter === 'naya') {
          setBridgeCharacter(parsed.karakter);
        }
        if (typeof parsed.level_terbuka === 'number') {
          setUnlockedBridgeLevel(Math.max(1, Math.min(12, parsed.level_terbuka)));
        }
        if (parsed.bintang_per_level && typeof parsed.bintang_per_level === 'object') {
          setBridgeStarsByLevel(parsed.bintang_per_level);
        }
        if (typeof parsed.total_skor === 'number') {
          setHighScores((prev) => ({
            ...prev,
            bridgebuilder: Math.max(prev.bridgebuilder, parsed.total_skor),
          }));
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveBridgeProgressLocal = (
    nextChar: 'adit' | 'naya',
    nextUnlocked: number,
    nextStarsMap: Record<number, number>,
    nextTotalScore: number
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY_BRIDGE,
        JSON.stringify({
          karakter: nextChar,
          level_terbuka: nextUnlocked,
          bintang_per_level: nextStarsMap,
          total_skor: nextTotalScore,
          pengaturan_audio: soundEnabled,
        })
      );
    } catch {
      // ignore
    }
  };

  const currentBridgeConfig =
    BRIDGE_LEVELS.find((l) => l.level === bridgeLevelNum) || BRIDGE_LEVELS[0];

  const initBridgeLevelState = (lvlNum: number) => {
    const cfg = BRIDGE_LEVELS.find((l) => l.level === lvlNum) || BRIDGE_LEVELS[0];
    setBridgeLevelNum(cfg.level);
    setRatioPlacedBoards([]);
    setGroupPlacedBoards((cfg.kelompok_penyusun || []).map(() => []));
    setActiveGroupIdx(0);
    setRemovedBoardIndices([]);
    setBridgeWrongCount(0);
    setBridgeHintCount(0);
    setShowBridgeHint(false);
    setBridgeCrossingAnim(false);
    setLastOutcomeStatus('idle');
    setFeedbackBanner(`Level ${cfg.level}: ${cfg.judul} — ${cfg.instruksi}`);
  };

  const gameCatalog: Array<{
    id: GameId;
    title: string;
    subtitle: string;
    genre: string;
    badgeColor: string;
  }> = [
    {
      id: 'tariktambang',
      title: '1. Tarik Tambang',
      subtitle: 'Kompetisi Adu Cepat Pecahan 3D',
      genre: 'Tarik tambang pecahan Tim Biru vs Tim Merah untuk 1–2 Pemain (IFP)!',
      badgeColor: 'bg-[#0066DD]',
    },
    {
      id: 'openbox',
      title: '2. Open Box',
      subtitle: 'Peti Harta Misteri Pecahan 3D',
      genre: 'Buka 9 peti harta karun misteri, pecahkan soal kartu pecahan & raih permata!',
      badgeColor: 'bg-[#7C3AED]',
    },
    {
      id: 'bridgebuilder',
      title: '3. Bridge Builder',
      subtitle: 'Bridge Builder Pecahan SAKTI (12 Level)',
      genre: 'Bantu Adit & Naya membangun jembatan papan rasio, penjumlahan & pengurangan pecahan!',
      badgeColor: 'bg-[#16A34A]',
    },
  ];

  const selectedGame: GameId = launchedGame || 'tariktambang';
  const activeGameMeta = gameCatalog.find((g) => g.id === selectedGame)!;
  const activeChallenge =
    LEVEL_CHALLENGES[level][questionIdx % LEVEL_CHALLENGES[level].length];
  const p2Challenge =
    LEVEL_CHALLENGES[level][p2QuestionIdx % LEVEL_CHALLENGES[level].length];

  const resetCurrentGame = (newGameId?: GameId, newLvl?: 1 | 2 | 3) => {
    const gId = newGameId || selectedGame;
    const lvl = newLvl || level;
    playSound(ASSETS.audio.klik);
    setScore(0);
    setCorrectCount(0);
    setTotalAnswered(0);
    setQuestionIdx(0);
    setP2Score(0);
    setP2CorrectCount(0);
    setP2TotalAnswered(0);
    setP2QuestionIdx(1);
    setLastOutcomeStatus('idle');
    setFeedbackBanner(`Siap bermain ${gameCatalog.find((g) => g.id === gId)?.title}!`);
    setP2Feedback('Tim Merah siap beraksi!');
    setStartTime(Date.now());
    setRopeOffset(0);
    setBlueAction('tarik');
    setRedAction('tarik');
    setOpenedBoxes({});
    setActiveBoxModal(null);
    if (gId === 'bridgebuilder') {
      initBridgeLevelState(bridgeLevelNum);
    }
    if (newLvl) setLevel(lvl);
  };

  const handleSaveGameResult = async () => {
    setSavingScore(true);
    playSound(ASSETS.audio.klik);
    const bestSessionScore = Math.max(score, p2Score);
    const totalCorrectBoth = correctCount + p2CorrectCount;
    const totalAnsBoth = Math.max(1, totalAnswered + p2TotalAnswered);
    const durationSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    setHighScores((prev) => ({
      ...prev,
      [selectedGame]: Math.max(prev[selectedGame], bestSessionScore),
    }));

    try {
      const { data } = await safeApiRequest('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_siswa: siswa.id_siswa,
          nama_siswa: siswa.nama_siswa,
          kelas: siswa.kelas,
          game_id: selectedGame.toUpperCase(),
          nama_game: `${activeGameMeta.title}${isSplitScreen ? ' (Split-Screen IFP)' : ''}`,
          level_dicapai: selectedGame === 'bridgebuilder' ? bridgeLevelNum : level,
          skor: bestSessionScore,
          jawaban_benar: totalCorrectBoth,
          total_soal: totalAnsBoth,
          durasi_detik: durationSec,
        }),
      });
      onSavedNotification(
        data?.sheetsStatusMessage ||
          `Skor ${activeGameMeta.title} (${bestSessionScore} Poin) berhasil disimpan.`,
        Boolean(data?.savedToGoogleSheets)
      );
    } catch {
      onSavedNotification('Gagal menyimpan skor game ke server.', false);
    } finally {
      setSavingScore(false);
    }
  };

  const recordAnswerOutcome = (isCorrect: boolean, bonusPoints = 100) => {
    const nextTotal = totalAnswered + 1;
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    const nextScore = isCorrect ? score + bonusPoints * level : Math.max(0, score - 20);

    setTotalAnswered(nextTotal);
    setCorrectCount(nextCorrect);
    setScore(nextScore);
    setLastOutcomeStatus(isCorrect ? 'correct' : 'wrong');
    setHighScores((prev) => ({
      ...prev,
      [selectedGame]: Math.max(prev[selectedGame], nextScore),
    }));

    if (isCorrect) {
      playSound(ASSETS.audio.benar);
      setFeedbackBanner(`✓ TEPAT SEKALI! +${bonusPoints * level} Poin! ${activeChallenge.hint}`);
      if (questionIdx + 1 >= LEVEL_CHALLENGES[level].length && level < 3) {
        setLevel((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
        setQuestionIdx(0);
      } else {
        setQuestionIdx((prev) => prev + 1);
      }
    } else {
      playSound(ASSETS.audio.salah);
      setFeedbackBanner(`✕ Belum tepat! Petunjuk: ${activeChallenge.hint}`);
    }
  };

  const recordP2Outcome = (isCorrect: boolean, bonusPoints = 100) => {
    const nextTotal = p2TotalAnswered + 1;
    const nextCorrect = isCorrect ? p2CorrectCount + 1 : p2CorrectCount;
    const nextScore = isCorrect ? p2Score + bonusPoints * level : Math.max(0, p2Score - 20);

    setP2TotalAnswered(nextTotal);
    setP2CorrectCount(nextCorrect);
    setP2Score(nextScore);
    setHighScores((prev) => ({
      ...prev,
      [selectedGame]: Math.max(prev[selectedGame], nextScore),
    }));

    if (isCorrect) {
      playSound(ASSETS.audio.benar);
      setP2Feedback(`✓ TIM MERAH BENAR! +${bonusPoints * level} Poin!`);
      setP2QuestionIdx((prev) => prev + 1);
    } else {
      playSound(ASSETS.audio.salah);
      setP2Feedback(`✕ Belum tepat! ${p2Challenge.hint}`);
    }
  };

  // ============================================================================
  // TARIK TAMBANG HANDLERS WITH 3D SPRITE POSES & AUDIO
  // ============================================================================
  const handleTarikTambangAnswerP1 = (opt: string) => {
    const isRight = opt === activeChallenge.correct;
    const nextOffset = isRight ? Math.max(-100, ropeOffset - 25) : Math.min(100, ropeOffset + 20);
    setRopeOffset(nextOffset);
    recordAnswerOutcome(isRight, 140);

    if (nextOffset <= -100) {
      setBlueAction('menang');
      setRedAction('kalah');
      playSound(ASSETS.audio.naik_level);
      setFeedbackBanner(`🎉 JUARA! Tim Biru (${siswa.nama_siswa}) memenangkan Tarik Tambang!`);
    } else if (nextOffset >= 100) {
      setBlueAction('kalah');
      setRedAction('menang');
      playSound(ASSETS.audio.salah);
    } else if (isRight) {
      playSound(ASSETS.audio.langkah_kaki);
      setBlueAction('hentak');
      setRedAction('tarik');
      setTimeout(() => {
        setBlueAction((curr) => (curr === 'hentak' ? 'tarik' : curr));
      }, 900);
    } else {
      setRedAction('hentak');
      setTimeout(() => {
        setRedAction((curr) => (curr === 'hentak' ? 'tarik' : curr));
      }, 900);
    }
  };

  const handleTarikTambangAnswerP2 = (opt: string) => {
    const isRight = opt === p2Challenge.correct;
    const nextOffset = isRight ? Math.min(100, ropeOffset + 25) : Math.max(-100, ropeOffset - 20);
    setRopeOffset(nextOffset);
    recordP2Outcome(isRight, 140);

    if (nextOffset >= 100) {
      setRedAction('menang');
      setBlueAction('kalah');
      playSound(ASSETS.audio.naik_level);
      setP2Feedback('🎉 JUARA! Tim Merah (Pemain 2) memenangkan Tarik Tambang!');
    } else if (nextOffset <= -100) {
      setBlueAction('menang');
      setRedAction('kalah');
      playSound(ASSETS.audio.naik_level);
    } else if (isRight) {
      playSound(ASSETS.audio.langkah_kaki);
      setRedAction('hentak');
      setBlueAction('tarik');
      setTimeout(() => {
        setRedAction((curr) => (curr === 'hentak' ? 'tarik' : curr));
      }, 900);
    } else {
      setBlueAction('hentak');
      setTimeout(() => {
        setBlueAction((curr) => (curr === 'hentak' ? 'tarik' : curr));
      }, 900);
    }
  };

  // ============================================================================
  // BRIDGE BUILDER HANDLERS (USING EXACT INTEGER FRACTION VALIDATOR)
  // ============================================================================
  const getUsedStockCount = (asetKey: string, warna?: 'merah' | 'biru') => {
    if (currentBridgeConfig.mode === 'susun_rasio') {
      return ratioPlacedBoards.filter((b) => b.aset === asetKey && b.warna === warna).length;
    }
    if (currentBridgeConfig.mode === 'susun_per_kelompok') {
      return groupPlacedBoards.reduce(
        (acc, grp) => acc + grp.filter((b) => b.aset === asetKey).length,
        0
      );
    }
    return 0;
  };

  const handleAddBoardToBridge = (item: BridgeInventoryItem) => {
    if (bridgeCrossingAnim) return;
    const used = getUsedStockCount(item.aset, item.warna);
    if (used >= item.jumlah) {
      playSound(ASSETS.audio.salah);
      setFeedbackBanner('Stok papan jenis ini di inventaris sudah habis terpakai.');
      return;
    }
    playSound(ASSETS.audio.pasang_papan);
    if (currentBridgeConfig.mode === 'susun_rasio' && item.warna) {
      setRatioPlacedBoards((prev) => [
        ...prev,
        { warna: item.warna!, pecahan: item.pecahan, aset: item.aset },
      ]);
    } else if (currentBridgeConfig.mode === 'susun_per_kelompok') {
      setGroupPlacedBoards((prev) => {
        const copy = prev.map((g) => [...g]);
        if (!copy[activeGroupIdx]) copy[activeGroupIdx] = [];
        copy[activeGroupIdx].push({ pecahan: item.pecahan, aset: item.aset });
        return copy;
      });
    }
  };

  const handleRemoveBoardFromBridge = (index: number, groupIdx?: number) => {
    if (bridgeCrossingAnim) return;
    playSound(ASSETS.audio.klik);
    if (currentBridgeConfig.mode === 'susun_rasio') {
      setRatioPlacedBoards((prev) => prev.filter((_, i) => i !== index));
    } else if (currentBridgeConfig.mode === 'susun_per_kelompok' && groupIdx !== undefined) {
      setGroupPlacedBoards((prev) => {
        const copy = prev.map((g) => [...g]);
        copy[groupIdx] = copy[groupIdx].filter((_, i) => i !== index);
        return copy;
      });
    } else if (currentBridgeConfig.mode === 'hapus_papan') {
      setRemovedBoardIndices((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    }
  };

  const handleCheckBridgeAnswer = () => {
    if (bridgeCrossingAnim) return;
    const res = validateBridgeLevel(currentBridgeConfig, {
      papan: ratioPlacedBoards,
      kelompok: groupPlacedBoards,
      indeks_dihapus: removedBoardIndices,
    });

    setTotalAnswered((t) => t + 1);

    if (res.benar) {
      playSound(ASSETS.audio.benar);
      setTimeout(() => playSound(ASSETS.audio.langkah_kaki), 350);
      setTimeout(() => playSound(ASSETS.audio.ambil_bintang), 900);

      const earnedStars = calcStars(bridgeWrongCount, bridgeHintCount);
      const earnedPoints = earnedStars * 100;
      const nextScore = score + earnedPoints;
      const nextUnlocked = Math.min(12, Math.max(unlockedBridgeLevel, bridgeLevelNum + 1));
      const nextStarsMap = {
        ...bridgeStarsByLevel,
        [bridgeLevelNum]: Math.max(bridgeStarsByLevel[bridgeLevelNum] || 0, earnedStars),
      };

      setScore(nextScore);
      setCorrectCount((c) => c + 1);
      setLastOutcomeStatus('correct');
      setBridgeCrossingAnim(true);
      setUnlockedBridgeLevel(nextUnlocked);
      setBridgeStarsByLevel(nextStarsMap);
      setFeedbackBanner(`★ ${res.pesan} (+${earnedPoints} Poin · ${earnedStars} Bintang Emas!)`);

      setHighScores((prev) => {
        const updated = Math.max(prev.bridgebuilder, nextScore);
        saveBridgeProgressLocal(bridgeCharacter, nextUnlocked, nextStarsMap, updated);
        return { ...prev, bridgebuilder: updated };
      });
    } else {
      playSound(ASSETS.audio.salah);
      setBridgeWrongCount((w) => w + 1);
      setLastOutcomeStatus('wrong');
      setFeedbackBanner(`✕ ${res.pesan}`);
    }
  };

  // ============================================================================
  // VIEW 1: 3 WAHANA GAME 3D SELECTION GALLERY
  // ============================================================================
  if (!launchedGame) {
    return (
      <div className="flex-1 flex flex-col gap-4">
        {/* Top Banner */}
        <div className="surface-3d-card rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-gradient-to-r from-white via-[#F0F9FF] to-[#FEF9C3]">
          <div>
            <div className="text-[10px] font-extrabold text-[#0066DD] uppercase tracking-wider">
              Modul C · 3 Wahana Permainan Edukasi 3D · Support IFP / PID Split-Screen
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#082545]">
              Pilih Salah Satu dari 3 Wahana Game 3D Pecahan
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playSound(ASSETS.audio.klik);
                setIsSplitScreen(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border-2 border-[#082545] flex items-center gap-1.5 transition-all cursor-pointer ${
                !isSplitScreen
                  ? 'bg-[#0066DD] text-white shadow-[0_2px_0_#082545]'
                  : 'bg-white text-[#082545]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Mode 1 Pemain</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSound(ASSETS.audio.klik);
                setIsSplitScreen(true);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border-2 border-[#082545] flex items-center gap-1.5 transition-all cursor-pointer ${
                isSplitScreen
                  ? 'bg-[#58CC02] text-white shadow-[0_2px_0_#082545]'
                  : 'bg-white text-[#082545]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Split-Screen 2 Pemain (IFP)</span>
            </button>
          </div>
        </div>

        {/* 3 Large 3D Game Wahana Cards */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {gameCatalog.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setLaunchedGame(g.id);
                resetCurrentGame(g.id, level);
              }}
              className="group surface-3d-card rounded-3xl p-5 text-left hover:-translate-y-1 transition-all flex flex-col justify-between gap-4 bg-gradient-to-b from-white via-white to-[#BAE6FD]/25 cursor-pointer"
            >
              <div className="space-y-3.5">
                <div className="w-full h-40 sm:h-44 mx-auto group-hover:scale-[1.02] transition-transform">
                  <GameIcon3D gameType={g.id} />
                </div>
                <div className="space-y-1.5">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-white ${g.badgeColor}`}
                  >
                    {g.subtitle}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#082545] leading-snug">
                    {g.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                    {g.genre}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t-2 border-slate-200">
                <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <img src={ASSETS.hadiah.piala} alt="" className="w-5 h-5 object-contain" />
                    <span>Rekor Tertinggi:</span>
                  </span>
                  <span className="font-mono text-[#0066DD]">{highScores[g.id]} Poin</span>
                </div>
                <div className="w-full surface-3d-btn-primary py-2.5 px-4 rounded-2xl text-center text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2">
                  <img src={ASSETS.ui.tombolMulai} alt="" className="w-5 h-5 object-contain" />
                  <span>Mainkan {g.title}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Helper to render a Fraction Card Option button using official card assets
  const renderFractionCardButton = (
    opt: string,
    onClick: () => void,
    variant: 'blue' | 'green' | 'amber' = 'blue'
  ) => {
    const cardImg = FRACTION_CARD_MAP[opt] || ASSETS.ui.kartuKosong;
    const isFallbackEmpty = !FRACTION_CARD_MAP[opt];
    const borderColors = {
      blue: 'border-[#0066DD] hover:bg-[#BAE6FD]/35',
      green: 'border-[#16A34A] hover:bg-[#BBF7D0]/35',
      amber: 'border-[#FF7A00] hover:bg-[#FEF08A]/45',
    }[variant];

    return (
      <button
        key={opt}
        type="button"
        onClick={onClick}
        className={`group relative rounded-2xl bg-white border-[3px] ${borderColors} shadow-[0_4px_0_#082545] hover:-translate-y-0.5 active:translate-y-0 transition-all p-2 flex flex-col items-center justify-center gap-1 cursor-pointer`}
      >
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
          <img
            src={cardImg}
            alt={`Kartu Pecahan ${opt}`}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
          />
          {isFallbackEmpty && (
            <div className="absolute inset-0 flex items-center justify-center">
              <MathText text={opt} className="text-base font-extrabold text-[#082545]" />
            </div>
          )}
        </div>
        <span className="text-[11px] font-extrabold text-[#082545] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300">
          Pilih {opt}
        </span>
      </button>
    );
  };

  // Current total fraction on Bridge Builder
  const currentBridgeTotalFrac: ExactFrac =
    currentBridgeConfig.mode === 'susun_rasio'
      ? fracSum(ratioPlacedBoards.map((b) => b.pecahan))
      : currentBridgeConfig.mode === 'susun_per_kelompok'
      ? fracSum(groupPlacedBoards.flat().map((b) => b.pecahan))
      : currentBridgeConfig.jembatan_awal
      ? fracSum(
          Array.from({ length: currentBridgeConfig.jembatan_awal.jumlah })
            .map((_, idx) =>
              removedBoardIndices.includes(idx)
                ? fracZero()
                : currentBridgeConfig.jembatan_awal!.nilai_setiap_papan
            )
        )
      : fracZero();

  const simplifiedCurrentTotal = simplifyFrac(currentBridgeTotalFrac);

  // ============================================================================
  // VIEW 2: ACTIVE LAUNCHED GAME ARENA
  // ============================================================================
  return (
    <div className="flex-1 flex flex-col gap-3.5">
      {/* Top Game Arena Control Bar */}
      <div className="surface-3d-card rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              playSound(ASSETS.audio.klik);
              setLaunchedGame(null);
            }}
            className="surface-3d-btn-neutral px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <img src={ASSETS.ui.tombolBeranda} alt="" className="w-4 h-4 object-contain" />
            <span>3 Wahana Game</span>
          </button>

          {/* Quick Game Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300">
            {gameCatalog.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setLaunchedGame(g.id);
                  resetCurrentGame(g.id, level);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                  selectedGame === g.id
                    ? 'bg-[#082545] text-white shadow-xs'
                    : 'text-[#082545] hover:bg-white'
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Switcher, Level, Audio, Reset, Save */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border-2 border-[#082545]">
            <button
              type="button"
              onClick={() => {
                playSound(ASSETS.audio.klik);
                setIsSplitScreen(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 cursor-pointer ${
                !isSplitScreen ? 'bg-[#0066DD] text-white' : 'text-[#082545]'
              }`}
            >
              <User className="w-3 h-3" />
              <span>1P</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSound(ASSETS.audio.klik);
                setIsSplitScreen(true);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 cursor-pointer ${
                isSplitScreen ? 'bg-[#58CC02] text-white' : 'text-[#082545]'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Split IFP (2P)</span>
            </button>
          </div>

          {selectedGame !== 'bridgebuilder' && (
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    playSound(ASSETS.audio.klik);
                    setLevel(lvl as 1 | 2 | 3);
                    setQuestionIdx(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border-2 border-[#082545] cursor-pointer ${
                    level === lvl ? 'bg-[#FFD60A] text-[#082545]' : 'bg-white text-slate-700'
                  }`}
                >
                  Lv.{lvl}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            className="surface-3d-btn-neutral p-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center cursor-pointer"
          >
            <img src={ASSETS.ui.tombolSuara} alt="" className="w-5 h-5 object-contain" />
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#0066DD] ml-1" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-red-600 ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => resetCurrentGame()}
            className="surface-3d-btn-neutral px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <img src={ASSETS.ui.tombolReset} alt="" className="w-4 h-4 object-contain" />
            <span>Ulangi</span>
          </button>

          <button
            type="button"
            disabled={savingScore}
            onClick={handleSaveGameResult}
            className="surface-3d-btn-emerald px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingScore ? 'Menyimpan...' : 'Simpan Skor'}</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SPLIT-SCREEN 2-PLAYER MODE FOR IFP / PID (LEFT VS RIGHT DUEL)        */}
      {/* ==================================================================== */}
      {isSplitScreen ? (
        <div className="flex-1 flex flex-col gap-3.5">
          {/* Shared Center Scoreboard Banner */}
          <div className="surface-3d-card rounded-2xl px-4 py-2.5 bg-[#082545] text-white flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="px-3 py-1 rounded-xl bg-[#0066DD] font-extrabold text-xs flex items-center gap-2">
              <img src={ASSETS.karakter.adit3d} alt="" className="w-6 h-6 object-contain" />
              <span>TIM BIRU / P1 ({siswa.nama_siswa}): {score} Poin ({correctCount} Benar)</span>
            </div>

            <div className="text-center hidden md:block">
              <div className="text-[11px] font-extrabold text-[#FFD60A] uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Duel Layar Sentuh IFP (2 Pemain Berdampingan)</span>
              </div>
            </div>

            <div className="px-3 py-1 rounded-xl bg-[#DC2626] font-extrabold text-xs flex items-center gap-2">
              <img src={ASSETS.karakter.naya3d} alt="" className="w-6 h-6 object-contain" />
              <span>TIM MERAH / P2 (Rekan Duel): {p2Score} Poin ({p2CorrectCount} Benar)</span>
            </div>
          </div>

          {/* Central 3D Visual Stage for Split-Screen */}
          <div className="surface-3d-card rounded-2xl p-3 relative overflow-hidden bg-sky-100 min-h-[165px] flex items-center justify-center">
            <img
              src={ASSETS.lingkungan.latarSungai}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <img
              src={ASSETS.lingkungan.pohonRimbun}
              alt=""
              className="absolute bottom-1 left-2 w-16 h-20 object-contain opacity-90 pointer-events-none"
            />
            <img
              src={ASSETS.lingkungan.pohonRimbun}
              alt=""
              className="absolute bottom-1 right-2 w-16 h-20 object-contain opacity-90 pointer-events-none"
            />

            {selectedGame === 'tariktambang' ? (
              <div className="relative z-10 w-full max-w-3xl flex items-center justify-between px-4">
                <div className="text-center bg-white/90 px-2.5 py-1 rounded-xl border-2 border-[#0066DD] text-[10px] font-extrabold text-[#0066DD]">
                  ZONA MENANG BIRU
                </div>

                {/* Moving Tug of War Characters & Rope */}
                <div
                  className="flex items-center justify-center transition-transform duration-300"
                  style={{ transform: `translateX(${ropeOffset * 1.15}px)` }}
                >
                  <img
                    src={
                      blueAction === 'menang'
                        ? ASSETS.tarikTambang.biruMenang
                        : blueAction === 'kalah'
                        ? ASSETS.tarikTambang.biruKalah
                        : blueAction === 'hentak'
                        ? ASSETS.tarikTambang.biruHentak
                        : ASSETS.tarikTambang.biruTarik
                    }
                    alt="Tim Biru"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md -mr-3 z-10"
                  />
                  <div className="w-36 sm:w-52 h-3 bg-gradient-to-r from-[#B45309] via-[#D97706] to-[#B45309] border-2 border-[#082545] rounded-full relative flex items-center justify-center">
                    <img
                      src={ASSETS.hadiah.benderaFinishing}
                      alt="Penanda Tengah"
                      className="w-8 h-8 object-contain -mt-6 drop-shadow"
                    />
                  </div>
                  <img
                    src={
                      redAction === 'menang'
                        ? ASSETS.tarikTambang.merahMenang
                        : redAction === 'kalah'
                        ? ASSETS.tarikTambang.merahKalah
                        : redAction === 'hentak'
                        ? ASSETS.tarikTambang.merahHentak
                        : ASSETS.tarikTambang.merahTarik
                    }
                    alt="Tim Merah"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain -scale-x-100 drop-shadow-md -ml-3 z-10"
                  />
                </div>

                <div className="text-center bg-white/90 px-2.5 py-1 rounded-xl border-2 border-[#DC2626] text-[10px] font-extrabold text-[#DC2626]">
                  ZONA MENANG MERAH
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex items-center justify-around w-full max-w-3xl px-4">
                <div className="flex items-center gap-2 bg-white/95 px-3.5 py-2 rounded-2xl border-2 border-[#082545]">
                  <img src={ASSETS.karakter.aditBerhasil} alt="" className="w-16 h-16 object-contain" />
                  <div>
                    <div className="text-xs font-extrabold text-[#0066DD]">Tim Adit (P1)</div>
                    <div className="text-sm font-mono font-extrabold text-[#082545]">{score} Poin</div>
                  </div>
                </div>
                <img src={ASSETS.hadiah.piala} alt="" className="w-16 h-16 object-contain drop-shadow" />
                <div className="flex items-center gap-2 bg-white/95 px-3.5 py-2 rounded-2xl border-2 border-[#082545]">
                  <img src={ASSETS.karakter.nayaBerhasil} alt="" className="w-16 h-16 object-contain" />
                  <div>
                    <div className="text-xs font-extrabold text-[#DC2626]">Tim Naya (P2)</div>
                    <div className="text-sm font-mono font-extrabold text-[#082545]">{p2Score} Poin</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Two Side-by-Side Interactive Touch Arenas */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
            {/* LEFT ARENA: PEMAIN 1 */}
            <div className="surface-3d-card rounded-2xl p-4 flex flex-col justify-between gap-3 bg-gradient-to-b from-[#BAE6FD]/35 to-white border-[3px] border-[#0066DD]">
              <div className="flex items-center justify-between border-b border-[#0066DD]/20 pb-2">
                <div className="flex items-center gap-2">
                  <img src={ASSETS.karakter.adit3d} alt="" className="w-10 h-10 object-contain" />
                  <div>
                    <span className="text-[10px] font-extrabold text-[#0066DD] uppercase">
                      Layar Sentuh Kiri · Tim Biru
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-[#082545]">
                      Pemain 1 ({siswa.nama_siswa})
                    </h4>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-[#0066DD] text-white font-mono text-sm font-extrabold">
                  {score} Poin
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#082545] text-white space-y-1">
                <div className="text-[10px] font-bold text-[#FFD60A]">MISI PECAHAN PEMAIN 1:</div>
                <div className="text-sm sm:text-base font-extrabold leading-snug">
                  <MathText text={activeChallenge.prompt} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activeChallenge.options.map((opt) =>
                  renderFractionCardButton(opt, () => handleTarikTambangAnswerP1(opt), 'blue')
                )}
              </div>

              {feedbackBanner && (
                <div className="p-2.5 rounded-xl bg-white border-2 border-[#082545] text-xs font-bold text-[#082545] flex items-center gap-2">
                  <img
                    src={
                      lastOutcomeStatus === 'wrong'
                        ? ASSETS.hadiah.medaliSalah
                        : ASSETS.hadiah.medaliBenar
                    }
                    alt=""
                    className="w-5 h-5 object-contain shrink-0"
                  />
                  <MathText text={feedbackBanner} />
                </div>
              )}
            </div>

            {/* RIGHT ARENA: PEMAIN 2 */}
            <div className="surface-3d-card rounded-2xl p-4 flex flex-col justify-between gap-3 bg-gradient-to-b from-[#FEE2E2]/45 to-white border-[3px] border-[#DC2626]">
              <div className="flex items-center justify-between border-b border-[#DC2626]/20 pb-2">
                <div className="flex items-center gap-2">
                  <img src={ASSETS.karakter.naya3d} alt="" className="w-10 h-10 object-contain" />
                  <div>
                    <span className="text-[10px] font-extrabold text-[#DC2626] uppercase">
                      Layar Sentuh Kanan · Tim Merah
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-[#082545]">
                      Pemain 2 (Rekan Duel IFP)
                    </h4>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-[#DC2626] text-white font-mono text-sm font-extrabold">
                  {p2Score} Poin
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#082545] text-white space-y-1">
                <div className="text-[10px] font-bold text-[#FCA5A5]">MISI PECAHAN PEMAIN 2:</div>
                <div className="text-sm sm:text-base font-extrabold leading-snug">
                  <MathText text={p2Challenge.prompt} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {p2Challenge.options.map((opt) =>
                  renderFractionCardButton(opt, () => handleTarikTambangAnswerP2(opt), 'amber')
                )}
              </div>

              {p2Feedback && (
                <div className="p-2.5 rounded-xl bg-white border-2 border-[#082545] text-xs font-bold text-[#082545] flex items-center gap-2">
                  <img src={ASSETS.hadiah.bintangEmas} alt="" className="w-5 h-5 object-contain shrink-0" />
                  <MathText text={p2Feedback} />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================================================================== */
        /* 1-PLAYER FULL ARENA MODE FOR THE 3 OFFICIAL GAMES                  */
        /* ================================================================== */
        <div className="flex-1 surface-3d-card rounded-2xl p-4 lg:p-5 flex flex-col justify-between gap-3.5">
          {/* ============================================================== */}
          {/* GAME 1 RENDER: TARIK TAMBANG 3D                                */}
          {/* ============================================================== */}
          {selectedGame === 'tariktambang' && (
            <div className="flex-1 flex flex-col justify-between gap-4">
              {/* Top Mission Prompt */}
              <div className="px-4 py-3 rounded-2xl bg-[#082545] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={ASSETS.hadiah.piala} alt="" className="w-10 h-10 object-contain shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono text-[#FFD60A]">
                      ARENA TARIK TAMBANG PECAHAN (LEVEL {level} · SOAL #{questionIdx + 1} · SKOR: {score})
                    </div>
                    <div className="text-sm sm:text-base font-extrabold leading-snug">
                      <MathText text={activeChallenge.prompt} />
                    </div>
                  </div>
                </div>
                {feedbackBanner && (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-sky-400/40 text-xs text-[#FFD60A] max-w-md font-bold flex items-center gap-2 shrink-0">
                    <img
                      src={
                        lastOutcomeStatus === 'wrong'
                          ? ASSETS.hadiah.medaliSalah
                          : ASSETS.hadiah.medaliBenar
                      }
                      alt=""
                      className="w-5 h-5 object-contain shrink-0"
                    />
                    <MathText text={feedbackBanner} />
                  </div>
                )}
              </div>

              {/* Scenic 3D Tug of War Stage Using Uploaded Assets */}
              <div className="relative flex-1 min-h-[240px] rounded-3xl border-[3px] border-[#082545] shadow-[0_6px_0_#082545] overflow-hidden flex flex-col justify-between p-4 bg-sky-100 select-none">
                <img
                  src={ASSETS.lingkungan.latarSungai}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <img
                  src={ASSETS.lingkungan.awanPutih}
                  alt=""
                  className="absolute top-3 left-10 w-28 object-contain opacity-90 pointer-events-none"
                />
                <img
                  src={ASSETS.lingkungan.awanKecil}
                  alt=""
                  className="absolute top-5 right-14 w-20 object-contain opacity-85 pointer-events-none"
                />
                <img
                  src={ASSETS.lingkungan.pohonRimbun}
                  alt=""
                  className="absolute bottom-2 left-2 w-24 h-28 object-contain pointer-events-none"
                />
                <img
                  src={ASSETS.lingkungan.pohonRimbun}
                  alt=""
                  className="absolute bottom-2 right-2 w-24 h-28 object-contain pointer-events-none"
                />

                {/* Top Team Status Bar */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className="px-3.5 py-1.5 rounded-xl bg-[#0066DD] text-white border-2 border-[#082545] text-xs font-extrabold shadow-sm">
                    TIM BIRU: {siswa.nama_siswa} ({score} Poin)
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-white/95 border-2 border-[#082545] text-xs font-mono font-extrabold text-[#082545]">
                    {ropeOffset < 0
                      ? `Tim Biru Menarik ${Math.abs(ropeOffset)}%`
                      : ropeOffset > 0
                      ? `Tim Merah Menarik ${ropeOffset}%`
                      : 'Posisi Tambang Seimbang (0%)'}
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-[#DC2626] text-white border-2 border-[#082545] text-xs font-extrabold shadow-sm">
                    TIM MERAH: Lawan Tangguh
                  </div>
                </div>

                {/* Center Tug-of-War Characters & Rope */}
                <div className="relative z-10 my-auto flex items-center justify-between px-4 sm:px-8">
                  <div className="flex flex-col items-center gap-1 bg-white/85 px-2.5 py-1.5 rounded-xl border-2 border-[#0066DD]">
                    <img src={ASSETS.hadiah.benderaFinishing} alt="" className="w-8 h-8 object-contain" />
                    <span className="text-[10px] font-extrabold text-[#0066DD]">GARIS MENANG</span>
                  </div>

                  <div
                    className="relative flex items-center justify-center transition-transform duration-300"
                    style={{ transform: `translateX(${ropeOffset * 1.4}px)` }}
                  >
                    {blueAction === 'hentak' && (
                      <img
                        src={ASSETS.hadiah.debuLompatan}
                        alt=""
                        className="absolute -left-6 bottom-1 w-14 h-14 object-contain animate-ping"
                      />
                    )}
                    <img
                      src={
                        blueAction === 'menang'
                          ? ASSETS.tarikTambang.biruMenang
                          : blueAction === 'kalah'
                          ? ASSETS.tarikTambang.biruKalah
                          : blueAction === 'hentak'
                          ? ASSETS.tarikTambang.biruHentak
                          : ASSETS.tarikTambang.biruTarik
                      }
                      alt="Karakter Tim Biru"
                      className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-lg -mr-4 z-10"
                    />

                    {/* Rope & Center Ribbon */}
                    <div className="w-40 sm:w-64 h-3.5 bg-gradient-to-r from-[#92400E] via-[#D97706] to-[#92400E] border-2 border-[#082545] rounded-full relative flex items-center justify-center shadow">
                      <div className="w-4 h-8 bg-[#EF4444] border-2 border-[#082545] rounded-sm -mt-2" />
                    </div>

                    <img
                      src={
                        redAction === 'menang'
                          ? ASSETS.tarikTambang.merahMenang
                          : redAction === 'kalah'
                          ? ASSETS.tarikTambang.merahKalah
                          : redAction === 'hentak'
                          ? ASSETS.tarikTambang.merahHentak
                          : ASSETS.tarikTambang.merahTarik
                      }
                      alt="Karakter Tim Merah"
                      className="w-28 h-28 sm:w-36 sm:h-36 object-contain -scale-x-100 drop-shadow-lg -ml-4 z-10"
                    />
                    {redAction === 'hentak' && (
                      <img
                        src={ASSETS.hadiah.debuLompatan}
                        alt=""
                        className="absolute -right-6 bottom-1 w-14 h-14 object-contain animate-ping"
                      />
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1 bg-white/85 px-2.5 py-1.5 rounded-xl border-2 border-[#DC2626]">
                    <img src={ASSETS.hadiah.benderaFinishing} alt="" className="w-8 h-8 object-contain" />
                    <span className="text-[10px] font-extrabold text-[#DC2626]">ZONA LAWAN</span>
                  </div>
                </div>

                {/* Bottom Grass & Flowers */}
                <div className="relative z-10 flex items-center justify-between px-6 pointer-events-none">
                  <img src={ASSETS.lingkungan.semak} alt="" className="w-14 h-10 object-contain" />
                  <img src={ASSETS.lingkungan.bunga} alt="" className="w-10 h-10 object-contain" />
                  <img src={ASSETS.lingkungan.semak} alt="" className="w-14 h-10 object-contain" />
                </div>
              </div>

              {/* 4 Fraction Card Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeChallenge.options.map((opt) =>
                  renderFractionCardButton(opt, () => handleTarikTambangAnswerP1(opt), 'blue')
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* GAME 2 RENDER: OPEN BOX 3D (PETI HARTA MISTERI)                */}
          {/* ============================================================== */}
          {selectedGame === 'openbox' && (
            <div className="flex-1 flex flex-col justify-between gap-4">
              {/* Top Mission Banner */}
              <div className="px-4 py-3 rounded-2xl bg-[#082545] text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={ASSETS.hadiah.petiHarta} alt="" className="w-11 h-11 object-contain" />
                  <div>
                    <div className="text-[10px] font-mono text-[#FFD60A]">
                      WAHANA 2 · OPEN BOX PETI HARTA MISTERI PECAHAN (SKOR: {score} POIN)
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold">
                      Sentuh Salah Satu dari 9 Peti Harta untuk Membuka Tantangan Kartu Pecahan!
                    </h4>
                  </div>
                </div>
                {feedbackBanner && (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-sky-400/40 text-xs text-[#FFD60A] max-w-md font-bold flex items-center gap-2">
                    <img src={ASSETS.hadiah.bintangEmas} alt="" className="w-5 h-5 object-contain" />
                    <MathText text={feedbackBanner} />
                  </div>
                )}
              </div>

              {/* 9 Treasure Chests Arena with Scenic Waterfall Backdrop */}
              <div className="relative flex-1 rounded-3xl border-[3px] border-[#082545] overflow-hidden p-4 sm:p-6 flex items-center justify-center bg-slate-900">
                <img
                  src={ASSETS.lingkungan.latarAirTerjun}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-65"
                />

                <div className="relative z-10 grid grid-cols-3 gap-3 sm:gap-4 max-w-3xl w-full">
                  {Array.from({ length: 9 }).map((_, boxIdx) => {
                    const boxNum = boxIdx + 1;
                    const opened = openedBoxes[boxNum];
                    const bonusValue = ((boxIdx % 3) + 1) * 100;
                    const rewardType: 'gem' | 'star' | 'coin' =
                      boxIdx % 3 === 2 ? 'gem' : boxIdx % 3 === 1 ? 'star' : 'coin';
                    const rewardImg =
                      rewardType === 'gem'
                        ? ASSETS.hadiah.permataBiru
                        : rewardType === 'star'
                        ? ASSETS.hadiah.bintangEmas
                        : ASSETS.hadiah.koinBintang;

                    return (
                      <button
                        key={boxNum}
                        type="button"
                        disabled={Boolean(opened)}
                        onClick={() => {
                          playSound(ASSETS.audio.peti_terbuka);
                          setActiveBoxModal({ boxNum, player: 'P1' });
                        }}
                        className={`group relative p-3 sm:p-4 rounded-2xl border-[3px] text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                          opened
                            ? opened.solved
                              ? 'bg-[#BBF7D0]/95 border-[#15803D] text-[#082545]'
                              : 'bg-red-100/90 border-red-400 text-slate-700'
                            : 'bg-white/95 border-[#082545] shadow-[0_5px_0_#082545] hover:-translate-y-1 cursor-pointer'
                        }`}
                      >
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                          {opened ? (
                            <>
                              <img
                                src={opened.solved ? rewardImg : ASSETS.hadiah.medaliSalah}
                                alt=""
                                className="w-14 h-14 object-contain drop-shadow"
                              />
                              {opened.solved && (
                                <img
                                  src={ASSETS.hadiah.kilauBintang}
                                  alt=""
                                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                />
                              )}
                            </>
                          ) : (
                            <img
                              src={ASSETS.hadiah.petiHarta}
                              alt={`Peti Harta ${boxNum}`}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform drop-shadow"
                            />
                          )}
                        </div>

                        <div className="text-xs sm:text-sm font-extrabold text-[#082545]">
                          {opened
                            ? opened.solved
                              ? `+${opened.points} Poin!`
                              : 'Belum Tepat'
                            : `Peti Harta #${boxNum}`}
                        </div>

                        {!opened && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF9C3] border border-[#082545]/20 text-[10px] font-mono font-extrabold text-[#B45309]">
                            <img src={rewardImg} alt="" className="w-3.5 h-3.5 object-contain" />
                            <span>Hadiah {bonusValue}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Open Box Modal with 3D Mentor & Fraction Cards */}
              {activeBoxModal !== null && (
                <div className="fixed inset-0 z-50 bg-[#082545]/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="max-w-xl w-full p-6 rounded-3xl bg-[#FFFDF7] text-[#082545] border-[3px] border-[#082545] shadow-[0_10px_0_#082545] space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={ASSETS.karakter.profesor3d}
                          alt="Profesor Mentor 3D"
                          className="w-14 h-14 object-contain bg-sky-100 rounded-2xl border-2 border-[#082545] p-1"
                        />
                        <div>
                          <span className="text-xs font-mono font-extrabold text-[#0066DD]">
                            PETI HARTA #{activeBoxModal.boxNum} TERBUKA!
                          </span>
                          <h4 className="text-base font-extrabold text-[#082545]">
                            Tantangan Profesor Pecahan
                          </h4>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-[#FFD60A] border-2 border-[#082545] text-xs font-mono font-extrabold">
                        Hadiah: {((activeBoxModal.boxNum % 3) + 1) * 100} Poin
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#082545] text-white text-base sm:text-lg font-extrabold leading-snug">
                      <MathText text={activeChallenge.prompt} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {activeChallenge.options.map((opt) =>
                        renderFractionCardButton(
                          opt,
                          () => {
                            const isRight = opt === activeChallenge.correct;
                            const bNum = activeBoxModal.boxNum;
                            const pts = ((bNum % 3) + 1) * 100;
                            const rewardType: 'gem' | 'star' | 'coin' =
                              bNum % 3 === 0 ? 'gem' : bNum % 3 === 2 ? 'star' : 'coin';
                            if (isRight) {
                              playSound(ASSETS.audio.ambil_bintang);
                            }
                            setOpenedBoxes((prev) => ({
                              ...prev,
                              [bNum]: {
                                points: isRight ? pts : 0,
                                solved: isRight,
                                rewardType,
                              },
                            }));
                            recordAnswerOutcome(isRight, pts);
                            setActiveBoxModal(null);
                          },
                          'blue'
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* GAME 3 RENDER: BRIDGE BUILDER PECAHAN SAKTI (12 LEVELS)        */}
          {/* ============================================================== */}
          {selectedGame === 'bridgebuilder' && (
            <div className="flex-1 flex flex-col justify-between gap-3.5">
              {/* Top Level Selector (12 Levels) + Character Switcher (Adit / Naya) */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-2xl border-2 border-[#082545]">
                {/* Character Selector */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      playSound(ASSETS.audio.klik);
                      setBridgeCharacter('adit');
                    }}
                    className={`px-2.5 py-1 rounded-xl border-2 flex items-center gap-1.5 text-xs font-extrabold cursor-pointer ${
                      bridgeCharacter === 'adit'
                        ? 'bg-[#0066DD] text-white border-[#082545]'
                        : 'bg-white text-[#082545] border-slate-300'
                    }`}
                  >
                    <img src={ASSETS.karakter.adit3d} alt="Adit" className="w-6 h-6 object-contain" />
                    <span>Adit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playSound(ASSETS.audio.klik);
                      setBridgeCharacter('naya');
                    }}
                    className={`px-2.5 py-1 rounded-xl border-2 flex items-center gap-1.5 text-xs font-extrabold cursor-pointer ${
                      bridgeCharacter === 'naya'
                        ? 'bg-[#FF7A00] text-white border-[#082545]'
                        : 'bg-white text-[#082545] border-slate-300'
                    }`}
                  >
                    <img src={ASSETS.karakter.naya3d} alt="Naya" className="w-6 h-6 object-contain" />
                    <span>Naya</span>
                  </button>
                </div>

                {/* 12 Level Buttons */}
                <div className="flex flex-wrap items-center gap-1">
                  {BRIDGE_LEVELS.map((lvl) => {
                    const isCurrent = bridgeLevelNum === lvl.level;
                    const starsEarned = bridgeStarsByLevel[lvl.level] || 0;
                    return (
                      <button
                        key={lvl.level}
                        type="button"
                        onClick={() => {
                          playSound(ASSETS.audio.klik);
                          initBridgeLevelState(lvl.level);
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-extrabold border-2 transition-all flex items-center gap-1 cursor-pointer ${
                          isCurrent
                            ? 'bg-[#FFD60A] text-[#082545] border-[#082545] shadow-[0_2px_0_#082545]'
                            : starsEarned > 0
                            ? 'bg-[#BBF7D0] text-[#082545] border-[#15803D]'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-[#082545]'
                        }`}
                      >
                        <span>L{lvl.level}</span>
                        {starsEarned > 0 && <span className="text-[10px] text-amber-600">★{starsEarned}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Reference Chart & Hint Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      playSound(ASSETS.audio.klik);
                      setShowBoardReferenceModal(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-sky-50 border-2 border-[#082545] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#0066DD]" />
                    <span>Tabel Ukuran Papan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playSound(ASSETS.audio.klik);
                      setBridgeHintCount((h) => h + 1);
                      setShowBridgeHint(!showBridgeHint);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#FEF9C3] hover:bg-amber-200 border-2 border-[#082545] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <img src={ASSETS.ui.tombolPetunjuk} alt="" className="w-4 h-4 object-contain" />
                    <span>Petunjuk</span>
                  </button>
                </div>
              </div>

              {/* Mission Instruction Banner */}
              <div className="px-4 py-2.5 rounded-2xl bg-[#082545] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#FFD60A] uppercase">
                    <span>
                      LEVEL {currentBridgeConfig.level}/12 · MATERI: {currentBridgeConfig.materi.toUpperCase()}
                    </span>
                    <span>·</span>
                    <span>
                      TARGET PANJANG JEMBATAN: {currentBridgeConfig.target_panjang.pembilang}/
                      {currentBridgeConfig.target_panjang.penyebut}
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold">
                    {currentBridgeConfig.judul}: <MathText text={currentBridgeConfig.instruksi} />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-xs font-mono font-extrabold text-[#BAE6FD]">
                    Panjang Saat Ini:{' '}
                    {simplifiedCurrentTotal.pembilang === 0
                      ? '0'
                      : `${simplifiedCurrentTotal.pembilang}/${simplifiedCurrentTotal.penyebut}`}
                  </div>
                </div>
              </div>

              {/* Optional Hint Box with Profesor Mentor 3D */}
              {showBridgeHint && (
                <div className="px-4 py-2.5 rounded-2xl bg-[#FEF9C3] border-2 border-[#082545] flex items-center justify-between gap-3 text-xs font-bold text-[#082545]">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={ASSETS.karakter.profesor3d}
                      alt="Profesor Mentor"
                      className="w-10 h-10 object-contain shrink-0"
                    />
                    <div>
                      <span className="font-extrabold text-[#B45309]">Petunjuk Profesor: </span>
                      <MathText text={currentBridgeConfig.petunjuk} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBridgeHint(false)}
                    className="p-1 rounded-lg hover:bg-amber-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* MAIN 16:9 SCENIC BRIDGE BUILDER STAGE */}
              <div className="relative rounded-3xl border-[3px] border-[#082545] shadow-[0_6px_0_#082545] overflow-hidden min-h-[250px] sm:min-h-[275px] flex flex-col justify-between p-4 select-none bg-sky-200">
                {/* Scene Background (River or Waterfall) */}
                <img
                  src={
                    currentBridgeConfig.scene === 'latar_air_terjun'
                      ? ASSETS.lingkungan.latarAirTerjun
                      : ASSETS.lingkungan.latarSungai
                  }
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Clouds & Trees */}
                <img
                  src={ASSETS.lingkungan.awanPutih}
                  alt=""
                  className="absolute top-2 left-12 w-24 object-contain opacity-90 pointer-events-none"
                />
                <img
                  src={ASSETS.lingkungan.awanKecil}
                  alt=""
                  className="absolute top-4 right-20 w-20 object-contain opacity-85 pointer-events-none"
                />

                {/* Top Status & Feedback */}
                <div className="relative z-20 flex flex-wrap items-center justify-between gap-2">
                  <div className="px-3 py-1 rounded-xl bg-white/90 border-2 border-[#082545] text-xs font-extrabold text-[#082545] flex items-center gap-1.5">
                    <img src={ASSETS.hadiah.bintangEmas} alt="" className="w-4 h-4 object-contain" />
                    <span>Skor Bridge Builder: {score} Poin</span>
                  </div>

                  {feedbackBanner && (
                    <div className="px-3 py-1 rounded-xl bg-[#082545]/95 text-[#FFD60A] border border-white/20 text-xs font-bold flex items-center gap-1.5">
                      <img
                        src={
                          lastOutcomeStatus === 'wrong'
                            ? ASSETS.hadiah.medaliSalah
                            : ASSETS.hadiah.medaliBenar
                        }
                        alt=""
                        className="w-4 h-4 object-contain"
                      />
                      <MathText text={feedbackBanner} />
                    </div>
                  )}
                </div>

                {/* Cliffs, Character, Bridge Span & Finishing Goal */}
                <div className="relative z-20 mt-auto pt-8 flex items-end justify-between gap-0">
                  {/* Left Cliff + Active Builder Character */}
                  <div className="relative w-24 sm:w-32 shrink-0 flex flex-col items-center">
                    <img
                      src={
                        bridgeCharacter === 'adit'
                          ? bridgeCrossingAnim
                            ? ASSETS.karakter.aditBerhasil
                            : lastOutcomeStatus === 'wrong'
                            ? ASSETS.karakter.aditBerpikir
                            : ASSETS.karakter.adit3d
                          : bridgeCrossingAnim
                          ? ASSETS.karakter.nayaBerhasil
                          : lastOutcomeStatus === 'wrong'
                          ? ASSETS.karakter.nayaBerpikir
                          : ASSETS.karakter.naya3d
                      }
                      alt="Karakter Pembangun"
                      className={`w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg -mb-4 z-20 transition-all duration-700 ${
                        bridgeCrossingAnim ? 'translate-x-48 sm:translate-x-80 scale-105' : ''
                      }`}
                    />
                    <img
                      src={ASSETS.lingkungan.tebingKiri}
                      alt="Tebing Kiri"
                      className="w-full h-24 sm:h-28 object-cover object-top"
                    />
                  </div>

                  {/* Center Bridge Span Container (Proportional Width = 100% for 1 Whole Bridge) */}
                  <div className="flex-1 flex flex-col items-center pb-5 px-1">
                    {/* Rope Railing & Target Span Indicator */}
                    <div className="w-full relative">
                      {/* Target Length Indicator Marker */}
                      <div
                        className="h-2.5 rounded-t-lg bg-[#FFD60A]/80 border-x-2 border-t-2 border-[#082545] transition-all relative flex items-center justify-center"
                        style={{
                          width: `${Math.min(
                            100,
                            (currentBridgeConfig.target_panjang.pembilang /
                              currentBridgeConfig.target_panjang.penyebut) *
                              100
                          )}%`,
                        }}
                      >
                        <span className=" -top-5 bg-[#082545] text-[#FFD60A] px-2 py-0.5 rounded text-[9px] font-mono font-extrabold whitespace-nowrap">
                          Target: {currentBridgeConfig.target_panjang.pembilang}/
                          {currentBridgeConfig.target_panjang.penyebut}
                        </span>
                      </div>

                      {/* Bridge Track Slot */}
                      <div className="w-full min-h-[58px] bg-[#082545]/45 backdrop-blur-xs rounded-xl border-2 border-dashed border-white/80 flex items-center p-1 relative overflow-hidden">
                        {/* MODE 1: SUSUN RASIO BOARDS */}
                        {currentBridgeConfig.mode === 'susun_rasio' &&
                          ratioPlacedBoards.map((b, idx) => {
                            const widthPct = (b.pecahan.pembilang / b.pecahan.penyebut) * 100;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleRemoveBoardFromBridge(idx)}
                                title="Ketuk untuk melepas papan ini"
                                style={{ width: `${widthPct}%` }}
                                className="h-12 relative group shrink-0 hover:brightness-110 transition-all cursor-pointer"
                              >
                                <img
                                  src={BOARD_ASSET_MAP[b.aset] || ASSETS.lingkungan.jembatanSelesai}
                                  alt={`Papan ${b.warna}`}
                                  className="w-full h-full object-fill rounded"
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                  {b.pecahan.pembilang}/{b.pecahan.penyebut} ({b.warna === 'merah' ? 'M' : 'B'})
                                </span>
                              </button>
                            );
                          })}

                        {/* MODE 2: SUSUN PER KELOMPOK BOARDS */}
                        {currentBridgeConfig.mode === 'susun_per_kelompok' &&
                          groupPlacedBoards.map((grp, gIdx) =>
                            grp.map((b, bIdx) => {
                              const widthPct = (b.pecahan.pembilang / b.pecahan.penyebut) * 100;
                              return (
                                <button
                                  key={`${gIdx}-${bIdx}`}
                                  type="button"
                                  onClick={() => handleRemoveBoardFromBridge(bIdx, gIdx)}
                                  title={`Suku ${gIdx + 1}: Ketuk untuk melepas papan`}
                                  style={{ width: `${widthPct}%` }}
                                  className={`h-12 relative shrink-0 hover:brightness-110 transition-all cursor-pointer ${
                                    gIdx === 0
                                      ? 'ring-2 ring-[#FFD60A]'
                                      : gIdx === 1
                                      ? 'ring-2 ring-[#38BDF8]'
                                      : 'ring-2 ring-[#4ADE80]'
                                  }`}
                                >
                                  <img
                                    src={BOARD_ASSET_MAP[b.aset] || ASSETS.lingkungan.jembatanSelesai}
                                    alt="Papan Pecahan"
                                    className="w-full h-full object-fill rounded"
                                  />
                                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                    S{gIdx + 1}: {b.pecahan.pembilang}/{b.pecahan.penyebut}
                                  </span>
                                </button>
                              );
                            })
                          )}

                        {/* MODE 3: HAPUS PAPAN BOARDS */}
                        {currentBridgeConfig.mode === 'hapus_papan' &&
                          currentBridgeConfig.jembatan_awal &&
                          Array.from({ length: currentBridgeConfig.jembatan_awal.jumlah }).map(
                            (_, idx) => {
                              const each = currentBridgeConfig.jembatan_awal!.nilai_setiap_papan;
                              const widthPct = (each.pembilang / each.penyebut) * 100;
                              const isRemoved = removedBoardIndices.includes(idx);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleRemoveBoardFromBridge(idx)}
                                  title={
                                    isRemoved
                                      ? 'Ketuk untuk mengembalikan papan'
                                      : 'Ketuk untuk menghapus/membongkar papan ini'
                                  }
                                  style={{ width: `${widthPct}%` }}
                                  className={`h-12 relative shrink-0 transition-all cursor-pointer ${
                                    isRemoved
                                      ? 'opacity-25 scale-90 bg-red-500/30 border border-dashed border-red-300 rounded'
                                      : 'hover:brightness-110'
                                  }`}
                                >
                                  <img
                                    src={
                                      BOARD_ASSET_MAP[currentBridgeConfig.jembatan_awal!.aset] ||
                                      ASSETS.lingkungan.jembatanSelesai
                                    }
                                    alt="Papan Awal"
                                    className="w-full h-full object-fill rounded"
                                  />
                                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                    {isRemoved ? 'DIHAPUS' : `${each.pembilang}/${each.penyebut}`}
                                  </span>
                                </button>
                              );
                            }
                          )}
                      </div>

                      {/* Wooden Support Pillars Underneath */}
                      <div className="flex justify-around px-6 -mt-1 pointer-events-none">
                        <img
                          src={ASSETS.lingkungan.tiangPenyanggaKayu}
                          alt=""
                          className="w-10 h-10 object-contain opacity-90"
                        />
                        <img
                          src={ASSETS.lingkungan.tiangPenyanggaKayu}
                          alt=""
                          className="w-10 h-10 object-contain opacity-90"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Cliff + Treasure Chest & Finishing Flag */}
                  <div className="relative w-24 sm:w-32 shrink-0 flex flex-col items-center">
                    <div className="flex items-end gap-1 -mb-3 z-20">
                      <img
                        src={ASSETS.hadiah.petiHarta}
                        alt="Peti Harta"
                        className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow"
                      />
                      <img
                        src={ASSETS.hadiah.benderaFinishing}
                        alt="Bendera Finish"
                        className="w-10 h-12 sm:w-12 sm:h-14 object-contain drop-shadow"
                      />
                    </div>
                    <img
                      src={ASSETS.lingkungan.tebingKanan}
                      alt="Tebing Kanan"
                      className="w-full h-24 sm:h-28 object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Controls: Group Selector (for Penjumlahan) + Inventory Boards + Check / Next Level */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-2xl border-2 border-[#082545]">
                <div className="lg:col-span-8 space-y-2">
                  {/* If Mode = susun_per_kelompok, render Suku Group Tabs */}
                  {currentBridgeConfig.mode === 'susun_per_kelompok' &&
                    currentBridgeConfig.kelompok_penyusun && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-[#082545]">
                          Pilih Kelompok Suku yang Diisi:
                        </span>
                        {currentBridgeConfig.kelompok_penyusun.map((grp, idx) => {
                          const grpSum = simplifyFrac(
                            fracSum((groupPlacedBoards[idx] || []).map((b) => b.pecahan))
                          );
                          const isDone = fracEq(grpSum, grp.nilai);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                playSound(ASSETS.audio.klik);
                                setActiveGroupIdx(idx);
                              }}
                              className={`px-3 py-1 rounded-xl text-xs font-extrabold border-2 flex items-center gap-1.5 cursor-pointer ${
                                activeGroupIdx === idx
                                  ? 'bg-[#0066DD] text-white border-[#082545]'
                                  : 'bg-white text-[#082545] border-slate-300'
                              }`}
                            >
                              <span>{grp.label}</span>
                              <span className="px-1.5 py-0.5 rounded bg-black/15 font-mono text-[10px]">
                                Isi: {grpSum.pembilang === 0 ? '0' : `${grpSum.pembilang}/${grpSum.penyebut}`}
                              </span>
                              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD60A]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                  {/* Inventory Boards Tray (for susun_rasio and susun_per_kelompok) */}
                  {currentBridgeConfig.inventaris ? (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-extrabold text-slate-600">
                        Inventaris Papan (Ketuk untuk Pasang):
                      </span>
                      {currentBridgeConfig.inventaris.map((item, idx) => {
                        const used = getUsedStockCount(item.aset, item.warna);
                        const remaining = Math.max(0, item.jumlah - used);
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={remaining === 0}
                            onClick={() => handleAddBoardToBridge(item)}
                            className={`px-3 py-2 rounded-2xl border-2 border-[#082545] flex items-center gap-2.5 transition-all ${
                              remaining > 0
                                ? 'bg-white hover:bg-[#FEF9C3] shadow-[0_3px_0_#082545] hover:-translate-y-0.5 cursor-pointer'
                                : 'bg-slate-200 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <img
                              src={BOARD_ASSET_MAP[item.aset]}
                              alt="Papan"
                              className="w-16 h-7 object-fill rounded border border-slate-300"
                            />
                            <div className="text-left">
                              <div className="text-xs font-extrabold text-[#082545] flex items-center gap-1">
                                <span>
                                  Papan {item.pecahan.pembilang}/{item.pecahan.penyebut}
                                </span>
                                {item.warna && (
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] text-white uppercase ${
                                      item.warna === 'merah' ? 'bg-red-600' : 'bg-blue-600'
                                    }`}
                                  >
                                    {item.warna}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono font-bold text-slate-500">
                                Sisa Stok: {remaining}/{item.jumlah}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs font-extrabold text-[#0066DD] flex items-center gap-2">
                      <span>
                        Mode Pengurangan Papan: Ketuk langsung papan pada jembatan di atas untuk
                        membongkar bagian yang dikurangi ({removedBoardIndices.length} papan dilepas).
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Action Buttons: Reset, Check Answer, Next Level */}
                <div className="lg:col-span-4 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playSound(ASSETS.audio.klik);
                      initBridgeLevelState(bridgeLevelNum);
                    }}
                    className="surface-3d-btn-neutral px-3.5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <img src={ASSETS.ui.tombolReset} alt="" className="w-5 h-5 object-contain" />
                    <span>Reset Papan</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckBridgeAnswer}
                    className="surface-3d-btn-emerald px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer"
                  >
                    <img src={ASSETS.ui.tombolCek} alt="" className="w-5 h-5 object-contain" />
                    <span>Cek Jawaban</span>
                  </button>

                  {bridgeLevelNum < 12 && (
                    <button
                      type="button"
                      onClick={() => {
                        playSound(ASSETS.audio.naik_level);
                        initBridgeLevelState(bridgeLevelNum + 1);
                      }}
                      className="surface-3d-btn-primary px-3.5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Level {bridgeLevelNum + 1}</span>
                      <img src={ASSETS.ui.tombolBerikutnya} alt="" className="w-5 h-5 object-contain" />
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Tabel Perbandingan Panjang Papan Pecahan */}
              {showBoardReferenceModal && (
                <div className="fixed inset-0 z-50 bg-[#082545]/75 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-3xl w-full p-5 border-[3px] border-[#082545] shadow-[0_10px_0_#082545] space-y-3">
                    <div className="flex items-center justify-between border-b pb-2.5">
                      <h4 className="text-base sm:text-lg font-extrabold text-[#082545]">
                        Tabel Perbandingan Panjang Papan Pecahan (Proporsional Eksak)
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowBoardReferenceModal(false)}
                        className="surface-3d-btn-neutral px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>
                    <img
                      src={ASSETS.lingkungan.perbandinganPapan}
                      alt="Perbandingan Panjang Papan Pecahan"
                      className="w-full max-h-[70vh] object-contain rounded-2xl border border-slate-200 mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
