import React, { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { Check, FileDown, Loader2, Printer, Share2, X } from 'lucide-react';
import { formatLocalDateISO, offsetDaysISO } from '../data/initialState';
import { SURAHS } from '../data/quranData';
import {
  AttendanceRecord,
  Halaqa,
  HifzTask,
  Student,
} from '../types';

interface ReportModalProps {
  students: Student[];
  halaqas: Halaqa[];
  attendance: AttendanceRecord[];
  tasks: HifzTask[];
  teacherName: string;
  initialHalaqaId?: string;
  onClose: () => void;
}

function getSurahErrorsWithRange(
  student: Student,
  surahNumber: number,
  filterByDate: boolean,
  startDate: string,
  endDate: string
): { hifz: number; tajweed: number; total: number } {
  let hifz = 0;
  let tajweed = 0;
  const prefix = `${surahNumber}:`;
  const fallbackDate = formatLocalDateISO(new Date());

  for (const [key, err] of Object.entries(student.errors)) {
    if (!key.startsWith(prefix)) continue;
    if (filterByDate) {
      const d = (err.updatedAt ?? fallbackDate).slice(0, 10);
      if (d < startDate || d > endDate) continue;
    }
    hifz += err.hifz;
    tajweed += err.tajweed;
  }
  return { hifz, tajweed, total: hifz + tajweed };
}

export const ReportModal: React.FC<ReportModalProps> = ({
  students,
  halaqas,
  attendance,
  tasks,
  teacherName,
  initialHalaqaId = 'all',
  onClose,
}) => {
  const [halaqaFilter, setHalaqaFilter] = useState<string>(initialHalaqaId);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(() =>
    students
      .filter((s) => initialHalaqaId === 'all' || s.halaqaId === initialHalaqaId)
      .map((s) => s.id)
  );
  const [selectedSurahNumbers, setSelectedSurahNumbers] = useState<number[]>([
    1, 2, 3, 4,
  ]);
  const [startDate, setStartDate] = useState<string>(offsetDaysISO(-7));
  const [endDate, setEndDate] = useState<string>(offsetDaysISO(0));
  const [includeAttendance, setIncludeAttendance] = useState(true);
  const [includeHifzResults, setIncludeHifzResults] = useState(true);
  const [filterErrorsByDateRange, setFilterErrorsByDateRange] = useState(false);
  const [surahSearch, setSurahSearch] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);

  const pdfSheetRef = useRef<HTMLDivElement | null>(null);

  const filteredStudentsPool = useMemo(() => {
    if (halaqaFilter === 'all') return students;
    return students.filter((s) => s.halaqaId === halaqaFilter);
  }, [students, halaqaFilter]);

  const handleHalaqaChange = (nextHalaqaId: string) => {
    setHalaqaFilter(nextHalaqaId);
    const pool =
      nextHalaqaId === 'all'
        ? students
        : students.filter((s) => s.halaqaId === nextHalaqaId);
    setSelectedStudentIds(pool.map((s) => s.id));
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSurah = (num: number) => {
    setSelectedSurahNumbers((prev) =>
      prev.includes(num)
        ? prev.filter((n) => n !== num)
        : [...prev, num].sort((a, b) => a - b)
    );
  };

  const visibleSurahsPicker = useMemo(() => {
    const q = surahSearch.trim();
    if (!q) return SURAHS;
    return SURAHS.filter(
      (s) => s.nameArabic.includes(q) || String(s.number) === q
    );
  }, [surahSearch]);

  const reportStudents = useMemo(
    () => students.filter((s) => selectedStudentIds.includes(s.id)),
    [students, selectedStudentIds]
  );

  const reportSurahs = useMemo(
    () => SURAHS.filter((s) => selectedSurahNumbers.includes(s.number)),
    [selectedSurahNumbers]
  );

  const halaqaNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const h of halaqas) map[h.id] = h.name;
    return map;
  }, [halaqas]);

  const selectSurahsWithErrors = () => {
    const activeSurahs = new Set<number>();
    for (const s of reportStudents) {
      for (const surah of SURAHS) {
        const res = getSurahErrorsWithRange(
          s,
          surah.number,
          filterErrorsByDateRange,
          startDate,
          endDate
        );
        if (res.total > 0) activeSurahs.add(surah.number);
      }
    }
    setSelectedSurahNumbers(Array.from(activeSurahs).sort((a, b) => a - b));
  };

  const studentReportRows = useMemo(() => {
    return reportStudents.map((student) => {
      const attInRange = attendance.filter(
        (a) =>
          a.studentId === student.id &&
          a.date >= startDate &&
          a.date <= endDate
      );
      const present = attInRange.filter((a) => a.status === 'present').length;
      const late = attInRange.filter((a) => a.status === 'late').length;
      const excused = attInRange.filter((a) => a.status === 'excused').length;
      const absent = attInRange.filter((a) => a.status === 'absent').length;
      const totalDays = attInRange.length;
      const attendanceRate =
        totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 0;

      const surahBreakdown = reportSurahs.map((surah) => ({
        surah,
        errors: getSurahErrorsWithRange(
          student,
          surah.number,
          filterErrorsByDateRange,
          startDate,
          endDate
        ),
      }));

      const totalHifzInSurahs = surahBreakdown.reduce(
        (acc, item) => acc + item.errors.hifz,
        0
      );
      const totalTajweedInSurahs = surahBreakdown.reduce(
        (acc, item) => acc + item.errors.tajweed,
        0
      );

      const latestTask = tasks.find(
        (t) =>
          t.studentId === student.id &&
          (selectedSurahNumbers.length === 0 ||
            selectedSurahNumbers.includes(t.surahNumber))
      );

      return {
        student,
        halaqaName: halaqaNameById[student.halaqaId] ?? '',
        attendance: { present, late, excused, absent, totalDays, attendanceRate },
        surahBreakdown,
        totalHifzInSurahs,
        totalTajweedInSurahs,
        latestGrade: latestTask?.grade ?? '—',
      };
    });
  }, [
    reportStudents,
    attendance,
    startDate,
    endDate,
    reportSurahs,
    tasks,
    selectedSurahNumbers,
    halaqaNameById,
    filterErrorsByDateRange,
  ]);

  const buildPdfBlob = async (): Promise<{ blob: Blob; filename: string } | null> => {
    const element = pdfSheetRef.current;
    if (!element) return null;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    const filename = `sanad-report-${startDate}-to-${endDate}.pdf`;
    const blob = pdf.output('blob');
    return { blob, filename };
  };

  const handleExportPdf = async () => {
    if (reportStudents.length === 0 || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfStatus(null);
    try {
      const result = await buildPdfBlob();
      if (!result) return;
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      setPdfStatus(`تم إنشاء وتحميل ملف PDF: ${result.filename}`);
    } catch {
      setPdfStatus('تعذر إنشاء ملف PDF، يمكنك استخدام زر الطباعة.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSharePdf = async () => {
    if (reportStudents.length === 0 || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfStatus(null);
    try {
      const result = await buildPdfBlob();
      if (!result) return;
      const file = new File([result.blob], result.filename, {
        type: 'application/pdf',
      });

      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            title: 'تقرير الحضور والحفظ PDF',
            text: `تقرير الحلقات للمدة من ${startDate} إلى ${endDate}`,
            files: [file],
          });
          setPdfStatus('تم فتح نافذة مشاركة ملف PDF.');
          return;
        } catch {
          // Fallback to direct download
        }
      }

      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      setPdfStatus(`تم تحميل ملف PDF (${result.filename}) لإرساله.`);
    } catch {
      setPdfStatus('تعذر مشاركة ملف PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Interactive Modal UI (hidden during @media print) */}
      <div className="no-print fixed inset-0 z-50 bg-black/55 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-4xl bg-white dark:bg-[#18181a] border border-[#d5deda] dark:border-[#323236] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#141716] dark:text-[#e5e2e1]">
          {/* Modal Header */}
          <div className="px-4 py-3 border-b border-[#e4eae7] dark:border-[#28282b] flex items-center justify-between gap-2 shrink-0 flex-wrap">
            <h2 className="text-[16px] sm:text-[17px] font-bold text-[#141716] dark:text-[#e5e2e1]">
              تقارير الحضور والحفظ (PDF)
            </h2>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                disabled={reportStudents.length === 0 || isGeneratingPdf}
                onClick={handleExportPdf}
                className="h-9 px-3.5 rounded-lg bg-[#006c52] hover:bg-[#005842] dark:bg-[#6fdab5] dark:hover:bg-[#8cf6d0] disabled:opacity-40 text-white dark:text-[#002117] text-[12px] sm:text-[13px] font-bold flex items-center gap-1.5"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span>تصدير PDF</span>
              </button>
              <button
                type="button"
                disabled={reportStudents.length === 0 || isGeneratingPdf}
                onClick={handleSharePdf}
                title="إرسال ملف PDF"
                className="h-9 px-3 rounded-lg bg-[#eef2f0] hover:bg-[#e1e7e4] dark:bg-[#242426] dark:hover:bg-[#2f2f32] disabled:opacity-40 text-[12px] font-semibold text-[#141716] dark:text-[#e5e2e1] flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-[#b45309] dark:text-[#f5bd6a]" />
                <span className="hidden sm:inline">إرسال PDF</span>
              </button>
              <button
                type="button"
                disabled={reportStudents.length === 0}
                onClick={handlePrint}
                className="h-9 px-3 rounded-lg bg-[#eef2f0] hover:bg-[#e1e7e4] dark:bg-[#242426] dark:hover:bg-[#2f2f32] disabled:opacity-40 text-[12px] font-semibold text-[#141716] dark:text-[#e5e2e1] flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-[#006c52] dark:text-[#6fdab5]" />
                <span className="hidden sm:inline">طباعة</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#52605a] dark:text-[#a0a0a0] hover:bg-[#eef2f0] dark:hover:bg-[#2a2a2c]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {pdfStatus && (
              <div className="rounded-lg px-3 py-2 bg-[#e4f5ee] dark:bg-[#162922] border border-[#b7e2d1] dark:border-[#2c5a3f] text-[#00513d] dark:text-[#8cf6d0] text-[12px] font-medium">
                {pdfStatus}
              </div>
            )}

            {/* Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range & Sections */}
              <div className="bg-[#f4f6f5] dark:bg-[#1f1f21] border border-[#d5deda] dark:border-[#2d2d30] rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-[13px] font-bold text-[#006c52] dark:text-[#6fdab5]">
                    1. المدة ومحتوى التقرير
                  </h3>
                  <div className="flex items-center gap-1">
                    {[
                      { label: 'اليوم', days: 0 },
                      { label: '7 أيام', days: -7 },
                      { label: '30 يوماً', days: -30 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setStartDate(offsetDaysISO(preset.days));
                          setEndDate(offsetDaysISO(0));
                        }}
                        className="px-2 py-0.5 rounded bg-white hover:bg-[#e1e7e4] dark:bg-[#28282b] dark:hover:bg-[#323236] border border-[#d5deda] dark:border-transparent text-[11px] text-[#3c4843] dark:text-[#bdcac2]"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#52605a] dark:text-[#a0a0a0] mb-1">
                      من تاريخ
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-9 bg-white dark:bg-[#131314] border border-[#d5deda] dark:border-[#323236] rounded-lg px-2.5 font-mono-metric text-[12px] text-[#141716] dark:text-[#e5e2e1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#52605a] dark:text-[#a0a0a0] mb-1">
                      إلى تاريخ
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full h-9 bg-white dark:bg-[#131314] border border-[#d5deda] dark:border-[#323236] rounded-lg px-2.5 font-mono-metric text-[12px] text-[#141716] dark:text-[#e5e2e1]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap pt-1">
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAttendance}
                      onChange={(e) => setIncludeAttendance(e.target.checked)}
                      className="accent-[#006c52] dark:accent-[#6fdab5] w-4 h-4"
                    />
                    <span>سجل الحضور</span>
                  </label>
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeHifzResults}
                      onChange={(e) => setIncludeHifzResults(e.target.checked)}
                      className="accent-[#006c52] dark:accent-[#6fdab5] w-4 h-4"
                    />
                    <span>نتائج الحفظ والتجويد</span>
                  </label>
                </div>

                {includeHifzResults && (
                  <label className="flex items-center gap-2 text-[12px] text-[#3c4843] dark:text-[#bdcac2] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterErrorsByDateRange}
                      onChange={(e) =>
                        setFilterErrorsByDateRange(e.target.checked)
                      }
                      className="accent-[#006c52] dark:accent-[#6fdab5] w-3.5 h-3.5"
                    />
                    <span>احتساب أخطاء الحفظ والتجويد ضمن المدة المختارة فقط</span>
                  </label>
                )}
              </div>

              {/* Group / Student Selection */}
              <div className="bg-[#f4f6f5] dark:bg-[#1f1f21] border border-[#d5deda] dark:border-[#2d2d30] rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[13px] font-bold text-[#006c52] dark:text-[#6fdab5]">
                    2. مجموعة الطلاب ({selectedStudentIds.length})
                  </h3>
                  <select
                    value={halaqaFilter}
                    onChange={(e) => handleHalaqaChange(e.target.value)}
                    className="h-8 bg-white dark:bg-[#131314] border border-[#d5deda] dark:border-[#323236] rounded-lg px-2 text-[12px] text-[#141716] dark:text-[#e5e2e1]"
                  >
                    <option value="all">جميع الحلقات</option>
                    {halaqas.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {filteredStudentsPool.map((s) => {
                    const checked = selectedStudentIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleStudent(s.id)}
                        className={`px-2.5 py-1 rounded-lg text-[12px] flex items-center gap-1.5 border transition-colors ${
                          checked
                            ? 'bg-[#e4f5ee] dark:bg-[#1a3a2f] border-[#006c52]/40 dark:border-[#6fdab5]/50 text-[#00513d] dark:text-[#e5e2e1]'
                            : 'bg-white dark:bg-[#131314] border-[#d5deda] dark:border-[#2b2b2e] text-[#52605a] dark:text-[#87948d]'
                        }`}
                      >
                        {checked && (
                          <Check className="w-3 h-3 text-[#006c52] dark:text-[#6fdab5]" />
                        )}
                        <span>{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Surah Picker */}
            {includeHifzResults && (
              <div className="bg-[#f4f6f5] dark:bg-[#1f1f21] border border-[#d5deda] dark:border-[#2d2d30] rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-[13px] font-bold text-[#006c52] dark:text-[#6fdab5]">
                    3. اختيار السور ({selectedSurahNumbers.length} سورة)
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <input
                      type="text"
                      value={surahSearch}
                      onChange={(e) => setSurahSearch(e.target.value)}
                      placeholder="بحث عن سورة..."
                      className="h-8 w-32 bg-white dark:bg-[#131314] border border-[#d5deda] dark:border-[#323236] rounded-lg px-2.5 text-[12px] text-[#141716] dark:text-[#e5e2e1] outline-none"
                    />
                    <button
                      type="button"
                      onClick={selectSurahsWithErrors}
                      className="h-8 px-2.5 rounded-lg bg-[#fef3dc] dark:bg-[#262629] text-[11px] font-medium text-[#854d0e] dark:text-[#f5bd6a]"
                    >
                      التي بها أخطاء
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSurahNumbers(SURAHS.map((s) => s.number))
                      }
                      className="h-8 px-2.5 rounded-lg bg-white dark:bg-[#262629] border border-[#d5deda] dark:border-transparent text-[11px] text-[#141716] dark:text-[#e5e2e1]"
                    >
                      تحديد الكل
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSurahNumbers([])}
                      className="h-8 px-2.5 rounded-lg bg-white dark:bg-[#262629] border border-[#d5deda] dark:border-transparent text-[11px] text-[#52605a] dark:text-[#a0a0a0]"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {visibleSurahsPicker.map((s) => {
                    const active = selectedSurahNumbers.includes(s.number);
                    return (
                      <button
                        key={s.number}
                        type="button"
                        onClick={() => toggleSurah(s.number)}
                        className={`px-2.5 py-1 rounded-lg text-[12px] border transition-colors ${
                          active
                            ? 'bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#002117] border-[#006c52] dark:border-[#6fdab5] font-bold'
                            : 'bg-white dark:bg-[#131314] text-[#3c4843] dark:text-[#bdcac2] border-[#d5deda] dark:border-[#2c2c30]'
                        }`}
                      >
                        {s.number}. {s.nameArabic}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live White A4 Paper Preview (Also captured by html2canvas-pro for PDF) */}
            <div className="rounded-xl overflow-x-auto border border-[#d5deda] dark:border-[#353535] bg-[#ffffff] text-[#111827]">
              <div ref={pdfSheetRef} className="bg-[#ffffff] text-[#111827] p-6 sm:p-8 min-w-[680px]">
                <ReportSheetContent
                  teacherName={teacherName}
                  startDate={startDate}
                  endDate={endDate}
                  includeAttendance={includeAttendance}
                  includeHifzResults={includeHifzResults}
                  filterErrorsByDateRange={filterErrorsByDateRange}
                  reportSurahs={reportSurahs}
                  studentReportRows={studentReportRows}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Print-Only Container */}
      <div
        id="printable-report-sheet"
        dir="rtl"
        className="hidden print-only-root bg-[#ffffff] text-[#111827]"
      >
        <ReportSheetContent
          teacherName={teacherName}
          startDate={startDate}
          endDate={endDate}
          includeAttendance={includeAttendance}
          includeHifzResults={includeHifzResults}
          filterErrorsByDateRange={filterErrorsByDateRange}
          reportSurahs={reportSurahs}
          studentReportRows={studentReportRows}
        />
      </div>
    </>
  );
};

interface ReportSheetContentProps {
  teacherName: string;
  startDate: string;
  endDate: string;
  includeAttendance: boolean;
  includeHifzResults: boolean;
  filterErrorsByDateRange: boolean;
  reportSurahs: typeof SURAHS;
  studentReportRows: {
    student: Student;
    halaqaName: string;
    attendance: {
      present: number;
      late: number;
      excused: number;
      absent: number;
      totalDays: number;
      attendanceRate: number;
    };
    surahBreakdown: {
      surah: (typeof SURAHS)[number];
      errors: { hifz: number; tajweed: number; total: number };
    }[];
    totalHifzInSurahs: number;
    totalTajweedInSurahs: number;
    latestGrade: string;
  }[];
}

const ReportSheetContent: React.FC<ReportSheetContentProps> = ({
  teacherName,
  startDate,
  endDate,
  includeAttendance,
  includeHifzResults,
  filterErrorsByDateRange,
  reportSurahs,
  studentReportRows,
}) => (
  <div className="space-y-5 text-right bg-[#ffffff] text-[#111827]" dir="rtl">
    <div className="border-b-2 border-[#0f172a] pb-3 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-[20px] font-bold text-[#0f172a]">
          تقرير الحضور ومتابعة الحفظ والتجويد
        </h1>
        <p className="text-[13px] text-[#475569] mt-1">
          المشرف: {teacherName} · عدد الطلاب: {studentReportRows.length}
        </p>
      </div>
      <div className="text-[12px] text-[#334155]">
        <p className="font-mono-metric">
          المدة: {startDate} إلى {endDate}
        </p>
        {includeHifzResults && (
          <p className="mt-0.5">
            السور المختارة ({filterErrorsByDateRange ? 'ضمن المدة' : 'السجل الكامل'}):{' '}
            {reportSurahs.length > 0
              ? reportSurahs.map((s) => s.nameArabic.replace('سورة ', '')).join('، ')
              : 'لم يتم تحديد سور'}
          </p>
        )}
      </div>
    </div>

    {studentReportRows.length === 0 ? (
      <p className="py-8 text-center text-[14px] text-[#64748b]">
        يرجى اختيار طالب واحد على الأقل لعرض التقرير.
      </p>
    ) : (
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="bg-[#f1f5f9] text-[#0f172a]">
            <th className="border border-[#cbd5e1] px-2.5 py-2 font-bold">م</th>
            <th className="border border-[#cbd5e1] px-2.5 py-2 font-bold">
              اسم الطالب
            </th>
            <th className="border border-[#cbd5e1] px-2.5 py-2 font-bold">
              الحلقة
            </th>
            {includeAttendance && (
              <>
                <th className="border border-[#cbd5e1] px-2 py-2 font-bold text-center">
                  حاضر
                </th>
                <th className="border border-[#cbd5e1] px-2 py-2 font-bold text-center">
                  متأخر
                </th>
                <th className="border border-[#cbd5e1] px-2 py-2 font-bold text-center">
                  بعذر
                </th>
                <th className="border border-[#cbd5e1] px-2 py-2 font-bold text-center">
                  غائب
                </th>
                <th className="border border-[#cbd5e1] px-2 py-2 font-bold text-center">
                  النسبة
                </th>
              </>
            )}
            {includeHifzResults && (
              <>
                <th className="border border-[#cbd5e1] px-2 py-2 font-bold text-center">
                  حفظ
                </th>
                <th className="border border-[#cbd5e1] px-2 py-2 font-bold text-center">
                  تجويد
                </th>
                <th className="border border-[#cbd5e1] px-2.5 py-2 font-bold">
                  تفصيل السور المختارة
                </th>
                <th className="border border-[#cbd5e1] px-2 py-2 font-bold text-center">
                  التقدير
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {studentReportRows.map((row, idx) => {
            const nonZeroSurahs = row.surahBreakdown.filter(
              (item) => item.errors.total > 0
            );
            return (
              <tr
                key={row.student.id}
                className={idx % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-[#ffffff]'}
              >
                <td className="border border-[#cbd5e1] px-2.5 py-2 font-mono-metric">
                  {row.student.code}
                </td>
                <td className="border border-[#cbd5e1] px-2.5 py-2 font-semibold text-[#0f172a]">
                  {row.student.name}
                </td>
                <td className="border border-[#cbd5e1] px-2.5 py-2 text-[#475569]">
                  {row.halaqaName}
                </td>
                {includeAttendance && (
                  <>
                    <td className="border border-[#cbd5e1] px-2 py-2 text-center font-mono-metric">
                      {row.attendance.present}
                    </td>
                    <td className="border border-[#cbd5e1] px-2 py-2 text-center font-mono-metric">
                      {row.attendance.late}
                    </td>
                    <td className="border border-[#cbd5e1] px-2 py-2 text-center font-mono-metric">
                      {row.attendance.excused}
                    </td>
                    <td className="border border-[#cbd5e1] px-2 py-2 text-center font-mono-metric">
                      {row.attendance.absent}
                    </td>
                    <td className="border border-[#cbd5e1] px-2 py-2 text-center font-mono-metric font-bold">
                      {row.attendance.attendanceRate}%
                    </td>
                  </>
                )}
                {includeHifzResults && (
                  <>
                    <td className="border border-[#cbd5e1] px-2 py-2 text-center font-mono-metric font-bold text-[#991b1b]">
                      {row.totalHifzInSurahs}
                    </td>
                    <td className="border border-[#cbd5e1] px-2 py-2 text-center font-mono-metric font-bold text-[#92400e]">
                      {row.totalTajweedInSurahs}
                    </td>
                    <td className="border border-[#cbd5e1] px-2.5 py-2 text-[11px] text-[#334155]">
                      {reportSurahs.length === 0
                        ? '—'
                        : nonZeroSurahs.length === 0
                        ? 'متقن بدون أخطاء في السور المختارة'
                        : nonZeroSurahs
                            .map(
                              (item) =>
                                `${item.surah.nameArabic.replace('سورة ', '')}: ${item.errors.hifz}ح / ${item.errors.tajweed}ت`
                            )
                            .join(' · ')}
                    </td>
                    <td className="border border-[#cbd5e1] px-2 py-2 text-center font-semibold">
                      {row.latestGrade}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    )}

    <div className="pt-4 border-t border-[#cbd5e1] flex items-center justify-between text-[12px] text-[#475569]">
      <span>توقيع معلم الحلقة: _______________________</span>
      <span>تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</span>
    </div>
  </div>
);
