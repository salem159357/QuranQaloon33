import { MushafPage, SurahInfo } from '../types';

export const SURAHS: SurahInfo[] = [
  { number: 1, nameArabic: 'سورة الفاتحة', nameLatin: 'Al-Fātiḥah', revelation: 'مكية', ayahCount: 7, startPage: 1, juz: 1 },
  { number: 2, nameArabic: 'سورة البقرة', nameLatin: 'Al-Baqarah', revelation: 'مدنية', ayahCount: 286, startPage: 2, juz: 1 },
  { number: 3, nameArabic: 'سورة آل عمران', nameLatin: 'Āl-ʿImrān', revelation: 'مدنية', ayahCount: 200, startPage: 50, juz: 3 },
  { number: 4, nameArabic: 'سورة النساء', nameLatin: 'An-Nisāʾ', revelation: 'مدنية', ayahCount: 176, startPage: 77, juz: 4 },
  { number: 5, nameArabic: 'سورة المائدة', nameLatin: 'Al-Māʾidah', revelation: 'مدنية', ayahCount: 120, startPage: 106, juz: 6 },
  { number: 6, nameArabic: 'سورة الأنعام', nameLatin: 'Al-Anʿām', revelation: 'مكية', ayahCount: 165, startPage: 128, juz: 7 },
  { number: 7, nameArabic: 'سورة الأعراف', nameLatin: 'Al-Aʿrāf', revelation: 'مكية', ayahCount: 206, startPage: 151, juz: 8 },
  { number: 8, nameArabic: 'سورة الأنفال', nameLatin: 'Al-Anfāl', revelation: 'مدنية', ayahCount: 75, startPage: 177, juz: 9 },
  { number: 9, nameArabic: 'سورة التوبة', nameLatin: 'At-Tawbah', revelation: 'مدنية', ayahCount: 129, startPage: 187, juz: 10 },
  { number: 10, nameArabic: 'سورة يونس', nameLatin: 'Yūnus', revelation: 'مكية', ayahCount: 109, startPage: 208, juz: 11 },
  { number: 11, nameArabic: 'سورة هود', nameLatin: 'Hūd', revelation: 'مكية', ayahCount: 123, startPage: 221, juz: 11 },
  { number: 12, nameArabic: 'سورة يوسف', nameLatin: 'Yūsuf', revelation: 'مكية', ayahCount: 111, startPage: 235, juz: 12 },
  { number: 13, nameArabic: 'سورة الرعد', nameLatin: 'Ar-Raʿd', revelation: 'مدنية', ayahCount: 43, startPage: 249, juz: 13 },
  { number: 14, nameArabic: 'سورة إبراهيم', nameLatin: 'Ibrāhīm', revelation: 'مكية', ayahCount: 52, startPage: 255, juz: 13 },
  { number: 15, nameArabic: 'سورة الحجر', nameLatin: 'Al-Ḥijr', revelation: 'مكية', ayahCount: 99, startPage: 262, juz: 14 },
  { number: 16, nameArabic: 'سورة النحل', nameLatin: 'An-Naḥl', revelation: 'مكية', ayahCount: 128, startPage: 267, juz: 14 },
  { number: 17, nameArabic: 'سورة الإسراء', nameLatin: 'Al-Isrāʾ', revelation: 'مكية', ayahCount: 111, startPage: 282, juz: 15 },
  { number: 18, nameArabic: 'سورة الكهف', nameLatin: 'Al-Kahf', revelation: 'مكية', ayahCount: 110, startPage: 293, juz: 15 },
  { number: 19, nameArabic: 'سورة مريم', nameLatin: 'Maryam', revelation: 'مكية', ayahCount: 98, startPage: 305, juz: 16 },
  { number: 20, nameArabic: 'سورة طه', nameLatin: 'Ṭā-Hā', revelation: 'مكية', ayahCount: 135, startPage: 312, juz: 16 },
  { number: 21, nameArabic: 'سورة الأنبياء', nameLatin: 'Al-Anbiyāʾ', revelation: 'مكية', ayahCount: 112, startPage: 322, juz: 17 },
  { number: 22, nameArabic: 'سورة الحج', nameLatin: 'Al-Ḥajj', revelation: 'مدنية', ayahCount: 78, startPage: 332, juz: 17 },
  { number: 23, nameArabic: 'سورة المؤمنون', nameLatin: 'Al-Muʾminūn', revelation: 'مكية', ayahCount: 118, startPage: 342, juz: 18 },
  { number: 24, nameArabic: 'سورة النور', nameLatin: 'An-Nūr', revelation: 'مدنية', ayahCount: 64, startPage: 350, juz: 18 },
  { number: 25, nameArabic: 'سورة الفرقان', nameLatin: 'Al-Furqān', revelation: 'مكية', ayahCount: 77, startPage: 359, juz: 18 },
  { number: 26, nameArabic: 'سورة الشعراء', nameLatin: 'Ash-Shuʿarāʾ', revelation: 'مكية', ayahCount: 227, startPage: 367, juz: 19 },
  { number: 27, nameArabic: 'سورة النمل', nameLatin: 'An-Naml', revelation: 'مكية', ayahCount: 93, startPage: 377, juz: 19 },
  { number: 28, nameArabic: 'سورة القصص', nameLatin: 'Al-Qaṣaṣ', revelation: 'مكية', ayahCount: 88, startPage: 385, juz: 20 },
  { number: 29, nameArabic: 'سورة العنكبوت', nameLatin: 'Al-ʿAnkabūt', revelation: 'مكية', ayahCount: 69, startPage: 396, juz: 20 },
  { number: 30, nameArabic: 'سورة الروم', nameLatin: 'Ar-Rūm', revelation: 'مكية', ayahCount: 60, startPage: 404, juz: 21 },
];

export const MUSHAF_PAGES: Record<number, MushafPage> = {
  1: {
    pageNumber: 1,
    surahNumber: 1,
    surahNameLatin: 'Surah Al-Fātiḥah',
    surahNameArabic: 'سورة الفاتحة',
    juzNumber: 1,
    ayahs: [
      { surahNumber: 1, ayahNumber: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
      { surahNumber: 1, ayahNumber: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
      { surahNumber: 1, ayahNumber: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
      { surahNumber: 1, ayahNumber: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
      { surahNumber: 1, ayahNumber: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
      { surahNumber: 1, ayahNumber: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
      { surahNumber: 1, ayahNumber: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
    ],
  },
  2: {
    pageNumber: 2,
    surahNumber: 2,
    surahNameLatin: 'Surah Al-Baqarah',
    surahNameArabic: 'سورة البقرة',
    juzNumber: 1,
    ayahs: [
      { surahNumber: 2, ayahNumber: 1, text: 'الم' },
      { surahNumber: 2, ayahNumber: 2, text: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ' },
      { surahNumber: 2, ayahNumber: 3, text: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ' },
      { surahNumber: 2, ayahNumber: 4, text: 'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ' },
      { surahNumber: 2, ayahNumber: 5, text: 'أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ' },
    ],
  },
  50: {
    pageNumber: 50,
    surahNumber: 3,
    surahNameLatin: 'Surah Āl-ʿImrān',
    surahNameArabic: 'سورة آل عمران',
    juzNumber: 3,
    ayahs: [
      { surahNumber: 3, ayahNumber: 1, text: 'الم' },
      { surahNumber: 3, ayahNumber: 2, text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ' },
      { surahNumber: 3, ayahNumber: 3, text: 'نَزَّلَ عَلَيْكَ الْكِتَابَ بِالْحَقِّ مُصَدِّقًا لِّمَا بَيْنَ يَدَيْهِ وَأَنزَلَ التَّوْرَاةَ وَالْإِنجِيلَ' },
      { surahNumber: 3, ayahNumber: 4, text: 'مِن قَبْلُ هُدًى لِّلنَّاسِ وَأَنزَلَ الْفُرْقَانَ ۗ إِنَّ الَّذِينَ كَفَرُوا بِآيَاتِ اللَّهِ لَهُمْ عَذَابٌ شَدِيدٌ ۗ وَاللَّهُ عَزِيزٌ ذُو انتِقَامٍ' },
      { surahNumber: 3, ayahNumber: 5, text: 'إِنَّ اللَّهَ لَا يَخْفَىٰ عَلَيْهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ' },
      { surahNumber: 3, ayahNumber: 6, text: 'هُوَ الَّذِي يُصَوِّرُكُمْ فِي الْأَرْحَامِ كَيْفَ يَشَاءُ ۚ لَا إِلَٰهَ إِلَّا هُوَ الْعَزِيزُ الْحَكِيمُ' },
    ],
  },
  77: {
    pageNumber: 77,
    surahNumber: 4,
    surahNameLatin: 'Surah An-Nisāʾ',
    surahNameArabic: 'سورة النساء',
    juzNumber: 4,
    ayahs: [
      { surahNumber: 4, ayahNumber: 1, text: 'يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ وَخَلَقَ مِنْهَا زَوْجَهَا وَبَثَّ مِنْهُمَا رِجَالًا كَثِيرًا وَنِسَاءً ۚ وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ ۚ إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا' },
      { surahNumber: 4, ayahNumber: 2, text: 'وَآتُوا الْيَتَامَىٰ أَمْوَالَهُمْ ۖ وَلَا تَتَبَدَّلُوا الْخَبِيثَ بِالطَّيِّبِ ۖ وَلَا تَأْكُلُوا أَمْوَالَهُمْ إِلَىٰ أَمْوَالِكُمْ ۚ إِنَّهُ كَانَ حُوبًا كَبِيرًا' },
      { surahNumber: 4, ayahNumber: 3, text: 'وَإِنْ خِفْتُمْ أَلَّا تُقْسِطُوا فِي الْيَتَامَىٰ فَانكِحُوا مَا طَابَ لَكُم مِّنَ النِّسَاءِ مَثْنَىٰ وَثُلَاثَ وَرُبَاعَ ۖ فَإِنْ خِفْتُمْ أَلَّا تَعْدِلُوا فَوَاحِدَةً أَوْ مَا مَلَكَتْ أَيْمَانُكُمْ ۚ ذَٰلِكَ أَدْنَىٰ أَلَّا تَعُولُوا' },
    ],
  },
  83: {
    pageNumber: 83,
    surahNumber: 4,
    surahNameLatin: "Surah An-Nisā'",
    surahNameArabic: 'سورة النساء',
    juzNumber: 5,
    ayahs: [
      {
        surahNumber: 4,
        ayahNumber: 27,
        text: 'وَاللَّهُ يُرِيدُ أَن يَتُوبَ عَلَيْكُمْ وَيُرِيدُ الَّذِينَ يَتَّبِعُونَ الشَّهَوَاتِ أَن تَمِيلُوا مَيْلًا عَظِيمًا',
      },
      {
        surahNumber: 4,
        ayahNumber: 28,
        text: 'يُرِيدُ اللَّهُ أَن يُخَفِّفَ عَنكُمْ ۚ وَخُلِقَ الْإِنسَانُ ضَعِيفًا',
      },
      {
        surahNumber: 4,
        ayahNumber: 29,
        text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ ۚ وَلَا تَقْتُلُوا أَنفُسَكُمْ ۚ إِنَّ اللَّهَ كَانَ بِكُمْ رَحِيمًا',
      },
      {
        surahNumber: 4,
        ayahNumber: 30,
        text: 'وَمَن يَفْعَلْ ذَٰلِكَ عُدْوَانًا وَظُلْمًا فَسَوْفَ نُصْلِيهِ نَارًا ۚ وَكَانَ ذَٰلِكَ عَلَى اللَّهِ يَسِيرًا',
      },
      {
        surahNumber: 4,
        ayahNumber: 31,
        text: 'إِن تَجْتَنِبُوا كَبَائِرَ مَا تُنْهَوْنَ عَنْهُ نُكَفِّرْ عَنكُمْ سَيِّئَاتِكُمْ وَنُدْخِلْكُم مُّدْخَلًا كَرِيمًا',
        hasHizbQuarter: true,
      },
      {
        surahNumber: 4,
        ayahNumber: 32,
        text: 'وَلَا تَتَمَنَّوْا مَا فَضَّلَ اللَّهُ بِهِ بَعْضَكُمْ عَلَىٰ بَعْضٍ ۚ لِّلرِّجَالِ نَصِيبٌ مِّمَّا اكْتَسَبُوا ۖ وَلِلنِّسَاءِ نَصِيبٌ مِّمَّا اكْتَسَبْنَ ۚ وَاسْأَلُوا اللَّهَ مِن فَضْلِهِ ۗ إِنَّ اللَّهَ كَانَ بِكُلِّ شَيْءٍ عَلِيمًا',
      },
      {
        surahNumber: 4,
        ayahNumber: 33,
        text: 'وَلِكُلٍّ جَعَلْنَا مَوَالِيَ مِمَّا تَرَكَ الْوَالِدَانِ وَالْأَقْرَبُونَ ۚ وَالَّذِينَ عَقَدَتْ أَيْمَانُكُمْ فَآتُوهُمْ نَصِيبَهُمْ ۚ إِنَّ اللَّهَ كَانَ عَلَىٰ كُلِّ شَيْءٍ شَهِيدًا',
      },
    ],
  },
  106: {
    pageNumber: 106,
    surahNumber: 5,
    surahNameLatin: 'Surah Al-Māʾidah',
    surahNameArabic: 'سورة المائدة',
    juzNumber: 6,
    ayahs: [
      { surahNumber: 5, ayahNumber: 1, text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ ۚ أُحِلَّتْ لَكُم بَهِيمَةُ الْأَنْعَامِ إِلَّا مَا يُتْلَىٰ عَلَيْكُمْ غَيْرَ مُحِلِّي الصَّيْدِ وَأَنتُمْ حُرُمٌ ۗ إِنَّ اللَّهَ يَحْكُمُ مَا يُرِيدُ' },
      { surahNumber: 5, ayahNumber: 2, text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تُحِلُّوا شَعَائِرَ اللَّهِ وَلَا الشَّهْرَ الْحَرَامَ وَلَا الْهَدْيَ وَلَا الْقَلَائِدَ وَلَا آمِّينَ الْبَيْتَ الْحَرَامَ يَبْتَغُونَ فَضْلًا مِّن رَّبِّهِمْ وَرِضْوَانًا' },
    ],
  },
};

export function toArabicIndicDigits(num: number): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num)
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? digits[Number(ch)] : ch))
    .join('');
}

export function getPageForSurah(surahNumber: number): MushafPage {
  // Default to page 83 when opening Surah An-Nisā' (4) so it lands on the exact reference screen page,
  // or return the specific page if available, otherwise generate an interactive Surah preview page.
  if (surahNumber === 4) {
    return MUSHAF_PAGES[83];
  }
  const surah = SURAHS.find((s) => s.number === surahNumber) ?? SURAHS[0];
  if (MUSHAF_PAGES[surah.startPage]) {
    return MUSHAF_PAGES[surah.startPage];
  }
  return {
    pageNumber: surah.startPage,
    surahNumber: surah.number,
    surahNameLatin: `Surah ${surah.nameLatin}`,
    surahNameArabic: surah.nameArabic,
    juzNumber: surah.juz,
    ayahs: [
      {
        surahNumber: surah.number,
        ayahNumber: 1,
        text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ',
      },
      {
        surahNumber: surah.number,
        ayahNumber: 2,
        text: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
      },
      {
        surahNumber: surah.number,
        ayahNumber: 3,
        text: 'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ وَيُبَشِّرُ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا',
      },
      {
        surahNumber: surah.number,
        ayahNumber: 4,
        text: 'الَّذِينَ آتَيْنَاهُمُ الْكِتَابَ يَتْلُونَهُ حَقَّ تِلَاوَتِهِ أُولَٰئِكَ يُؤْمِنُونَ بِهِ',
      },
    ],
  };
}
