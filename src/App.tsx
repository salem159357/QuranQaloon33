import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  Settings,
  Users,
} from 'lucide-react';
import { AttendanceScreen } from './components/AttendanceScreen';
import { HalaqasScreen } from './components/HalaqasScreen';
import {
  AddHalaqaModal,
  ConfirmDeleteModal,
  StudentFormModal,
  StudentFormPayload,
} from './components/Modals';
import { MushafScreen } from './components/MushafScreen';
import { PlannerScreen } from './components/PlannerScreen';
import { ReportModal } from './components/ReportModal';
import { SettingsScreen } from './components/SettingsScreen';
import { StudentsScreen } from './components/StudentsScreen';
import { SurahsScreen } from './components/SurahsScreen';
import {
  INITIAL_ATTENDANCE,
  INITIAL_HALAQAS,
  INITIAL_SETTINGS,
  INITIAL_STUDENTS,
  INITIAL_TASKS,
  formatLocalDateISO,
} from './data/initialState';
import { getPageForSurah, MUSHAF_PAGES } from './data/quranData';
import { LocalSqliteRepository } from './db/sqliteDb';
import {
  AppSettings,
  AppTab,
  AttendanceRecord,
  AttendanceStatus,
  DatabaseStats,
  Halaqa,
  HifzTask,
  RetentionGrade,
  Riwayah,
  Student,
} from './types';

export default function App() {
  const repoRef = useRef<LocalSqliteRepository | null>(null);

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [halaqas, setHalaqas] = useState<Halaqa[]>(INITIAL_HALAQAS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [tasks, setTasks] = useState<HifzTask[]>(INITIAL_TASKS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);

  const [activeTab, setActiveTab] = useState<AppTab>('students');
  const [mobileRoute, setMobileRoute] = useState<'list' | 'surahs' | 'mushaf'>('list');

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    INITIAL_STUDENTS[0]?.id ?? 'student-1'
  );
  const [activeMushafPageNumber, setActiveMushafPageNumber] = useState<number>(83);
  const [activeSurahForMushaf, setActiveSurahForMushaf] = useState<number>(4);

  const [attendanceDate, setAttendanceDate] = useState<string>(() =>
    formatLocalDateISO(new Date())
  );

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [showAddHalaqa, setShowAddHalaqa] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showProfileBanner, setShowProfileBanner] = useState(false);
  const [reportConfig, setReportConfig] = useState<{
    open: boolean;
    initialHalaqaId: string;
  }>({ open: false, initialHalaqaId: 'all' });

  // Sync Tailwind dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.appTheme === 'dark');
  }, [settings.appTheme]);

  // Initialize on-device SQLite (sql.js + IndexedDB binary store)
  useEffect(() => {
    let active = true;
    LocalSqliteRepository.init()
      .then((repo) => {
        if (!active) return;
        repoRef.current = repo;
        const hydrated = repo.getState();
        setHalaqas(hydrated.halaqas);
        setStudents(hydrated.students);
        setAttendance(hydrated.attendance);
        setTasks(hydrated.tasks);
        setSettings(hydrated.settings);
        setDbStats(repo.getStats());
        if (hydrated.students[0]) {
          setSelectedStudentId((prev) =>
            hydrated.students.some((s) => s.id === prev)
              ? prev
              : hydrated.students[0].id
          );
        }
      })
      .catch(() => {
        // Keep in-memory initial state if Wasm fails to initialize
      });
    return () => {
      active = false;
    };
  }, []);

  const refreshStats = () => {
    if (repoRef.current) {
      setDbStats(repoRef.current.getStats());
    }
  };

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? students[0],
    [students, selectedStudentId]
  );

  const activeMushafPage = useMemo(
    () =>
      MUSHAF_PAGES[activeMushafPageNumber] ??
      getPageForSurah(activeSurahForMushaf),
    [activeMushafPageNumber, activeSurahForMushaf]
  );

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab('students');
    setMobileRoute('surahs');
  };

  const handleOpenMushafForSurah = (surahNumber: number) => {
    const targetPage = getPageForSurah(surahNumber);
    setActiveSurahForMushaf(surahNumber);
    setActiveMushafPageNumber(targetPage.pageNumber);
    setMobileRoute('mushaf');
  };

  const handleUpdateAyahError = (
    studentId: string,
    surahNumber: number,
    ayahNumber: number,
    type: 'hifz' | 'tajweed',
    delta: number
  ) => {
    const key = `${surahNumber}:${ayahNumber}`;
    const today = formatLocalDateISO(new Date());
    const targetStudent = students.find((s) => s.id === studentId);
    const current = targetStudent?.errors[key] ?? { hifz: 0, tajweed: 0 };
    const nextVal = Math.max(0, current[type] + delta);
    const updated = { ...current, [type]: nextVal, updatedAt: today };

    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;
        const nextErrors = { ...student.errors };
        if (updated.hifz === 0 && updated.tajweed === 0) {
          delete nextErrors[key];
        } else {
          nextErrors[key] = updated;
        }
        return { ...student, errors: nextErrors };
      })
    );

    if (repoRef.current) {
      void repoRef.current
        .setAyahError(
          studentId,
          surahNumber,
          ayahNumber,
          updated.hifz,
          updated.tajweed
        )
        .then(refreshStats);
    }
  };

  const handleAddStudent = (data: StudentFormPayload) => {
    const nextNumber = students.length + 1;
    const code = String(nextNumber).padStart(2, '0');
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      code,
      name: data.name,
      fatherName: data.fatherName,
      fatherPhone: data.fatherPhone,
      address: data.address,
      age: data.age,
      halaqaId: data.halaqaId,
      riwayah: data.riwayah,
      currentJuz: 1,
      currentSurah: 1,
      currentAyah: 1,
      errors: {},
    };
    setStudents((prev) => [...prev, newStudent]);
    setSelectedStudentId(newStudent.id);
    if (repoRef.current) {
      void repoRef.current.upsertStudent(newStudent).then(refreshStats);
    }
  };

  const handleEditStudent = (studentId: string, data: StudentFormPayload) => {
    const existing = students.find((s) => s.id === studentId);
    if (!existing) return;
    const updatedStudent: Student = {
      ...existing,
      name: data.name,
      fatherName: data.fatherName,
      fatherPhone: data.fatherPhone,
      address: data.address,
      age: data.age,
      halaqaId: data.halaqaId,
      riwayah: data.riwayah,
    };
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? updatedStudent : s))
    );
    if (repoRef.current) {
      void repoRef.current.upsertStudent(updatedStudent).then(refreshStats);
    }
  };

  const handleConfirmDeleteStudent = () => {
    if (!studentToDelete) return;
    const deletedId = studentToDelete.id;
    setStudents((prev) => {
      const remaining = prev.filter((s) => s.id !== deletedId);
      if (selectedStudentId === deletedId && remaining[0]) {
        setSelectedStudentId(remaining[0].id);
      }
      return remaining;
    });
    setTasks((prev) => prev.filter((t) => t.studentId !== deletedId));
    setAttendance((prev) => prev.filter((a) => a.studentId !== deletedId));
    setStudentToDelete(null);

    if (repoRef.current) {
      void repoRef.current.deleteStudent(deletedId).then(refreshStats);
    }
  };

  const handleChangeStudentRiwayah = (studentId: string, riwayah: Riwayah) => {
    const existing = students.find((s) => s.id === studentId);
    const updatedStudent = existing ? { ...existing, riwayah } : null;
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, riwayah } : s))
    );
    if (updatedStudent && repoRef.current) {
      void repoRef.current.upsertStudent(updatedStudent).then(refreshStats);
    }
  };

  const handleAddHalaqa = (data: { name: string; schedule: string }) => {
    const newHalaqa: Halaqa = {
      id: `halaqa-${Date.now()}`,
      name: data.name,
      groupLabel: `المجموعة ${halaqas.length + 1} • ${data.name}`,
      schedule: data.schedule,
      teacherName: settings.teacherName,
    };
    setHalaqas((prev) => [...prev, newHalaqa]);
    if (repoRef.current) {
      void repoRef.current.upsertHalaqa(newHalaqa).then(refreshStats);
    }
  };

  const handleMarkAttendance = (
    studentId: string,
    date: string,
    status: AttendanceStatus,
    note = ''
  ) => {
    const record: AttendanceRecord = {
      id: `att-${studentId}-${date}`,
      studentId,
      date,
      status,
      note,
    };
    setAttendance((prev) => {
      const idx = prev.findIndex(
        (a) => a.studentId === studentId && a.date === date
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });
    if (repoRef.current) {
      void repoRef.current.upsertAttendance(record).then(refreshStats);
    }
  };

  const handleBulkMarkPresent = (studentIds: string[], date: string) => {
    const existingNotes: Record<string, string> = {};
    for (const a of attendance) {
      if (a.date === date) existingNotes[a.studentId] = a.note;
    }

    const batch: AttendanceRecord[] = studentIds.map((studentId) => ({
      id: `att-${studentId}-${date}`,
      studentId,
      date,
      status: 'present',
      note: existingNotes[studentId] ?? '',
    }));

    setAttendance((prev) => {
      const map = new Map<string, AttendanceRecord>();
      for (const item of prev) {
        map.set(`${item.studentId}::${item.date}`, item);
      }
      for (const item of batch) {
        map.set(`${item.studentId}::${item.date}`, item);
      }
      return Array.from(map.values());
    });

    if (repoRef.current) {
      void repoRef.current.bulkUpsertAttendance(batch).then(refreshStats);
    }
  };

  const handleToggleTask = (taskId: string) => {
    const existing = tasks.find((t) => t.id === taskId);
    const updatedTask = existing
      ? { ...existing, completed: !existing.completed }
      : null;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    if (updatedTask && repoRef.current) {
      void repoRef.current.upsertTask(updatedTask).then(refreshStats);
    }
  };

  const handleChangeTaskGrade = (taskId: string, grade: RetentionGrade) => {
    const existing = tasks.find((t) => t.id === taskId);
    const updatedTask = existing ? { ...existing, grade } : null;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, grade } : t))
    );
    if (updatedTask && repoRef.current) {
      void repoRef.current.upsertTask(updatedTask).then(refreshStats);
    }
  };

  const handleAddTask = (task: Omit<HifzTask, 'id'>) => {
    const created: HifzTask = { ...task, id: `task-${Date.now()}` };
    setTasks((prev) => [created, ...prev]);
    if (repoRef.current) {
      void repoRef.current.upsertTask(created).then(refreshStats);
    }
  };

  const handleUpdateSettings = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (repoRef.current) {
      void repoRef.current.saveSettings(next).then(refreshStats);
    }
  };

  const handleToggleAppTheme = () => {
    handleUpdateSettings({
      appTheme: settings.appTheme === 'dark' ? 'light' : 'dark',
    });
  };

  const handleSaveDbLocally = async () => {
    if (repoRef.current) {
      await repoRef.current.persist();
      refreshStats();
    }
  };

  const handleExportDbRange = (startDate: string, endDate: string) => {
    if (!repoRef.current) return null;
    return repoRef.current.exportSqliteForDateRange(startDate, endDate);
  };

  const handleImportDbFile = async (
    bytes: Uint8Array,
    mode: 'replace' | 'merge_range',
    startDate: string,
    endDate: string
  ) => {
    if (!repoRef.current) {
      throw new Error('SQLite not initialized');
    }
    const result = await repoRef.current.importSqliteBytes(
      bytes,
      mode,
      startDate,
      endDate
    );
    setHalaqas(result.state.halaqas);
    setStudents(result.state.students);
    setAttendance(result.state.attendance);
    setTasks(result.state.tasks);
    setSettings(result.state.settings);
    if (result.state.students[0]) {
      setSelectedStudentId(result.state.students[0].id);
    }
    refreshStats();
    return {
      importedAttendance: result.importedAttendance,
      importedErrors: result.importedErrors,
    };
  };

  const handleResetDemoData = async () => {
    if (repoRef.current) {
      const resetState = await repoRef.current.resetDemoData();
      setHalaqas(resetState.halaqas);
      setStudents(resetState.students);
      setAttendance(resetState.attendance);
      setTasks(resetState.tasks);
      setSettings(resetState.settings);
      refreshStats();
    } else {
      setStudents(INITIAL_STUDENTS);
      setHalaqas(INITIAL_HALAQAS);
      setAttendance(INITIAL_ATTENDANCE);
      setTasks(INITIAL_TASKS);
      setSettings(INITIAL_SETTINGS);
    }
    setSelectedStudentId(INITIAL_STUDENTS[0].id);
    setActiveMushafPageNumber(83);
  };

  const renderPrimaryTabContent = () => {
    if (activeTab === 'halaqas') {
      return (
        <HalaqasScreen
          halaqas={halaqas}
          students={students}
          onOpenAddHalaqa={() => setShowAddHalaqa(true)}
          onSelectStudentFromHalaqa={handleSelectStudent}
          onOpenReportModal={(halaqaId = 'all') =>
            setReportConfig({ open: true, initialHalaqaId: halaqaId })
          }
        />
      );
    }
    if (activeTab === 'attendance') {
      return (
        <AttendanceScreen
          students={students}
          halaqas={halaqas}
          attendance={attendance}
          selectedDate={attendanceDate}
          onChangeDate={setAttendanceDate}
          onMarkAttendance={handleMarkAttendance}
          onBulkMarkPresent={handleBulkMarkPresent}
          onOpenReportModal={(initialHalaqaId = 'all') =>
            setReportConfig({ open: true, initialHalaqaId })
          }
        />
      );
    }
    if (activeTab === 'planner') {
      return (
        <PlannerScreen
          tasks={tasks}
          students={students}
          onToggleTask={handleToggleTask}
          onChangeGrade={handleChangeTaskGrade}
          onAddTask={handleAddTask}
        />
      );
    }
    if (activeTab === 'settings') {
      return (
        <SettingsScreen
          settings={settings}
          dbStats={dbStats}
          onUpdateSettings={handleUpdateSettings}
          onSaveDbLocally={handleSaveDbLocally}
          onExportDbRange={handleExportDbRange}
          onImportDbFile={handleImportDbFile}
          onResetDemoData={handleResetDemoData}
        />
      );
    }
    return (
      <StudentsScreen
        students={students}
        halaqas={halaqas}
        selectedStudentId={selectedStudent?.id ?? ''}
        appTheme={settings.appTheme}
        onToggleAppTheme={handleToggleAppTheme}
        onSelectStudent={handleSelectStudent}
        onOpenAddStudent={() => setShowAddStudent(true)}
        onEditStudent={(student) => setStudentToEdit(student)}
        onRequestDeleteStudent={(student) => setStudentToDelete(student)}
        onOpenProfileModal={() => setShowProfileBanner((prev) => !prev)}
        onOpenReportModal={(halaqaFilter) =>
          setReportConfig({ open: true, initialHalaqaId: halaqaFilter })
        }
      />
    );
  };

  const navItems: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'students', label: 'الطلاب', icon: <Users className="w-5 h-5" /> },
    { id: 'halaqas', label: 'الحلقات', icon: <BookOpen className="w-5 h-5" /> },
    {
      id: 'attendance',
      label: 'الحضور',
      icon: <CalendarCheck2 className="w-5 h-5" />,
    },
    { id: 'planner', label: 'الخطة', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
  ];

  const resolvedMushafPage = useMemo(() => {
    if (MUSHAF_PAGES[activeMushafPageNumber]) {
      return MUSHAF_PAGES[activeMushafPageNumber];
    }
    return activeMushafPage;
  }, [activeMushafPageNumber, activeMushafPage]);

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-[#e9eeec] dark:bg-[#0e0e0e] text-[#141716] dark:text-[#e5e2e1] transition-colors"
    >
      {/* Interactive App Shell (hidden during print) */}
      <div className="no-print">
        {showProfileBanner && (
          <div className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 bg-white dark:bg-[#1e1e1f] border border-[#d5deda] dark:border-[#3e4944] rounded-xl p-3.5 shadow-2xl flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-[#006c52] dark:text-[#6fdab5] font-semibold">
                المشرف الحالي
              </p>
              <p className="text-[14px] font-bold text-[#141716] dark:text-[#e5e2e1] mt-0.5">
                {settings.teacherName}
              </p>
              <p className="text-[11px] text-[#52605a] dark:text-[#a0a0a0] mt-0.5">
                {halaqas.length} حلقات · {students.length} طلاب
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowProfileBanner(false)}
              className="px-2.5 py-1 rounded-lg bg-[#eef2f0] dark:bg-[#2a2a2a] text-[12px] text-[#141716] dark:text-[#e5e2e1]"
            >
              حسناً
            </button>
          </div>
        )}

        {/* Unified Single-Screen App View (Mobile & Desktop) */}
        <div className="flex flex-col h-dvh w-full max-w-4xl mx-auto bg-[#f4f6f5] dark:bg-[#131313] lg:border-x lg:border-[#d5deda] dark:lg:border-[#242424] overflow-hidden">
          <main className="flex-1 min-h-0 overflow-hidden">
            {activeTab === 'students' && mobileRoute === 'mushaf' && selectedStudent ? (
              <MushafScreen
                student={selectedStudent}
                page={resolvedMushafPage}
                theme={settings.mushafTheme}
                onToggleTheme={() =>
                  handleUpdateSettings({
                    mushafTheme:
                      settings.mushafTheme === 'parchment' ? 'slate' : 'parchment',
                  })
                }
                onSelectPage={(pageNum) => setActiveMushafPageNumber(pageNum)}
                onUpdateAyahError={handleUpdateAyahError}
                onBackToSurahs={() => setMobileRoute('surahs')}
              />
            ) : activeTab === 'students' && mobileRoute === 'surahs' && selectedStudent ? (
              <SurahsScreen
                student={selectedStudent}
                onBackToStudents={() => setMobileRoute('list')}
                onOpenMushafForSurah={handleOpenMushafForSurah}
                onChangeStudentRiwayah={handleChangeStudentRiwayah}
              />
            ) : (
              renderPrimaryTabContent()
            )}
          </main>

          {/* Bottom Navigation Bar */}
          {(activeTab !== 'students' || mobileRoute === 'list') && (
            <nav
              aria-label="التنقل الرئيسي"
              className="h-16 bg-white dark:bg-[#1b1b1c] border-t border-[#d5deda] dark:border-[#262626] grid grid-cols-5 items-center shrink-0 pb-[env(safe-area-inset-bottom)]"
            >
              {navItems.map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === 'students') {
                        setMobileRoute('list');
                      }
                    }}
                    className={`h-full flex flex-col items-center justify-center gap-1 transition-colors ${
                      active
                        ? 'text-[#006c52] dark:text-[#6fdab5]'
                        : 'text-[#52605a] dark:text-[#87948d] hover:text-[#141716] dark:hover:text-[#e5e2e1]'
                    }`}
                  >
                    {item.icon}
                    <span className="text-[11px] font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Modals */}
        {showAddStudent && (
          <StudentFormModal
            halaqas={halaqas}
            defaultRiwayah={settings.defaultRiwayah}
            onClose={() => setShowAddStudent(false)}
            onSubmit={handleAddStudent}
          />
        )}

        {studentToEdit && (
          <StudentFormModal
            halaqas={halaqas}
            defaultRiwayah={settings.defaultRiwayah}
            initialStudent={studentToEdit}
            onClose={() => setStudentToEdit(null)}
            onSubmit={(data) => handleEditStudent(studentToEdit.id, data)}
          />
        )}

        {showAddHalaqa && (
          <AddHalaqaModal
            onClose={() => setShowAddHalaqa(false)}
            onSubmit={handleAddHalaqa}
          />
        )}

        {studentToDelete && (
          <ConfirmDeleteModal
            student={studentToDelete}
            onCancel={() => setStudentToDelete(null)}
            onConfirm={handleConfirmDeleteStudent}
          />
        )}
      </div>

      {/* Printable Report Modal (contains both interactive UI .no-print and printable .print-only-root) */}
      {reportConfig.open && (
        <ReportModal
          students={students}
          halaqas={halaqas}
          attendance={attendance}
          tasks={tasks}
          teacherName={settings.teacherName}
          initialHalaqaId={reportConfig.initialHalaqaId}
          onClose={() => setReportConfig({ open: false, initialHalaqaId: 'all' })}
        />
      )}
    </div>
  );
}
