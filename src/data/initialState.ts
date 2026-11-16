import { AppSettings, AttendanceRecord, Halaqa, HifzTask, Student } from '../types';

export function formatLocalDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function offsetDaysISO(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return formatLocalDateISO(d);
}

const TODAY = offsetDaysISO(0);
const YESTERDAY = offsetDaysISO(-1);
const TWO_DAYS_AGO = offsetDaysISO(-2);

export const INITIAL_HALAQAS: Halaqa[] = [
  {
    id: 'halaqa-fajr',
    name: 'حلقة الفجر',
    groupLabel: 'المجموعة الأولى • حلقة الفجر',
    schedule: 'يومياً بعد صلاة الفجر • 05:30 ص',
    teacherName: 'الشيخ عبد الملك القاسمي',
  },
  {
    id: 'halaqa-asr',
    name: 'حلقة العصر',
    groupLabel: 'المجموعة الثانية • حلقة العصر',
    schedule: 'السبت - الأربعاء • 04:15 م',
    teacherName: 'الشيخ عبد الملك القاسمي',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    code: '01',
    name: 'عمر عبد الله المنصوري',
    fatherName: 'عبد الله المنصوري',
    fatherPhone: '0551234567',
    address: 'حي النور، شارع المسجد الكبير',
    age: 14,
    halaqaId: 'halaqa-fajr',
    riwayah: 'قالون',
    currentJuz: 5,
    currentSurah: 4,
    currentAyah: 31,
    errors: {
      '2:14': { hifz: 2, tajweed: 1, updatedAt: TODAY },
      '2:48': { hifz: 1, tajweed: 1, updatedAt: YESTERDAY },
      '3:7': { hifz: 1, tajweed: 2, updatedAt: YESTERDAY },
      '3:19': { hifz: 0, tajweed: 2, updatedAt: TWO_DAYS_AGO },
      '4:28': { hifz: 1, tajweed: 0, updatedAt: TODAY },
      '4:29': { hifz: 1, tajweed: 1, updatedAt: TODAY },
    },
  },
  {
    id: 'student-2',
    code: '02',
    name: 'يوسف أحمد التونسي',
    fatherName: 'أحمد التونسي',
    fatherPhone: '0552345678',
    address: 'حي السلام، عمارة 12',
    age: 12,
    halaqaId: 'halaqa-fajr',
    riwayah: 'قالون',
    currentJuz: 8,
    currentSurah: 7,
    currentAyah: 42,
    errors: {
      '6:12': { hifz: 1, tajweed: 2, updatedAt: TODAY },
      '7:10': { hifz: 0, tajweed: 1, updatedAt: YESTERDAY },
    },
  },
  {
    id: 'student-3',
    code: '03',
    name: 'حمزة خالد الفاسي',
    fatherName: 'خالد الفاسي',
    fatherPhone: '0553456789',
    address: 'شارع الأندلس، رقم 8',
    age: 15,
    halaqaId: 'halaqa-fajr',
    riwayah: 'قالون',
    currentJuz: 11,
    currentSurah: 10,
    currentAyah: 25,
    errors: {
      '2:255': { hifz: 0, tajweed: 1, updatedAt: TODAY },
      '10:5': { hifz: 2, tajweed: 0, updatedAt: YESTERDAY },
    },
  },
  {
    id: 'student-4',
    code: '04',
    name: 'طارق زياد الليبي',
    fatherName: 'زياد الليبي',
    fatherPhone: '0554567890',
    address: 'حي الهدى، المنطقة الشرقية',
    age: 11,
    halaqaId: 'halaqa-asr',
    riwayah: 'قالون',
    currentJuz: 3,
    currentSurah: 3,
    currentAyah: 52,
    errors: {
      '3:14': { hifz: 2, tajweed: 3, updatedAt: TODAY },
    },
  },
  {
    id: 'student-5',
    code: '05',
    name: 'عبد الرحمن محمد الصالح',
    fatherName: 'محمد الصالح',
    fatherPhone: '0555678901',
    address: 'حي البساتين، منزل 24',
    age: 16,
    halaqaId: 'halaqa-asr',
    riwayah: 'قالون',
    currentJuz: 15,
    currentSurah: 18,
    currentAyah: 18,
    errors: {
      '18:10': { hifz: 1, tajweed: 1, updatedAt: YESTERDAY },
    },
  },
  {
    id: 'student-6',
    code: '06',
    name: 'بلال أنس التواتي',
    fatherName: 'أنس التواتي',
    fatherPhone: '0556789012',
    address: 'شارع الفلاح، حي الزيتون',
    age: 13,
    halaqaId: 'halaqa-asr',
    riwayah: 'قالون',
    currentJuz: 6,
    currentSurah: 5,
    currentAyah: 12,
    errors: {
      '5:3': { hifz: 1, tajweed: 2, updatedAt: TODAY },
    },
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: `att-student-1-${TODAY}`, studentId: 'student-1', date: TODAY, status: 'present', note: '' },
  { id: `att-student-2-${TODAY}`, studentId: 'student-2', date: TODAY, status: 'present', note: '' },
  { id: `att-student-3-${TODAY}`, studentId: 'student-3', date: TODAY, status: 'late', note: 'تأخر 10 دقائق' },
  { id: `att-student-4-${TODAY}`, studentId: 'student-4', date: TODAY, status: 'present', note: '' },
  { id: `att-student-5-${TODAY}`, studentId: 'student-5', date: TODAY, status: 'excused', note: 'موعد طبي' },
  { id: `att-student-6-${TODAY}`, studentId: 'student-6', date: TODAY, status: 'absent', note: '' },

  { id: `att-student-1-${YESTERDAY}`, studentId: 'student-1', date: YESTERDAY, status: 'present', note: '' },
  { id: `att-student-2-${YESTERDAY}`, studentId: 'student-2', date: YESTERDAY, status: 'present', note: '' },
  { id: `att-student-3-${YESTERDAY}`, studentId: 'student-3', date: YESTERDAY, status: 'present', note: '' },
  { id: `att-student-4-${YESTERDAY}`, studentId: 'student-4', date: YESTERDAY, status: 'late', note: '' },
  { id: `att-student-5-${YESTERDAY}`, studentId: 'student-5', date: YESTERDAY, status: 'present', note: '' },
  { id: `att-student-6-${YESTERDAY}`, studentId: 'student-6', date: YESTERDAY, status: 'present', note: '' },

  { id: `att-student-1-${TWO_DAYS_AGO}`, studentId: 'student-1', date: TWO_DAYS_AGO, status: 'present', note: '' },
  { id: `att-student-2-${TWO_DAYS_AGO}`, studentId: 'student-2', date: TWO_DAYS_AGO, status: 'absent', note: '' },
  { id: `att-student-3-${TWO_DAYS_AGO}`, studentId: 'student-3', date: TWO_DAYS_AGO, status: 'present', note: '' },
  { id: `att-student-4-${TWO_DAYS_AGO}`, studentId: 'student-4', date: TWO_DAYS_AGO, status: 'present', note: '' },
  { id: `att-student-5-${TWO_DAYS_AGO}`, studentId: 'student-5', date: TWO_DAYS_AGO, status: 'present', note: '' },
  { id: `att-student-6-${TWO_DAYS_AGO}`, studentId: 'student-6', date: TWO_DAYS_AGO, status: 'excused', note: '' },
];

export const INITIAL_TASKS: HifzTask[] = [
  {
    id: 'task-1',
    studentId: 'student-1',
    type: 'sabaq',
    surahNumber: 4,
    ayahRange: '004:027-033',
    juz: 5,
    grade: 'ممتاز',
    completed: true,
    dateLabel: TODAY,
  },
  {
    id: 'task-2',
    studentId: 'student-1',
    type: 'sabqi',
    surahNumber: 3,
    ayahRange: '003:150-200',
    juz: 4,
    grade: 'جيد جداً',
    completed: true,
    dateLabel: TODAY,
  },
  {
    id: 'task-3',
    studentId: 'student-1',
    type: 'manzil',
    surahNumber: 2,
    ayahRange: '002:001-141',
    juz: 1,
    grade: 'جيد',
    completed: false,
    dateLabel: TODAY,
  },
  {
    id: 'task-4',
    studentId: 'student-2',
    type: 'sabaq',
    surahNumber: 7,
    ayahRange: '007:035-050',
    juz: 8,
    grade: 'ممتاز',
    completed: false,
    dateLabel: TODAY,
  },
  {
    id: 'task-5',
    studentId: 'student-4',
    type: 'sabqi',
    surahNumber: 3,
    ayahRange: '003:001-050',
    juz: 3,
    grade: 'ضعيف',
    completed: false,
    dateLabel: TODAY,
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  defaultRiwayah: 'قالون',
  appTheme: 'dark',
  mushafTheme: 'parchment',
  teacherName: 'الشيخ عبد الملك القاسمي',
  showAyahIndicators: true,
  fontSizeScale: 'normal',
};
