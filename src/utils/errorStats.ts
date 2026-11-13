import { Student, StudentErrorMap } from '../types';

export interface ErrorTotals {
  hifz: number;
  tajweed: number;
  total: number;
}

export function getStudentTotalErrors(errors: StudentErrorMap): ErrorTotals {
  let hifz = 0;
  let tajweed = 0;
  for (const key of Object.keys(errors)) {
    hifz += errors[key].hifz;
    tajweed += errors[key].tajweed;
  }
  return { hifz, tajweed, total: hifz + tajweed };
}

export function getSurahErrorsForStudent(
  student: Student,
  surahNumber: number
): ErrorTotals {
  let hifz = 0;
  let tajweed = 0;
  const prefix = `${surahNumber}:`;
  for (const key of Object.keys(student.errors)) {
    if (key.startsWith(prefix)) {
      hifz += student.errors[key].hifz;
      tajweed += student.errors[key].tajweed;
    }
  }
  return { hifz, tajweed, total: hifz + tajweed };
}

export function getAyahErrorsForStudent(
  student: Student,
  surahNumber: number,
  ayahNumber: number
): { hifz: number; tajweed: number } {
  const key = `${surahNumber}:${ayahNumber}`;
  return student.errors[key] ?? { hifz: 0, tajweed: 0 };
}
