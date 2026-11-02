import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  FileDown,
  RotateCcw,
  Save,
  Clock,
} from 'lucide-react';
import {
  downloadQuizExcel,
  downloadQuizPdf,
  type QuizQuestionItem,
  type StudentIdentity,
} from '../utils/fractionMath';
import { MathText } from './FractionVisuals';
import { safeApiRequest } from '../utils/apiClient';

interface QuizModuleProps {
  siswa: StudentIdentity;
  onSavedNotification: (msg: string, syncedToSheets: boolean) => void;
}

export const QUIZ_15_QUESTIONS: QuizQuestionItem[] = [
  {
    id_soal: 'SOAL-01',
    nomor_soal: 1,
    topik: 'Membandingkan dan Mengurutkan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan:
      'Dalam kegiatan Mini Bakery: Master Chef Pecahan, Siti menyiapkan 3/4 liter susu cair dan 2/3 liter santan. Tanda perbandingan yang tepat antara 3/4 dan 2/3 adalah ...',
    opsi: {
      A: '3/4 < 2/3',
      B: '3/4 > 2/3',
      C: '3/4 = 2/3',
      D: '3/4 <= 2/3',
    },
    kunci_jawaban: 'B',
    pembahasan:
      'Samakan penyebut dengan KPK dari 4 dan 3 yaitu 12. 3/4 = 9/12 dan 2/3 = 8/12. Karena 9/12 > 8/12, maka 3/4 > 2/3.',
  },
  {
    id_soal: 'SOAL-02',
    nomor_soal: 2,
    topik: 'Membandingkan dan Mengurutkan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan:
      'Perhatikan empat takaran bahan kue berikut: 1/2 kg tepung, 3/8 kg gula pasir, 3/4 kg ubi ungu, dan 5/8 kg santan. Urutan pecahan dari yang terkecil ke terbesar adalah ...',
    opsi: {
      A: '3/8, 1/2, 5/8, 3/4',
      B: '1/2, 3/8, 3/4, 5/8',
      C: '3/8, 5/8, 1/2, 3/4',
      D: '3/4, 5/8, 1/2, 3/8',
    },
    kunci_jawaban: 'A',
    pembahasan:
      'Ubah ke penyebut 8: 1/2 = 4/8; 3/8 tetap 3/8; 3/4 = 6/8; 5/8 tetap 5/8. Urutan dari terkecil: 3/8, 1/2, 5/8, 3/4.',
  },
  {
    id_soal: 'SOAL-03',
    nomor_soal: 3,
    topik: 'Membandingkan dan Mengurutkan Pecahan',
    level_kognitif: 'C2 (Pemahaman)',
    pertanyaan:
      'Pecahan di bawah ini yang nilainya lebih besar dari 3/5 tetapi lebih kecil dari 4/5 adalah ...',
    opsi: {
      A: '5/10',
      B: '7/10',
      C: '8/10',
      D: '9/10',
    },
    kunci_jawaban: 'B',
    pembahasan:
      'Ubah 3/5 dan 4/5 ke penyebut 10: 3/5 = 6/10 dan 4/5 = 8/10. Pecahan di antara 6/10 dan 8/10 adalah 7/10.',
  },
  {
    id_soal: 'SOAL-04',
    nomor_soal: 4,
    topik: 'Membandingkan dan Mengurutkan Pecahan',
    level_kognitif: 'C4 (Analisis - HOTS)',
    pertanyaan:
      'Empat kelompok siswa membuat adonan klepon. Kelompok A memakai 5/6 kg tepung ketan, Kelompok B memakai 7/9 kg, Kelompok C memakai 2/3 kg, dan Kelompok D memakai 13/18 kg. Kelompok yang menggunakan tepung ketan paling banyak adalah ...',
    opsi: {
      A: 'Kelompok A',
      B: 'Kelompok B',
      C: 'Kelompok C',
      D: 'Kelompok D',
    },
    kunci_jawaban: 'A',
    pembahasan:
      'KPK dari 6, 9, 3, dan 18 adalah 18. Kelompok A = 5/6 = 15/18; Kelompok B = 7/9 = 14/18; Kelompok C = 2/3 = 12/18; Kelompok D = 13/18. Nilai terbesar adalah 15/18 (Kelompok A).',
  },
  {
    id_soal: 'SOAL-05',
    nomor_soal: 5,
    topik: 'Membandingkan dan Mengurutkan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Manakah pasangan pecahan berikut yang merupakan pecahan senilai (ekuivalen)?',
    opsi: {
      A: '4/6 dan 8/10',
      B: '6/9 dan 10/15',
      C: '3/7 dan 6/12',
      D: '5/8 dan 15/20',
    },
    kunci_jawaban: 'B',
    pembahasan:
      'Sederhanakan 6/9 (dibagi 3) = 2/3, dan 10/15 (dibagi 5) = 2/3. Keduanya bernilai 2/3 sehingga senilai.',
  },
  {
    id_soal: 'SOAL-06',
    nomor_soal: 6,
    topik: 'Penjumlahan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Hasil penjumlahan dari 2/5 + 3/10 dalam bentuk paling sederhana adalah ...',
    opsi: {
      A: '5/15',
      B: '1/2',
      C: '7/10',
      D: '4/5',
    },
    kunci_jawaban: 'C',
    pembahasan: 'Samakan penyebut menjadi 10: 2/5 = 4/10. Maka 4/10 + 3/10 = 7/10.',
  },
  {
    id_soal: 'SOAL-07',
    nomor_soal: 7,
    topik: 'Penjumlahan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan:
      'Untuk membuat es buah, Rina mencampurkan 3/4 liter sari jeruk dan 5/6 liter air kelapa muda. Total volume campuran minuman tersebut adalah ...',
    opsi: {
      A: '1 5/12 liter',
      B: '1 7/12 liter',
      C: '8/10 liter',
      D: '1 9/12 liter',
    },
    kunci_jawaban: 'B',
    pembahasan:
      'KPK dari 4 dan 6 adalah 12. 3/4 = 9/12 dan 5/6 = 10/12. Jumlah = 9/12 + 10/12 = 19/12 = 1 7/12 liter.',
  },
  {
    id_soal: 'SOAL-08',
    nomor_soal: 8,
    topik: 'Penjumlahan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Hasil dari penjumlahan pecahan campuran 1 1/3 + 2 1/4 adalah ...',
    opsi: {
      A: '3 2/7',
      B: '3 5/12',
      C: '3 7/12',
      D: '4 1/12',
    },
    kunci_jawaban: 'C',
    pembahasan:
      'Jumlahkan bilangan bulat: 1 + 2 = 3. Jumlahkan pecahan: 1/3 + 1/4 = 4/12 + 3/12 = 7/12. Total = 3 7/12.',
  },
  {
    id_soal: 'SOAL-09',
    nomor_soal: 9,
    topik: 'Penjumlahan Bilangan Pecahan',
    level_kognitif: 'C4 (Analisis - HOTS)',
    pertanyaan:
      'Dalam proyek resep sehat, Budi menimbang 1/2 kg tepung beras, 3/8 kg tepung tapioka, dan 1/4 kg gula aren. Berat seluruh bahan yang ditimbang Budi adalah ...',
    opsi: {
      A: '1 1/8 kg',
      B: '1 3/8 kg',
      C: '7/8 kg',
      D: '1 1/4 kg',
    },
    kunci_jawaban: 'A',
    pembahasan:
      'Samakan penyebut menjadi 8: 1/2 = 4/8; 3/8 = 3/8; 1/4 = 2/8. Jumlah = 9/8 = 1 1/8 kg.',
  },
  {
    id_soal: 'SOAL-10',
    nomor_soal: 10,
    topik: 'Penjumlahan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Hasil dari 5/12 + 3/8 adalah ...',
    opsi: {
      A: '8/20',
      B: '19/24',
      C: '17/24',
      D: '21/24',
    },
    kunci_jawaban: 'B',
    pembahasan:
      'KPK dari 12 dan 8 adalah 24. 5/12 = 10/24 dan 3/8 = 9/24. Maka 10/24 + 9/24 = 19/24.',
  },
  {
    id_soal: 'SOAL-11',
    nomor_soal: 11,
    topik: 'Pengurangan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Hasil pengurangan dari 7/8 - 1/4 adalah ...',
    opsi: {
      A: '6/4',
      B: '5/8',
      C: '3/8',
      D: '3/4',
    },
    kunci_jawaban: 'B',
    pembahasan: 'Ubah 1/4 menjadi 2/8. Maka 7/8 - 2/8 = 5/8.',
  },
  {
    id_soal: 'SOAL-12',
    nomor_soal: 12,
    topik: 'Pengurangan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan:
      'Ibu memiliki persediaan 5/6 kg gula pasir. Sebanyak 3/9 kg digunakan untuk membuat sirup pandan. Sisa gula pasir Ibu sekarang adalah ...',
    opsi: {
      A: '1/2 kg',
      B: '2/3 kg',
      C: '5/18 kg',
      D: '7/18 kg',
    },
    kunci_jawaban: 'A',
    pembahasan: 'Sederhanakan 3/9 menjadi 1/3 = 2/6. Maka 5/6 - 2/6 = 3/6 = 1/2 kg.',
  },
  {
    id_soal: 'SOAL-13',
    nomor_soal: 13,
    topik: 'Pengurangan Bilangan Pecahan',
    level_kognitif: 'C3 (Aplikasi)',
    pertanyaan: 'Hasil dari pengurangan pecahan campuran 3 3/4 - 1 2/5 adalah ...',
    opsi: {
      A: '2 1/20',
      B: '2 7/20',
      C: '2 9/20',
      D: '1 7/20',
    },
    kunci_jawaban: 'B',
    pembahasan:
      'Kurangkan bilangan bulat: 3 - 1 = 2. Kurangkan pecahan: 3/4 - 2/5 = 15/20 - 8/20 = 7/20. Hasilnya adalah 2 7/20.',
  },
  {
    id_soal: 'SOAL-14',
    nomor_soal: 14,
    topik: 'Pengurangan Bilangan Pecahan',
    level_kognitif: 'C4 (Analisis - HOTS)',
    pertanyaan:
      'Tangki laboratorium hidroponik berisi 4 1/6 liter larutan nutrisi. Setelah dialirkan ke tanaman sebanyak 1 2/3 liter, sisa larutan di dalam tangki adalah ...',
    opsi: {
      A: '2 1/2 liter',
      B: '2 2/6 liter',
      C: '3 1/2 liter',
      D: '2 1/6 liter',
    },
    kunci_jawaban: 'A',
    pembahasan:
      'Ubah ke pecahan biasa: 4 1/6 = 25/6 dan 1 2/3 = 5/3 = 10/6. Kurangkan: 25/6 - 10/6 = 15/6 = 5/2 = 2 1/2 liter.',
  },
  {
    id_soal: 'SOAL-15',
    nomor_soal: 15,
    topik: 'Pengurangan Bilangan Pecahan',
    level_kognitif: 'C4 (Analisis - HOTS)',
    pertanyaan:
      'Di dapur Mini Bakery: Master Chef Pecahan, kelompok Dinda menyiapkan 2 1/2 kg tepung terigu. Pada sesi pertama terpakai 3/4 kg dan sesi kedua terpakai 7/8 kg. Sisa tepung terigu kelompok Dinda adalah ...',
    opsi: {
      A: '5/8 liter',
      B: '7/8 liter',
      C: '3/4 liter',
      D: '1 1/8 liter',
    },
    kunci_jawaban: 'B',
    pembahasan:
      'Samakan penyebut ke 8: 2 1/2 = 5/2 = 20/8. Terjual: 3/4 = 6/8 dan 7/8. Sisa = 20/8 - 6/8 - 7/8 = 7/8 liter.',
  },
];

export const QuizModule: React.FC<QuizModuleProps> = ({
  siswa,
  onSavedNotification,
}) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);

  const loadQuizHistory = async () => {
    try {
      const { ok, data } = await safeApiRequest(
        `/api/db/records?id_siswa=${encodeURIComponent(siswa.id_siswa)}`
      );
      if (ok && data) {
        setQuizHistory(data.hasilQuiz || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadQuizHistory();
  }, [siswa.id_siswa]);

  useEffect(() => {
    if (isSubmitted) return;
    const t = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [isSubmitted]);

  const currentQuestion = QUIZ_15_QUESTIONS[currentIdx];
  const answeredTotal = Object.keys(userAnswers).length;

  const jumlahBenar = QUIZ_15_QUESTIONS.filter(
    (q) => userAnswers[q.nomor_soal] === q.kunci_jawaban
  ).length;
  const jumlahSalah = QUIZ_15_QUESTIONS.length - jumlahBenar;
  const skorAkhir = Math.round((jumlahBenar / QUIZ_15_QUESTIONS.length) * 100);
  const predikat =
    skorAkhir >= 90
      ? 'Sangat Baik (A)'
      : skorAkhir >= 80
      ? 'Baik (B)'
      : skorAkhir >= 70
      ? 'Cukup (C)'
      : 'Perlu Bimbingan (D)';

  const handleSubmitAndSaveQuiz = async () => {
    setIsSubmitted(true);
    setIsSaving(true);

    const detailJawaban = QUIZ_15_QUESTIONS.map((q) => {
      const ans = userAnswers[q.nomor_soal] || '-';
      return {
        nomor_soal: q.nomor_soal,
        topik: q.topik,
        jawaban_siswa: ans,
        kunci_jawaban: q.kunci_jawaban,
        status_benar: ans === q.kunci_jawaban,
      };
    });

    try {
      const { data } = await safeApiRequest('/api/quiz/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_siswa: siswa.id_siswa,
          nama_siswa: siswa.nama_siswa,
          kelas: siswa.kelas,
          asal_sekolah: siswa.asal_sekolah,
          skor_akhir: skorAkhir,
          jumlah_benar: jumlahBenar,
          jumlah_salah: jumlahSalah,
          total_soal: QUIZ_15_QUESTIONS.length,
          durasi_detik: elapsedSec,
          predikat,
          detail_jawaban: detailJawaban,
        }),
      });
      await loadQuizHistory();
      onSavedNotification(
        data?.sheetsStatusMessage ||
          `Hasil Quiz (Skor: ${skorAkhir}) berhasil disimpan.`,
        Boolean(data?.savedToGoogleSheets)
      );
    } catch {
      onSavedNotification('Gagal menyimpan hasil quiz ke server.', false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setCurrentIdx(0);
    setIsSubmitted(false);
    setElapsedSec(0);
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Header & Download Actions Bar */}
      <div className="surface-3d-card rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="text-[10px] font-extrabold text-[#0066DD] uppercase tracking-wider">
            Modul D · Evaluasi Kognitif Terpadu · 15 Butir Soal Pilihan Ganda
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#082545]">
            Quiz Interaktif 15 Soal Bilangan Pecahan
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              downloadQuizExcel({
                siswa,
                skorAkhir,
                jumlahBenar,
                jumlahSalah,
                durasiDetik: elapsedSec,
                predikat,
                questions: QUIZ_15_QUESTIONS,
                userAnswers,
              })
            }
            className="surface-3d-btn-emerald px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Results as Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() =>
              downloadQuizPdf({
                siswa,
                skorAkhir,
                jumlahBenar,
                jumlahSalah,
                durasiDetik: elapsedSec,
                predikat,
                questions: QUIZ_15_QUESTIONS,
                userAnswers,
              })
            }
            className="surface-3d-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download Results as PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {/* Main Quiz Grid Fitting in 1 Screen: Left Active Question (8 cols), Right Question Navigator & Summary (4 cols) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-8 surface-3d-card rounded-2xl p-4 lg:p-5 flex flex-col justify-between gap-3 lg:overflow-y-auto">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 text-xs sm:text-sm">
              <div className="text-slate-600">
                <span className="font-extrabold text-[#082545]">
                  Soal {currentQuestion.nomor_soal} dari 15
                </span>{' '}
                · {currentQuestion.topik} · {currentQuestion.level_kognitif}
              </div>
              <div className="font-mono tabular-nums flex items-center gap-1.5 font-extrabold text-[#0066DD]">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Waktu: {Math.floor(elapsedSec / 60)}m {elapsedSec % 60}d
                </span>
              </div>
            </div>

            <div className="text-base sm:text-lg font-extrabold text-[#082545] leading-relaxed">
              {currentQuestion.nomor_soal}. <MathText text={currentQuestion.pertanyaan} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                const selected = userAnswers[currentQuestion.nomor_soal] === optKey;
                const isCorrectOption = currentQuestion.kunci_jawaban === optKey;
                let cardClass = 'bg-white border-[#082545] text-[#082545] hover:bg-[#BAE6FD]/30';

                if (!isSubmitted && selected) {
                  cardClass = 'bg-[#BAE6FD] border-[#0066DD] text-[#082545] font-extrabold shadow-[0_3px_0_#0066DD]';
                } else if (isSubmitted) {
                  if (isCorrectOption) {
                    cardClass = 'bg-[#BBF7D0] border-[#15803D] text-[#082545] font-extrabold';
                  } else if (selected && !isCorrectOption) {
                    cardClass = 'bg-red-100 border-red-500 text-red-900';
                  }
                }

                return (
                  <button
                    key={optKey}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() =>
                      setUserAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.nomor_soal]: optKey,
                      }))
                    }
                    className={`p-3.5 rounded-2xl border-2 text-left text-sm sm:text-base transition-all flex items-center gap-3 cursor-pointer ${cardClass}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#082545] text-white font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                      {optKey}
                    </span>
                    <span className="font-bold">
                      <MathText text={currentQuestion.opsi[optKey]} />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation shown after submission */}
            {isSubmitted && (
              <div className="p-3.5 rounded-xl bg-[#FEF9C3] border-2 border-[#082545] space-y-1 text-xs sm:text-sm">
                <div className="font-extrabold text-[#082545]">
                  Kunci Jawaban: {currentQuestion.kunci_jawaban} (
                  <MathText text={currentQuestion.opsi[currentQuestion.kunci_jawaban]} />)
                </div>
                <p className="text-[#082545] leading-snug">
                  <strong>Pembahasan Matematis:</strong>{' '}
                  <MathText text={currentQuestion.pembahasan} />
                </p>
              </div>
            )}
          </div>

          {/* Prev / Next Navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="surface-3d-btn-neutral px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold disabled:opacity-40 cursor-pointer"
            >
              ← Soal Sebelumnya
            </button>

            <div className="text-xs sm:text-sm text-[#082545] font-mono font-extrabold">
              Terjawab: {answeredTotal} / 15
            </div>

            {currentIdx < QUIZ_15_QUESTIONS.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => Math.min(QUIZ_15_QUESTIONS.length - 1, i + 1))}
                className="surface-3d-btn-primary px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer"
              >
                Soal Berikutnya →
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSubmitAndSaveQuiz}
                className="surface-3d-btn-emerald px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesai & Simpan Hasil Quiz</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Navigator & Score Summary Panel Combined in 1 Card */}
        <div className="lg:col-span-4 surface-3d-card rounded-2xl p-4 flex flex-col justify-between gap-3 lg:overflow-y-auto">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#082545]">
                Navigasi 15 Nomor Soal
              </h3>
              {isSubmitted && (
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="text-xs font-extrabold text-[#0066DD] flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Ulangi</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
              {QUIZ_15_QUESTIONS.map((q, idx) => {
                const ans = userAnswers[q.nomor_soal];
                const active = currentIdx === idx;
                let bg = 'bg-slate-100 text-[#082545] border-slate-300';
                if (isSubmitted) {
                  bg =
                    ans === q.kunci_jawaban
                      ? 'bg-[#58CC02] text-white border-[#082545]'
                      : 'bg-red-600 text-white border-[#082545]';
                } else if (ans) {
                  bg = 'bg-[#0066DD] text-white border-[#082545]';
                }
                return (
                  <button
                    key={q.id_soal}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`py-2 rounded-xl border-2 font-extrabold cursor-pointer ${bg} ${
                      active ? 'ring-2 ring-[#FF7A00] ring-offset-1' : ''
                    }`}
                  >
                    {q.nomor_soal}
                    {ans ? `·${ans}` : ''}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSubmitAndSaveQuiz}
              className="w-full surface-3d-btn-emerald py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {isSaving ? 'Menyimpan...' : 'Kumpulkan & Hitung Skor'}
              </span>
            </button>
          </div>

          {/* Score & History Summary */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-xs tabular-nums">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Nilai Akhir:</span>
                <span className="text-base font-extrabold text-[#0066DD]">{skorAkhir} / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Benar / Salah:</span>
                <span className="font-bold text-emerald-700">
                  {jumlahBenar} Benar · <span className="text-red-600">{jumlahSalah} Salah</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Predikat:</span>
                <span className="font-bold text-[#082545]">{predikat}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-extrabold text-[#082545]">
                Riwayat Percobaan Siswa ({quizHistory.length}):
              </div>
              {quizHistory.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  Belum ada riwayat tersimpan untuk {siswa.nama_siswa}.
                </p>
              ) : (
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {quizHistory.map((h, i) => (
                    <div
                      key={h.id_hasil_quiz || i}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between font-mono tabular-nums"
                    >
                      <span className="font-bold text-slate-900">
                        Skor: {h.skor_akhir}/100 ({h.jumlah_benar}/15)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(h.waktu_selesai).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
