export type Riwayah = 'قالون' | 'حفص' | 'ورش';

export type AppTab = 'students' | 'halaqas' | 'attendance' | 'planner' | 'settings';

export type StudentViewMode = 'surahs' | 'mushaf';

export type RetentionGrade = 'ممتاز' | 'جيد جداً' | 'جيد' | 'ضعيف';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note: string;
}

export interface Halaqa {
  id: string;
  name: string;
  groupLabel: string;
  schedule: string;
  teacherName: string;
}

export interface AyahErrorCount {
  hifz: number;
  tajweed: number;
  note?: string;
  updatedAt?: string;
}

// Keyed by `${surahNumber}:${ayahNumber}`
export type StudentErrorMap = Record<string, AyahErrorCount>;

export interface Student {
  id: string;
  code: string;
  name: string;
  fatherName: string;
  fatherPhone: string;
  address: string;
  age: number | null;
  halaqaId: string;
  riwayah: Riwayah;
  currentJuz: number;
  currentSurah: number;
  currentAyah: number;
  errors: StudentErrorMap;
}

export interface HifzTask {
  id: string;
  studentId: string;
  type: 'sabaq' | 'sabqi' | 'manzil';
  surahNumber: number;
  ayahRange: string;
  juz: number;
  grade: RetentionGrade;
  completed: boolean;
  dateLabel: string;
}

export interface SurahInfo {
  number: number;
  nameArabic: string;
  nameLatin: string;
  revelation: 'مكية' | 'مدنية';
  ayahCount: number;
  startPage: number;
  juz: number;
}

export interface MushafAyah {
  surahNumber: number;
  ayahNumber: number;
  text: string;
  hasHizbQuarter?: boolean;
}

export interface MushafPage {
  pageNumber: number;
  surahNumber: number;
  surahNameLatin: string;
  surahNameArabic: string;
  juzNumber: number;
  ayahs: MushafAyah[];
}

export interface AppSettings {
  defaultRiwayah: Riwayah;
  appTheme: 'dark' | 'light';
  mushafTheme: 'parchment' | 'slate';
  teacherName: string;
  showAyahIndicators: boolean;
  fontSizeScale: 'compact' | 'normal' | 'large';
}

export interface DatabaseStats {
  sizeBytes: number;
  studentsCount: number;
  halaqasCount: number;
  attendanceCount: number;
  errorsCount: number;
  tasksCount: number;
  lastSavedAt: string | null;
}
