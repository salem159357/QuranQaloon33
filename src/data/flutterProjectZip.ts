import JSZip from 'jszip';

export interface FlutterProjectFile {
  path: string;
  label: string;
  content: string;
}

const PUBSPEC_YAML = `name: sanad_slate
description: Quran memorization (Hifz), Tajweed error tracking, attendance, and Halaqa management app.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  sqflite: ^2.3.3+1
  path: ^1.9.0
  path_provider: ^2.1.4
  share_plus: ^10.0.2
  file_picker: ^8.1.2
  pdf: ^3.11.1
  printing: ^5.13.3
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
`;

const README_MD = `# Sanad Slate (Flutter)

Application Flutter de suivi de mémorisation du Coran (Hifz), erreurs de Tajweed, présence des étudiants et gestion des Halaqas avec base de données SQLite locale (\`sqflite\`) et génération de rapports PDF.

## Installation et lancement

\`\`\`bash
flutter pub get
flutter run
\`\`\`

## Structure du projet

- \`lib/main.dart\` : Point d'entrée, thème Sanad Slate sombre, support RTL arabe et navigation principale (5 onglets).
- \`lib/models/app_models.dart\` : Modèles de données (\`Student\`, \`Halaqa\`, \`SurahInfo\`, \`AttendanceRecord\`, \`HifzTask\`).
- \`lib/data/quran_data.dart\` : Métadonnées des sourates et page 83 (Sourate An-Nisā' - Juz' 5).
- \`lib/db/database_helper.dart\` : Base SQLite (\`sqflite\`), export/import \`.sqlite\` par plage de dates.
- \`lib/screens/students_screen.dart\` : Liste des étudiants avec total d'erreurs (Hifz / Tajweed) et tri.
- \`lib/screens/surahs_screen.dart\` : Suivi des sourates et filtrage des erreurs par étudiant.
- \`lib/screens/mushaf_screen.dart\` : Vue Mushaf interactive avec popover d'erreurs الحفظ / التجويد.
- \`lib/screens/attendance_screen.dart\` : Enregistrement quotidien des présences.
- \`lib/screens/settings_screen.dart\` : Sauvegarde, export, partage et import SQLite par période.
- \`lib/services/pdf_report_service.dart\` : Génération et impression de rapports PDF (présence et résultats par sourates et période).
`;

const MODELS_DART = `enum Riwayah { qaloon, hafs, warsh }

extension RiwayahLabel on Riwayah {
  String get arabic {
    switch (this) {
      case Riwayah.qaloon:
        return 'قالون';
      case Riwayah.hafs:
        return 'حفص';
      case Riwayah.warsh:
        return 'ورش';
    }
  }
}

enum AttendanceStatus { present, late, excused, absent }

extension AttendanceLabel on AttendanceStatus {
  String get arabic {
    switch (this) {
      case AttendanceStatus.present:
        return 'حاضر';
      case AttendanceStatus.late:
        return 'متأخر';
      case AttendanceStatus.excused:
        return 'بعذر';
      case AttendanceStatus.absent:
        return 'غائب';
    }
  }
}

class Halaqa {
  final String id;
  final String name;
  final String groupLabel;
  final String schedule;
  final String teacherName;

  const Halaqa({
    required this.id,
    required this.name,
    required this.groupLabel,
    required this.schedule,
    required this.teacherName,
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'name': name,
        'group_label': groupLabel,
        'schedule': schedule,
        'teacher_name': teacherName,
      };

  factory Halaqa.fromMap(Map<String, dynamic> map) => Halaqa(
        id: map['id'] as String,
        name: map['name'] as String,
        groupLabel: map['group_label'] as String,
        schedule: map['schedule'] as String,
        teacherName: map['teacher_name'] as String,
      );
}

class AyahError {
  final String studentId;
  final int surahNumber;
  final int ayahNumber;
  final int hifz;
  final int tajweed;
  final String updatedAt;

  const AyahError({
    required this.studentId,
    required this.surahNumber,
    required this.ayahNumber,
    required this.hifz,
    required this.tajweed,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() => {
        'student_id': studentId,
        'surah_number': surahNumber,
        'ayah_number': ayahNumber,
        'hifz': hifz,
        'tajweed': tajweed,
        'updated_at': updatedAt,
      };

  factory AyahError.fromMap(Map<String, dynamic> map) => AyahError(
        studentId: map['student_id'] as String,
        surahNumber: map['surah_number'] as int,
        ayahNumber: map['ayah_number'] as int,
        hifz: map['hifz'] as int,
        tajweed: map['tajweed'] as int,
        updatedAt: map['updated_at'] as String,
      );
}

class Student {
  final String id;
  final String code;
  final String name;
  final String halaqaId;
  final String riwayah;
  final int currentJuz;
  final int currentSurah;
  final int currentAyah;

  const Student({
    required this.id,
    required this.code,
    required this.name,
    required this.halaqaId,
    required this.riwayah,
    this.currentJuz = 1,
    this.currentSurah = 1,
    this.currentAyah = 1,
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'code': code,
        'name': name,
        'halaqa_id': halaqaId,
        'riwayah': riwayah,
        'current_juz': currentJuz,
        'current_surah': currentSurah,
        'current_ayah': currentAyah,
      };

  factory Student.fromMap(Map<String, dynamic> map) => Student(
        id: map['id'] as String,
        code: map['code'] as String,
        name: map['name'] as String,
        halaqaId: map['halaqa_id'] as String,
        riwayah: map['riwayah'] as String,
        currentJuz: (map['current_juz'] as int?) ?? 1,
        currentSurah: (map['current_surah'] as int?) ?? 1,
        currentAyah: (map['current_ayah'] as int?) ?? 1,
      );
}

class AttendanceRecord {
  final String id;
  final String studentId;
  final String date;
  final AttendanceStatus status;
  final String note;

  const AttendanceRecord({
    required this.id,
    required this.studentId,
    required this.date,
    required this.status,
    this.note = '',
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'student_id': studentId,
        'date': date,
        'status': status.name,
        'note': note,
      };

  factory AttendanceRecord.fromMap(Map<String, dynamic> map) => AttendanceRecord(
        id: map['id'] as String,
        studentId: map['student_id'] as String,
        date: map['date'] as String,
        status: AttendanceStatus.values.firstWhere(
          (e) => e.name == map['status'],
          orElse: () => AttendanceStatus.present,
        ),
        note: (map['note'] as String?) ?? '',
      );
}

class SurahInfo {
  final int number;
  final String nameArabic;
  final String nameLatin;
  final String revelation;
  final int ayahCount;
  final int startPage;
  final int juz;

  const SurahInfo({
    required this.number,
    required this.nameArabic,
    required this.nameLatin,
    required this.revelation,
    required this.ayahCount,
    required this.startPage,
    required this.juz,
  });
}

class MushafAyah {
  final int surahNumber;
  final int ayahNumber;
  final String text;
  final bool hasHizbQuarter;

  const MushafAyah({
    required this.surahNumber,
    required this.ayahNumber,
    required this.text,
    this.hasHizbQuarter = false,
  });
}
`;

const QURAN_DATA_DART = `import '../models/app_models.dart';

const List<SurahInfo> kSurahs = [
  SurahInfo(number: 1, nameArabic: 'سورة الفاتحة', nameLatin: 'Al-Fātiḥah', revelation: 'مكية', ayahCount: 7, startPage: 1, juz: 1),
  SurahInfo(number: 2, nameArabic: 'سورة البقرة', nameLatin: 'Al-Baqarah', revelation: 'مدنية', ayahCount: 286, startPage: 2, juz: 1),
  SurahInfo(number: 3, nameArabic: 'سورة آل عمران', nameLatin: 'Āl-ʿImrān', revelation: 'مدنية', ayahCount: 200, startPage: 50, juz: 3),
  SurahInfo(number: 4, nameArabic: 'سورة النساء', nameLatin: 'An-Nisāʾ', revelation: 'مدنية', ayahCount: 176, startPage: 77, juz: 4),
  SurahInfo(number: 5, nameArabic: 'سورة المائدة', nameLatin: 'Al-Māʾidah', revelation: 'مدنية', ayahCount: 120, startPage: 106, juz: 6),
  SurahInfo(number: 6, nameArabic: 'سورة الأنعام', nameLatin: 'Al-Anʿām', revelation: 'مكية', ayahCount: 165, startPage: 128, juz: 7),
  SurahInfo(number: 7, nameArabic: 'سورة الأعراف', nameLatin: 'Al-Aʿrāf', revelation: 'مكية', ayahCount: 206, startPage: 151, juz: 8),
  SurahInfo(number: 8, nameArabic: 'سورة الأنفال', nameLatin: 'Al-Anfāl', revelation: 'مدنية', ayahCount: 75, startPage: 177, juz: 9),
  SurahInfo(number: 9, nameArabic: 'سورة التوبة', nameLatin: 'At-Tawbah', revelation: 'مدنية', ayahCount: 129, startPage: 187, juz: 10),
  SurahInfo(number: 10, nameArabic: 'سورة يونس', nameLatin: 'Yūnus', revelation: 'مكية', ayahCount: 109, startPage: 208, juz: 11),
];

const List<MushafAyah> kPage83Ayahs = [
  MushafAyah(
    surahNumber: 4,
    ayahNumber: 27,
    text: 'وَاللَّهُ يُرِيدُ أَن يَتُوبَ عَلَيْكُمْ وَيُرِيدُ الَّذِينَ يَتَّبِعُونَ الشَّهَوَاتِ أَن تَمِيلُوا مَيْلًا عَظِيمًا',
  ),
  MushafAyah(
    surahNumber: 4,
    ayahNumber: 28,
    text: 'يُرِيدُ اللَّهُ أَن يُخَفِّفَ عَنكُمْ ۚ وَخُلِقَ الْإِنسَانُ ضَعِيفًا',
  ),
  MushafAyah(
    surahNumber: 4,
    ayahNumber: 29,
    text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ ۚ وَلَا تَقْتُلُوا أَنفُسَكُمْ ۚ إِنَّ اللَّهَ كَانَ بِكُمْ رَحِيمًا',
  ),
  MushafAyah(
    surahNumber: 4,
    ayahNumber: 30,
    text: 'وَمَن يَفْعَلْ ذَٰلِكَ عُدْوَانًا وَظُلْمًا فَسَوْفَ نُصْلِيهِ نَارًا ۚ وَكَانَ ذَٰلِكَ عَلَى اللَّهِ يَسِيرًا',
  ),
  MushafAyah(
    surahNumber: 4,
    ayahNumber: 31,
    hasHizbQuarter: true,
    text: 'إِن تَجْتَنِبُوا كَبَائِرَ مَا تُنْهَوْنَ عَنْهُ نُكَفِّرْ عَنكُمْ سَيِّئَاتِكُمْ وَنُدْخِلْكُم مُّدْخَلًا كَرِيمًا',
  ),
  MushafAyah(
    surahNumber: 4,
    ayahNumber: 32,
    text: 'وَلَا تَتَمَنَّوْا مَا فَضَّلَ اللَّهُ بِهِ بَعْضَكُمْ عَلَىٰ بَعْضٍ ۚ لِّلرِّجَالِ نَصِيبٌ مِّمَّا اكْتَسَبُوا ۖ وَلِلنِّسَاءِ نَصِيبٌ مِّمَّا اكْتَسَبْنَ ۚ وَاسْأَلُوا اللَّهَ مِن فَضْلِهِ ۗ إِنَّ اللَّهَ كَانَ بِكُلِّ شَيْءٍ عَلِيمًا',
  ),
  MushafAyah(
    surahNumber: 4,
    ayahNumber: 33,
    text: 'وَلِكُلٍّ جَعَلْنَا مَوَالِيَ مِمَّا تَرَكَ الْوَالِدَانِ وَالْأَقْرَبُونَ ۚ وَالَّذِينَ عَقَدَتْ أَيْمَانُكُمْ فَآتُوهُمْ نَصِيبَهُمْ ۚ إِنَّ اللَّهَ كَانَ عَلَىٰ كُلِّ شَيْءٍ شَهِيدًا',
  ),
];

String toArabicIndicDigits(int number) {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return number.toString().split('').map((c) {
    final idx = int.tryParse(c);
    return idx != null ? digits[idx] : c;
  }).join();
}
`;

const DATABASE_HELPER_DART = `import 'dart:io';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import '../models/app_models.dart';

class DatabaseHelper {
  DatabaseHelper._();
  static final DatabaseHelper instance = DatabaseHelper._();

  static const _dbName = 'sanad_slate.sqlite';
  Database? _db;

  Future<Database> get database async {
    if (_db != null) return _db!;
    final dir = await getDatabasesPath();
    final path = p.join(dir, _dbName);
    _db = await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
    await _seedIfEmpty(_db!);
    return _db!;
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS halaqas (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        group_label TEXT NOT NULL,
        schedule TEXT NOT NULL,
        teacher_name TEXT NOT NULL
      );
    ''');

    await db.execute('''
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
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS ayah_errors (
        student_id TEXT NOT NULL,
        surah_number INTEGER NOT NULL,
        ayah_number INTEGER NOT NULL,
        hifz INTEGER NOT NULL DEFAULT 0,
        tajweed INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (student_id, surah_number, ayah_number)
      );
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        UNIQUE(student_id, date)
      );
    ''');
  }

  Future<void> _seedIfEmpty(Database db) async {
    final count = Sqflite.firstIntValue(
      await db.rawQuery('SELECT COUNT(*) FROM students'),
    );
    if ((count ?? 0) > 0) return;

    final today = DateTime.now().toIso8601String().substring(0, 10);

    await db.insert('halaqas', {
      'id': 'halaqa-fajr',
      'name': 'حلقة الفجر',
      'group_label': 'المجموعة الأولى • حلقة الفجر',
      'schedule': 'يومياً بعد صلاة الفجر',
      'teacher_name': 'الشيخ عبد الملك القاسمي',
    });
    await db.insert('halaqas', {
      'id': 'halaqa-asr',
      'name': 'حلقة العصر',
      'group_label': 'المجموعة الثانية • حلقة العصر',
      'schedule': 'السبت - الأربعاء 04:15 م',
      'teacher_name': 'الشيخ عبد الملك القاسمي',
    });

    final initialStudents = [
      Student(id: 'student-1', code: '01', name: 'عمر عبد الله المنصوري', halaqaId: 'halaqa-fajr', riwayah: 'قالون', currentJuz: 5, currentSurah: 4, currentAyah: 31),
      Student(id: 'student-2', code: '02', name: 'يوسف أحمد التونسي', halaqaId: 'halaqa-fajr', riwayah: 'قالون', currentJuz: 8, currentSurah: 7, currentAyah: 42),
      Student(id: 'student-3', code: '03', name: 'حمزة خالد الفاسي', halaqaId: 'halaqa-fajr', riwayah: 'قالون', currentJuz: 11, currentSurah: 10, currentAyah: 25),
      Student(id: 'student-4', code: '04', name: 'طارق زياد الليبي', halaqaId: 'halaqa-asr', riwayah: 'قالون', currentJuz: 3, currentSurah: 3, currentAyah: 52),
      Student(id: 'student-5', code: '05', name: 'عبد الرحمن محمد الصالح', halaqaId: 'halaqa-asr', riwayah: 'قالون', currentJuz: 15, currentSurah: 18, currentAyah: 18),
      Student(id: 'student-6', code: '06', name: 'بلال أنس التواتي', halaqaId: 'halaqa-asr', riwayah: 'قالون', currentJuz: 6, currentSurah: 5, currentAyah: 12),
    ];

    for (final s in initialStudents) {
      await db.insert('students', s.toMap());
    }

    // Matching initial errors for student-1 (6 حفظ, 7 تجويد)
    await db.insert('ayah_errors', {'student_id': 'student-1', 'surah_number': 2, 'ayah_number': 14, 'hifz': 3, 'tajweed': 2, 'updated_at': today});
    await db.insert('ayah_errors', {'student_id': 'student-1', 'surah_number': 3, 'ayah_number': 7, 'hifz': 1, 'tajweed': 4, 'updated_at': today});
    await db.insert('ayah_errors', {'student_id': 'student-1', 'surah_number': 4, 'ayah_number': 29, 'hifz': 2, 'tajweed': 1, 'updated_at': today});
  }

  Future<List<Halaqa>> getHalaqas() async {
    final db = await database;
    final rows = await db.query('halaqas');
    return rows.map(Halaqa.fromMap).toList();
  }

  Future<List<Student>> getStudents() async {
    final db = await database;
    final rows = await db.query('students', orderBy: 'code ASC');
    return rows.map(Student.fromMap).toList();
  }

  Future<List<AyahError>> getErrorsForStudent(String studentId) async {
    final db = await database;
    final rows = await db.query('ayah_errors', where: 'student_id = ?', whereArgs: [studentId]);
    return rows.map(AyahError.fromMap).toList();
  }

  Future<List<AyahError>> getAllErrors() async {
    final db = await database;
    final rows = await db.query('ayah_errors');
    return rows.map(AyahError.fromMap).toList();
  }

  Future<void> upsertStudent(Student student) async {
    final db = await database;
    await db.insert('students', student.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> deleteStudent(String studentId) async {
    final db = await database;
    await db.delete('students', where: 'id = ?', whereArgs: [studentId]);
    await db.delete('ayah_errors', where: 'student_id = ?', whereArgs: [studentId]);
    await db.delete('attendance', where: 'student_id = ?', whereArgs: [studentId]);
  }

  Future<void> setAyahError({
    required String studentId,
    required int surahNumber,
    required int ayahNumber,
    required int hifz,
    required int tajweed,
  }) async {
    final db = await database;
    if (hifz <= 0 && tajweed <= 0) {
      await db.delete(
        'ayah_errors',
        where: 'student_id = ? AND surah_number = ? AND ayah_number = ?',
        whereArgs: [studentId, surahNumber, ayahNumber],
      );
      return;
    }
    final today = DateTime.now().toIso8601String().substring(0, 10);
    await db.insert(
      'ayah_errors',
      {
        'student_id': studentId,
        'surah_number': surahNumber,
        'ayah_number': ayahNumber,
        'hifz': hifz,
        'tajweed': tajweed,
        'updated_at': today,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<AttendanceRecord>> getAttendanceForDate(String date) async {
    final db = await database;
    final rows = await db.query('attendance', where: 'date = ?', whereArgs: [date]);
    return rows.map(AttendanceRecord.fromMap).toList();
  }

  Future<List<AttendanceRecord>> getAttendanceInRange(String startDate, String endDate) async {
    final db = await database;
    final rows = await db.query(
      'attendance',
      where: 'date >= ? AND date <= ?',
      whereArgs: [startDate, endDate],
      orderBy: 'date DESC',
    );
    return rows.map(AttendanceRecord.fromMap).toList();
  }

  Future<void> upsertAttendance(AttendanceRecord record) async {
    final db = await database;
    await db.insert('attendance', record.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  /// Export a standalone SQLite database file filtered to [startDate]..[endDate]
  Future<File> exportSqliteForDateRange(String startDate, String endDate) async {
    final srcDb = await database;
    final tempDir = await getTemporaryDirectory();
    final outPath = p.join(tempDir.path, 'sanad-slate-$startDate-to-$endDate.sqlite');
    final outFile = File(outPath);
    if (await outFile.exists()) await outFile.delete();

    final exportDb = await openDatabase(outPath, version: 1, onCreate: _onCreate);
    try {
      final halaqas = await srcDb.query('halaqas');
      final students = await srcDb.query('students');
      final att = await srcDb.query('attendance', where: 'date >= ? AND date <= ?', whereArgs: [startDate, endDate]);
      final errs = await srcDb.query('ayah_errors', where: 'updated_at >= ? AND updated_at <= ?', whereArgs: [startDate, endDate]);

      await exportDb.transaction((txn) async {
        for (final row in halaqas) {
          await txn.insert('halaqas', row, conflictAlgorithm: ConflictAlgorithm.replace);
        }
        for (final row in students) {
          await txn.insert('students', row, conflictAlgorithm: ConflictAlgorithm.replace);
        }
        for (final row in att) {
          await txn.insert('attendance', row, conflictAlgorithm: ConflictAlgorithm.replace);
        }
        for (final row in errs) {
          await txn.insert('ayah_errors', row, conflictAlgorithm: ConflictAlgorithm.replace);
        }
      });
    } finally {
      await exportDb.close();
    }

    return outFile;
  }

  /// Import an external .sqlite file and merge records within [startDate]..[endDate]
  Future<void> importSqliteFile({
    required String filePath,
    required bool replaceAll,
    required String startDate,
    required String endDate,
  }) async {
    final incomingDb = await openDatabase(filePath, readOnly: true);
    final currentDb = await database;

    try {
      final halaqas = await incomingDb.query('halaqas');
      final students = await incomingDb.query('students');
      final att = replaceAll
          ? await incomingDb.query('attendance')
          : await incomingDb.query('attendance', where: 'date >= ? AND date <= ?', whereArgs: [startDate, endDate]);
      final errs = replaceAll
          ? await incomingDb.query('ayah_errors')
          : await incomingDb.query('ayah_errors', where: 'updated_at >= ? AND updated_at <= ?', whereArgs: [startDate, endDate]);

      await currentDb.transaction((txn) async {
        if (replaceAll) {
          await txn.delete('halaqas');
          await txn.delete('students');
          await txn.delete('attendance');
          await txn.delete('ayah_errors');
        }
        for (final row in halaqas) {
          await txn.insert('halaqas', row, conflictAlgorithm: ConflictAlgorithm.replace);
        }
        for (final row in students) {
          await txn.insert('students', row, conflictAlgorithm: ConflictAlgorithm.replace);
        }
        for (final row in att) {
          await txn.insert('attendance', row, conflictAlgorithm: ConflictAlgorithm.replace);
        }
        for (final row in errs) {
          await txn.insert('ayah_errors', row, conflictAlgorithm: ConflictAlgorithm.replace);
        }
      });
    } finally {
      await incomingDb.close();
    }
  }
}
`;

const STUDENTS_SCREEN_DART = `import 'package:flutter/material.dart';
import '../db/database_helper.dart';
import '../models/app_models.dart';
import 'surahs_screen.dart';

enum StudentSortMode { defaultOrder, mostErrors, leastErrors, alphabetical }

class StudentsScreen extends StatefulWidget {
  const StudentsScreen({super.key});

  @override
  State<StudentsScreen> createState() => _StudentsScreenState();
}

class _StudentsScreenState extends State<StudentsScreen> {
  List<Halaqa> _halaqas = [];
  List<Student> _students = [];
  Map<String, ({int hifz, int tajweed})> _errorTotals = {};
  String _halaqaFilter = 'all';
  String _searchQuery = '';
  StudentSortMode _sortMode = StudentSortMode.defaultOrder;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final halaqas = await DatabaseHelper.instance.getHalaqas();
    final students = await DatabaseHelper.instance.getStudents();
    final errors = await DatabaseHelper.instance.getAllErrors();

    final totals = <String, ({int hifz, int tajweed})>{};
    for (final e in errors) {
      final prev = totals[e.studentId] ?? (hifz: 0, tajweed: 0);
      totals[e.studentId] = (hifz: prev.hifz + e.hifz, tajweed: prev.tajweed + e.tajweed);
    }

    if (!mounted) return;
    setState(() {
      _halaqas = halaqas;
      _students = students;
      _errorTotals = totals;
    });
  }

  List<Student> get _filteredAndSorted {
    final filtered = _students.where((s) {
      final matchesHalaqa = _halaqaFilter == 'all' || s.halaqaId == _halaqaFilter;
      final q = _searchQuery.trim();
      final matchesQuery = q.isEmpty || s.name.contains(q) || s.code.contains(q);
      return matchesHalaqa && matchesQuery;
    }).toList();

    filtered.sort((a, b) {
      final ea = _errorTotals[a.id] ?? (hifz: 0, tajweed: 0);
      final eb = _errorTotals[b.id] ?? (hifz: 0, tajweed: 0);
      final ta = ea.hifz + ea.tajweed;
      final tb = eb.hifz + eb.tajweed;
      switch (_sortMode) {
        case StudentSortMode.mostErrors:
          return tb.compareTo(ta);
        case StudentSortMode.leastErrors:
          return ta.compareTo(tb);
        case StudentSortMode.alphabetical:
          return a.name.compareTo(b.name);
        case StudentSortMode.defaultOrder:
          return a.code.compareTo(b.code);
      }
    });
    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    final items = _filteredAndSorted;

    return Scaffold(
      backgroundColor: const Color(0xFF131313),
      appBar: AppBar(
        backgroundColor: const Color(0xFF131313),
        elevation: 0,
        title: const Text('قائمة الطلاب', style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _showAddStudentDialog),
          const Padding(
            padding: EdgeInsets.only(left: 12),
            child: CircleAvatar(
              radius: 17,
              backgroundColor: Color(0xFF6FDAB5),
              child: Icon(Icons.person_outline, color: Color(0xFF003829), size: 20),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
            child: TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: InputDecoration(
                hintText: 'ابحث عن طالب...',
                prefixIcon: const Icon(Icons.search, color: Color(0xFFA0A0A0)),
                filled: true,
                fillColor: const Color(0xFF1B1B1C),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF262626)),
                ),
              ),
            ),
          ),
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildFilterChip('الكل (\${_students.length})', 'all'),
                const SizedBox(width: 8),
                ..._halaqas.map((h) => Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: _buildFilterChip(h.name, h.id),
                )),
              ],
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 34,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildSortChip('المجموعات', StudentSortMode.defaultOrder),
                _buildSortChip('الأكثر أخطاءً', StudentSortMode.mostErrors),
                _buildSortChip('الأقل أخطاءً', StudentSortMode.leastErrors),
                _buildSortChip('الاسم', StudentSortMode.alphabetical),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadData,
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 88),
                itemCount: items.length,
                separatorBuilder: (_, __) => const Divider(color: Color(0xFF1E1E1E), height: 1),
                itemBuilder: (context, index) {
                  final s = items[index];
                  final err = _errorTotals[s.id] ?? (hifz: 0, tajweed: 0);
                  final total = err.hifz + err.tajweed;

                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    onTap: () async {
                      await Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => SurahsScreen(student: s)),
                      );
                      _loadData();
                    },
                    leading: CircleAvatar(
                      backgroundColor: const Color(0xFF1B1B1C),
                      child: Text(s.code, style: const TextStyle(color: Color(0xFF6FDAB5), fontWeight: FontWeight.w700, fontSize: 13)),
                    ),
                    title: Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(s.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF162922),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF24473A)),
                          ),
                          child: Text(s.riwayah, style: const TextStyle(color: Color(0xFF6FDAB5), fontSize: 11)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E1E1F),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF2D2D2E)),
                          ),
                          child: Text(
                            '$total (\${err.hifz} حفظ / \${err.tajweed} تجويد)',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline, color: Color(0xFF87948D), size: 20),
                      onPressed: () async {
                        await DatabaseHelper.instance.deleteStudent(s.id);
                        _loadData();
                      },
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF6FDAB5),
        foregroundColor: const Color(0xFF002117),
        onPressed: _showAddStudentDialog,
        icon: const Icon(Icons.person_add_alt_1_outlined),
        label: const Text('إضافة طالب', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final active = _halaqaFilter == value;
    return ChoiceChip(
      label: Text(label),
      selected: active,
      selectedColor: const Color(0xFF6FDAB5),
      backgroundColor: const Color(0xFF1B1B1C),
      labelStyle: TextStyle(
        color: active ? const Color(0xFF002117) : const Color(0xFFE5E2E1),
        fontWeight: FontWeight.w600,
      ),
      onSelected: (_) => setState(() => _halaqaFilter = value),
    );
  }

  Widget _buildSortChip(String label, StudentSortMode mode) {
    final active = _sortMode == mode;
    return Padding(
      padding: const EdgeInsets.only(left: 6),
      child: ChoiceChip(
        label: Text(label, style: const TextStyle(fontSize: 11)),
        selected: active,
        selectedColor: const Color(0xFF2A3F37),
        backgroundColor: const Color(0xFF181819),
        labelStyle: TextStyle(color: active ? const Color(0xFF6FDAB5) : const Color(0xFFA0A0A0)),
        onSelected: (_) => setState(() => _sortMode = mode),
      ),
    );
  }

  Future<void> _showAddStudentDialog() async {
    final controller = TextEditingController();
    String halaqaId = _halaqas.isNotEmpty ? _halaqas.first.id : 'halaqa-fajr';
    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1F),
        title: const Text('إضافة طالب جديد'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'اسم الطالب الثلاثي'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          FilledButton(
            onPressed: () async {
              final name = controller.text.trim();
              if (name.isEmpty) return;
              final code = (_students.length + 1).toString().padLeft(2, '0');
              await DatabaseHelper.instance.upsertStudent(Student(
                id: 'student-\${DateTime.now().millisecondsSinceEpoch}',
                code: code,
                name: name,
                halaqaId: halaqaId,
                riwayah: 'قالون',
              ));
              if (ctx.mounted) Navigator.pop(ctx);
              _loadData();
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }
}
`;

const SURAHS_SCREEN_DART = `import 'package:flutter/material.dart';
import '../data/quran_data.dart';
import '../db/database_helper.dart';
import '../models/app_models.dart';
import 'mushaf_screen.dart';

class SurahsScreen extends StatefulWidget {
  final Student student;
  const SurahsScreen({super.key, required this.student});

  @override
  State<SurahsScreen> createState() => _SurahsScreenState();
}

class _SurahsScreenState extends State<SurahsScreen> {
  List<AyahError> _errors = [];
  bool _onlyWithErrors = false;

  @override
  void initState() {
    super.initState();
    _loadErrors();
  }

  Future<void> _loadErrors() async {
    final list = await DatabaseHelper.instance.getErrorsForStudent(widget.student.id);
    if (!mounted) return;
    setState(() => _errors = list);
  }

  @override
  Widget build(BuildContext context) {
    final totalHifz = _errors.fold<int>(0, (sum, e) => sum + e.hifz);
    final totalTajweed = _errors.fold<int>(0, (sum, e) => sum + e.tajweed);

    final visibleSurahs = kSurahs.where((s) {
      if (!_onlyWithErrors) return true;
      return _errors.any((e) => e.surahNumber == s.number && (e.hifz + e.tajweed) > 0);
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF131313),
      appBar: AppBar(
        backgroundColor: const Color(0xFF131313),
        title: Text('القرآن - \${widget.student.riwayah}', style: const TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            icon: const Icon(Icons.menu_book_outlined),
            onPressed: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => MushafScreen(student: widget.student)),
              );
              _loadErrors();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: const Color(0xFF1B1B1C),
            child: Row(
              children: [
                const CircleAvatar(
                  backgroundColor: Color(0xFF13382C),
                  child: Icon(Icons.person, color: Color(0xFF6FDAB5)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('الطالب المتابع:', style: TextStyle(fontSize: 11, color: Color(0xFFA0A0A0))),
                      Text(widget.student.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    ],
                  ),
                ),
                _badge('$totalHifz أخطاء حفظ', const Color(0xFF3C1418), const Color(0xFFFFB4AB)),
                const SizedBox(width: 6),
                _badge('$totalTajweed أخطاء تجويد', const Color(0xFF382B11), const Color(0xFFF5BD6A)),
              ],
            ),
          ),
          CheckboxListTile(
            value: _onlyWithErrors,
            onChanged: (v) => setState(() => _onlyWithErrors = v ?? false),
            title: const Text('السور التي بها أخطاء فقط', style: TextStyle(fontSize: 13)),
            controlAffinity: ListTileControlAffinity.leading,
            activeColor: const Color(0xFF6FDAB5),
          ),
          Expanded(
            child: ListView.separated(
              itemCount: visibleSurahs.length,
              separatorBuilder: (_, __) => const Divider(color: Color(0xFF222222), height: 1),
              itemBuilder: (context, index) {
                final surah = visibleSurahs[index];
                final sErrors = _errors.where((e) => e.surahNumber == surah.number);
                final hifz = sErrors.fold<int>(0, (s, e) => s + e.hifz);
                final tajweed = sErrors.fold<int>(0, (s, e) => s + e.tajweed);

                return ListTile(
                  onTap: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => MushafScreen(student: widget.student)),
                    );
                    _loadErrors();
                  },
                  leading: Text('\${surah.number}', style: const TextStyle(color: Color(0xFF87948D))),
                  title: Text(surah.nameArabic, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('\${surah.revelation} • \${surah.ayahCount} آية • ص \${surah.startPage}', style: const TextStyle(fontSize: 12, color: Color(0xFF87948D))),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _badge('$hifz حفظ', const Color(0xFF4D181E), const Color(0xFFFFD6D6)),
                      const SizedBox(width: 6),
                      _badge('$tajweed تجويد', const Color(0xFF4D3912), const Color(0xFFFFDFA3)),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _badge(String text, Color bg, Color fg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Text(text, style: TextStyle(color: fg, fontSize: 11, fontWeight: FontWeight.w700)),
    );
  }
}
`;

const MUSHAF_SCREEN_DART = `import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../data/quran_data.dart';
import '../db/database_helper.dart';
import '../models/app_models.dart';

class MushafScreen extends StatefulWidget {
  final Student student;
  const MushafScreen({super.key, required this.student});

  @override
  State<MushafScreen> createState() => _MushafScreenState();
}

class _MushafScreenState extends State<MushafScreen> {
  int _selectedAyah = 31;
  Map<int, ({int hifz, int tajweed})> _pageErrors = {};

  @override
  void initState() {
    super.initState();
    _loadErrors();
  }

  Future<void> _loadErrors() async {
    final all = await DatabaseHelper.instance.getErrorsForStudent(widget.student.id);
    final map = <int, ({int hifz, int tajweed})>{};
    for (final e in all.where((e) => e.surahNumber == 4)) {
      map[e.ayahNumber] = (hifz: e.hifz, tajweed: e.tajweed);
    }
    if (!mounted) return;
    setState(() => _pageErrors = map);
  }

  Future<void> _adjustError(String type, int delta) async {
    final curr = _pageErrors[_selectedAyah] ?? (hifz: 0, tajweed: 0);
    final nextHifz = type == 'hifz' ? (curr.hifz + delta).clamp(0, 99) : curr.hifz;
    final nextTajweed = type == 'tajweed' ? (curr.tajweed + delta).clamp(0, 99) : curr.tajweed;

    await DatabaseHelper.instance.setAyahError(
      studentId: widget.student.id,
      surahNumber: 4,
      ayahNumber: _selectedAyah,
      hifz: nextHifz,
      tajweed: nextTajweed,
    );
    _loadErrors();
  }

  @override
  Widget build(BuildContext context) {
    final activeErr = _pageErrors[_selectedAyah] ?? (hifz: 0, tajweed: 0);

    return Scaffold(
      backgroundColor: const Color(0xFFFBF9F5),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Directionality(
                textDirection: TextDirection.ltr,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.chevron_left, color: Color(0xFF2C2B28)),
                          onPressed: () => Navigator.pop(context),
                        ),
                        const Text("Surah An-Nisā'", style: TextStyle(color: Color(0xFF2C2B28), fontWeight: FontWeight.w600)),
                      ],
                    ),
                    const Text("Juz' 5", style: TextStyle(color: Color(0xFF2C2B28), fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF1D3D2A),
                borderRadius: BorderRadius.circular(14),
                boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 14)],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildStepper('حفظ', activeErr.hifz, (d) => _adjustError('hifz', d)),
                  Container(width: 1, height: 22, color: Colors.white24, margin: const EdgeInsets.symmetric(horizontal: 10)),
                  _buildStepper('تجويد', activeErr.tajweed, (d) => _adjustError('tajweed', d)),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 8),
                child: RichText(
                  textAlign: TextAlign.justify,
                  text: TextSpan(
                    style: const TextStyle(fontSize: 23, height: 2.1, color: Color(0xFF1A1A18)),
                    children: kPage83Ayahs.map((ayah) {
                      final isSelected = ayah.ayahNumber == _selectedAyah;
                      return TextSpan(
                        text: '\${ayah.hasHizbQuarter ? "۞ " : ""}\${ayah.text} ﴿\${toArabicIndicDigits(ayah.ayahNumber)}﴾ ',
                        style: TextStyle(
                          backgroundColor: isSelected ? const Color(0xFFD6EAE9) : Colors.transparent,
                        ),
                        recognizer: TapGestureRecognizer()
                          ..onTap = () => setState(() => _selectedAyah = ayah.ayahNumber),
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(bottom: 12),
              child: Text('83', style: TextStyle(color: Color(0xFF2C2B28), fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepper(String label, int value, ValueChanged<int> onDelta) {
    return Row(
      children: [
        Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        const SizedBox(width: 6),
        IconButton(
          icon: const Icon(Icons.add, color: Colors.white, size: 18),
          onPressed: () => onDelta(1),
          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          padding: EdgeInsets.zero,
        ),
        Text('$value', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        IconButton(
          icon: const Icon(Icons.remove, color: Colors.white, size: 18),
          onPressed: value > 0 ? () => onDelta(-1) : null,
          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          padding: EdgeInsets.zero,
        ),
      ],
    );
  }
}
`;

const ATTENDANCE_SCREEN_DART = `import 'package:flutter/material.dart';
import '../db/database_helper.dart';
import '../models/app_models.dart';
import '../services/pdf_report_service.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  String _selectedDate = DateTime.now().toIso8601String().substring(0, 10);
  List<Student> _students = [];
  Map<String, AttendanceRecord> _recordsByStudent = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final students = await DatabaseHelper.instance.getStudents();
    final att = await DatabaseHelper.instance.getAttendanceForDate(_selectedDate);
    if (!mounted) return;
    setState(() {
      _students = students;
      _recordsByStudent = {for (final r in att) r.studentId: r};
    });
  }

  Future<void> _mark(Student s, AttendanceStatus status) async {
    final record = AttendanceRecord(
      id: 'att-\${s.id}-$_selectedDate',
      studentId: s.id,
      date: _selectedDate,
      status: status,
    );
    await DatabaseHelper.instance.upsertAttendance(record);
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF131313),
      appBar: AppBar(
        backgroundColor: const Color(0xFF131313),
        title: const Text('تسجيل الحضور', style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          TextButton.icon(
            onPressed: () => PdfReportService.printAttendanceAndHifzReport(
              context: context,
              startDate: _selectedDate,
              endDate: _selectedDate,
              selectedSurahs: const [1, 2, 3, 4],
            ),
            icon: const Icon(Icons.picture_as_pdf_outlined, color: Color(0xFF6FDAB5)),
            label: const Text('تقرير PDF', style: TextStyle(color: Color(0xFF6FDAB5))),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('التاريخ: $_selectedDate', style: const TextStyle(fontWeight: FontWeight.w600)),
                FilledButton.icon(
                  onPressed: () async {
                    for (final s in _students) {
                      await _mark(s, AttendanceStatus.present);
                    }
                  },
                  icon: const Icon(Icons.done_all, size: 18),
                  label: const Text('تحضير الكل'),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _students.length,
              itemBuilder: (context, idx) {
                final s = _students[idx];
                final current = _recordsByStudent[s.id]?.status;
                return Card(
                  color: const Color(0xFF1B1B1C),
                  margin: const EdgeInsets.only(bottom: 10),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(s.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 6,
                          children: AttendanceStatus.values.map((status) {
                            final active = current == status;
                            return ChoiceChip(
                              label: Text(status.arabic),
                              selected: active,
                              selectedColor: const Color(0xFF6FDAB5),
                              labelStyle: TextStyle(
                                color: active ? const Color(0xFF002117) : const Color(0xFFE5E2E1),
                              ),
                              onSelected: (_) => _mark(s, status),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
`;

const PDF_SERVICE_DART = `import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../db/database_helper.dart';
import '../models/app_models.dart';

class PdfReportService {
  static Future<void> printAttendanceAndHifzReport({
    required BuildContext context,
    required String startDate,
    required String endDate,
    required List<int> selectedSurahs,
  }) async {
    final students = await DatabaseHelper.instance.getStudents();
    final attendance = await DatabaseHelper.instance.getAttendanceInRange(startDate, endDate);
    final errors = await DatabaseHelper.instance.getAllErrors();

    final pdf = pw.Document();
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        textDirection: pw.TextDirection.rtl,
        build: (ctx) => [
          pw.Header(
            level: 0,
            child: pw.Text('تقرير الحضور ومتابعة الحفظ والتجويد', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
          ),
          pw.Text('المدة: $startDate إلى $endDate'),
          pw.SizedBox(height: 12),
          pw.TableHelper.fromTextArray(
            headers: ['الرقم', 'اسم الطالب', 'حاضر', 'غائب', 'أخطاء حفظ', 'أخطاء تجويد'],
            data: students.map((s) {
              final sAtt = attendance.where((a) => a.studentId == s.id);
              final present = sAtt.where((a) => a.status == AttendanceStatus.present).length;
              final absent = sAtt.where((a) => a.status == AttendanceStatus.absent).length;
              final sErr = errors.where((e) => e.studentId == s.id && selectedSurahs.contains(e.surahNumber));
              final hifz = sErr.fold<int>(0, (acc, e) => acc + e.hifz);
              final tajweed = sErr.fold<int>(0, (acc, e) => acc + e.tajweed);
              return [s.code, s.name, '$present', '$absent', '$hifz', '$tajweed'];
            }).toList(),
          ),
        ],
      ),
    );

    await Printing.layoutPdf(onLayout: (format) async => pdf.save());
  }
}
`;

const SETTINGS_SCREEN_DART = `import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import '../db/database_helper.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String _startDate = DateTime.now().subtract(const Duration(days: 30)).toIso8601String().substring(0, 10);
  String _endDate = DateTime.now().toIso8601String().substring(0, 10);
  String? _statusMessage;

  Future<void> _exportAndShare() async {
    final file = await DatabaseHelper.instance.exportSqliteForDateRange(_startDate, _endDate);
    await Share.shareXFiles([XFile(file.path)], text: 'قاعدة بيانات Sanad Slate ($_startDate - $_endDate)');
    setState(() => _statusMessage = 'تم تصدير وإرسال قاعدة البيانات: \${file.path}');
  }

  Future<void> _importDb(bool replaceAll) async {
    final result = await FilePicker.platform.pickFiles(type: FileType.any);
    final path = result?.files.single.path;
    if (path == null) return;
    await DatabaseHelper.instance.importSqliteFile(
      filePath: path,
      replaceAll: replaceAll,
      startDate: _startDate,
      endDate: _endDate,
    );
    setState(() => _statusMessage = 'تم توريد قاعدة البيانات بنجاح.');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF131313),
      appBar: AppBar(
        backgroundColor: const Color(0xFF131313),
        title: const Text('الإعدادات وقاعدة البيانات', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: const Color(0xFF1B1B1C),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('قاعدة بيانات SQLite على الجهاز', style: TextStyle(color: Color(0xFF6FDAB5), fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  Text('المدة المختارة: $_startDate إلى $_endDate', style: const TextStyle(fontSize: 13)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: _exportAndShare,
                          icon: const Icon(Icons.share_outlined),
                          label: const Text('تصدير / إرسال'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _importDb(false),
                          icon: const Icon(Icons.upload_file_outlined),
                          label: const Text('توريد (دمج)'),
                        ),
                      ),
                    ],
                  ),
                  if (_statusMessage != null) ...[
                    const SizedBox(height: 10),
                    Text(_statusMessage!, style: const TextStyle(color: Color(0xFF8CF6D0), fontSize: 12)),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
`;

const MAIN_DART = `import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'screens/attendance_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/students_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SanadSlateApp());
}

class SanadSlateApp extends StatelessWidget {
  const SanadSlateApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sanad Slate',
      debugShowCheckedModeBanner: false,
      locale: const Locale('ar'),
      supportedLocales: const [Locale('ar'), Locale('en')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF131313),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6FDAB5),
          onPrimary: Color(0xFF003829),
          surface: Color(0xFF1E1E1E),
          onSurface: Color(0xFFE5E2E1),
          tertiary: Color(0xFFF5BD6A),
          error: Color(0xFFFFB4AB),
        ),
      ),
      home: const HomeShell(),
    );
  }
}

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _tabIndex = 0;

  final List<Widget> _pages = const [
    StudentsScreen(),
    AttendanceScreen(),
    SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_tabIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tabIndex,
        backgroundColor: const Color(0xFF1B1B1C),
        indicatorColor: const Color(0xFF6FDAB5).withOpacity(0.16),
        onDestinationSelected: (i) => setState(() => _tabIndex = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.people_outline), label: 'الطلاب'),
          NavigationDestination(icon: Icon(Icons.event_available_outlined), label: 'الحضور'),
          NavigationDestination(icon: Icon(Icons.settings_outlined), label: 'الإعدادات'),
        ],
      ),
    );
  }
}
`;

export const FLUTTER_PROJECT_FILES: FlutterProjectFile[] = [
  { path: 'pubspec.yaml', label: 'pubspec.yaml', content: PUBSPEC_YAML },
  { path: 'README.md', label: 'README.md', content: README_MD },
  { path: 'lib/main.dart', label: 'lib/main.dart', content: MAIN_DART },
  { path: 'lib/models/app_models.dart', label: 'app_models.dart', content: MODELS_DART },
  { path: 'lib/data/quran_data.dart', label: 'quran_data.dart', content: QURAN_DATA_DART },
  { path: 'lib/db/database_helper.dart', label: 'database_helper.dart', content: DATABASE_HELPER_DART },
  { path: 'lib/screens/students_screen.dart', label: 'students_screen.dart', content: STUDENTS_SCREEN_DART },
  { path: 'lib/screens/surahs_screen.dart', label: 'surahs_screen.dart', content: SURAHS_SCREEN_DART },
  { path: 'lib/screens/mushaf_screen.dart', label: 'mushaf_screen.dart', content: MUSHAF_SCREEN_DART },
  { path: 'lib/screens/attendance_screen.dart', label: 'attendance_screen.dart', content: ATTENDANCE_SCREEN_DART },
  { path: 'lib/screens/settings_screen.dart', label: 'settings_screen.dart', content: SETTINGS_SCREEN_DART },
  { path: 'lib/services/pdf_report_service.dart', label: 'pdf_report_service.dart', content: PDF_SERVICE_DART },
];

export async function downloadFlutterProjectZip(): Promise<string> {
  const zip = new JSZip();
  const rootFolder = zip.folder('sanad_slate_flutter');
  if (!rootFolder) {
    throw new Error('Could not initialize zip folder');
  }

  for (const file of FLUTTER_PROJECT_FILES) {
    rootFolder.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const filename = 'sanad_slate_flutter_project.zip';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return filename;
}
