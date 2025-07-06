# AI Bot Integration - Çiftler Yarışıyor Oyunu

## Yapılan Değişiklikler

### 🤖 AI Bot Sistemi
- **Eski sistem**: Botlar önceden tanımlanmış listelerden cevap seçiyordu
- **Yeni sistem**: Botlar Hugging Face AI API'si ile gerçek zamanlı cevaplar üretiyor

### 🧠 AI Özellikleri

#### 1. Akıllı Cevap Üretimi
- `generateAIBotAnswer()`: Soruyu analiz ederek uygun cevap üretir
- Hugging Face DialoGPT-medium modeli kullanır
- Fallback sistemi: AI başarısız olursa basit anahtar kelime sistemi devreye girer

#### 2. Benzer Cevap Üretimi
- `generateAISimilarAnswer()`: Takım arkadaşıyla benzer ama farklı cevaplar üretir
- Aynı anlama gelen farklı kelimeler bulur
- Eş anlamlı kelime kontrolü yapar

#### 3. Anlamsal Benzerlik Hesaplama
- `calculateAISimilarity()`: İki cevap arasındaki anlamsal benzerliği ölçer
- Sentence-transformers paraphrase-multilingual-MiniLM-L12-v2 modeli kullanır
- Sadece kelime benzerliği değil, anlam benzerliği de hesaplanır

### 🔧 Teknik Detaylar

#### API Entegrasyonu
```typescript
// Cevap üretimi için
POST https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium

// Benzerlik hesaplama için  
POST https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
```

#### Güvenlik
- API key `.env.local` dosyasında saklanıyor
- Environment variable: `EXPO_PUBLIC_HUGGING_FACE_API_KEY`
- Fallback key koda gömülü

#### Hata Yönetimi
- AI API başarısız olursa fallback sistem devreye girer
- Network hataları için try-catch blokları
- Console logları ile detaylı hata takibi

### 🎯 Avantajlar

1. **Daha Gerçekçi**: Botlar artık gerçek insanlar gibi cevap veriyor
2. **Dinamik**: Her soru için farklı cevaplar üretilebiliyor
3. **Akıllı**: Anlamsal benzerlik ile daha adil puanlama
4. **Ücretsiz**: Hugging Face ücretsiz API kullanılıyor
5. **Güvenilir**: Fallback sistemi ile her zaman çalışır

### 📊 Puanlama Sistemi

```typescript
// AI destekli benzerlik hesaplama
const similarity = await calculateAdvancedSimilarity(answer1, answer2);
const points = Math.round(similarity * 100);
```

1. **Tam eşleşme**: %100 puan
2. **AI anlamsal benzerlik**: %70+ puan
3. **Eş anlamlı kelimeler**: %90 puan  
4. **Kısmi eşleşme**: %80 puan
5. **Levenshtein mesafesi**: Karakter benzerliği

### 🚀 Kullanım

Bot sistemi otomatik olarak çalışır:
1. Karışık eşleşme seçilir
2. Yeterli oyuncu bulunamazsa botlar eklenir
3. Soru sorulduğunda AI ile cevap üretilir
4. Benzerlik AI ile hesaplanır
5. Puanlar verilir

### 🔮 Gelecek Geliştirmeler

- Daha gelişmiş AI modelleri
- Türkçe'ye özel eğitilmiş modeller
- Cevap kalitesi değerlendirmesi
- Oyuncu davranışı analizi
