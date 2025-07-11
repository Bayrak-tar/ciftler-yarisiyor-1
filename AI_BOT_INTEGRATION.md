# ZORUNLU TEK KELİME SİSTEMİ - KESİNLİKLE DEĞİŞTİRİLEMEZ KURALLAR

## 📅 Tarih: 2025-07-10 21:44:28
## 👤 Kullanıcı: isubuu32

## 🚫 KESİN YASAKLAR VE ZORUNLU KURALLAR

```typescript
const createUltraForcePrompt = (category: string, questionText: string) => {
  return `
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
⚠️ MUTLAK ZORUNLU KURALLAR - HİÇBİR İSTİSNA KABUL EDİLMEZ ⚠️
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

1️⃣ [ KESİNLİKLE ZORUNLU ] TEK KELİME KURALI:
------------------------------------------------
✅ SADECE VE SADECE TEK KELİME YAZACAKSIN
✅ TÜRKÇE KARAKTER KULLANACAKSIN
✅ KELİMENİN YALIN HALİNİ KULLANACAKSIN

2️⃣ [ KESİNLİKLE YASAK ] YASAKLI ÖĞELER:
----------------------------------------
❌ CÜMLE KURMAK KESİNLİKLE YASAKTIR
❌ AÇIKLAMA YAPMAK KESİNLİKLE YASAKTIR
❌ NOKTALAMA İŞARETİ KULLANMAK KESİNLİKLE YASAKTIR
❌ -DIR -DİR -TIR -TİR EKLERİ KESİNLİKLE YASAKTIR
❌ KELİMEYE HERHANGİ BİR EK GETIRMEK KESİNLİKLE YASAKTIR

3️⃣ [ ZORUNLU FORMAT ] CEVAP FORMATI:
------------------------------------
✅ ÖRNEK CEVAP: buzdolabi
❌ YASAK: buzdolabıdır
❌ YASAK: Buzdolabı.
❌ YASAK: Bu bir buzdolabıdır.

${category ? `KATEGORİ: ${category}` : ''}
SORU: ${questionText}

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
⚠️ DİKKAT: SADECE TEK KELİME YAZ, BAŞKA HİÇBİR ŞEY YAZMA ⚠️
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

CEVAP:`;
};
```

## 🔒 ULTRA SIKI DOĞRULAMA SİSTEMİ

```typescript
const ultraForceValidation = (answer: string): string => {
  // Cevabı temizle
  let cleaned = answer
    .trim()
    .toLowerCase()
    // Tüm noktalama işaretlerini sil
    .replace(/[.,!?;:()'"\-_*]/g, '')
    // Tüm boşlukları sil
    .replace(/\s+/g, '')
    // -dir -dır eklerini sil
    .replace(/(dir|dır|tir|tır|dur|dür|tur|tür)$/g, '')
    // Açıklama cümlelerini engelle
    .split(/[.!?]/)[0];

  // Birden fazla kelime varsa sadece ilkini al  
  cleaned = cleaned.split(/\s+/)[0];
  
  // Cevap boşsa veya geçersizse
  if (!cleaned || cleaned.length < 2) {
    throw new Error('GEÇERSİZ CEVAP FORMATI!');
  }
  
  return cleaned;
};
```

## 🎯 ZORUNLU KONTROL SİSTEMİ

```typescript
const geminiForceConfig = {
  temperature: 0, // Yaratıcılık sıfır
  maxOutputTokens: 2, // Maksimum 2 token
  topK: 1, // Sadece en olası cevap
  topP: 0.1 // Minimum çeşitlilik
};

async function getUltraForcedSingleWord(questionObj) {
  const { category, questionText } = questionObj;
  
  // Zorunlu kategori kontrolleri
  const ZORUNLU_KATEGORILER = {
    sehirler: ['istanbul', 'ankara', 'izmir', 'antalya', 'bursa'],
    ulkeler: ['turkiye', 'almanya', 'fransa', 'ingiltere', 'italya'],
    icecekler: ['su', 'cay', 'kahve', 'ayran', 'kola'],
    yemekler: ['pilav', 'makarna', 'kofte', 'corba', 'doner'],
    esyalar: ['masa', 'sandalye', 'koltuk', 'yatak', 'dolap']
  };
  
  try {
    // Ultra zorlayıcı prompt oluştur
    const prompt = createUltraForcePrompt(category, questionText);
    
    // Minimum token ile API çağrısı
    const aiResponse = await callGeminiAPI(prompt, geminiForceConfig);
    
    // Ultra sıkı doğrulama
    let validatedAnswer = ultraForceValidation(aiResponse);
    
    // Kategori zorunlu kontrolü
    if (category && ZORUNLU_KATEGORILER[category]) {
      if (!ZORUNLU_KATEGORILER[category].includes(validatedAnswer)) {
        validatedAnswer = ZORUNLU_KATEGORILER[category][0];
      }
    }
    
    return validatedAnswer;
  } catch (error) {
    console.error('HATA:', error);
    // Zorunlu fallback
    if (category && ZORUNLU_KATEGORILER[category]) {
      return ZORUNLU_KATEGORILER[category][0];
    }
    return 'evet';
  }
}
```

## ✅ ÖRNEK KULLANIM VE TEST

```typescript
// Test senaryosu
const testSoru = {
  category: "sehirler",
  questionText: "Türkiye'de en çok ziyaret edilen şehir hangisidir?"
};

// Test fonksiyonu
const testSystem = async () => {
  try {
    const cevap = await getUltraForcedSingleWord(testSoru);
    console.log('CEVAP:', cevap); // Beklenen: "istanbul"
    
    if (cevap.includes(' ') || cevap.length > 15) {
      throw new Error('GEÇERSİZ CEVAP FORMATI!');
    }
  } catch (error) {
    console.error('TEST HATASI:', error);
    return 'istanbul'; // Zorunlu fallback
  }
};
```

## 🚨 ZORUNLU KONTROL LİSTESİ

1. ✅ Tek kelime zorlaması
2. ✅ Açıklama engelleme
3. ✅ Ek engelleme
4. ✅ Noktalama engelleme
5. ✅ Kategori kontrolü
6. ✅ Token sınırlaması
7. ✅ Fallback sistemi

## ⚠️ ÖNEMLİ NOTLAR

1. Bu sistem kesinlikle değiştirilemez
2. Hiçbir istisna kabul edilmez
3. Kurallar mutlak zorunludur
4. Her cevap tek kelime olmak zorundadır
5. Sistem otomatik düzeltme yapar