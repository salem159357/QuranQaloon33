import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Halaqa, Riwayah, Student } from '../types';

export interface StudentFormPayload {
  name: string;
  fatherName: string;
  fatherPhone: string;
  address: string;
  age: number | null;
  halaqaId: string;
  riwayah: Riwayah;
}

interface StudentFormModalProps {
  halaqas: Halaqa[];
  defaultRiwayah: Riwayah;
  initialStudent?: Student | null;
  onClose: () => void;
  onSubmit: (data: StudentFormPayload) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  halaqas,
  defaultRiwayah,
  initialStudent,
  onClose,
  onSubmit,
}) => {
  const isEditing = Boolean(initialStudent);
  const [name, setName] = useState(initialStudent?.name ?? '');
  const [fatherName, setFatherName] = useState(initialStudent?.fatherName ?? '');
  const [fatherPhone, setFatherPhone] = useState(
    initialStudent?.fatherPhone ?? ''
  );
  const [address, setAddress] = useState(initialStudent?.address ?? '');
  const [ageInput, setAgeInput] = useState(
    initialStudent?.age !== null && initialStudent?.age !== undefined
      ? String(initialStudent.age)
      : ''
  );
  const [halaqaId, setHalaqaId] = useState(
    initialStudent?.halaqaId ?? halaqas[0]?.id ?? ''
  );
  const [riwayah, setRiwayah] = useState<Riwayah>(
    initialStudent?.riwayah ?? defaultRiwayah
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !halaqaId) return;
    const parsedAge = ageInput.trim() ? Number(ageInput.trim()) : null;
    const validAge =
      parsedAge !== null && Number.isFinite(parsedAge) && parsedAge > 0
        ? Math.round(parsedAge)
        : null;

    onSubmit({
      name: name.trim(),
      fatherName: fatherName.trim(),
      fatherPhone: fatherPhone.trim(),
      address: address.trim(),
      age: validAge,
      halaqaId,
      riwayah,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-[#1e1e1f] border border-[#d9e0dd] dark:border-[#353535] rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
      >
        <div className="w-10 h-1 bg-[#c5ceca] dark:bg-[#3e4944] rounded-full mx-auto sm:hidden" />

        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[#141716] dark:text-[#e5e2e1]">
            {isEditing ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#52605a] dark:text-[#a0a0a0] hover:bg-[#eef2f0] dark:hover:bg-[#2a2a2a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[#52605a] dark:text-[#a0a0a0] mb-1.5">
              اسم الطالب
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أنس محمد الشنقيطي"
              className="w-full h-11 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d0dad6] dark:border-[#353535] focus:border-[#006c52] dark:focus:border-[#6fdab5] rounded-xl px-3.5 text-[14px] text-[#141716] dark:text-[#e5e2e1] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#52605a] dark:text-[#a0a0a0] mb-1.5">
                اسم الأب
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="مثال: عبد الله المنصوري"
                className="w-full h-11 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d0dad6] dark:border-[#353535] focus:border-[#006c52] dark:focus:border-[#6fdab5] rounded-xl px-3.5 text-[14px] text-[#141716] dark:text-[#e5e2e1] outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#52605a] dark:text-[#a0a0a0] mb-1.5">
                رقم هاتف الأب
              </label>
              <input
                type="tel"
                dir="ltr"
                value={fatherPhone}
                onChange={(e) => setFatherPhone(e.target.value)}
                placeholder="0555 12 34 56"
                className="w-full h-11 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d0dad6] dark:border-[#353535] focus:border-[#006c52] dark:focus:border-[#6fdab5] rounded-xl px-3.5 font-mono-metric text-[14px] text-left text-[#141716] dark:text-[#e5e2e1] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-[#52605a] dark:text-[#a0a0a0] mb-1.5">
                العنوان
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: حي النور - شارع الاستقلال"
                className="w-full h-11 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d0dad6] dark:border-[#353535] focus:border-[#006c52] dark:focus:border-[#6fdab5] rounded-xl px-3.5 text-[14px] text-[#141716] dark:text-[#e5e2e1] outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#52605a] dark:text-[#a0a0a0] mb-1.5">
                العمر
              </label>
              <input
                type="number"
                min={3}
                max={99}
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                placeholder="12"
                className="w-full h-11 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d0dad6] dark:border-[#353535] focus:border-[#006c52] dark:focus:border-[#6fdab5] rounded-xl px-3 font-mono-metric text-[14px] text-[#141716] dark:text-[#e5e2e1] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#52605a] dark:text-[#a0a0a0] mb-1.5">
              الحلقة
            </label>
            <select
              value={halaqaId}
              onChange={(e) => setHalaqaId(e.target.value)}
              className="w-full h-11 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d0dad6] dark:border-[#353535] focus:border-[#006c52] dark:focus:border-[#6fdab5] rounded-xl px-3 text-[14px] text-[#141716] dark:text-[#e5e2e1] outline-none"
            >
              {halaqas.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.groupLabel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#52605a] dark:text-[#a0a0a0] mb-1.5">
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
                      ? 'bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#002117] border-[#006c52] dark:border-[#6fdab5]'
                      : 'bg-[#f4f6f5] dark:bg-[#131313] text-[#141716] dark:text-[#e5e2e1] border-[#d0dad6] dark:border-[#353535]'
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
            className="flex-1 h-11 rounded-xl bg-[#eef2f0] dark:bg-[#2a2a2a] text-[14px] font-semibold text-[#141716] dark:text-[#e5e2e1]"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="flex-1 h-11 rounded-xl bg-[#006c52] hover:bg-[#005842] dark:bg-[#6fdab5] dark:hover:bg-[#8cf6d0] text-white dark:text-[#002117] text-[14px] font-bold"
          >
            {isEditing ? 'حفظ التعديلات' : 'إضافة الطالب'}
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
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:max-w-md bg-white dark:bg-[#1e1e1f] border border-[#d9e0dd] dark:border-[#353535] rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[#141716] dark:text-[#e5e2e1]">
            إنشاء حلقة جديدة
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#52605a] dark:text-[#a0a0a0] hover:bg-[#eef2f0] dark:hover:bg-[#2a2a2a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[#52605a] dark:text-[#a0a0a0] mb-1.5">
              اسم الحلقة
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: حلقة المغرب"
              className="w-full h-11 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d0dad6] dark:border-[#353535] focus:border-[#006c52] dark:focus:border-[#6fdab5] rounded-xl px-3.5 text-[14px] text-[#141716] dark:text-[#e5e2e1] outline-none"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#52605a] dark:text-[#a0a0a0] mb-1.5">
              الموعد الأسبوعي
            </label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full h-11 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d0dad6] dark:border-[#353535] focus:border-[#006c52] dark:focus:border-[#6fdab5] rounded-xl px-3.5 text-[14px] text-[#141716] dark:text-[#e5e2e1] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-[#eef2f0] dark:bg-[#2a2a2a] text-[14px] font-semibold text-[#141716] dark:text-[#e5e2e1]"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="flex-1 h-11 rounded-xl bg-[#006c52] hover:bg-[#005842] dark:bg-[#6fdab5] text-white dark:text-[#002117] text-[14px] font-bold"
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
  <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
    <div className="w-full max-w-sm bg-white dark:bg-[#1e1e1f] border border-[#d9e0dd] dark:border-[#353535] rounded-2xl p-5 space-y-4 shadow-2xl">
      <h3 className="text-[16px] font-bold text-[#141716] dark:text-[#e5e2e1]">
        حذف الطالب
      </h3>
      <p className="text-[13px] text-[#3c4843] dark:text-[#bdcac2] leading-relaxed">
        هل تريد بالتأكيد حذف الطالب <strong>{student.name}</strong> وسجل أخطائه
        المسجلة؟
      </p>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-xl bg-[#eef2f0] dark:bg-[#2a2a2a] text-[13px] font-semibold text-[#141716] dark:text-[#e5e2e1]"
        >
          تراجع
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 h-10 rounded-xl bg-[#b91c1c] hover:bg-[#991b1b] dark:bg-[#93000a] dark:hover:bg-[#b0101b] text-white dark:text-[#ffdad6] text-[13px] font-bold"
        >
          حذف الطالب
        </button>
      </div>
    </div>
  </div>
);
