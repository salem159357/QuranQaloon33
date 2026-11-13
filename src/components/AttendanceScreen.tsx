import React, { useMemo } from 'react';
import {
  Calendar,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Printer,
  Users,
} from 'lucide-react';
import { formatLocalDateISO } from '../data/initialState';
import {
  AttendanceRecord,
  AttendanceStatus,
  Halaqa,
  Student,
} from '../types';

interface AttendanceScreenProps {
  students: Student[];
  halaqas: Halaqa[];
  attendance: AttendanceRecord[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onMarkAttendance: (
    studentId: string,
    date: string,
    status: AttendanceStatus,
    note?: string
  ) => void;
  onBulkMarkPresent: (studentIds: string[], date: string) => void;
  onOpenReportModal: (initialHalaqaId?: string) => void;
}

const STATUS_OPTIONS: {
  id: AttendanceStatus;
  label: string;
  activeClass: string;
}[] = [
  {
    id: 'present',
    label: 'حاضر',
    activeClass: 'bg-[#6fdab5] text-[#002117] border-[#6fdab5] font-bold',
  },
  {
    id: 'late',
    label: 'متأخر',
    activeClass: 'bg-[#f5bd6a] text-[#291800] border-[#f5bd6a] font-bold',
  },
  {
    id: 'excused',
    label: 'بعذر',
    activeClass: 'bg-[#4b607f] text-[#eaf2ff] border-[#6d87ad] font-bold',
  },
  {
    id: 'absent',
    label: 'غائب',
    activeClass: 'bg-[#93000a] text-[#ffdad6] border-[#c43e44] font-bold',
  },
];

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  students,
  halaqas,
  attendance,
  selectedDate,
  onChangeDate,
  onMarkAttendance,
  onBulkMarkPresent,
  onOpenReportModal,
}) => {
  const [halaqaFilter, setHalaqaFilter] = React.useState<string>('all');

  const todayISO = useMemo(() => formatLocalDateISO(new Date()), []);

  const filteredStudents = useMemo(() => {
    if (halaqaFilter === 'all') return students;
    return students.filter((s) => s.halaqaId === halaqaFilter);
  }, [students, halaqaFilter]);

  const recordByStudentId = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    for (const r of attendance) {
      if (r.date === selectedDate) {
        map[r.studentId] = r;
      }
    }
    return map;
  }, [attendance, selectedDate]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let unmarked = 0;

    for (const s of filteredStudents) {
      const rec = recordByStudentId[s.id];
      if (!rec) unmarked++;
      else if (rec.status === 'present') present++;
      else if (rec.status === 'absent') absent++;
      else if (rec.status === 'late') late++;
      else if (rec.status === 'excused') excused++;
    }
    return { present, absent, late, excused, unmarked };
  }, [filteredStudents, recordByStudentId]);

  const halaqaNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const h of halaqas) map[h.id] = h.name;
    return map;
  }, [halaqas]);

  const shiftDay = (delta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + delta);
    onChangeDate(formatLocalDateISO(dt));
  };

  return (
    <div className="flex flex-col h-full bg-[#131313] text-[#e5e2e1]">
      {/* Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-[#202020] shrink-0">
        <h1 className="text-[20px] font-bold text-[#e5e2e1]">تسجيل الحضور</h1>
        <button
          type="button"
          onClick={() => onOpenReportModal(halaqaFilter)}
          className="h-9 px-3 rounded-lg bg-[#202020] hover:bg-[#2a2a2a] border border-[#353535] text-[12px] font-semibold text-[#6fdab5] flex items-center gap-1.5 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>تقرير PDF</span>
        </button>
      </header>

      {/* Date Picker Bar */}
      <div className="px-4 py-3 bg-[#171718] border-b border-[#222224] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => shiftDay(-1)}
            aria-label="اليوم السابق"
            className="w-9 h-9 rounded-lg bg-[#1e1e1f] border border-[#2d2d2f] flex items-center justify-center text-[#bdcac2] hover:text-[#e5e2e1]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="relative flex items-center">
            <Calendar className="w-4 h-4 text-[#6fdab5] absolute right-2.5 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onChangeDate(e.target.value)}
              className="h-9 bg-[#1e1e1f] border border-[#2d2d2f] focus:border-[#6fdab5] rounded-lg pr-8 pl-2.5 font-mono-metric text-[13px] text-[#e5e2e1] outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => shiftDay(1)}
            aria-label="اليوم التالي"
            className="w-9 h-9 rounded-lg bg-[#1e1e1f] border border-[#2d2d2f] flex items-center justify-center text-[#bdcac2] hover:text-[#e5e2e1]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {selectedDate !== todayISO && (
            <button
              type="button"
              onClick={() => onChangeDate(todayISO)}
              className="h-9 px-2.5 rounded-lg bg-[#1e1e1f] border border-[#2d2d2f] text-[12px] text-[#bdcac2] hover:text-[#6fdab5]"
            >
              اليوم
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              onBulkMarkPresent(
                filteredStudents.map((s) => s.id),
                selectedDate
              )
            }
            className="h-9 px-3 rounded-lg bg-[#6fdab5] hover:bg-[#8cf6d0] text-[#002117] text-[12px] font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <CheckCheck className="w-4 h-4" />
            <span>تحضير الكل</span>
          </button>
        </div>
      </div>

      {/* Halaqa Filter Chips */}
      <div className="px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <button
          type="button"
          onClick={() => setHalaqaFilter('all')}
          className={`h-8 px-3 rounded-full text-[12px] font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
            halaqaFilter === 'all'
              ? 'bg-[#6fdab5] text-[#002117]'
              : 'bg-[#1b1b1c] text-[#e5e2e1]/90 border border-[#2a2a2a]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>الكل ({students.length})</span>
        </button>

        {halaqas.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => setHalaqaFilter(h.id)}
            className={`h-8 px-3 rounded-full text-[12px] whitespace-nowrap shrink-0 transition-colors ${
              halaqaFilter === h.id
                ? 'bg-[#6fdab5] text-[#002117] font-bold'
                : 'bg-[#1b1b1c] text-[#e5e2e1]/90 border border-[#2a2a2a]'
            }`}
          >
            {h.name}
          </button>
        ))}
      </div>

      {/* Daily Summary Metrics */}
      <div className="px-4 pb-3 grid grid-cols-4 gap-2 shrink-0">
        <div className="bg-[#1b1b1c] border border-[#262626] rounded-xl py-2 px-2.5 text-center">
          <p className="font-mono-metric text-[15px] font-bold text-[#6fdab5]">
            {summary.present}
          </p>
          <p className="text-[11px] text-[#a0a0a0]">حاضر</p>
        </div>
        <div className="bg-[#1b1b1c] border border-[#262626] rounded-xl py-2 px-2.5 text-center">
          <p className="font-mono-metric text-[15px] font-bold text-[#f5bd6a]">
            {summary.late}
          </p>
          <p className="text-[11px] text-[#a0a0a0]">متأخر</p>
        </div>
        <div className="bg-[#1b1b1c] border border-[#262626] rounded-xl py-2 px-2.5 text-center">
          <p className="font-mono-metric text-[15px] font-bold text-[#9ab4d9]">
            {summary.excused}
          </p>
          <p className="text-[11px] text-[#a0a0a0]">بعذر</p>
        </div>
        <div className="bg-[#1b1b1c] border border-[#262626] rounded-xl py-2 px-2.5 text-center">
          <p className="font-mono-metric text-[15px] font-bold text-[#ffb4ab]">
            {summary.absent}
          </p>
          <p className="text-[11px] text-[#a0a0a0]">غائب</p>
        </div>
      </div>

      {/* Student Attendance Rows */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2.5">
        {filteredStudents.map((student) => {
          const rec = recordByStudentId[student.id];
          const currentStatus = rec?.status;

          return (
            <div
              key={student.id}
              className="bg-[#1b1b1c] border border-[#272729] rounded-xl p-3 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#131313] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                    <span className="font-mono-metric text-[12px] font-semibold text-[#6fdab5]">
                      {student.code}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#e5e2e1] truncate">
                      {student.name}
                    </p>
                    <p className="text-[11px] text-[#87948d]">
                      {halaqaNameById[student.halaqaId] ?? ''} · {student.riwayah}
                    </p>
                  </div>
                </div>

                {!currentStatus && (
                  <span className="text-[11px] text-[#87948d] shrink-0">
                    غير مسجل
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {STATUS_OPTIONS.map((opt) => {
                  const isActive = currentStatus === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        onMarkAttendance(
                          student.id,
                          selectedDate,
                          opt.id,
                          rec?.note ?? ''
                        )
                      }
                      className={`h-9 rounded-lg text-[12px] border transition-colors ${
                        isActive
                          ? opt.activeClass
                          : 'bg-[#141415] border-[#29292b] text-[#bdcac2] hover:border-[#3e4944]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={rec?.note ?? ''}
                onChange={(e) =>
                  onMarkAttendance(
                    student.id,
                    selectedDate,
                    currentStatus ?? 'present',
                    e.target.value
                  )
                }
                placeholder="ملاحظة الجلسة (اختياري)..."
                className="w-full h-8 bg-[#141415] border border-[#242426] focus:border-[#6fdab5] rounded-lg px-2.5 text-[12px] text-[#e5e2e1] placeholder-[#686868] outline-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
