import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpDown,
  BookOpen,
  Check,
  ChevronRight,
  MoreVertical,
  Search,
  User,
  X,
} from 'lucide-react';
import { SURAHS } from '../data/quranData';
import { Riwayah, Student } from '../types';
import { getStudentTotalErrors, getSurahErrorsForStudent } from '../utils/errorStats';

type SurahSortMode = 'default' | 'most_errors' | 'hifz_errors' | 'tajweed_errors';

interface SurahsScreenProps {
  student: Student;
  onBackToStudents: () => void;
  onOpenMushafForSurah: (surahNumber: number) => void;
  onChangeStudentRiwayah: (studentId: string, riwayah: Riwayah) => void;
}

export const SurahsScreen: React.FC<SurahsScreenProps> = ({
  student,
  onBackToStudents,
  onOpenMushafForSurah,
  onChangeStudentRiwayah,
}) => {
  const [sortMode, setSortMode] = useState<SurahSortMode>('default');
  const [onlyWithErrors, setOnlyWithErrors] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const totals = useMemo(() => getStudentTotalErrors(student.errors), [student.errors]);

  const surahsWithStats = useMemo(() => {
    const list = SURAHS.map((surah) => ({
      surah,
      errors: getSurahErrorsForStudent(student, surah.number),
    }));

    const searched = list.filter(({ surah }) => {
      const q = searchQuery.trim();
      if (!q) return true;
      return (
        surah.nameArabic.includes(q) ||
        surah.nameLatin.toLowerCase().includes(q.toLowerCase()) ||
        String(surah.number) === q
      );
    });

    const filtered = onlyWithErrors
      ? searched.filter((item) => item.errors.total > 0)
      : searched;

    const sorted = [...filtered].sort((a, b) => {
      if (sortMode === 'most_errors') {
        return b.errors.total - a.errors.total || a.surah.number - b.surah.number;
      }
      if (sortMode === 'hifz_errors') {
        return b.errors.hifz - a.errors.hifz || a.surah.number - b.surah.number;
      }
      if (sortMode === 'tajweed_errors') {
        return b.errors.tajweed - a.errors.tajweed || a.surah.number - b.surah.number;
      }
      return a.surah.number - b.surah.number;
    });

    return sorted;
  }, [student, searchQuery, onlyWithErrors, sortMode]);

  return (
    <div className="flex flex-col h-full bg-[#131313] text-[#e5e2e1] relative">
      {/* Top App Bar */}
      <header className="h-14 px-3 flex items-center justify-between shrink-0 bg-[#131313]">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={onBackToStudents}
            aria-label="العودة إلى قائمة الطلاب"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#e5e2e1] hover:bg-[#202020] transition-colors shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h1 className="text-[19px] font-bold text-[#e5e2e1] truncate">
            القرآن - {student.riwayah}
          </h1>
        </div>

        <div className="flex items-center gap-0.5 relative">
          <button
            type="button"
            onClick={() => onOpenMushafForSurah(student.currentSurah || 4)}
            title="فتح المصحف"
            aria-label="فتح المصحف"
            className="w-11 h-11 rounded-full flex items-center justify-center text-[#e5e2e1] hover:bg-[#202020] transition-colors"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowSearch((prev) => !prev)}
            title="بحث في السور"
            aria-label="بحث في السور"
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              showSearch ? 'text-[#6fdab5] bg-[#1b1b1c]' : 'text-[#e5e2e1] hover:bg-[#202020]'
            }`}
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            title="خيارات الرواية"
            aria-label="المزيد"
            className="w-11 h-11 rounded-full flex items-center justify-center text-[#e5e2e1] hover:bg-[#202020] transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute left-0 top-12 z-40 w-48 rounded-xl bg-[#242425] border border-[#353535] shadow-2xl p-1.5">
              <p className="px-2.5 py-1.5 text-[11px] font-medium text-[#a0a0a0]">
                تغيير الرواية للطالب
              </p>
              {(['قالون', 'حفص', 'ورش'] as Riwayah[]).map((riwayah) => (
                <button
                  key={riwayah}
                  type="button"
                  onClick={() => {
                    onChangeStudentRiwayah(student.id, riwayah);
                    setShowMenu(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-lg text-[13px] flex items-center justify-between hover:bg-[#303032] text-right"
                >
                  <span>رواية {riwayah}</span>
                  {student.riwayah === riwayah && (
                    <Check className="w-4 h-4 text-[#6fdab5]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Expandable Surah Search */}
      {showSearch && (
        <div className="px-4 pb-2.5 bg-[#131313]">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#87948d] absolute right-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم السورة أو رقمها..."
              className="w-full h-10 bg-[#1b1b1c] border border-[#2f2f2f] focus:border-[#6fdab5] rounded-xl pr-9 pl-8 text-[13px] text-[#e5e2e1] placeholder-[#87948d] outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2 w-6 h-6 flex items-center justify-center text-[#87948d] hover:text-[#e5e2e1]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Student Summary Strip */}
      <div className="bg-[#1b1b1c] border-y border-[#252526] px-4 py-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#13382c] text-[#6fdab5] flex items-center justify-center shrink-0">
            <User className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-[#a0a0a0] leading-tight">الطالب المتابع:</p>
            <p className="text-[14px] font-bold text-[#e5e2e1] truncate mt-0.5">
              {student.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSortMode('hifz_errors');
              setOnlyWithErrors(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#3c1418] border border-[#7c272f] text-[#ffb4ab] text-[11px] sm:text-[12px] font-semibold tabular-nums whitespace-nowrap hover:bg-[#4f1a20] transition-colors"
          >
            {totals.hifz} أخطاء حفظ
          </button>
          <button
            type="button"
            onClick={() => {
              setSortMode('tajweed_errors');
              setOnlyWithErrors(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#382b11] border border-[#73561c] text-[#f5bd6a] text-[11px] sm:text-[12px] font-semibold tabular-nums whitespace-nowrap hover:bg-[#493715] transition-colors"
          >
            {totals.tajweed} أخطاء تجويد
          </button>
        </div>
      </div>

      {/* Sub-tab Strip */}
      <div className="border-b border-[#252526] px-4 flex items-center justify-between shrink-0 bg-[#131313]">
        <div className="flex items-center gap-6">
          <div className="py-2.5 border-b-2 border-[#6fdab5] text-[13px] font-bold text-[#6fdab5]">
            السور
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenMushafForSurah(4)}
          className="text-[12px] font-medium text-[#6fdab5] hover:underline py-1"
        >
          متابعة صفحة 83 (النساء)
        </button>
      </div>

      {/* Sort & Filter Chips */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <button
          type="button"
          onClick={() => setSortMode('default')}
          className={`h-8 px-3 rounded-full text-[12px] flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
            sortMode === 'default'
              ? 'bg-[#6fdab5] text-[#002117] font-bold'
              : 'bg-[#1e1e1e] border border-[#2f2f2f] text-[#e5e2e1] hover:bg-[#262626]'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>الترتيب الافتراضي</span>
        </button>

        <button
          type="button"
          onClick={() => setSortMode('most_errors')}
          className={`h-8 px-3 rounded-full text-[12px] flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
            sortMode === 'most_errors'
              ? 'bg-[#6fdab5] text-[#002117] font-bold'
              : 'bg-[#1e1e1e] border border-[#2f2f2f] text-[#e5e2e1] hover:bg-[#262626]'
          }`}
        >
          <AlertCircle
            className={`w-3.5 h-3.5 ${
              sortMode === 'most_errors' ? 'text-[#002117]' : 'text-[#f5bd6a]'
            }`}
          />
          <span>الأكثر أخطاءً</span>
        </button>

        <button
          type="button"
          onClick={() => setSortMode('hifz_errors')}
          className={`h-8 px-3 rounded-full text-[12px] flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
            sortMode === 'hifz_errors'
              ? 'bg-[#6fdab5] text-[#002117] font-bold'
              : 'bg-[#1e1e1e] border border-[#2f2f2f] text-[#e5e2e1] hover:bg-[#262626]'
          }`}
        >
          <span
            className="w-2 h-2 rounded-full bg-[#ffb4ab] shrink-0"
            aria-hidden="true"
          />
          <span>أخطاء الحفظ</span>
        </button>

        <button
          type="button"
          onClick={() => setSortMode('tajweed_errors')}
          className={`h-8 px-3 rounded-full text-[12px] flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
            sortMode === 'tajweed_errors'
              ? 'bg-[#6fdab5] text-[#002117] font-bold'
              : 'bg-[#1e1e1e] border border-[#2f2f2f] text-[#e5e2e1] hover:bg-[#262626]'
          }`}
        >
          <span
            className="w-2 h-2 rounded-full bg-[#f5bd6a] shrink-0"
            aria-hidden="true"
          />
          <span>أخطاء التجويد</span>
        </button>
      </div>

      {/* Filter Checkbox & Count Row */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-[#202020] shrink-0">
        <label className="flex items-center gap-2 cursor-pointer select-none min-h-[36px]">
          <button
            type="button"
            role="checkbox"
            aria-checked={onlyWithErrors}
            onClick={() => setOnlyWithErrors((prev) => !prev)}
            className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-colors ${
              onlyWithErrors
                ? 'bg-[#6fdab5] border-[#6fdab5] text-[#002117]'
                : 'bg-transparent border-[#555555]'
            }`}
          >
            {onlyWithErrors && <Check className="w-3 h-3" strokeWidth={3} />}
          </button>
          <span className="text-[12px] text-[#bdcac2]">
            السور التي بها أخطاء فقط
          </span>
        </label>

        <span className="text-[12px] text-[#87948d] tabular-nums">
          {surahsWithStats.length} سورة
        </span>
      </div>

      {/* Surah List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#202020]">
        {surahsWithStats.length === 0 ? (
          <div className="py-16 text-center space-y-2.5 px-4">
            <p className="text-[14px] text-[#bdcac2]">
              لا توجد سور مسجل بها أخطاء لهذا الطالب
            </p>
            <button
              type="button"
              onClick={() => {
                setOnlyWithErrors(false);
                setSearchQuery('');
                setSortMode('default');
              }}
              className="px-4 py-2 rounded-lg bg-[#202020] text-[12px] text-[#6fdab5] hover:bg-[#2a2a2a]"
            >
              عرض كل السور
            </button>
          </div>
        ) : (
          surahsWithStats.map(({ surah, errors }) => (
            <button
              key={surah.number}
              type="button"
              onClick={() => onOpenMushafForSurah(surah.number)}
              className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-right hover:bg-[#1b1b1c] active:bg-[#202020] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="w-6 text-center font-mono-metric text-[14px] text-[#87948d] shrink-0">
                  {surah.number}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[#e5e2e1] truncate">
                    {surah.nameArabic}
                  </p>
                  <p className="text-[12px] text-[#87948d] mt-0.5 tabular-nums">
                    {surah.revelation} • {surah.ayahCount} آية • ص {surah.startPage}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-md text-[12px] font-semibold tabular-nums whitespace-nowrap ${
                    errors.hifz > 0
                      ? 'bg-[#6b1a22] text-[#ffdad6]'
                      : 'bg-[#4d181e] text-[#ffd6d6]/90'
                  }`}
                >
                  {errors.hifz} حفظ
                </span>
                <span
                  className={`px-2.5 py-1 rounded-md text-[12px] font-semibold tabular-nums whitespace-nowrap ${
                    errors.tajweed > 0
                      ? 'bg-[#6b4f15] text-[#ffddb1]'
                      : 'bg-[#4d3912] text-[#ffddb1]/90'
                  }`}
                >
                  {errors.tajweed} تجويد
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
