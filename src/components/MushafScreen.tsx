import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Moon,
  Plus,
  Sun,
  X,
} from 'lucide-react';
import { MUSHAF_PAGES, toArabicIndicDigits } from '../data/quranData';
import { MushafPage, Student } from '../types';
import { getAyahErrorsForStudent } from '../utils/errorStats';

interface MushafScreenProps {
  student: Student;
  page: MushafPage;
  theme: 'parchment' | 'slate';
  onToggleTheme: () => void;
  onSelectPage: (pageNumber: number) => void;
  onUpdateAyahError: (
    studentId: string,
    surahNumber: number,
    ayahNumber: number,
    type: 'hifz' | 'tajweed',
    delta: number
  ) => void;
  onBackToSurahs: () => void;
}

export const MushafScreen: React.FC<MushafScreenProps> = ({
  student,
  page,
  theme,
  onToggleTheme,
  onSelectPage,
  onUpdateAyahError,
  onBackToSurahs,
}) => {
  // Default selected Ayah to 31 when on page 83 so Screen 2's iconic popover appears immediately
  const defaultSelected =
    page.pageNumber === 83 ? 31 : page.ayahs[0]?.ayahNumber ?? 1;
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number | null>(
    defaultSelected
  );

  useEffect(() => {
    setSelectedAyahNumber(
      page.pageNumber === 83 ? 31 : page.ayahs[0]?.ayahNumber ?? 1
    );
  }, [page.pageNumber, page.surahNumber]);

  const availablePageNumbers = useMemo(
    () => Object.keys(MUSHAF_PAGES).map(Number).sort((a, b) => a - b),
    []
  );

  const currentIdx = availablePageNumbers.indexOf(page.pageNumber);
  const prevPage =
    currentIdx > 0 ? availablePageNumbers[currentIdx - 1] : undefined;
  const nextPage =
    currentIdx !== -1 && currentIdx < availablePageNumbers.length - 1
      ? availablePageNumbers[currentIdx + 1]
      : undefined;

  const isParchment = theme === 'parchment';

  const selectedErrors = useMemo(() => {
    if (selectedAyahNumber === null) return { hifz: 0, tajweed: 0 };
    return getAyahErrorsForStudent(student, page.surahNumber, selectedAyahNumber);
  }, [student, page.surahNumber, selectedAyahNumber]);

  return (
    <div
      className={`flex flex-col h-full transition-colors duration-200 relative ${
        isParchment
          ? 'bg-[#fbf9f5] text-[#1c1b18]'
          : 'bg-[#151615] text-[#e8e4dc]'
      }`}
    >
      {/* Top Mushaf Header (matches Screen 2 layout + non-intrusive navigation controls) */}
      <div
        dir="ltr"
        className={`px-4 pt-3 pb-2 flex items-center justify-between shrink-0 ${
          isParchment ? 'text-[#2c2b28]' : 'text-[#d8d4cc]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBackToSurahs}
            aria-label="العودة للسور"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isParchment
                ? 'hover:bg-[#ebe6dc] text-[#2c2b28]'
                : 'hover:bg-[#252625] text-[#e5e2e1]'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-[14px] font-medium tracking-tight truncate">
            {page.surahNameLatin}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="تبديل وضع القراءة"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isParchment
                ? 'hover:bg-[#ebe6dc] text-[#5c5a52]'
                : 'hover:bg-[#252625] text-[#bdcac2]'
            }`}
          >
            {isParchment ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
          <span className="text-[14px] font-medium tabular-nums">
            Juz&apos; {page.juzNumber}
          </span>
        </div>
      </div>

      {/* Subtle Active Student Strip */}
      <div
        className={`mx-4 mb-2 px-3 py-1.5 rounded-lg flex items-center justify-between text-[12px] shrink-0 ${
          isParchment
            ? 'bg-[#f1ede4] text-[#4e4b43] border border-[#e4ded2]'
            : 'bg-[#1d1f1e] text-[#bdcac2] border border-[#2c2e2d]'
        }`}
      >
        <span className="truncate font-medium">
          الطالب: <strong className="font-bold">{student.name}</strong>
        </span>
        <span className="text-[11px] opacity-80 shrink-0">
          اضغط على أي آية لتسجيل الأخطاء
        </span>
      </div>

      {/* Floating Ayah Error Stepper Popover (Matches Screen 2 Dark Green Popover) */}
      {selectedAyahNumber !== null && (
        <div className="px-4 pb-2 flex justify-center shrink-0 z-20">
          <div className="relative bg-[#1d3d2a] text-white rounded-2xl px-3.5 py-2 shadow-xl shadow-black/25 border border-[#2c5a3f] flex items-center gap-2.5 sm:gap-4">
            {/* Hifz Stepper */}
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-white/95">حفظ</span>
              <div className="bg-[#152e1f] rounded-lg px-1 py-0.5 flex items-center gap-1.5 border border-[#285038]">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateAyahError(
                      student.id,
                      page.surahNumber,
                      selectedAyahNumber,
                      'hifz',
                      1
                    )
                  }
                  aria-label="زيادة أخطاء الحفظ"
                  className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#234a33] active:scale-90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono-metric text-[14px] font-bold min-w-[18px] text-center">
                  {selectedErrors.hifz}
                </span>
                <button
                  type="button"
                  disabled={selectedErrors.hifz <= 0}
                  onClick={() =>
                    onUpdateAyahError(
                      student.id,
                      page.surahNumber,
                      selectedAyahNumber,
                      'hifz',
                      -1
                    )
                  }
                  aria-label="إنقاص أخطاء الحفظ"
                  className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#234a33] disabled:opacity-40 active:scale-90 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="w-px h-6 bg-white/20" aria-hidden="true" />

            {/* Tajweed Stepper */}
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-white/95">تجويد</span>
              <div className="bg-[#152e1f] rounded-lg px-1 py-0.5 flex items-center gap-1.5 border border-[#285038]">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateAyahError(
                      student.id,
                      page.surahNumber,
                      selectedAyahNumber,
                      'tajweed',
                      1
                    )
                  }
                  aria-label="زيادة أخطاء التجويد"
                  className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#234a33] active:scale-90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono-metric text-[14px] font-bold min-w-[18px] text-center">
                  {selectedErrors.tajweed}
                </span>
                <button
                  type="button"
                  disabled={selectedErrors.tajweed <= 0}
                  onClick={() =>
                    onUpdateAyahError(
                      student.id,
                      page.surahNumber,
                      selectedAyahNumber,
                      'tajweed',
                      -1
                    )
                  }
                  aria-label="إنقاص أخطاء التجويد"
                  className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#234a33] disabled:opacity-40 active:scale-90 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedAyahNumber(null)}
              aria-label="إغلاق شريط الأخطاء"
              className="w-6 h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Downward Caret */}
            <div
              className="w-3 h-3 bg-[#1d3d2a] rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-[#2c5a3f]"
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {/* Quranic Parchment Script Body */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-2">
        <div
          dir="rtl"
          className="font-quran text-[24px] sm:text-[27px] leading-[2.35] text-justify select-none"
        >
          {page.ayahs.map((ayah) => {
            const isSelected = selectedAyahNumber === ayah.ayahNumber;
            const err = getAyahErrorsForStudent(
              student,
              ayah.surahNumber,
              ayah.ayahNumber
            );
            const hasErrors = err.hifz > 0 || err.tajweed > 0;

            return (
              <span
                key={`${ayah.surahNumber}:${ayah.ayahNumber}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedAyahNumber(ayah.ayahNumber)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedAyahNumber(ayah.ayahNumber);
                  }
                }}
                className={`inline rounded-md px-1 py-0.5 transition-colors cursor-pointer ${
                  isSelected
                    ? isParchment
                      ? 'bg-[#d6eae9]'
                      : 'bg-[#1f4437]'
                    : hasErrors
                    ? isParchment
                      ? 'bg-[#f6e8d5]/70 underline decoration-[#d8a353]/60 decoration-2 underline-offset-8'
                      : 'bg-[#2c2519]/60 underline decoration-[#f5bd6a]/50 decoration-2 underline-offset-8'
                    : isParchment
                    ? 'hover:bg-[#f0ece3]'
                    : 'hover:bg-[#222423]'
                }`}
              >
                {ayah.hasHizbQuarter && (
                  <span className="mx-1 text-[20px] opacity-80">۞</span>
                )}
                <span>{ayah.text}</span>{' '}
                <span
                  className={`inline-flex items-center justify-center mx-1 text-[19px] font-sans ${
                    isParchment ? 'text-[#3e524a]' : 'text-[#89cbb2]'
                  }`}
                >
                  ﴿{toArabicIndicDigits(ayah.ayahNumber)}﴾
                </span>
                {hasErrors && (
                  <span
                    className={`inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded font-sans text-[10px] font-bold align-middle ${
                      err.hifz > 0
                        ? 'bg-[#93000a] text-[#ffdad6]'
                        : 'bg-[#6b4f15] text-[#ffddb1]'
                    }`}
                  >
                    {err.hifz > 0 ? `${err.hifz}ح` : ''}
                    {err.hifz > 0 && err.tajweed > 0 ? '·' : ''}
                    {err.tajweed > 0 ? `${err.tajweed}ت` : ''}
                  </span>
                )}{' '}
              </span>
            );
          })}
        </div>
      </div>

      {/* Bottom Mushaf Page Number & Navigation */}
      <footer
        className={`h-12 px-5 flex items-center justify-between shrink-0 border-t ${
          isParchment
            ? 'border-[#ebe6dc] text-[#2c2b28]'
            : 'border-[#252625] text-[#bdcac2]'
        }`}
      >
        <button
          type="button"
          disabled={!nextPage}
          onClick={() => nextPage && onSelectPage(nextPage)}
          className="h-9 px-2.5 rounded-lg text-[12px] font-medium flex items-center gap-1 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5"
        >
          <ChevronRight className="w-4 h-4" />
          <span>الصفحة التالية</span>
        </button>

        <span className="font-mono-metric text-[14px] font-semibold">
          {page.pageNumber}
        </span>

        <button
          type="button"
          disabled={!prevPage}
          onClick={() => prevPage && onSelectPage(prevPage)}
          className="h-9 px-2.5 rounded-lg text-[12px] font-medium flex items-center gap-1 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5"
        >
          <span>الصفحة السابقة</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
