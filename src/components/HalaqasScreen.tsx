import React from 'react';
import { BookOpen, Calendar, FileDown, Plus, Users } from 'lucide-react';
import { Halaqa, Student } from '../types';
import { getStudentTotalErrors } from '../utils/errorStats';

interface HalaqasScreenProps {
  halaqas: Halaqa[];
  students: Student[];
  onOpenAddHalaqa: () => void;
  onSelectStudentFromHalaqa: (studentId: string) => void;
  onOpenReportModal: (halaqaId?: string) => void;
}

export const HalaqasScreen: React.FC<HalaqasScreenProps> = ({
  halaqas,
  students,
  onOpenAddHalaqa,
  onSelectStudentFromHalaqa,
  onOpenReportModal,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#f4f6f5] dark:bg-[#131313] text-[#141716] dark:text-[#e5e2e1]">
      <header className="h-14 px-4 flex items-center justify-between border-b border-[#d9e0dd] dark:border-[#202020] shrink-0">
        <h1 className="text-[20px] font-bold text-[#141716] dark:text-[#e5e2e1]">
          الحلقات القرآنية
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenReportModal('all')}
            className="h-9 px-3 rounded-lg bg-white dark:bg-[#202020] hover:bg-[#eef2f0] dark:hover:bg-[#2a2a2a] border border-[#d5deda] dark:border-[#353535] text-[12px] font-semibold text-[#006c52] dark:text-[#6fdab5] flex items-center gap-1.5 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span>تقارير PDF</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddHalaqa}
            className="h-9 px-3.5 rounded-lg bg-[#006c52] hover:bg-[#005842] dark:bg-[#6fdab5] dark:hover:bg-[#8cf6d0] text-white dark:text-[#002117] text-[13px] font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>حلقة جديدة</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {halaqas.map((halaqa) => {
          const members = students.filter((s) => s.halaqaId === halaqa.id);
          const totalHifz = members.reduce(
            (acc, s) => acc + getStudentTotalErrors(s.errors).hifz,
            0
          );
          const totalTajweed = members.reduce(
            (acc, s) => acc + getStudentTotalErrors(s.errors).tajweed,
            0
          );

          return (
            <div
              key={halaqa.id}
              className="bg-white dark:bg-[#1b1b1c] border border-[#d5deda] dark:border-[#2a2a2a] rounded-xl p-4 space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-bold text-[#141716] dark:text-[#e5e2e1]">
                    {halaqa.name}
                  </h2>
                  <p className="text-[12px] text-[#52605a] dark:text-[#a0a0a0] mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#006c52] dark:text-[#6fdab5]" />
                    <span>{halaqa.schedule}</span>
                  </p>
                </div>
                <span className="text-[12px] font-semibold text-[#006c52] dark:text-[#6fdab5] tabular-nums">
                  {members.length} طلاب
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e4eae7] dark:border-[#262626] text-center">
                <div className="py-2 rounded-lg bg-[#f4f6f5] dark:bg-[#151516]">
                  <p className="font-mono-metric text-[16px] font-bold text-[#141716] dark:text-[#e5e2e1]">
                    {members.length}
                  </p>
                  <p className="text-[11px] text-[#52605a] dark:text-[#87948d] mt-0.5">
                    المنتسبون
                  </p>
                </div>
                <div className="py-2 rounded-lg bg-[#f4f6f5] dark:bg-[#151516]">
                  <p className="font-mono-metric text-[16px] font-bold text-[#b91c1c] dark:text-[#ffb4ab]">
                    {totalHifz}
                  </p>
                  <p className="text-[11px] text-[#52605a] dark:text-[#87948d] mt-0.5">
                    أخطاء حفظ
                  </p>
                </div>
                <div className="py-2 rounded-lg bg-[#f4f6f5] dark:bg-[#151516]">
                  <p className="font-mono-metric text-[16px] font-bold text-[#b45309] dark:text-[#f5bd6a]">
                    {totalTajweed}
                  </p>
                  <p className="text-[11px] text-[#52605a] dark:text-[#87948d] mt-0.5">
                    أخطاء تجويد
                  </p>
                </div>
              </div>

              {members.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-medium text-[#52605a] dark:text-[#87948d]">
                    طلاب الحلقة (اضغط لفتح سجل السور):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onSelectStudentFromHalaqa(m.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#f4f6f5] hover:bg-[#e4f5ee] dark:bg-[#242425] dark:hover:bg-[#2d2d2f] border border-[#d5deda] dark:border-[#323234] text-[12px] text-[#141716] dark:text-[#e5e2e1] flex items-center gap-1.5 transition-colors"
                      >
                        <BookOpen className="w-3 h-3 text-[#006c52] dark:text-[#6fdab5]" />
                        <span>{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {members.length === 0 && (
                <div className="py-3 text-center text-[12px] text-[#52605a] dark:text-[#87948d] flex items-center justify-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>لا يوجد طلاب مضافون لهذه الحلقة بعد</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
