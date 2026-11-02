import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface SimpleFraction {
  whole?: number;
  num: number;
  den: number;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 1;
  return Math.abs(Math.round((a * b) / gcd(a, b)));
}

export function lcmArray(arr: number[]): number {
  return arr.reduce((acc, val) => lcm(acc, val), 1);
}

export function toImproper(f: SimpleFraction): { num: number; den: number } {
  const den = Math.max(1, Math.round(f.den));
  const whole = Math.round(f.whole || 0);
  const num = Math.round(f.num);
  return {
    num: whole * den + num,
    den,
  };
}

export function simplifyFraction(num: number, den: number): {
  num: number;
  den: number;
  fpb: number;
  whole: number;
  remNum: number;
  decimal: number;
  formattedImproper: string;
  formattedMixed: string;
} {
  const safeDen = Math.max(1, Math.round(den));
  const safeNum = Math.round(num);
  const divisor = gcd(safeNum, safeDen);
  const sNum = safeNum / divisor;
  const sDen = safeDen / divisor;
  const sign = sNum < 0 ? -1 : 1;
  const absNum = Math.abs(sNum);
  const whole = Math.floor(absNum / sDen) * sign;
  const remNum = absNum % sDen;

  let formattedMixed = `${sNum}/${sDen}`;
  if (remNum === 0) {
    formattedMixed = `${whole}`;
  } else if (Math.abs(whole) > 0) {
    formattedMixed = `${whole} ${remNum}/${sDen}`;
  }

  return {
    num: sNum,
    den: sDen,
    fpb: divisor,
    whole,
    remNum,
    decimal: Number((sNum / sDen).toFixed(4)),
    formattedImproper: `${sNum}/${sDen}`,
    formattedMixed,
  };
}

export function addFractions(a: SimpleFraction, b: SimpleFraction) {
  const impA = toImproper(a);
  const impB = toImproper(b);
  const kpk = lcm(impA.den, impB.den);
  const eqNumA = impA.num * (kpk / impA.den);
  const eqNumB = impB.num * (kpk / impB.den);
  const rawSumNum = eqNumA + eqNumB;
  const simplified = simplifyFraction(rawSumNum, kpk);

  return {
    impA,
    impB,
    kpk,
    eqNumA,
    eqNumB,
    rawSumNum,
    rawDen: kpk,
    simplified,
  };
}

export function subtractFractions(a: SimpleFraction, b: SimpleFraction) {
  const impA = toImproper(a);
  const impB = toImproper(b);
  const kpk = lcm(impA.den, impB.den);
  const eqNumA = impA.num * (kpk / impA.den);
  const eqNumB = impB.num * (kpk / impB.den);
  const rawDiffNum = eqNumA - eqNumB;
  const simplified = simplifyFraction(rawDiffNum, kpk);

  return {
    impA,
    impB,
    kpk,
    eqNumA,
    eqNumB,
    rawDiffNum,
    rawDen: kpk,
    simplified,
  };
}

export function compareTwoFractions(a: SimpleFraction, b: SimpleFraction) {
  const impA = toImproper(a);
  const impB = toImproper(b);
  const kpk = lcm(impA.den, impB.den);
  const eqNumA = impA.num * (kpk / impA.den);
  const eqNumB = impB.num * (kpk / impB.den);
  const crossLeft = impA.num * impB.den;
  const crossRight = impB.num * impA.den;
  const symbol: '<' | '>' | '=' =
    eqNumA < eqNumB ? '<' : eqNumA > eqNumB ? '>' : '=';

  return {
    impA,
    impB,
    kpk,
    eqNumA,
    eqNumB,
    crossLeft,
    crossRight,
    symbol,
  };
}

// ============================================================================
// PDF & EXCEL (.XLSX) GENERATION UTILITIES
// ============================================================================

export interface StudentIdentity {
  id_siswa: string;
  nama_siswa: string;
  kelas: string;
  asal_sekolah: string;
}

export function downloadLkpdPdf(params: {
  siswa: StudentIdentity;
  labTitle: string;
  stemFocus: string;
  hipotesis: string;
  dataRows: Array<{
    no: number;
    variabel: string;
    perhitunganKpk: string;
    hasilPecahan: string;
    nilaiDesimal: string;
    keterangan: string;
  }>;
  observasi: string;
  kesimpulan: string;
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header Banner
  doc.setFillColor(2, 132, 199);
  doc.rect(0, 0, 210, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('LEMBAR KERJA PESERTA DIDIK (LKPD) — VIRTUAL LAB 3D', 14, 13);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'MATWALL — Mathematics Interactive Wordwall | Kelas V SD Kurikulum Merdeka Fase C',
    14,
    20
  );
  doc.text(`Laboratorium: ${params.labTitle}`, 14, 27);

  // Student Identity Box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('A. IDENTITAS PESERTA DIDIK', 14, 43);

  autoTable(doc, {
    startY: 46,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
    body: [
      ['Nama Siswa', params.siswa.nama_siswa, 'Kelas', params.siswa.kelas],
      [
        'Asal Sekolah',
        params.siswa.asal_sekolah,
        'Tanggal Eksperimen',
        new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      ],
      ['Fokus Eksperimen', { content: params.stemFocus, colSpan: 3 }],
    ],
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // Hypothesis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('B. RUMUSAN HIPOTESIS AWAL', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const splitHipo = doc.splitTextToSize(
    params.hipotesis || 'Siswa belum menuliskan hipotesis.',
    182
  );
  doc.text(splitHipo, 14, currentY + 5);
  currentY += 8 + splitHipo.length * 4.5;

  // Data Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('C. TABEL DATA HASIL SIMULASI EKSPERIMEN MATEMATIKA', 14, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [
      [
        'No',
        'Variabel Pecahan Uji',
        'Transformasi KPK / Penyebut',
        'Hasil Akhir Pecahan',
        'Nilai Desimal',
        'Keterangan Hasil',
      ],
    ],
    body:
      params.dataRows.length > 0
        ? params.dataRows.map((r) => [
            String(r.no),
            r.variabel,
            r.perhitunganKpk,
            r.hasilPecahan,
            r.nilaiDesimal,
            r.keterangan,
          ])
        : [['1', '-', '-', '-', '-', 'Belum ada data tercatat']],
    theme: 'striped',
    headStyles: { fillColor: [2, 132, 199], textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Observation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('D. ANALISIS DAN HASIL PENGAMATAN (OBSERVASI)', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const splitObs = doc.splitTextToSize(
    params.observasi || 'Siswa telah melakukan pengamatan visualisasi pecahan.',
    182
  );
  doc.text(splitObs, 14, currentY + 5);
  currentY += 8 + splitObs.length * 4.5;

  // Conclusion
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('E. KESIMPULAN EKSPERIMEN', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const splitKes = doc.splitTextToSize(
    params.kesimpulan || 'Kesimpulan eksperimen telah diverifikasi.',
    182
  );
  doc.text(splitKes, 14, currentY + 5);

  // Footer Developer Credit
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Dikembangkan oleh: MILA AULIA (NIM: 501332956) — S2 Magister Pendidikan Dasar, Universitas Terbuka',
    14,
    287
  );

  const safeName = params.siswa.nama_siswa.replace(/[^a-zA-Z0-9]/g, '_');
  const safeLab = params.labTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25);
  doc.save(`LKPD_${safeLab}_${safeName}.pdf`);
}

export function exportLabExcel(params: {
  siswa: StudentIdentity;
  labTitle: string;
  hipotesis: string;
  observasi: string;
  kesimpulan: string;
  dataRows: Array<{
    no: number;
    variabel: string;
    perhitunganKpk: string;
    hasilPecahan: string;
    nilaiDesimal: string;
    keterangan: string;
  }>;
}) {
  const wb = XLSX.utils.book_new();

  const metaSheetData = [
    ['LAPORAN EKSPERIMEN VIRTUAL LAB 3D — MATWALL'],
    ['Laboratorium', params.labTitle],
    ['Nama Siswa', params.siswa.nama_siswa],
    ['Kelas', params.siswa.kelas],
    ['Asal Sekolah', params.siswa.asal_sekolah],
    ['Waktu Ekspor', new Date().toLocaleString('id-ID')],
    [],
    ['Hipotesis Awal', params.hipotesis],
    ['Hasil Observasi', params.observasi],
    ['Kesimpulan Eksperimen', params.kesimpulan],
  ];

  const wsMeta = XLSX.utils.aoa_to_sheet(metaSheetData);
  XLSX.utils.book_append_sheet(wb, wsMeta, 'Identitas_dan_Analisis');

  const tableRows = params.dataRows.map((r) => ({
    No: r.no,
    'Variabel Pecahan Uji': r.variabel,
    'Transformasi KPK': r.perhitunganKpk,
    'Hasil Pecahan': r.hasilPecahan,
    'Nilai Desimal': r.nilaiDesimal,
    'Keterangan Hasil': r.keterangan,
  }));

  const wsData = XLSX.utils.json_to_sheet(
    tableRows.length > 0
      ? tableRows
      : [
          {
            No: 1,
            'Variabel Pecahan Uji': '-',
            'Transformasi KPK': '-',
            'Hasil Pecahan': '-',
            'Nilai Desimal': '-',
            'Keterangan Hasil': 'Belum ada percobaan ditambahkan ke tabel',
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, wsData, 'Data_Percobaan_Lab');

  const safeName = params.siswa.nama_siswa.replace(/[^a-zA-Z0-9]/g, '_');
  const safeLab = params.labTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25);
  XLSX.writeFile(wb, `Data_Eksperimen_${safeLab}_${safeName}.xlsx`);
}

export interface QuizQuestionItem {
  id_soal: string;
  nomor_soal: number;
  topik: string;
  level_kognitif: string;
  pertanyaan: string;
  opsi: { A: string; B: string; C: string; D: string };
  kunci_jawaban: 'A' | 'B' | 'C' | 'D';
  pembahasan: string;
}

export function downloadQuizExcel(params: {
  siswa: StudentIdentity;
  skorAkhir: number;
  jumlahBenar: number;
  jumlahSalah: number;
  durasiDetik: number;
  predikat: string;
  questions: QuizQuestionItem[];
  userAnswers: Record<number, string>;
}) {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ['LAPORAN HASIL QUIZ EVALUASI PECAHAN (15 SOAL) — MATWALL'],
    ['Target Kurikulum', 'Matematika Kelas V SD — Kurikulum Merdeka Fase C Semester 1'],
    ['Nama Siswa', params.siswa.nama_siswa],
    ['Kelas', params.siswa.kelas],
    ['Asal Sekolah', params.siswa.asal_sekolah],
    ['Nilai Akhir (Skala 100)', params.skorAkhir],
    ['Jumlah Jawaban Benar', params.jumlahBenar],
    ['Jumlah Jawaban Salah', params.jumlahSalah],
    ['Total Soal', params.questions.length],
    ['Durasi Pengerjaan (Detik)', params.durasiDetik],
    ['Predikat Capaian', params.predikat],
    ['Waktu Selesai', new Date().toLocaleString('id-ID')],
    ['Pengembang MPI', 'MILA AULIA (NIM: 501332956) - S2 Magister Pendidikan Dasar, Universitas Terbuka'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan_Hasil');

  const detailData = params.questions.map((q) => {
    const ans = params.userAnswers[q.nomor_soal] || '-';
    const isCorrect = ans === q.kunci_jawaban;
    return {
      'No Soal': q.nomor_soal,
      'Topik Materi': q.topik,
      'Level Kognitif': q.level_kognitif,
      Pertanyaan: q.pertanyaan,
      'Jawaban Siswa': ans,
      'Teks Jawaban Siswa': ans !== '-' ? (q.opsi as any)[ans] || '' : 'Tidak Dijawab',
      'Kunci Jawaban': q.kunci_jawaban,
      'Teks Kunci Jawaban': (q.opsi as any)[q.kunci_jawaban],
      Status: isCorrect ? 'BENAR' : 'SALAH',
      Skor: isCorrect ? 1 : 0,
      Pembahasan: q.pembahasan,
    };
  });

  const wsDetail = XLSX.utils.json_to_sheet(detailData);
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail_Jawaban_15_Soal');

  const safeName = params.siswa.nama_siswa.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Hasil_Quiz_MATWALL_${safeName}.xlsx`);
}

export function downloadQuizPdf(params: {
  siswa: StudentIdentity;
  skorAkhir: number;
  jumlahBenar: number;
  jumlahSalah: number;
  durasiDetik: number;
  predikat: string;
  questions: QuizQuestionItem[];
  userAnswers: Record<number, string>;
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFillColor(2, 132, 199);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LAPORAN HASIL QUIZ EVALUASI BILANGAN PECAHAN', 14, 13);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'MATWALL — Mathematics Interactive Wordwall | Kelas V SD Kurikulum Merdeka Fase C',
    14,
    20
  );
  doc.text(
    `Pengembang: MILA AULIA (NIM: 501332956) — Magister Pendidikan Dasar, Universitas Terbuka`,
    14,
    26
  );

  doc.setTextColor(15, 23, 42);
  autoTable(doc, {
    startY: 38,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5 },
    body: [
      ['Nama Siswa', params.siswa.nama_siswa, 'Skor Akhir', `${params.skorAkhir} / 100`],
      ['Kelas', params.siswa.kelas, 'Jawaban Benar / Salah', `${params.jumlahBenar} Benar / ${params.jumlahSalah} Salah`],
      ['Asal Sekolah', params.siswa.asal_sekolah, 'Predikat', params.predikat],
    ],
  });

  const rows = params.questions.map((q) => {
    const ans = params.userAnswers[q.nomor_soal] || '-';
    const isCorrect = ans === q.kunci_jawaban;
    return [
      String(q.nomor_soal),
      q.topik,
      ans,
      q.kunci_jawaban,
      isCorrect ? 'BENAR' : 'SALAH',
      q.pembahasan,
    ];
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 6,
    head: [['No', 'Topik', 'Jawab', 'Kunci', 'Status', 'Pembahasan Matematis']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [2, 132, 199], textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 38 },
      2: { cellWidth: 14 },
      3: { cellWidth: 14 },
      4: { cellWidth: 18 },
      5: { cellWidth: 88 },
    },
  });

  const safeName = params.siswa.nama_siswa.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Hasil_Quiz_MATWALL_${safeName}.pdf`);
}

export function downloadPjblPdf(params: {
  siswa: StudentIdentity;
  namaResep: string;
  porsiTarget: string;
  fase1: string;
  fase2: string;
  jadwal: Array<{ tahap: string; targetWaktu: string; selesai: boolean }>;
  bahanList: Array<{
    nama: string;
    satuan: string;
    awalNum: number;
    awalDen: number;
    terpakaiNum: number;
    terpakaiDen: number;
  }>;
  perbandinganRingkasan: string;
  totalPenjumlahan: string;
  sisaPengurangan: string;
  fase5Presentasi: string;
  fase6Refleksi: string;
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PORTOFOLIO PROYEK PjBL — MINI BAKERY: MASTER CHEF PECAHAN', 14, 13);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Model Project Based Learning (PjBL) | Matematika Kelas V SD Kurikulum Merdeka',
    14,
    20
  );
  doc.text(`Nama Karya Kue: ${params.namaResep} (${params.porsiTarget})`, 14, 26);

  autoTable(doc, {
    startY: 38,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5 },
    body: [
      ['Nama Siswa', params.siswa.nama_siswa, 'Kelas', params.siswa.kelas],
      ['Asal Sekolah', params.siswa.asal_sekolah, 'Target Porsi', params.porsiTarget],
      ['Tahap 1: Pertanyaan Mendasar', { content: params.fase1, colSpan: 3 }],
      ['Tahap 2: Rencana Resep Kue', { content: params.fase2, colSpan: 3 }],
    ],
  });

  const bahanRows = params.bahanList.map((b, i) => {
    const diff = subtractFractions(
      { num: b.awalNum, den: b.awalDen },
      { num: b.terpakaiNum, den: b.terpakaiDen }
    );
    return [
      String(i + 1),
      b.nama,
      `${b.awalNum}/${b.awalDen} ${b.satuan}`,
      `${b.terpakaiNum}/${b.terpakaiDen} ${b.satuan}`,
      `${diff.simplified.formattedMixed} ${b.satuan}`,
    ];
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 6,
    head: [['No', 'Nama Bahan Resep', 'Takaran Awal', 'Takaran Terpakai', 'Sisa Bahan (Pengurangan)']],
    body: bahanRows,
    theme: 'striped',
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 6,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    body: [
      ['Urutan Perbandingan Bahan (Terkecil ke Terbesar)', params.perbandinganRingkasan],
      ['Total Penjumlahan Seluruh Bahan', params.totalPenjumlahan],
      ['Ringkasan Sisa Pengurangan Bahan', params.sisaPengurangan],
      ['Tahap 5: Catatan Presentasi Karya', params.fase5Presentasi],
      ['Tahap 6: Evaluasi Pengalaman & Refleksi', params.fase6Refleksi],
    ],
  });

  const safeName = params.siswa.nama_siswa.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Portofolio_PjBL_Mini_Bakery_${safeName}.pdf`);
}
