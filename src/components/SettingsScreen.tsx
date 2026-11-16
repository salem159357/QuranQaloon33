import React, { useRef, useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Database,
  Download,
  FileArchive,
  HardDrive,
  Loader2,
  Moon,
  RotateCcw,
  Share2,
  Sun,
  Upload,
} from 'lucide-react';
import {
  FLUTTER_PROJECT_FILES,
  downloadFlutterProjectZip,
} from '../data/flutterProjectZip';
import { offsetDaysISO } from '../data/initialState';
import { AppSettings, DatabaseStats, Riwayah } from '../types';

interface SettingsScreenProps {
  settings: AppSettings;
  dbStats: DatabaseStats | null;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onSaveDbLocally: () => Promise<void>;
  onExportDbRange: (startDate: string, endDate: string) => Uint8Array | null;
  onImportDbFile: (
    bytes: Uint8Array,
    mode: 'replace' | 'merge_range',
    startDate: string,
    endDate: string
  ) => Promise<{ importedAttendance: number; importedErrors: number }>;
  onResetDemoData: () => Promise<void>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  dbStats,
  onUpdateSettings,
  onSaveDbLocally,
  onExportDbRange,
  onImportDbFile,
  onResetDemoData,
}) => {
  const [showFlutterModal, setShowFlutterModal] = useState(false);
  const [activeFilePath, setActiveFilePath] = useState<string>(
    FLUTTER_PROJECT_FILES[2].path
  );
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Date range for DB Save/Export/Send/Import
  const [startDate, setStartDate] = useState<string>(offsetDaysISO(-30));
  const [endDate, setEndDate] = useState<string>(offsetDaysISO(0));
  const [importMode, setImportMode] = useState<'merge_range' | 'replace'>(
    'merge_range'
  );
  const [dbFeedback, setDbFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeCode =
    FLUTTER_PROJECT_FILES.find((f) => f.path === activeFilePath)?.content ??
    FLUTTER_PROJECT_FILES[0].content;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadFlutterZip = async () => {
    if (isZipping) return;
    setIsZipping(true);
    try {
      const filename = await downloadFlutterProjectZip();
      setDbFeedback({
        type: 'success',
        message: `تم تحميل مشروع Flutter الكامل (${filename}) بنجاح.`,
      });
    } catch {
      setDbFeedback({
        type: 'error',
        message: 'تعذر ضغط مشروع Flutter.',
      });
    } finally {
      setIsZipping(false);
    }
  };

  const handleSaveLocally = async () => {
    try {
      await onSaveDbLocally();
      setDbFeedback({
        type: 'success',
        message: 'تم حفظ نسخة قاعدة بيانات SQLite على الجهاز بنجاح.',
      });
    } catch {
      setDbFeedback({
        type: 'error',
        message: 'تعذر حفظ قاعدة البيانات محلياً.',
      });
    }
  };

  const triggerDownload = (bytes: Uint8Array, filename: string) => {
    const copy = new Uint8Array(bytes);
    const blob = new Blob([copy], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const bytes = onExportDbRange(startDate, endDate);
    if (!bytes) {
      setDbFeedback({
        type: 'error',
        message: 'قاعدة البيانات غير جاهزة للتصدير بعد.',
      });
      return;
    }
    const filename = `sanad-slate-${startDate}-to-${endDate}.sqlite`;
    triggerDownload(bytes, filename);
    setDbFeedback({
      type: 'success',
      message: `تم تصدير ملف SQLite (${filename}) للمدة المختارة.`,
    });
  };

  const handleSendShare = async () => {
    const bytes = onExportDbRange(startDate, endDate);
    if (!bytes) return;
    const filename = `sanad-slate-${startDate}-to-${endDate}.sqlite`;
    const copy = new Uint8Array(bytes);
    const file = new File([copy], filename, {
      type: 'application/x-sqlite3',
    });

    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          title: 'قاعدة بيانات Sanad Slate',
          text: `نسخة قاعدة بيانات الحلقات والحضور للمدة من ${startDate} إلى ${endDate}`,
          files: [file],
        });
        setDbFeedback({
          type: 'success',
          message: 'تم فتح نافذة الإرسال والمشاركة لملف SQLite.',
        });
        return;
      } catch {
        // User cancelled share or browser blocked inside iframe; fallback to download
      }
    }

    triggerDownload(bytes, filename);
    setDbFeedback({
      type: 'success',
      message:
        'تم تنزيل ملف قاعدة البيانات (.sqlite) لتتمكن من إرساله عبر التطبيقات.',
    });
  };

  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const res = await onImportDbFile(bytes, importMode, startDate, endDate);
      setDbFeedback({
        type: 'success',
        message:
          importMode === 'replace'
            ? 'تم استيراد واستبدال قاعدة بيانات SQLite بالكامل.'
            : `تم توريد ودمج البيانات للمدة المختارة (${res.importedAttendance} سجل حضور، ${res.importedErrors} سجل أخطاء).`,
      });
    } catch {
      setDbFeedback({
        type: 'error',
        message: 'الملف المختار ليس قاعدة بيانات SQLite صالحة.',
      });
    }
  };

  const formatKb = (bytes?: number) => {
    if (!bytes) return '0 KB';
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f6f5] dark:bg-[#131313] text-[#141716] dark:text-[#e5e2e1]">
      <header className="h-14 px-4 flex items-center justify-between border-b border-[#d9e0dd] dark:border-[#202020] shrink-0">
        <h1 className="text-[20px] font-bold text-[#141716] dark:text-[#e5e2e1]">
          الإعدادات
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-8">
        {/* App Day / Night Mode Selector */}
        <section className="bg-white dark:bg-[#1b1b1c] border border-[#d5deda] dark:border-[#2a2a2a] rounded-xl p-4 space-y-3">
          <h2 className="text-[14px] font-bold text-[#006c52] dark:text-[#6fdab5]">
            مظهر التطبيق (رؤية نهار / ليل)
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdateSettings({ appTheme: 'light' })}
              className={`h-11 rounded-xl text-[13px] font-semibold border flex items-center justify-center gap-2 transition-colors ${
                settings.appTheme === 'light'
                  ? 'bg-[#006c52] text-white border-[#006c52]'
                  : 'bg-[#f4f6f5] dark:bg-[#131313] text-[#141716] dark:text-[#e5e2e1] border-[#d5deda] dark:border-[#2f2f2f]'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>رؤية نهار (فاتح)</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ appTheme: 'dark' })}
              className={`h-11 rounded-xl text-[13px] font-semibold border flex items-center justify-center gap-2 transition-colors ${
                settings.appTheme === 'dark'
                  ? 'bg-[#6fdab5] text-[#002117] border-[#6fdab5] font-bold'
                  : 'bg-[#f4f6f5] dark:bg-[#131313] text-[#141716] dark:text-[#e5e2e1] border-[#d5deda] dark:border-[#2f2f2f]'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>رؤية ليل (داكن)</span>
            </button>
          </div>
        </section>

        {/* SQLite On-Device Database Management */}
        <section className="bg-white dark:bg-[#1b1b1c] border border-[#d5deda] dark:border-[#2a2a2a] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[14px] font-bold text-[#006c52] dark:text-[#6fdab5] flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>قاعدة بيانات SQLite على الجهاز</span>
            </h2>
            <span className="font-mono-metric text-[11px] text-[#52605a] dark:text-[#a0a0a0]">
              {formatKb(dbStats?.sizeBytes)}
            </span>
          </div>

          {dbStats && (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-[#f4f6f5] dark:bg-[#131314] border border-[#d5deda] dark:border-[#252528] rounded-lg py-2 px-1">
                <p className="font-mono-metric text-[14px] font-bold text-[#141716] dark:text-[#e5e2e1]">
                  {dbStats.studentsCount}
                </p>
                <p className="text-[10px] text-[#52605a] dark:text-[#87948d]">
                  الطلاب
                </p>
              </div>
              <div className="bg-[#f4f6f5] dark:bg-[#131314] border border-[#d5deda] dark:border-[#252528] rounded-lg py-2 px-1">
                <p className="font-mono-metric text-[14px] font-bold text-[#006c52] dark:text-[#6fdab5]">
                  {dbStats.attendanceCount}
                </p>
                <p className="text-[10px] text-[#52605a] dark:text-[#87948d]">
                  الحضور
                </p>
              </div>
              <div className="bg-[#f4f6f5] dark:bg-[#131314] border border-[#d5deda] dark:border-[#252528] rounded-lg py-2 px-1">
                <p className="font-mono-metric text-[14px] font-bold text-[#b45309] dark:text-[#f5bd6a]">
                  {dbStats.errorsCount}
                </p>
                <p className="text-[10px] text-[#52605a] dark:text-[#87948d]">
                  الأخطاء
                </p>
              </div>
              <div className="bg-[#f4f6f5] dark:bg-[#131314] border border-[#d5deda] dark:border-[#252528] rounded-lg py-2 px-1">
                <p className="font-mono-metric text-[14px] font-bold text-[#3c4843] dark:text-[#bdcac2]">
                  {dbStats.tasksCount}
                </p>
                <p className="text-[10px] text-[#52605a] dark:text-[#87948d]">
                  الخطط
                </p>
              </div>
            </div>
          )}

          {/* Date Range Selector */}
          <div className="space-y-2 pt-2 border-t border-[#e4eae7] dark:border-[#262628]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[12px] font-semibold text-[#141716] dark:text-[#e5e2e1]">
                المدة المختارة للتصدير والإرسال والتوريد:
              </span>
              <div className="flex items-center gap-1">
                {[
                  { label: 'اليوم', days: 0 },
                  { label: '7 أيام', days: -7 },
                  { label: '30 يوماً', days: -30 },
                  { label: 'الكل', days: -3650 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setStartDate(offsetDaysISO(preset.days));
                      setEndDate(offsetDaysISO(0));
                    }}
                    className="px-2 py-1 rounded-md bg-[#eef2f0] hover:bg-[#e1e7e4] dark:bg-[#242426] dark:hover:bg-[#2f2f32] text-[11px] text-[#3c4843] dark:text-[#bdcac2]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-[#52605a] dark:text-[#a0a0a0] mb-1">
                  من تاريخ
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 bg-[#f4f6f5] dark:bg-[#131314] border border-[#d5deda] dark:border-[#2f2f33] focus:border-[#006c52] dark:focus:border-[#6fdab5] rounded-lg px-2.5 font-mono-metric text-[12px] text-[#141716] dark:text-[#e5e2e1] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#52605a] dark:text-[#a0a0a0] mb-1">
                  إلى تاريخ
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-10 bg-[#f4f6f5] dark:bg-[#131314] border border-[#d5deda] dark:border-[#2f2f33] focus:border-[#006c52] dark:focus:border-[#6fdab5] rounded-lg px-2.5 font-mono-metric text-[12px] text-[#141716] dark:text-[#e5e2e1] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Import Mode Selector */}
          <div className="space-y-1.5">
            <span className="block text-[11px] text-[#52605a] dark:text-[#a0a0a0]">
              طريقة التوريد عند استيراد ملف (.sqlite / .db):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setImportMode('merge_range')}
                className={`h-9 rounded-lg text-[12px] font-semibold border transition-colors ${
                  importMode === 'merge_range'
                    ? 'bg-[#e4f5ee] dark:bg-[#2a3f37] text-[#00513d] dark:text-[#6fdab5] border-[#006c52]/40 dark:border-[#6fdab5]/50'
                    : 'bg-[#f4f6f5] dark:bg-[#131314] text-[#52605a] dark:text-[#a0a0a0] border-[#d5deda] dark:border-[#2d2d30]'
                }`}
              >
                دمج ضمن المدة المختارة
              </button>
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`h-9 rounded-lg text-[12px] font-semibold border transition-colors ${
                  importMode === 'replace'
                    ? 'bg-[#e4f5ee] dark:bg-[#2a3f37] text-[#00513d] dark:text-[#6fdab5] border-[#006c52]/40 dark:border-[#6fdab5]/50'
                    : 'bg-[#f4f6f5] dark:bg-[#131314] text-[#52605a] dark:text-[#a0a0a0] border-[#d5deda] dark:border-[#2d2d30]'
                }`}
              >
                استبدال القاعدة بالكامل
              </button>
            </div>
          </div>

          {/* 4 Database Action Buttons: حفظ / تصدير / إرسال / توريد */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveLocally}
              className="h-11 rounded-xl bg-[#eef2f0] hover:bg-[#e1e7e4] dark:bg-[#242426] dark:hover:bg-[#2d2d30] border border-[#d5deda] dark:border-[#353538] text-[13px] font-semibold text-[#141716] dark:text-[#e5e2e1] flex items-center justify-center gap-1.5 transition-colors"
            >
              <HardDrive className="w-4 h-4 text-[#006c52] dark:text-[#6fdab5]" />
              <span>حفظ</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="h-11 rounded-xl bg-[#006c52] hover:bg-[#005842] dark:bg-[#6fdab5] dark:hover:bg-[#8cf6d0] text-white dark:text-[#002117] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير</span>
            </button>

            <button
              type="button"
              onClick={handleSendShare}
              className="h-11 rounded-xl bg-[#eef2f0] hover:bg-[#e1e7e4] dark:bg-[#242426] dark:hover:bg-[#2d2d30] border border-[#d5deda] dark:border-[#353538] text-[13px] font-semibold text-[#141716] dark:text-[#e5e2e1] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4 text-[#b45309] dark:text-[#f5bd6a]" />
              <span>إرسال</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-11 rounded-xl bg-[#eef2f0] hover:bg-[#e1e7e4] dark:bg-[#242426] dark:hover:bg-[#2d2d30] border border-[#d5deda] dark:border-[#353538] text-[13px] font-semibold text-[#141716] dark:text-[#e5e2e1] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-4 h-4 text-[#006c52] dark:text-[#6fdab5]" />
              <span>توريد</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".sqlite,.db,.sqlite3"
              onChange={handleFileSelected}
              className="hidden"
            />
          </div>

          {dbFeedback && (
            <div
              className={`rounded-lg px-3 py-2 text-[12px] font-medium ${
                dbFeedback.type === 'success'
                  ? 'bg-[#e4f5ee] dark:bg-[#162922] border border-[#b7e2d1] dark:border-[#2c5a3f] text-[#00513d] dark:text-[#8cf6d0]'
                  : 'bg-[#fde8ea] dark:bg-[#3c1418] border border-[#f5bfc4] dark:border-[#7c272f] text-[#9b1c26] dark:text-[#ffdad6]'
              }`}
            >
              {dbFeedback.message}
            </div>
          )}
        </section>

        {/* Teacher Profile */}
        <section className="bg-white dark:bg-[#1b1b1c] border border-[#d5deda] dark:border-[#2a2a2a] rounded-xl p-4 space-y-3">
          <h2 className="text-[14px] font-bold text-[#006c52] dark:text-[#6fdab5]">
            بيانات المعلم
          </h2>
          <div>
            <label className="block text-[11px] text-[#52605a] dark:text-[#a0a0a0] mb-1.5">
              اسم الشيخ / المشرف
            </label>
            <input
              type="text"
              value={settings.teacherName}
              onChange={(e) => onUpdateSettings({ teacherName: e.target.value })}
              className="w-full h-10 bg-[#f4f6f5] dark:bg-[#131313] border border-[#d5deda] dark:border-[#2f2f2f] focus:border-[#006c52] dark:focus:border-[#6fdab5] rounded-lg px-3 text-[14px] text-[#141716] dark:text-[#e5e2e1] outline-none"
            />
          </div>
        </section>

        {/* Riwayah & Mushaf Appearance */}
        <section className="bg-white dark:bg-[#1b1b1c] border border-[#d5deda] dark:border-[#2a2a2a] rounded-xl p-4 space-y-4">
          <h2 className="text-[14px] font-bold text-[#006c52] dark:text-[#6fdab5]">
            تفضيلات المصحف والرواية
          </h2>

          <div>
            <label className="block text-[11px] text-[#52605a] dark:text-[#a0a0a0] mb-2">
              الرواية الافتراضية للطلاب الجدد
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['قالون', 'حفص', 'ورش'] as Riwayah[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onUpdateSettings({ defaultRiwayah: r })}
                  className={`h-10 rounded-lg text-[13px] font-semibold border transition-colors ${
                    settings.defaultRiwayah === r
                      ? 'bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#002117] border-[#006c52] dark:border-[#6fdab5]'
                      : 'bg-[#f4f6f5] dark:bg-[#131313] text-[#141716] dark:text-[#e5e2e1] border-[#d5deda] dark:border-[#2f2f2f] hover:bg-[#eef2f0] dark:hover:bg-[#242425]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#52605a] dark:text-[#a0a0a0] mb-2">
              مظهر صفحة المصحف
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ mushafTheme: 'parchment' })}
                className={`h-10 rounded-lg text-[13px] font-semibold border transition-colors ${
                  settings.mushafTheme === 'parchment'
                    ? 'bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#002117] border-[#006c52] dark:border-[#6fdab5]'
                    : 'bg-[#f4f6f5] dark:bg-[#131313] text-[#141716] dark:text-[#e5e2e1] border-[#d5deda] dark:border-[#2f2f2f]'
                }`}
              >
                ورقي فاتح (الافتراضي)
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ mushafTheme: 'slate' })}
                className={`h-10 rounded-lg text-[13px] font-semibold border transition-colors ${
                  settings.mushafTheme === 'slate'
                    ? 'bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#002117] border-[#006c52] dark:border-[#6fdab5]'
                    : 'bg-[#f4f6f5] dark:bg-[#131313] text-[#141716] dark:text-[#e5e2e1] border-[#d5deda] dark:border-[#2f2f2f]'
                }`}
              >
                داكن مريح للعين
              </button>
            </div>
          </div>
        </section>

        {/* Flutter Export & Reset */}
        <section className="bg-white dark:bg-[#1b1b1c] border border-[#d5deda] dark:border-[#2a2a2a] rounded-xl p-4 space-y-3">
          <h2 className="text-[14px] font-bold text-[#141716] dark:text-[#e5e2e1]">
            مشروع Flutter الكامل والبيانات
          </h2>

          <button
            type="button"
            disabled={isZipping}
            onClick={handleDownloadFlutterZip}
            className="w-full h-11 rounded-lg bg-[#006c52] hover:bg-[#005842] dark:bg-[#6fdab5] dark:hover:bg-[#8cf6d0] disabled:opacity-50 text-white dark:text-[#002117] px-4 text-[13px] font-bold flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              {isZipping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileArchive className="w-4 h-4" />
              )}
              <span>تحميل مشروع Flutter كامل (.zip)</span>
            </span>
            <span className="font-mono-metric text-[11px]">
              {FLUTTER_PROJECT_FILES.length} ملفات
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowFlutterModal(true)}
            className="w-full h-11 rounded-lg bg-[#eef2f0] hover:bg-[#e1e7e4] dark:bg-[#242425] dark:hover:bg-[#2d2d2f] border border-[#d5deda] dark:border-[#353535] px-4 text-[13px] font-semibold text-[#141716] dark:text-[#e5e2e1] flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#006c52] dark:text-[#6fdab5]" />
              <span>استعراض ونسخ ملفات كود Flutter (Dart)</span>
            </span>
            <span className="text-[11px] text-[#006c52] dark:text-[#6fdab5]">
              Dart 3
            </span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await onResetDemoData();
              setDbFeedback({
                type: 'success',
                message: 'تمت استعادة البيانات الافتراضية في قاعدة بيانات SQLite.',
              });
            }}
            className="w-full h-11 rounded-lg bg-[#fde8ea] hover:bg-[#fad5d9] dark:bg-[#3c1418]/50 dark:hover:bg-[#3c1418] border border-[#f5bfc4] dark:border-[#7c272f]/60 px-4 text-[13px] font-semibold text-[#9b1c26] dark:text-[#ffb4ab] flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>استعادة البيانات الافتراضية</span>
          </button>
        </section>
      </div>

      {/* Flutter Code Export Modal */}
      {showFlutterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-[#1b1b1c] border border-[#d5deda] dark:border-[#353535] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
            <div className="px-4 py-3 border-b border-[#e4eae7] dark:border-[#2a2a2a] flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-[15px] font-bold text-[#141716] dark:text-[#e5e2e1]">
                كود مشروع Flutter الكامل (Sanad Slate)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isZipping}
                  onClick={handleDownloadFlutterZip}
                  className="px-3 py-1.5 rounded-lg bg-[#006c52] hover:bg-[#005842] dark:bg-[#6fdab5] dark:hover:bg-[#8cf6d0] text-white dark:text-[#002117] text-[12px] font-bold flex items-center gap-1.5"
                >
                  <FileArchive className="w-3.5 h-3.5" />
                  <span>تحميل ZIP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFlutterModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#eef2f0] dark:bg-[#2a2a2a] text-[12px] text-[#141716] dark:text-[#e5e2e1]"
                >
                  إغلاق
                </button>
              </div>
            </div>

            <div className="px-4 pt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {FLUTTER_PROJECT_FILES.map((file) => (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setActiveFilePath(file.path)}
                    className={`px-3 py-1.5 rounded-lg font-mono-metric text-[11px] whitespace-nowrap shrink-0 ${
                      activeFilePath === file.path
                        ? 'bg-[#006c52] dark:bg-[#6fdab5] text-white dark:text-[#002117] font-bold'
                        : 'bg-[#eef2f0] dark:bg-[#262627] text-[#3c4843] dark:text-[#bdcac2] hover:text-[#141716] dark:hover:text-[#e5e2e1]'
                    }`}
                  >
                    {file.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-[#eef2f0] dark:bg-[#242425] border border-[#d5deda] dark:border-[#383838] text-[12px] text-[#006c52] dark:text-[#6fdab5] flex items-center gap-1.5 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>

            <div className="px-4 pt-2">
              <p dir="ltr" className="font-mono-metric text-[11px] text-[#52605a] dark:text-[#87948d]">
                sanad_slate_flutter/{activeFilePath}
              </p>
            </div>

            <div className="p-4 overflow-auto flex-1">
              <pre
                dir="ltr"
                className="p-4 rounded-xl bg-[#f7f9f8] dark:bg-[#0e0e0e] border border-[#d5deda] dark:border-[#2a2a2a] font-mono-metric text-[12px] leading-relaxed text-[#252d2a] dark:text-[#bdcac2] overflow-x-auto"
              >
                <code>{activeCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
