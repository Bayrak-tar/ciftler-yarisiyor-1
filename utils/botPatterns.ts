// Bot için örnek veri ve fonksiyonlar

// Kategorilere göre örnek cevaplar
export const categoryWords: Record<string, string[]> = {
  kahvaltilik: ['ekmek', 'peynir', 'zeytin', 'yumurta', 'bal', 'simit', 'çay'],
  icecek: ['su', 'çay', 'kahve', 'ayran', 'kola', 'meşrubat'],
  meyve: ['elma', 'muz', 'portakal', 'çilek', 'karpuz', 'üzüm'],
  sehir: ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya'],
  renk: ['mavi', 'kırmızı', 'yeşil', 'sarı', 'beyaz', 'siyah'],
  hayvan: ['kedi', 'köpek', 'kuş', 'at', 'balık', 'aslan'],
  film: ['komedi', 'aksiyon', 'drama', 'korku', 'bilimkurgu'],
};

// Film türleri için benzer cevaplar
export const filmSimilarAnswers: Record<string, string[]> = {
  komedi: ['drama', 'aksiyon'],
  aksiyon: ['macera', 'gerilim'],
  drama: ['komedi', 'romantik'],
  korku: ['gerilim', 'aksiyon'],
  bilimkurgu: ['fantastik', 'aksiyon'],
};

// Eş anlamlılar
export const synonyms: Record<string, string[]> = {
  su: ['içecek', 'ayran'],
  ekmek: ['simit', 'poğaça'],
  kedi: ['hayvan', 'pisi'],
  köpek: ['hayvan', 'can'],
  mavi: ['lacivert', 'gökyüzü'],
};

// Gelişmiş patternler
export const advancedPatterns = [
  { category: 'kahvaltilik', answers: categoryWords.kahvaltilik },
  { category: 'icecek', answers: categoryWords.icecek },
  { category: 'meyve', answers: categoryWords.meyve },
  { category: 'sehir', answers: categoryWords.sehir },
  { category: 'renk', answers: categoryWords.renk },
  { category: 'hayvan', answers: categoryWords.hayvan },
  { category: 'film', answers: categoryWords.film },
];

// Basit patternler
export const basicPatterns = [
  { pattern: /kahvaltı/i, answers: categoryWords.kahvaltilik },
  { pattern: /içecek/i, answers: categoryWords.icecek },
  { pattern: /meyve/i, answers: categoryWords.meyve },
  { pattern: /şehir|il/i, answers: categoryWords.sehir },
  { pattern: /renk/i, answers: categoryWords.renk },
  { pattern: /hayvan/i, answers: categoryWords.hayvan },
  { pattern: /film/i, answers: categoryWords.film },
];

// Evrensel garantili cevaplar
export const universalAnswers = ['ekmek', 'su', 'elma', 'istanbul', 'kedi', 'mavi'];
export const guaranteedAnswers = ['ekmek', 'su', 'elma', 'istanbul', 'kedi', 'mavi'];
export const questionTypeAnswers = {
  kahvaltilik: 'ekmek',
  icecek: 'su',
  meyve: 'elma',
  sehir: 'istanbul',
  renk: 'mavi',
  hayvan: 'kedi',
  film: 'komedi',
};

// Gelişmiş akıllı cevap üretici
export function generateAdvancedSmartAnswer(question: string): string {
  for (const pattern of advancedPatterns) {
    if (question.toLowerCase().includes(pattern.category)) {
      return pattern.answers[Math.floor(Math.random() * pattern.answers.length)];
    }
  }
  return 'bilinmiyor';
}

// Basit akıllı cevap üretici
export function generateBasicSmartAnswer(question: string): string {
  for (const pattern of basicPatterns) {
    if (pattern.pattern.test(question)) {
      return pattern.answers[Math.floor(Math.random() * pattern.answers.length)];
    }
  }
  return 'bilinmiyor';
}

// Güvenilir fallback cevap üretici
export function generateReliableFallbackAnswer(question: string): string {
  // Önce basit akıllı cevapları dene
  const basic = generateBasicSmartAnswer(question);
  if (basic !== 'bilinmiyor') return basic;
  // Son çare evrensel cevaplardan rastgele dön
  return universalAnswers[Math.floor(Math.random() * universalAnswers.length)];
}

// Akıllı fallback cevap üretici
export function generateSmartFallbackAnswer(question: string): string {
  // Gelişmiş ve basit cevapları sırayla dene
  const adv = generateAdvancedSmartAnswer(question);
  if (adv !== 'bilinmiyor') return adv;
  const basic = generateBasicSmartAnswer(question);
  if (basic !== 'bilinmiyor') return basic;
  return 'bilinmiyor';
}

// Eş anlamlı kontrolü (benzerlik oranı döner)
export function checkSynonyms(a: string, b: string): number {
  if (a === b) return 1;
  if (synonyms[a] && synonyms[a].includes(b)) return 0.8;
  if (synonyms[b] && synonyms[b].includes(a)) return 0.8;
  return 0;
}

// Kelimenin kategorisini bul
export function findWordCategory(word: string): string | null {
  for (const pattern of advancedPatterns) {
    if (pattern.answers.includes(word)) return pattern.category;
  }
  return null;
}

// Kategori bazlı benzerlik
export function calculateCategorySimilarity(a: string, b: string): number {
  const catA = findWordCategory(a);
  const catB = findWordCategory(b);
  return catA && catB && catA === catB ? 0.5 : 0;
}

// Gereksiz ama import hatası olmasın diye
export const a = 1;
