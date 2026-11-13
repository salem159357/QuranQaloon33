import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Halaqa, Riwayah, Student } from '../types';

interface AddStudentModalProps {
  halaqas: Halaqa[];
  defaultRiwayah: Riwayah;
  onClose: () => void;
  onSubmit: (data: { name: string; halaqaId: string; riwayah: Riwayah }) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  halaqas,
  defaultRiwayah,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [halaqaId, setHalaqaId] = useState(halaqas[0]?.id ?? '');
  const [riwayah, setRiwayah] = useState<Riwayah>(defaultRiwayah);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !halaqaId) return;
    onSubmit({ name: name.trim(), halaqaId, riwayah });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:max-w-md bg-[#1e1e1f] border border-[#353535] rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
      >
        <div className="w-10 h-1 bg-[#3e4944] rounded-full mx-auto sm:hidden" />

        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[#e5e2e1]">إضافة طالب جديد</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#a0a0a0] hover:bg-[#2a2a2a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[12px] text-[#a0a0a0] mb-1.5">
              اسم الطالب الثلاثي
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أنس محمد الشنقيطي"
              className="w-full h-11 bg-[#131313] border border-[#353535] focus:border-[#6fdab5] rounded-xl px-3.5 text-[14px] text-[#e5e2e1] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] text-[#a0a0a0] mb-1.5">
              الحلقة
            </label>
            <select
              value={halaqaId}
              onChange={(e) => setHalaqaId(e.target.value)}
              className="w-full h-11 bg-[#131313] border border-[#353535] focus:border-[#6fdab5] rounded-xl px-3 text-[14px] text-[#e5e2e1] outline-none"
            >
              {halaqas.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.groupLabel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] text-[#a0a0a0] mb-1.5">
              الرواية المعتمدة
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['قالون', 'حفص', 'ورش'] as Riwayah[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiwayah(r)}
                  className={`h-10 rounded-xl text-[13px] font-semibold border transition-colors ${
                    riwayah === r
                      ? 'bg-[#6fdab5] text-[#002117] border-[#6fdab5]'
                      : 'bg-[#131313] text-[#e5e2e1] border-[#353535]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-[#2a2a2a] text-[14px] font-semibold text-[#e5e2e1]"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="flex-1 h-11 rounded-xl bg-[#6fdab5] hover:bg-[#8cf6d0] text-[14px] font-bold text-[#002117]"
          >
            إضافة الطالب
          </button>
        </div>
      </form>
    </div>
  );
};

interface AddHalaqaModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; schedule: string }) => void;
}

export const AddHalaqaModal: React.FC<AddHalaqaModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('يومياً بعد صلاة المغرب');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), schedule: schedule.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:max-w-md bg-[#1e1e1f] border border-[#353535] rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[#e5e2e1]">إنشاء حلقة جديدة</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#a0a0a0] hover:bg-[#2a2a2a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[12px] text-[#a0a0a0] mb-1.5">
              اسم الحلقة
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: حلقة المغرب"
              className="w-full h-11 bg-[#131313] border border-[#353535] focus:border-[#6fdab5] rounded-xl px-3.5 text-[14px] text-[#e5e2e1] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12px] text-[#a0a0a0] mb-1.5">
              الموعد الأسبوعي
            </label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full h-11 bg-[#131313] border border-[#353535] focus:border-[#6fdab5] rounded-xl px-3.5 text-[14px] text-[#e5e2e1] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-[#2a2a2a] text-[14px] font-semibold text-[#e5e2e1]"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="flex-1 h-11 rounded-xl bg-[#6fdab5] text-[14px] font-bold text-[#002117]"
          >
            حفظ الحلقة
          </button>
        </div>
      </form>
    </div>
  );
};

interface ConfirmDeleteModalProps {
  student: Student;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  student,
  onCancel,
  onConfirm,
}) => (
  <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
    <div className="w-full max-w-sm bg-[#1e1e1f] border border-[#353535] rounded-2xl p-5 space-y-4 shadow-2xl">
      <h3 className="text-[16px] font-bold text-[#e5e2e1]">حذف الطالب</h3>
      <p className="text-[13px] text-[#bdcac2] leading-relaxed">
        هل تريد بالتأكيد حذف الطالب <strong>{student.name}</strong> وسجل أخطائه
        المسجلة؟
      </p>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-xl bg-[#2a2a2a] text-[13px] font-semibold text-[#e5e2e1]"
        >
          تراجع
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 h-10 rounded-xl bg-[#93000a] hover:bg-[#b0101b] text-[13px] font-bold text-[#ffdad6]"
        >
          حذف الطالب
        </button>
      </div>
    </div>
  </div>
);
