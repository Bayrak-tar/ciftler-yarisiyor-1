// AI_BOT_INTEGRATION.ts
// ZORUNLU TEK KELİME SİSTEMİ - KESİNLİKLE DEĞİŞTİRİLEMEZ KURALLAR

export const createUltraForcePrompt = (category: string, questionText: string) => {
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

export const ultraForceValidation = (answer: string): string => {
  let cleaned = answer
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:()'"\-_*]/g, '')
    .replace(/\s+/g, '')
    .replace(/(dir|dır|tir|tır|dur|dür|tur|tür)$/g, '')
    .split(/[.!?]/)[0];
  cleaned = cleaned.split(/\s+/)[0];
  if (!cleaned || cleaned.length < 2) {
    throw new Error('GEÇERSİZ CEVAP FORMATI!');
  }
  return cleaned;
};
