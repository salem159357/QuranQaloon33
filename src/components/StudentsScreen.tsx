import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ChevronLeft,
  Plus,
  Printer,
  Search,
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
  onSelectStudent: (studentId: string) => void;
  onOpenAddStudent: () => void;
  onRequestDeleteStudent: (student: Student) => void;
  onOpenProfileModal: () => void;
  onOpenReportModal: (halaqaFilter: string) => void;
}

export const StudentsScreen: React.FC<StudentsScreenProps> = ({
  students,
  halaqas,
  selectedStudentId,
  onSelectStudent,
  onOpenAddStudent,
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
        className={`group flex items-center justify-between py-2.5 px-2 rounded-xl transition-colors cursor-pointer ${
          isSelected
            ? 'bg-[#1b1b1c] ring-1 ring-[#6fdab5]/30'
            : 'hover:bg-[#1b1b1c]/60'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full bg-[#1b1b1c] border border-[#2a2a2a] flex items-center justify-center shrink-0">
            <span className="font-mono-metric text-[13px] font-semibold text-[#6fdab5]">
              {student.code}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[15px] font-semibold text-[#e5e2e1] truncate">
                {student.name}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#162922] border border-[#24473a] text-[#6fdab5] text-[11px] font-medium shrink-0">
                {student.riwayah}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1e1e1f] border border-[#2d2d2e] text-[11px] font-semibold tabular-nums shrink-0"
                title="مجموع الأخطاء (حفظ / تجويد)"
              >
                <span className={err.total > 0 ? 'text-[#e5e2e1]' : 'text-[#87948d]'}>
                  {err.total}
                </span>
                <span className="text-[#686868]">(</span>
                <span className={err.hifz > 0 ? 'text-[#ffb4ab]' : 'text-[#87948d]'}>
                  {err.hifz} حفظ
                </span>
                <span className="text-[#686868]">/</span>
                <span className={err.tajweed > 0 ? 'text-[#f5bd6a]' : 'text-[#87948d]'}>
                  {err.tajweed} تجويد
                </span>
                <span className="text-[#686868]">)</span>
              </span>
            </div>
            {showHalaqaSubtitle && (
              <p className="text-[11px] text-[#87948d] mt-0.5 truncate">
                {halaqaNameById[student.halaqaId] ?? ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <span className="w-8 h-11 flex items-center justify-center text-[#bdcac2] group-hover:text-[#6fdab5] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDeleteStudent(student);
            }}
            aria-label={`حذف ${student.name}`}
            className="w-11 h-11 rounded-lg flex items-center justify-center text-[#87948d] hover:text-[#ffb4ab] hover:bg-[#3c1418]/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#131313] text-[#e5e2e1] relative">
      {/* Top App Bar */}
      <header className="h-14 px-4 flex items-center justify-between shrink-0 bg-[#131313]">
        <h1 className="text-[20px] font-bold tracking-tight text-[#e5e2e1]">
          قائمة الطلاب
        </h1>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onOpenReportModal(activeHalaqaFilter)}
            title="طباعة تقرير"
            aria-label="طباعة تقرير"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#bdcac2] hover:text-[#6fdab5] hover:bg-[#202020] active:scale-95 transition-all"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowTopSearch((prev) => !prev)}
            aria-label="بحث سريع"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#e5e2e1] hover:bg-[#202020] active:scale-95 transition-all"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onOpenAddStudent}
            aria-label="إضافة طالب"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#e5e2e1] hover:bg-[#202020] active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={onOpenProfileModal}
            aria-label="ملف المعلم"
            className="w-9 h-9 mr-1 rounded-full bg-[#6fdab5] text-[#003829] flex items-center justify-center hover:bg-[#8cf6d0] active:scale-95 transition-all"
          >
            <User className="w-5 h-5" strokeWidth={2.2} />
          </button>
        </div>
      </header>

      {/* Search Field */}
      <div className={`px-4 pb-3 ${showTopSearch ? 'block' : 'block'}`}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#87948d] absolute right-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن طالب..."
            className="w-full h-11 bg-[#1b1b1c] border border-[#262626] focus:border-[#6fdab5] rounded-xl pr-10 pl-9 text-[14px] text-[#e5e2e1] placeholder-[#87948d] outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="مسح البحث"
              className="absolute left-2.5 w-7 h-7 flex items-center justify-center rounded-full text-[#87948d] hover:text-[#e5e2e1]"
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
              ? 'bg-[#6fdab5] text-[#002117]'
              : 'bg-[#1b1b1c] text-[#e5e2e1]/90 border border-[#2a2a2a] hover:bg-[#242425]'
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
                  ? 'bg-[#6fdab5] text-[#002117] font-semibold'
                  : 'bg-[#1b1b1c] text-[#e5e2e1]/90 border border-[#2a2a2a] hover:bg-[#242425]'
              }`}
            >
              {halaqa.name}
            </button>
          );
        })}
      </div>

      {/* Sort Chips */}
      <div className="px-4 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[11px] text-[#87948d] flex items-center gap-1 shrink-0 ml-1">
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
                  ? 'bg-[#2a3f37] text-[#6fdab5] border border-[#6fdab5]/40 font-semibold'
                  : 'bg-[#181819] text-[#a0a0a0] border border-[#262626] hover:text-[#e5e2e1]'
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
            <p className="text-[15px] font-medium text-[#bdcac2]">
              لا يوجد طلاب مطابقون للبحث الحالي
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveHalaqaFilter('all');
                setSortMode('default');
              }}
              className="px-4 py-2 rounded-lg bg-[#202020] border border-[#353535] text-[13px] text-[#6fdab5] hover:bg-[#2a2a2a]"
            >
              عرض جميع الطلاب
            </button>
          </div>
        ) : sortMode === 'default' ? (
          groupedSections.map(({ halaqa, items }) => (
            <section key={halaqa.id} className="space-y-1.5">
              {/* Group Header */}
              <div className="bg-[#1b1b1c] border border-[#252526] rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-1 h-4 rounded-full bg-[#6fdab5] shrink-0"
                    aria-hidden="true"
                  />
                  <h2 className="text-[14px] font-bold text-[#e5e2e1]">
                    {halaqa.groupLabel}
                  </h2>
                </div>
                <span className="text-[12px] text-[#87948d] tabular-nums">
                  {items.length} {items.length === 1 ? 'طالب' : 'طلاب'}
                </span>
              </div>

              {/* Student Rows */}
              <div className="divide-y divide-[#1e1e1e]">
                {items.map((student) => renderStudentRow(student, false))}
              </div>
            </section>
          ))
        ) : (
          <div className="divide-y divide-[#1e1e1e]">
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
        className="absolute bottom-5 left-4 z-20 h-13 px-5 rounded-2xl bg-[#6fdab5] hover:bg-[#8cf6d0] active:scale-[0.98] text-[#002117] font-bold text-[14px] flex items-center gap-2 shadow-xl shadow-black/60 transition-all"
      >
        <UserPlus className="w-5 h-5" strokeWidth={2.2} />
        <span>إضافة طالب</span>
      </button>
    </div>
  );
};
