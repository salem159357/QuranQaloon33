import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import {
  INITIAL_ATTENDANCE,
  INITIAL_HALAQAS,
  INITIAL_SETTINGS,
  INITIAL_STUDENTS,
  INITIAL_TASKS,
  formatLocalDateISO,
} from '../data/initialState';
import {
  AppSettings,
  AttendanceRecord,
  AttendanceStatus,
  DatabaseStats,
  Halaqa,
  HifzTask,
  RetentionGrade,
  Riwayah,
  Student,
  StudentErrorMap,
} from '../types';

const IDB_NAME = 'sanad_slate_sqlite_db';
const IDB_STORE = 'sqlite_binary';
const IDB_KEY = 'main_db';
const IDB_META_KEY = 'last_saved_at';

let sqlModulePromise: Promise<SqlJsStatic> | null = null;

function getSqlModule(): Promise<SqlJsStatic> {
  if (!sqlModulePromise) {
    sqlModulePromise = initSqlJs({
      locateFile: () => '/sql-wasm.wasm',
    });
  }
  return sqlModulePromise;
}

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readBinaryFromIndexedDb(): Promise<{
  bytes: Uint8Array | null;
  lastSavedAt: string | null;
}> {
  try {
    const idb = await openIndexedDb();
    return await new Promise((resolve) => {
      const tx = idb.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const binReq = store.get(IDB_KEY);
      const metaReq = store.get(IDB_META_KEY);
      let bytes: Uint8Array | null = null;
      let lastSavedAt: string | null = null;
      binReq.onsuccess = () => {
        if (binReq.result instanceof Uint8Array) {
          bytes = binReq.result;
        } else if (binReq.result instanceof ArrayBuffer) {
          bytes = new Uint8Array(binReq.result);
        }
      };
      metaReq.onsuccess = () => {
        if (typeof metaReq.result === 'string') {
          lastSavedAt = metaReq.result;
        }
      };
      tx.oncomplete = () => {
        idb.close();
        resolve({ bytes, lastSavedAt });
      };
      tx.onerror = () => {
        idb.close();
        resolve({ bytes: null, lastSavedAt: null });
      };
    });
  } catch {
    return { bytes: null, lastSavedAt: null };
  }
}

async function writeBinaryToIndexedDb(bytes: Uint8Array): Promise<string> {
  const savedAt = new Date().toISOString();
  try {
    const idb = await openIndexedDb();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(bytes, IDB_KEY);
      store.put(savedAt, IDB_META_KEY);
      tx.oncomplete = () => {
        idb.close();
        resolve();
      };
      tx.onerror = () => {
        idb.close();
        reject(tx.error);
      };
    });
  } catch {
    // Fallback ignored if IndexedDB is restricted
  }
  return savedAt;
}

export function createSchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS halaqas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      group_label TEXT NOT NULL,
      schedule TEXT NOT NULL,
      teacher_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      halaqa_id TEXT NOT NULL,
      riwayah TEXT NOT NULL,
      current_juz INTEGER NOT NULL DEFAULT 1,
      current_surah INTEGER NOT NULL DEFAULT 1,
      current_ayah INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS ayah_errors (
      student_id TEXT NOT NULL,
      surah_number INTEGER NOT NULL,
      ayah_number INTEGER NOT NULL,
      hifz INTEGER NOT NULL DEFAULT 0,
      tajweed INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (student_id, surah_number, ayah_number)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      UNIQUE(student_id, date)
    );

    CREATE TABLE IF NOT EXISTS hifz_tasks (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      type TEXT NOT NULL,
      surah_number INTEGER NOT NULL,
      ayah_range TEXT NOT NULL,
      juz INTEGER NOT NULL,
      grade TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      date_label TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function seedDatabase(db: Database): void {
  db.run('BEGIN TRANSACTION;');
  try {
    const insertHalaqa = db.prepare(
      'INSERT OR REPLACE INTO halaqas (id, name, group_label, schedule, teacher_name) VALUES (?, ?, ?, ?, ?)'
    );
    for (const h of INITIAL_HALAQAS) {
      insertHalaqa.run([h.id, h.name, h.groupLabel, h.schedule, h.teacherName]);
    }
    insertHalaqa.free();

    const insertStudent = db.prepare(
      'INSERT OR REPLACE INTO students (id, code, name, halaqa_id, riwayah, current_juz, current_surah, current_ayah) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const insertError = db.prepare(
      'INSERT OR REPLACE INTO ayah_errors (student_id, surah_number, ayah_number, hifz, tajweed, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const today = formatLocalDateISO(new Date());

    for (const s of INITIAL_STUDENTS) {
      insertStudent.run([
        s.id,
        s.code,
        s.name,
        s.halaqaId,
        s.riwayah,
        s.currentJuz,
        s.currentSurah,
        s.currentAyah,
      ]);

      for (const [key, val] of Object.entries(s.errors)) {
        const [surahStr, ayahStr] = key.split(':');
        insertError.run([
          s.id,
          Number(surahStr),
          Number(ayahStr),
          val.hifz,
          val.tajweed,
          val.updatedAt ?? today,
        ]);
      }
    }
    insertStudent.free();
    insertError.free();

    const insertAtt = db.prepare(
      'INSERT OR REPLACE INTO attendance (id, student_id, date, status, note) VALUES (?, ?, ?, ?, ?)'
    );
    for (const a of INITIAL_ATTENDANCE) {
      insertAtt.run([a.id, a.studentId, a.date, a.status, a.note]);
    }
    insertAtt.free();

    const insertTask = db.prepare(
      'INSERT OR REPLACE INTO hifz_tasks (id, student_id, type, surah_number, ayah_range, juz, grade, completed, date_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const t of INITIAL_TASKS) {
      insertTask.run([
        t.id,
        t.studentId,
        t.type,
        t.surahNumber,
        t.ayahRange,
        t.juz,
        t.grade,
        t.completed ? 1 : 0,
        t.dateLabel,
      ]);
    }
    insertTask.free();

    db.run('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)', [
      'settings',
      JSON.stringify(INITIAL_SETTINGS),
    ]);

    db.run('COMMIT;');
  } catch (err) {
    db.run('ROLLBACK;');
    throw err;
  }
}

export interface HydratedState {
  halaqas: Halaqa[];
  students: Student[];
  attendance: AttendanceRecord[];
  tasks: HifzTask[];
  settings: AppSettings;
}

export function hydrateStateFromDb(db: Database): HydratedState {
  const halaqas: Halaqa[] = [];
  const hStmt = db.prepare(
    'SELECT id, name, group_label, schedule, teacher_name FROM halaqas'
  );
  while (hStmt.step()) {
    const row = hStmt.getAsObject();
    halaqas.push({
      id: String(row.id),
      name: String(row.name),
      groupLabel: String(row.group_label),
      schedule: String(row.schedule),
      teacherName: String(row.teacher_name),
    });
  }
  hStmt.free();

  const errorsByStudent: Record<string, StudentErrorMap> = {};
  const eStmt = db.prepare(
    'SELECT student_id, surah_number, ayah_number, hifz, tajweed, updated_at FROM ayah_errors'
  );
  while (eStmt.step()) {
    const row = eStmt.getAsObject();
    const sid = String(row.student_id);
    if (!errorsByStudent[sid]) errorsByStudent[sid] = {};
    const key = `${row.surah_number}:${row.ayah_number}`;
    errorsByStudent[sid][key] = {
      hifz: Number(row.hifz),
      tajweed: Number(row.tajweed),
      updatedAt: String(row.updated_at),
    };
  }
  eStmt.free();

  const students: Student[] = [];
  const sStmt = db.prepare(
    'SELECT id, code, name, halaqa_id, riwayah, current_juz, current_surah, current_ayah FROM students ORDER BY code ASC'
  );
  while (sStmt.step()) {
    const row = sStmt.getAsObject();
    const id = String(row.id);
    students.push({
      id,
      code: String(row.code),
      name: String(row.name),
      halaqaId: String(row.halaqa_id),
      riwayah: String(row.riwayah) as Riwayah,
      currentJuz: Number(row.current_juz),
      currentSurah: Number(row.current_surah),
      currentAyah: Number(row.current_ayah),
      errors: errorsByStudent[id] ?? {},
    });
  }
  sStmt.free();

  const attendance: AttendanceRecord[] = [];
  const aStmt = db.prepare(
    'SELECT id, student_id, date, status, note FROM attendance ORDER BY date DESC'
  );
  while (aStmt.step()) {
    const row = aStmt.getAsObject();
    attendance.push({
      id: String(row.id),
      studentId: String(row.student_id),
      date: String(row.date),
      status: String(row.status) as AttendanceStatus,
      note: String(row.note ?? ''),
    });
  }
  aStmt.free();

  const tasks: HifzTask[] = [];
  const tStmt = db.prepare(
    'SELECT id, student_id, type, surah_number, ayah_range, juz, grade, completed, date_label FROM hifz_tasks'
  );
  while (tStmt.step()) {
    const row = tStmt.getAsObject();
    tasks.push({
      id: String(row.id),
      studentId: String(row.student_id),
      type: String(row.type) as HifzTask['type'],
      surahNumber: Number(row.surah_number),
      ayahRange: String(row.ayah_range),
      juz: Number(row.juz),
      grade: String(row.grade) as RetentionGrade,
      completed: Number(row.completed) === 1,
      dateLabel: String(row.date_label),
    });
  }
  tStmt.free();

  let settings = INITIAL_SETTINGS;
  const setStmt = db.prepare('SELECT value FROM app_settings WHERE key = ?');
  setStmt.bind(['settings']);
  if (setStmt.step()) {
    try {
      const parsed = JSON.parse(String(setStmt.getAsObject().value));
      settings = { ...INITIAL_SETTINGS, ...parsed };
    } catch {
      settings = INITIAL_SETTINGS;
    }
  }
  setStmt.free();

  return { halaqas, students, attendance, tasks, settings };
}

export class LocalSqliteRepository {
  private db: Database;
  private sql: SqlJsStatic;
  private lastSavedAt: string | null;

  private constructor(sql: SqlJsStatic, db: Database, lastSavedAt: string | null) {
    this.sql = sql;
    this.db = db;
    this.lastSavedAt = lastSavedAt;
  }

  static async init(): Promise<LocalSqliteRepository> {
    const sql = await getSqlModule();
    const { bytes, lastSavedAt } = await readBinaryFromIndexedDb();
    let db: Database;
    let savedTimestamp = lastSavedAt;

    if (bytes && bytes.length > 0) {
      try {
        db = new sql.Database(bytes);
        createSchema(db);
        const countRes = db.exec('SELECT COUNT(*) FROM students');
        const count = Number(countRes[0]?.values[0]?.[0] ?? 0);
        if (count === 0) {
          const hCount = Number(
            db.exec('SELECT COUNT(*) FROM halaqas')[0]?.values[0]?.[0] ?? 0
          );
          if (hCount === 0) {
            seedDatabase(db);
          }
        }
      } catch {
        db = new sql.Database();
        createSchema(db);
        seedDatabase(db);
      }
    } else {
      db = new sql.Database();
      createSchema(db);
      seedDatabase(db);
      savedTimestamp = await writeBinaryToIndexedDb(db.export());
    }

    return new LocalSqliteRepository(sql, db, savedTimestamp);
  }

  getState(): HydratedState {
    return hydrateStateFromDb(this.db);
  }

  async persist(): Promise<string> {
    const bytes = this.db.export();
    this.lastSavedAt = await writeBinaryToIndexedDb(bytes);
    return this.lastSavedAt;
  }

  getStats(): DatabaseStats {
    const bytes = this.db.export();
    const countOf = (table: string) => {
      const res = this.db.exec(`SELECT COUNT(*) FROM ${table}`);
      return Number(res[0]?.values[0]?.[0] ?? 0);
    };
    return {
      sizeBytes: bytes.byteLength,
      studentsCount: countOf('students'),
      halaqasCount: countOf('halaqas'),
      attendanceCount: countOf('attendance'),
      errorsCount: countOf('ayah_errors'),
      tasksCount: countOf('hifz_tasks'),
      lastSavedAt: this.lastSavedAt,
    };
  }

  async upsertStudent(student: Student): Promise<void> {
    this.db.run(
      'INSERT OR REPLACE INTO students (id, code, name, halaqa_id, riwayah, current_juz, current_surah, current_ayah) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        student.id,
        student.code,
        student.name,
        student.halaqaId,
        student.riwayah,
        student.currentJuz,
        student.currentSurah,
        student.currentAyah,
      ]
    );
    await this.persist();
  }

  async deleteStudent(studentId: string): Promise<void> {
    this.db.run('DELETE FROM students WHERE id = ?', [studentId]);
    this.db.run('DELETE FROM ayah_errors WHERE student_id = ?', [studentId]);
    this.db.run('DELETE FROM attendance WHERE student_id = ?', [studentId]);
    this.db.run('DELETE FROM hifz_tasks WHERE student_id = ?', [studentId]);
    await this.persist();
  }

  async setAyahError(
    studentId: string,
    surahNumber: number,
    ayahNumber: number,
    hifz: number,
    tajweed: number
  ): Promise<void> {
    if (hifz <= 0 && tajweed <= 0) {
      this.db.run(
        'DELETE FROM ayah_errors WHERE student_id = ? AND surah_number = ? AND ayah_number = ?',
        [studentId, surahNumber, ayahNumber]
      );
    } else {
      const today = formatLocalDateISO(new Date());
      this.db.run(
        'INSERT OR REPLACE INTO ayah_errors (student_id, surah_number, ayah_number, hifz, tajweed, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [studentId, surahNumber, ayahNumber, hifz, tajweed, today]
      );
    }
    await this.persist();
  }

  async upsertAttendance(record: AttendanceRecord): Promise<void> {
    this.db.run(
      'INSERT OR REPLACE INTO attendance (id, student_id, date, status, note) VALUES (?, ?, ?, ?, ?)',
      [record.id, record.studentId, record.date, record.status, record.note]
    );
    await this.persist();
  }

  async bulkUpsertAttendance(records: AttendanceRecord[]): Promise<void> {
    this.db.run('BEGIN TRANSACTION;');
    try {
      const stmt = this.db.prepare(
        'INSERT OR REPLACE INTO attendance (id, student_id, date, status, note) VALUES (?, ?, ?, ?, ?)'
      );
      for (const r of records) {
        stmt.run([r.id, r.studentId, r.date, r.status, r.note]);
      }
      stmt.free();
      this.db.run('COMMIT;');
    } catch (err) {
      this.db.run('ROLLBACK;');
      throw err;
    }
    await this.persist();
  }

  async upsertHalaqa(halaqa: Halaqa): Promise<void> {
    this.db.run(
      'INSERT OR REPLACE INTO halaqas (id, name, group_label, schedule, teacher_name) VALUES (?, ?, ?, ?, ?)',
      [
        halaqa.id,
        halaqa.name,
        halaqa.groupLabel,
        halaqa.schedule,
        halaqa.teacherName,
      ]
    );
    await this.persist();
  }

  async upsertTask(task: HifzTask): Promise<void> {
    this.db.run(
      'INSERT OR REPLACE INTO hifz_tasks (id, student_id, type, surah_number, ayah_range, juz, grade, completed, date_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        task.id,
        task.studentId,
        task.type,
        task.surahNumber,
        task.ayahRange,
        task.juz,
        task.grade,
        task.completed ? 1 : 0,
        task.dateLabel,
      ]
    );
    await this.persist();
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    this.db.run('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)', [
      'settings',
      JSON.stringify(settings),
    ]);
    await this.persist();
  }

  async resetDemoData(): Promise<HydratedState> {
    this.db.close();
    this.db = new this.sql.Database();
    createSchema(this.db);
    seedDatabase(this.db);
    await this.persist();
    return this.getState();
  }

  /**
   * Exports a valid SQLite binary file (.sqlite) containing students, halaqas,
   * and attendance/errors/tasks filtered to the selected date range [startDate, endDate].
   */
  exportSqliteForDateRange(startDate: string, endDate: string): Uint8Array {
    const exportDb = new this.sql.Database();
    createSchema(exportDb);

    const state = this.getState();

    exportDb.run('BEGIN TRANSACTION;');
    try {
      const insH = exportDb.prepare(
        'INSERT OR REPLACE INTO halaqas (id, name, group_label, schedule, teacher_name) VALUES (?, ?, ?, ?, ?)'
      );
      for (const h of state.halaqas) {
        insH.run([h.id, h.name, h.groupLabel, h.schedule, h.teacherName]);
      }
      insH.free();

      const insS = exportDb.prepare(
        'INSERT OR REPLACE INTO students (id, code, name, halaqa_id, riwayah, current_juz, current_surah, current_ayah) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      for (const s of state.students) {
        insS.run([
          s.id,
          s.code,
          s.name,
          s.halaqaId,
          s.riwayah,
          s.currentJuz,
          s.currentSurah,
          s.currentAyah,
        ]);
      }
      insS.free();

      const insA = exportDb.prepare(
        'INSERT OR REPLACE INTO attendance (id, student_id, date, status, note) VALUES (?, ?, ?, ?, ?)'
      );
      for (const a of state.attendance) {
        if (a.date >= startDate && a.date <= endDate) {
          insA.run([a.id, a.studentId, a.date, a.status, a.note]);
        }
      }
      insA.free();

      const insE = exportDb.prepare(
        'INSERT OR REPLACE INTO ayah_errors (student_id, surah_number, ayah_number, hifz, tajweed, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      );
      for (const s of state.students) {
        for (const [key, err] of Object.entries(s.errors)) {
          const dateOnly = (err.updatedAt ?? formatLocalDateISO(new Date())).slice(0, 10);
          if (dateOnly >= startDate && dateOnly <= endDate) {
            const [surahStr, ayahStr] = key.split(':');
            insE.run([
              s.id,
              Number(surahStr),
              Number(ayahStr),
              err.hifz,
              err.tajweed,
              dateOnly,
            ]);
          }
        }
      }
      insE.free();

      const insT = exportDb.prepare(
        'INSERT OR REPLACE INTO hifz_tasks (id, student_id, type, surah_number, ayah_range, juz, grade, completed, date_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      for (const t of state.tasks) {
        const isDated = /^\d{4}-\d{2}-\d{2}$/.test(t.dateLabel);
        if (!isDated || (t.dateLabel >= startDate && t.dateLabel <= endDate)) {
          insT.run([
            t.id,
            t.studentId,
            t.type,
            t.surahNumber,
            t.ayahRange,
            t.juz,
            t.grade,
            t.completed ? 1 : 0,
            t.dateLabel,
          ]);
        }
      }
      insT.free();

      exportDb.run(
        'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
        ['settings', JSON.stringify(state.settings)]
      );

      exportDb.run('COMMIT;');
      return exportDb.export();
    } finally {
      exportDb.close();
    }
  }

  /**
   * Imports a .sqlite / .db binary file either by replacing the entire DB
   * or merging records within the selected date range [startDate, endDate].
   */
  async importSqliteBytes(
    bytes: Uint8Array,
    mode: 'replace' | 'merge_range',
    startDate: string,
    endDate: string
  ): Promise<{ state: HydratedState; importedAttendance: number; importedErrors: number }> {
    const incomingDb = new this.sql.Database(bytes);
    try {
      createSchema(incomingDb);
      const incoming = hydrateStateFromDb(incomingDb);

      if (mode === 'replace') {
        this.db.close();
        this.db = new this.sql.Database(bytes);
        createSchema(this.db);
        await this.persist();
        const errTotal = incoming.students.reduce(
          (acc, s) => acc + Object.keys(s.errors).length,
          0
        );
        return {
          state: this.getState(),
          importedAttendance: incoming.attendance.length,
          importedErrors: errTotal,
        };
      }

      // Merge mode within [startDate, endDate]
      let importedAttendance = 0;
      let importedErrors = 0;

      this.db.run('BEGIN TRANSACTION;');
      try {
        const insH = this.db.prepare(
          'INSERT OR REPLACE INTO halaqas (id, name, group_label, schedule, teacher_name) VALUES (?, ?, ?, ?, ?)'
        );
        for (const h of incoming.halaqas) {
          insH.run([h.id, h.name, h.groupLabel, h.schedule, h.teacherName]);
        }
        insH.free();

        const insS = this.db.prepare(
          'INSERT OR REPLACE INTO students (id, code, name, halaqa_id, riwayah, current_juz, current_surah, current_ayah) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        for (const s of incoming.students) {
          insS.run([
            s.id,
            s.code,
            s.name,
            s.halaqaId,
            s.riwayah,
            s.currentJuz,
            s.currentSurah,
            s.currentAyah,
          ]);
        }
        insS.free();

        const insA = this.db.prepare(
          'INSERT OR REPLACE INTO attendance (id, student_id, date, status, note) VALUES (?, ?, ?, ?, ?)'
        );
        for (const a of incoming.attendance) {
          if (a.date >= startDate && a.date <= endDate) {
            insA.run([a.id, a.studentId, a.date, a.status, a.note]);
            importedAttendance++;
          }
        }
        insA.free();

        const insE = this.db.prepare(
          'INSERT OR REPLACE INTO ayah_errors (student_id, surah_number, ayah_number, hifz, tajweed, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
        );
        for (const s of incoming.students) {
          for (const [key, err] of Object.entries(s.errors)) {
            const dateOnly = (err.updatedAt ?? formatLocalDateISO(new Date())).slice(0, 10);
            if (dateOnly >= startDate && dateOnly <= endDate) {
              const [surahStr, ayahStr] = key.split(':');
              insE.run([
                s.id,
                Number(surahStr),
                Number(ayahStr),
                err.hifz,
                err.tajweed,
                dateOnly,
              ]);
              importedErrors++;
            }
          }
        }
        insE.free();

        this.db.run('COMMIT;');
      } catch (err) {
        this.db.run('ROLLBACK;');
        throw err;
      }

      await this.persist();
      return {
        state: this.getState(),
        importedAttendance,
        importedErrors,
      };
    } finally {
      incomingDb.close();
    }
  }
}
