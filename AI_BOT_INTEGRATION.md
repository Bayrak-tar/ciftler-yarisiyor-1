# AI Bot Integration - Çiftler Yarışıyor Oyunu

## Yapılan Değişiklikler

### 🤖 AI Bot Sistemi
- **Eski sistem**: Botlar önceden tanımlanmış listelerden cevap seçiyordu
- **Yeni sistem**: Botlar Hugging Face AI API'si ile gerçek zamanlı ve dinamik cevaplar üretiyor
- **Kategori Desteği**: Soruların kategorileri Firebaseden dinamik olarak çekiliyor, AI promptları buna göre oluşturuluyor

### 🧠 AI Özellikleri

#### 1. Akıllı ve Gerçekçi Cevap Üretimi
- `generateAIBotAnswer(questionObj)`: Soru objesini analiz ederek uygun ve gerçekçi cevap üretir
- Soru tipi ve varsa kategori Firebaseden alınır, prompt'a eklenir
- Hugging Face DialoGPT-medium modeli ile tek kelimelik, mantıklı ve alakalı cevaplar üretilir
- Eğer kategori yoksa sadece soru metniyle AI'dan cevap alınır
- Fallback sistemi: AI başarısız olursa anahtar kelime ve örnek cevap sistemleri devreye girer

#### 2. Benzer Cevap Üretimi
- `generateAISimilarAnswer(baseAnswer, questionObj)`: Takım arkadaşıyla benzer ama farklı cevaplar üretir
- Kategori ve eş anlamlılar dikkate alınır
- Farklı varyasyonlar ve eş anlamlılar AI veya fallback ile üretilir

#### 3. Anlamsal Benzerlik Hesaplama
- `calculateAISimilarity(answer1, answer2)`: İki cevap arasındaki anlamsal benzerliği ölçer
- Sentence-transformers paraphrase-multilingual-MiniLM-L12-v2 modeli kullanılır
- Sadece kelime benzerliği değil, anlam benzerliği de hesaplanır

### ⚡️ AI Cevaplarının Gerçekçiliği ve Doğruluk Kontrolü

#### Gelişmiş Prompt ve Sonuç Doğrulama
- AI'ya gönderilen prompt, kategoriye ve sorunun türüne göre örnekli ve açıklamalı şekilde hazırlanır.
- Örneğin, içecek soruları için prompt şu şekilde olmalıdır:

```typescript
const prompt = `Kategori: İçecek\nSoru: Günün en çok tüketilen içeceği nedir?\n\nKurallar:\n- Sadece 1 kelimeyle cevap ver.\n- Cevap içecek ismi olmalı (ör: su, çay, kahve).\n- Türkçe yaz.\n\nCevap:`;
```
- AI'dan dönen cevap, ilgili kategoriye ait bir kelime listesiyle kontrol edilir. Eğer cevap alakasızsa (ör: şehir ismi, saçma kelime), fallback ile mantıklı bir cevap döndürülür.
- Örnek kontrol:

```typescript
const validDrinks = ['su', 'çay', 'kahve', 'ayran', 'kola', 'meşrubat', 'soda', 'şalgam'];
if (!validDrinks.includes(aiAnswer)) {
  aiAnswer = 'su'; // fallback
}
```
- Bu sayede, "izmir" gibi alakasız cevaplar engellenir ve her zaman mantıklı bir sonuç döner.

#### Tavsiye Edilen Geliştirme
- Her kategori için örnek cevap listeleri oluşturun ve AI'dan dönen cevabı bu listelerle doğrulayın.
- Promptları kategoriye göre özelleştirin ve örnekler ekleyin.
- AI cevabı mantıklı değilse, fallback ile garantili cevap döndürün.

### 🔧 Teknik Detaylar

#### Soru Kategorisi ve Prompt Oluşturma
- Firebaseden sorular çekilirken, her soru objesinin tipi ve varsa `category` alanı alınır
- AI'ya gönderilecek prompt şu şekilde oluşturulur:

```typescript
const prompt = category
  ? `Kategori: ${category}\nSoru: ${questionText}\n\nCevap:`
  : `Soru: ${questionText}\n\nCevap:`;
```
- Bu sayede AI, sorunun bağlamını daha iyi anlar ve gerçekçi cevaplar üretir

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

1. **Daha Gerçekçi**: Botlar artık gerçek insanlar gibi, sorunun kategorisine uygun cevap veriyor
2. **Dinamik**: Her soru için farklı ve alakalı cevaplar üretilebiliyor
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
3. Soru sorulduğunda Firebaseden kategori ve metin alınır, AI ile cevap üretilir
4. AI cevabı kategoriye göre doğrulanır, gerekirse fallback uygulanır
5. Benzerlik AI ile hesaplanır
6. Puanlar verilir

### 🔮 Gelecek Geliştirmeler

- Daha gelişmiş AI modelleri
- Türkçe'ye özel eğitilmiş modeller
- Cevap kalitesi değerlendirmesi
- Oyuncu davranışı analizi
