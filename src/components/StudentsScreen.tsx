import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ChevronLeft,
  MapPin,
  Moon,
  Pencil,
  Phone,
  Plus,
  Printer,
  Search,
  Sun,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Halaqa, Student } from '../types';
import { getStudentTotalErrors } from '../utils/errorStats';

type StudentSortMode = 'default' | 'most_errors' | 'least_errors' | 'name';

interface StudentsScreenProps {
  students: Student[];
  halaqas: Halaqa[];
  selectedStudentId: string;
  appTheme: 'dark' | 'light';
  onToggleAppTheme: () => void;
  onSelectStudent: (studentId: string) => void;
  onOpenAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onRequestDeleteStudent: (student: Student) => void;
  onOpenProfileModal: () => void;
  onOpenReportModal: (halaqaFilter: string) => void;
}

export const StudentsScreen: React.FC<StudentsScreenProps> = ({
  students,
  halaqas,
  selectedStudentId,
  appTheme,
  onToggleAppTheme,
  onSelectStudent,
  onOpenAddStudent,
  onEditStudent,
  onRequestDeleteStudent,
  onOpenProfileModal,
  onOpenReportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHalaqaFilter, setActiveHalaqaFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<StudentSortMode>('default');
  const [showTopSearch, setShowTopSearch] = useState(false);

  const halaqaNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const h of halaqas) {
      map[h.id] = h.name;
    }
    return map;
  }, [halaqas]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesHalaqa =
        activeHalaqaFilter === 'all' || s.halaqaId === activeHalaqaFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q) ||
        s.fatherPhone.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.code.includes(q) ||
        s.riwayah.includes(q);
      return matchesHalaqa && matchesQuery;
    });
  }, [students, activeHalaqaFilter, searchQuery]);

  const sortedFlatStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      if (sortMode === 'most_errors') {
        const errDiff =
          getStudentTotalErrors(b.errors).total -
          getStudentTotalErrors(a.errors).total;
        return errDiff !== 0 ? errDiff : a.code.localeCompare(b.code);
      }
      if (sortMode === 'least_errors') {
        const errDiff =
          getStudentTotalErrors(a.errors).total -
          getStudentTotalErrors(b.errors).total;
        return errDiff !== 0 ? errDiff : a.code.localeCompare(b.code);
      }
      if (sortMode === 'name') {
        return a.name.localeCompare(b.name, 'ar');
      }
      return a.code.localeCompare(b.code);
    });
  }, [filteredStudents, sortMode]);

  const groupedSections = useMemo(() => {
    const visibleHalaqas =
      activeHalaqaFilter === 'all'
        ? halaqas
        : halaqas.filter((h) => h.id === activeHalaqaFilter);

    return visibleHalaqas
      .map((halaqa) => ({
        halaqa,
        items: sortedFlatStudents.filter((s) => s.halaqaId === halaqa.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [halaqas, activeHalaqaFilter, sortedFlatStudents]);

  const renderStudentRow = (student: Student, showHalaqaSubtitle = false) => {
    const isSelected = student.id === selectedStudentId;
    const err = getStudentTotalErrors(student.errors);

    return (
      <div
        key={student.id}
        role="button"
        tabIndex={0}
        onClick={() => onSelectStudent(student.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectStudent(student.id);
          }
        }}
        className={`group flex items-center justify-between py-2.5 px-2.5 rounded-xl transition-colors cursor-pointer ${
          isSelected
            ? 'bg-white dark:bg-[#1b1b1c] ring-1 ring-[#006c52]/35 dark:ring-[#6fdab5]/30 shadow-xs dark:shadow-none'
            : 'hover:bg-white/80 dark:hover:bg-[#1b1b1c]/60'
        }`}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 mt-0.5 rounded-full bg-[#eef2f0] dark:bg-[#1b1b1c] border border-[#d0dad6] dark:border-[#2a2a2a] flex items-center justify-center shrink-0">
            <span className="font-mono-metric text-[13px] font-semibold text-[#006c52] dark:text-[#6fdab5]">
              {student.code}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[15px] font-semibold text-[#141716] dark:text-[#e5e2e1] truncate">
                {student.name}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#e4f5ee] dark:bg-[#162922] border border-[#b7e2d1] dark:border-[#24473a] text-[#00513d] dark:text-[#6fdab5] text-[11px] font-medium shrink-0">
                {student.riwayah}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#eef2f0] dark:bg-[#1e1e1f] border border-[#d5deda] dark:border-[#2d2d2e] text-[11px] font-semibold tabular-nums shrink-0"
                title="مجموع الأخطاء (حفظ / تجويد)"
              >
                <span
                  className={
                    err.total > 0
                      ? 'text-[#141716] dark:text-[#e5e2e1]'
                      : 'text-[#52605a] dark:text-[#87948d]'
                  }
                >
                  {err.total}
                </span>
                <span className="text-[#9aa8a2] dark:text-[#686868]">(</span>
                <span
                  className={
                    err.hifz > 0
                      ? 'text-[#b91c1c] dark:text-[#ffb4ab]'
                      : 'text-[#52605a] dark:text-[#87948d]'
                  }
                >
                  {err.hifz} حفظ
                </span>
                <span className="text-[#9aa8a2] dark:text-[#686868]">/</span>
                <span
                  className={
                    err.tajweed > 0
                      ? 'text-[#b45309] dark:text-[#f5bd6a]'
                      : 'text-[#52605a] dark:text-[#87948d]'
                  }
                >
                  {err.tajweed} تجويد
                </span>
                <span className="text-[#9aa8a2] dark:text-[#686868]">)</span>
              </span>
            </div>

            {/* Father name, Age, Father phone & Address metadata line */}
            <div className="mt-1 flex items-center flex-wrap gap-x-2.5 gap-y-0.5 text-[11px] text-[#52605a] dark:text-[#87948d]">
              {showHalaqaSubtitle && (
                <span className="font-medium text-[#006c52] dark:text-[#6fdab5]">
                  {halaqaNameById[student.halaqaId] ?? ''}
                </span>
              )}
              {student.fatherName && (
                <span>الأب: {student.fatherName}</span>
              )}
              {student.age !== null && (
                <span className="tabular-nums">{student.age} سنة</span>
              )}
              {student.fatherPhone && (
                <span
                  dir="ltr"
                  className="inline-flex items-center gap-1 font-mono-metric text-[#3c4843] dark:text-[#bdcac2]"
                >
                  <Phone className="w-3 h-3 text-[#006c52] dark:text-[#6fdab5]" />
                  <span>{student.fatherPhone}</span>
                </span>
              )}
              {student.address && (
                <span className="inline-flex items-center gap-1 truncate max-w-[220px]">
                  <MapPin className="w-3 h-3 shrink-0 text-[#52605a] dark:text-[#87948d]" />
                  <span className="truncate">{student.address}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <span className="w-7 h-10 flex items-center justify-center text-[#52605a] dark:text-[#bdcac2] group-hover:text-[#006c52] dark:group-hover:text-[#6fdab5] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditStudent(student);
            }}
            aria-label={`تعديل بيانات ${student.name}`}
            title="تعديل بيانات الطالب"
            className="w-9 h-10 rounded-lg flex items-center justify-center text-[#52605a] dark:text-[#87948d] hover:text-[#006c52] dark:hover:text-[#6fdab5] hover:bg-[#e4f5ee] dark:hover:bg-[#1d3129] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDeleteStudent(student);
            }}
            aria-label={`حذف ${student.name}`}
            className="w-9 h-10 rounded-lg flex items-center justify-center text-[#52605a] dark:text-[#87948d] hover:text-[#b91c1c] dark:hover:text-[#ffb4ab] hover:bg-[#fde8ea] dark:hover:bg-[#3c1418]/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f6f5] dark:bg-[#131313] text-[#141716] dark:text-[#e5e2e1] relative">
      {/* Top App Bar */}
      <header className="h-14 px-4 flex items-center justify-between shrink-0 bg-[#f4f6f5] dark:bg-[#131313]">
        <h1 className="text-[20px] font-bold tracking-tight text-[#141716] dark:text-[#e5e2e1]">
          قائمة الطلاب
        </h1>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onToggleAppTheme}
            title={appTheme === 'dark' ? 'تفعيل رؤية نهار' : 'تفعيل الرؤية الليلية'}
            aria-label={appTheme === 'dark' ? 'تفعيل رؤية نهار' : 'تفعيل الرؤية الليلية'}
            className="h-9 px-2.5 rounded-full flex items-center gap-1.5 text-[12px] font-semibold bg-white dark:bg-[#1e1e1f] border border-[#d5deda] dark:border-[#2e2e30] text-[#006c52] dark:text-[#f5bd6a] hover:bg-[#eef2f0] dark:hover:bg-[#272729] active:scale-95 transition-all ml-1"
          >
            {appTheme === 'dark' ? (
              <>
                <Sun className="w-4 h-4" />
                <span className="hidden sm:inline">نهار</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span className="hidden sm:inline">ليل</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onOpenReportModal(activeHalaqaFilter)}
            title="طباعة تقرير"
            aria-label="طباعة تقرير"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#3c4843] dark:text-[#bdcac2] hover:text-[#006c52] dark:hover:text-[#6fdab5] hover:bg-[#e7ecea] dark:hover:bg-[#202020] active:scale-95 transition-all"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowTopSearch((prev) => !prev)}
            aria-label="بحث سريع"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#141716] dark:text-[#e5e2e1] hover:bg-[#e7ecea] dark:hover:bg-[#202020] active:scale-95 transition-all"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onOpenAddStudent}
            aria-label="إضافة طالب"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#141716] dark:text-[#e5e2e1] hover:bg-[#e7ecea] dark:hover:bg-[#202020] active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={onOpenProfileModal}
            aria-label="ملف المعلم"
            className="w-9 h-9 mr-1 rounded-full bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#003829] flex items-center justify-center hover:bg-[#005842] dark:hover:bg-[#8cf6d0] active:scale-95 transition-all"
          >
            <User className="w-5 h-5" strokeWidth={2.2} />
          </button>
        </div>
      </header>

      {/* Search Field */}
      <div className={`px-4 pb-3 ${showTopSearch ? 'block' : 'block'}`}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#52605a] dark:text-[#87948d] absolute right-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن طالب، اسم الأب، الهاتف أو العنوان..."
            className="w-full h-11 bg-white dark:bg-[#1b1b1c] border border-[#d5deda] dark:border-[#262626] focus:border-[#006c52] dark:focus:border-[#6fdab5] rounded-xl pr-10 pl-9 text-[14px] text-[#141716] dark:text-[#e5e2e1] placeholder-[#6e7b75] dark:placeholder-[#87948d] outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="مسح البحث"
              className="absolute left-2.5 w-7 h-7 flex items-center justify-center rounded-full text-[#52605a] dark:text-[#87948d] hover:text-[#141716] dark:hover:text-[#e5e2e1]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Halaqa Filter Chips */}
      <div className="px-4 pb-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <button
          type="button"
          onClick={() => setActiveHalaqaFilter('all')}
          className={`h-9 px-3.5 rounded-full text-[13px] font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
            activeHalaqaFilter === 'all'
              ? 'bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#002117]'
              : 'bg-white dark:bg-[#1b1b1c] text-[#141716] dark:text-[#e5e2e1]/90 border border-[#d5deda] dark:border-[#2a2a2a] hover:bg-[#eef2f0] dark:hover:bg-[#242425]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>الكل ({students.length})</span>
        </button>

        {halaqas.map((halaqa) => {
          const isActive = activeHalaqaFilter === halaqa.id;
          return (
            <button
              key={halaqa.id}
              type="button"
              onClick={() => setActiveHalaqaFilter(halaqa.id)}
              className={`h-9 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#002117] font-semibold'
                  : 'bg-white dark:bg-[#1b1b1c] text-[#141716] dark:text-[#e5e2e1]/90 border border-[#d5deda] dark:border-[#2a2a2a] hover:bg-[#eef2f0] dark:hover:bg-[#242425]'
              }`}
            >
              {halaqa.name}
            </button>
          );
        })}
      </div>

      {/* Sort Chips */}
      <div className="px-4 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[11px] text-[#52605a] dark:text-[#87948d] flex items-center gap-1 shrink-0 ml-1">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>ترتيب:</span>
        </span>
        {(
          [
            { id: 'default', label: 'المجموعات' },
            { id: 'most_errors', label: 'الأكثر أخطاءً' },
            { id: 'least_errors', label: 'الأقل أخطاءً' },
            { id: 'name', label: 'الاسم' },
          ] as { id: StudentSortMode; label: string }[]
        ).map((option) => {
          const active = sortMode === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSortMode(option.id)}
              className={`h-7 px-2.5 rounded-full text-[12px] whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'bg-[#e4f5ee] dark:bg-[#2a3f37] text-[#00513d] dark:text-[#6fdab5] border border-[#006c52]/35 dark:border-[#6fdab5]/40 font-semibold'
                  : 'bg-white dark:bg-[#181819] text-[#52605a] dark:text-[#a0a0a0] border border-[#d5deda] dark:border-[#262626] hover:text-[#141716] dark:hover:text-[#e5e2e1]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Scrollable Student List / Groups */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-5">
        {sortedFlatStudents.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-[15px] font-medium text-[#3c4843] dark:text-[#bdcac2]">
              لا يوجد طلاب مطابقون للبحث الحالي
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveHalaqaFilter('all');
                setSortMode('default');
              }}
              className="px-4 py-2 rounded-lg bg-white dark:bg-[#202020] border border-[#d5deda] dark:border-[#353535] text-[13px] text-[#006c52] dark:text-[#6fdab5] hover:bg-[#eef2f0] dark:hover:bg-[#2a2a2a]"
            >
              عرض جميع الطلاب
            </button>
          </div>
        ) : sortMode === 'default' ? (
          groupedSections.map(({ halaqa, items }) => (
            <section key={halaqa.id} className="space-y-1.5">
              {/* Group Header */}
              <div className="bg-white dark:bg-[#1b1b1c] border border-[#d5deda] dark:border-[#252526] rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-1 h-4 rounded-full bg-[#006c52] dark:bg-[#6fdab5] shrink-0"
                    aria-hidden="true"
                  />
                  <h2 className="text-[14px] font-bold text-[#141716] dark:text-[#e5e2e1]">
                    {halaqa.groupLabel}
                  </h2>
                </div>
                <span className="text-[12px] text-[#52605a] dark:text-[#87948d] tabular-nums">
                  {items.length} {items.length === 1 ? 'طالب' : 'طلاب'}
                </span>
              </div>

              {/* Student Rows */}
              <div className="divide-y divide-[#e4eae7] dark:divide-[#1e1e1e]">
                {items.map((student) => renderStudentRow(student, false))}
              </div>
            </section>
          ))
        ) : (
          <div className="divide-y divide-[#e4eae7] dark:divide-[#1e1e1e]">
            {sortedFlatStudents.map((student) =>
              renderStudentRow(student, activeHalaqaFilter === 'all')
            )}
          </div>
        )}
      </div>

      {/* Floating Add Student Button */}
      <button
        type="button"
        onClick={onOpenAddStudent}
        className="absolute bottom-5 left-4 z-20 h-13 px-5 rounded-2xl bg-[#006c52] hover:bg-[#005842] dark:bg-[#6fdab5] dark:hover:bg-[#8cf6d0] active:scale-[0.98] text-white dark:text-[#002117] font-bold text-[14px] flex items-center gap-2 shadow-xl shadow-black/20 dark:shadow-black/60 transition-all"
      >
        <UserPlus className="w-5 h-5" strokeWidth={2.2} />
        <span>إضافة طالب</span>
      </button>
    </div>
  );
};
