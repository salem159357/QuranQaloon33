import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { SURAHS } from '../data/quranData';
import { HifzTask, RetentionGrade, Student } from '../types';

interface PlannerScreenProps {
  tasks: HifzTask[];
  students: Student[];
  onToggleTask: (taskId: string) => void;
  onChangeGrade: (taskId: string, grade: RetentionGrade) => void;
  onAddTask: (task: Omit<HifzTask, 'id'>) => void;
}

const GRADES: RetentionGrade[] = ['ممتاز', 'جيد جداً', 'جيد', 'ضعيف'];

const TASK_TYPE_LABEL: Record<HifzTask['type'], { label: string; classes: string }> = {
  sabaq: {
    label: 'السبق (حفظ جديد)',
    classes:
      'bg-[#e4f5ee] dark:bg-[#4eba97]/15 text-[#00513d] dark:text-[#6fdab5]',
  },
  sabqi: {
    label: 'السبقي (مراجعة قريبة)',
    classes:
      'bg-[#e6f4ea] dark:bg-[#52b788]/15 text-[#136f45] dark:text-[#75daa8]',
  },
  manzil: {
    label: 'المنزل (تثبيت قديم)',
    classes:
      'bg-[#fef3dc] dark:bg-[#d8a353]/15 text-[#854d0e] dark:text-[#f5bd6a]',
  },
};

export const PlannerScreen: React.FC<PlannerScreenProps> = ({
  tasks,
  students,
  onToggleTask,
  onChangeGrade,
  onAddTask,
}) => {
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudentId, setNewStudentId] = useState(students[0]?.id ?? '');
  const [newType, setNewType] = useState<HifzTask['type']>('sabaq');
  const [newSurah, setNewSurah] = useState(4);
  const [newRange, setNewRange] = useState('004:034-042');

  const visibleTasks =
    selectedStudentFilter === 'all'
      ? tasks
      : tasks.filter((t) => t.studentId === selectedStudentFilter);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId) return;
    const surahObj = SURAHS.find((s) => s.number === newSurah) ?? SURAHS[0];
    onAddTask({
      studentId: newStudentId,
      type: newType,
      surahNumber: newSurah,
      ayahRange: newRange.trim() || `${String(newSurah).padStart(3, '0')}:001-015`,
      juz: surahObj.juz,
      grade: 'ممتاز',
      completed: false,
      dateLabel: 'اليوم',
    });
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f6f5] dark:bg-[#131313] text-[#141716] dark:text-[#e5e2e1]">
      <header className="h-14 px-4 flex items-center justify-between border-b border-[#d9e0dd] dark:border-[#202020] shrink-0">
        <h1 className="text-[20px] font-bold text-[#141716] dark:text-[#e5e2e1]">
          خطة الحفظ والمراجعة
        </h1>
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="h-9 px-3.5 rounded-lg bg-[#006c52] hover:bg-[#005842] dark:bg-[#6fdab5] dark:hover:bg-[#8cf6d0] text-white dark:text-[#002117] text-[13px] font-bold flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة ورد</span>
        </button>
      </header>

      {/* Student Filter Pills */}
      <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#d9e0dd] dark:border-[#1d1d1e] shrink-0">
        <button
          type="button"
          onClick={() => setSelectedStudentFilter('all')}
          className={`h-8 px-3 rounded-full text-[12px] whitespace-nowrap shrink-0 transition-colors ${
            selectedStudentFilter === 'all'
              ? 'bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#002117] font-bold'
              : 'bg-white dark:bg-[#1b1b1c] text-[#3c4843] dark:text-[#bdcac2] border border-[#d5deda] dark:border-[#2a2a2a]'
          }`}
        >
          كل الطلاب ({tasks.length})
        </button>
        {students.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedStudentFilter(s.id)}
            className={`h-8 px-3 rounded-full text-[12px] whitespace-nowrap shrink-0 transition-colors ${
              selectedStudentFilter === s.id
                ? 'bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#002117] font-bold'
                : 'bg-white dark:bg-[#1b1b1c] text-[#3c4843] dark:text-[#bdcac2] border border-[#d5deda] dark:border-[#2a2a2a]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {showAddForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-[#1b1b1c] border border-[#006c52]/40 dark:border-[#3e4944] rounded-xl p-4 space-y-3"
          >
            <h2 className="text-[14px] font-bold text-[#006c52] dark:text-[#6fdab5]">
              تعيين ورد حفظ أو مراجعة جديد
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#52605a] dark:text-[#a0a0a0] mb-1">
                  الطالب
                </label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full h-10 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d5deda] dark:border-[#2f2f2f] rounded-lg px-3 text-[13px] text-[#141716] dark:text-[#e5e2e1] outline-none focus:border-[#006c52] dark:focus:border-[#6fdab5]"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#52605a] dark:text-[#a0a0a0] mb-1">
                  نوع الورد
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as HifzTask['type'])}
                  className="w-full h-10 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d5deda] dark:border-[#2f2f2f] rounded-lg px-3 text-[13px] text-[#141716] dark:text-[#e5e2e1] outline-none focus:border-[#006c52] dark:focus:border-[#6fdab5]"
                >
                  <option value="sabaq">السبق (حفظ جديد)</option>
                  <option value="sabqi">السبقي (مراجعة قريبة)</option>
                  <option value="manzil">المنزل (تثبيت قديم)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#52605a] dark:text-[#a0a0a0] mb-1">
                  السورة
                </label>
                <select
                  value={newSurah}
                  onChange={(e) => setNewSurah(Number(e.target.value))}
                  className="w-full h-10 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d5deda] dark:border-[#2f2f2f] rounded-lg px-3 text-[13px] text-[#141716] dark:text-[#e5e2e1] outline-none focus:border-[#006c52] dark:focus:border-[#6fdab5]"
                >
                  {SURAHS.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.nameArabic}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#52605a] dark:text-[#a0a0a0] mb-1">
                  نطاق الآيات
                </label>
                <input
                  type="text"
                  value={newRange}
                  onChange={(e) => setNewRange(e.target.value)}
                  className="w-full h-10 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d5deda] dark:border-[#2f2f2f] rounded-lg px-3 font-mono-metric text-[13px] text-[#141716] dark:text-[#e5e2e1] outline-none focus:border-[#006c52] dark:focus:border-[#6fdab5]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="h-9 px-3.5 rounded-lg bg-[#eef2f0] dark:bg-[#2a2a2a] text-[13px] text-[#141716] dark:text-[#e5e2e1]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#002117] text-[13px] font-bold"
              >
                حفظ الورد
              </button>
            </div>
          </form>
        )}

        {visibleTasks.map((task) => {
          const student = students.find((s) => s.id === task.studentId);
          const surah = SURAHS.find((s) => s.number === task.surahNumber);
          const badge = TASK_TYPE_LABEL[task.type];

          return (
            <div
              key={task.id}
              className="bg-white dark:bg-[#1b1b1c] border border-[#d5deda] dark:border-[#2a2a2a] rounded-xl p-3.5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    aria-label="تحديد كمكتمل"
                    className={`w-6 h-6 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      task.completed
                        ? 'bg-[#006c52] dark:bg-[#6fdab5] border-[#006c52] dark:border-[#6fdab5] text-white dark:text-[#002117]'
                        : 'border-[#9aa8a2] dark:border-[#4a4a4a] hover:border-[#006c52] dark:hover:border-[#6fdab5]'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </button>
                  <div>
                    <p
                      className={`text-[14px] font-bold ${
                        task.completed
                          ? 'line-through text-[#6e7b75] dark:text-[#87948d]'
                          : 'text-[#141716] dark:text-[#e5e2e1]'
                      }`}
                    >
                      {student?.name ?? 'طالب'}
                    </p>
                    <p className="text-[12px] text-[#52605a] dark:text-[#a0a0a0] mt-0.5">
                      {surah?.nameArabic} ·{' '}
                      <span className="font-mono-metric text-[#3c4843] dark:text-[#bdcac2]">
                        الجزء {task.juz} • {task.ayahRange}
                      </span>
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${badge.classes}`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Retention Grade Segmented Selector */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[#eef2f0] dark:bg-[#141415] border border-[#d5deda] dark:border-[#252526]">
                {GRADES.map((grade) => {
                  const active = task.grade === grade;
                  return (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => onChangeGrade(task.id, grade)}
                      className={`h-8 rounded-md text-[11px] font-semibold transition-colors ${
                        active
                          ? 'bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#002117]'
                          : 'text-[#52605a] dark:text-[#a0a0a0] hover:text-[#141716] dark:hover:text-[#e5e2e1]'
                      }`}
                    >
                      {grade}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
