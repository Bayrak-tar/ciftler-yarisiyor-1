import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { 
  advancedPatterns, 
  basicPatterns, 
  guaranteedAnswers, 
  questionTypeAnswers, 
  universalAnswers, 
  synonyms,
  categoryWords,
  filmSimilarAnswers,
  generateAdvancedSmartAnswer,
  generateBasicSmartAnswer,
  generateReliableFallbackAnswer,
  generateSmartFallbackAnswer,
  checkSynonyms,
  findWordCategory,
  calculateCategorySimilarity,
  a
} from '@/utils/botPatterns';
import axios from 'axios';

export type GameMode = 'couple-vs-couple' | 'individual-vs-individual' | 'mixed-match';
export type GameRound = 'common-mind' | 'popular-answer' | 'general-knowledge';
export type GameState = 'waiting' | 'starting' | 'playing' | 'finished' | 'scoring';

export interface GameRoom {
  id: string;
  mode: GameMode;
  players: Player[];
  teams: Team[];
  currentRound: GameRound;
  roundNumber: number;
  state: GameState;
  scores: { [teamId: string]: number };
  currentQuestion?: Question;
  answers?: { [playerId: string]: string };
  roundResults?: RoundResult[];
  createdAt: any;
  startedAt?: any;
  maxPlayers: number;
  hasAnswered?: { [playerId: string]: boolean };
}

export interface Player {
  id: string;
  username: string;
  teamId: string;
  isBot?: boolean;
  joinedAt?: any;
}

export interface Team {
  id: string;
  name: string;
  playerIds: string[];
  color: string;
}

export interface Question {
  id: string;
  questionText: string;
  answerType: 'text' | 'time' | 'number';
  roundType: 'common_sense' | 'most_popular' | 'general_knowledge';
  timeLimit: number;
}

export interface RoundResult {
  roundNumber: number;
  question: string;
  teamScores: {
    [teamId: string]: {
      score: number;
      similarity: number;
      answers: { [playerId: string]: string };
      playerNames: { [playerId: string]: string };
    }
  };
}

interface GameContextType {
  currentRoom: GameRoom | null;
  isSearching: boolean;
  searchTimeLeft: number;
  joinMixedMatch: () => Promise<void>;
  leaveRoom: () => void;
  submitAnswer: (answer: string) => Promise<void>;
  currentAnswer: string;
  setCurrentAnswer: (answer: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeLeft, setSearchTimeLeft] = useState(30);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [roomListener, setRoomListener] = useState<(() => void) | null>(null);
  const [scoreCalculationInProgress, setScoreCalculationInProgress] = useState(false);
  const [autoTimerRef, setAutoTimerRef] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const { user } = useAuth();

  // Bot isimleri havuzu
  const botNames = [
    'Aşk Ustası', 'Kalp Kraliçesi', 'Sevgi Savaşçısı', 
    'Romantik Ruh', 'Çift Kalp', 'Aşk Büyücüsü',
    'Sevda Sultanı', 'Gönül Efendisi', 'Aşk Prensi',
    'Kalp Hırsızı', 'Sevgi Meleği', 'Romantik Kahraman'
  ];

  // Arama zamanlayıcısı
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isSearching && searchTimeLeft > 0) {
      timer = setTimeout(() => {
        setSearchTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isSearching && searchTimeLeft === 0) {
      // 30 saniye doldu, bot oyuncularla oyun başlat
      handleSearchTimeout();
    }
    return () => clearTimeout(timer);
  }, [isSearching, searchTimeLeft]);

  // Oyun odası dinleyicisini temizle
  useEffect(() => {
    return () => {
      if (roomListener) {
        roomListener();
      }
    };
  }, [roomListener]);

  // Otomatik puan hesaplama için dinleyici
  useEffect(() => {
    if (currentRoom?.state === 'playing' && currentRoom.answers && !scoreCalculationInProgress) {
      const totalPlayers = currentRoom.players.length;
      const realPlayers = currentRoom.players.filter(p => !p.isBot); // Sadece gerçek oyuncular
      const answeredPlayers = Object.keys(currentRoom.answers).length;
      const answeredRealPlayers = Object.keys(currentRoom.answers).filter(playerId => {
        const player = currentRoom.players.find(p => p.id === playerId);
        return player && !player.isBot;
      }).length;
      
      console.log(`📊 Cevap durumu: ${answeredRealPlayers}/${realPlayers.length} gerçek oyuncu, ${answeredPlayers}/${totalPlayers} toplam oyuncu`);
      
      // Sadece gerçek oyuncuların hepsi cevap verdiyse ve minimum 10 saniye geçmişse puanları hesapla
      if (answeredRealPlayers === realPlayers.length && realPlayers.length > 1) { // En az 2 gerçek oyuncu olmalı
        const currentTime = Date.now();
        const timeElapsed = gameStartTime ? (currentTime - gameStartTime) / 1000 : 0;
        
        if (timeElapsed >= 10) {
          console.log(`🎯 Tüm ${realPlayers.length} gerçek oyuncu cevap verdi (${timeElapsed.toFixed(1)}s geçti), puanlar hesaplanıyor...`);
          setScoreCalculationInProgress(true);
          
          // Otomatik timer'ı iptal et
          if (autoTimerRef) {
            clearTimeout(autoTimerRef);
            setAutoTimerRef(null);
            console.log('⏰ Otomatik timer iptal edildi');
          }
          
          setTimeout(() => {
            calculateAdvancedScores(currentRoom.id, currentRoom.answers!);
          }, 1000); // 1 saniye bekle
        } else {
          console.log(`⏳ Tüm ${realPlayers.length} gerçek oyuncu cevap verdi ama henüz ${timeElapsed.toFixed(1)}s geçti, minimum 10s bekleniyor...`);
        }
      }
    }
  }, [currentRoom?.answers, currentRoom?.state, scoreCalculationInProgress, autoTimerRef, gameStartTime]);

  const setupRoomListener = (roomId: string) => {
    // Önceki dinleyiciyi temizle
    if (roomListener) {
      roomListener();
    }

    const unsubscribe = onSnapshot(doc(db, 'gameRooms', roomId), (doc) => {
      if (doc.exists()) {
        const roomData = { id: doc.id, ...doc.data() } as GameRoom;
        setCurrentRoom(roomData);
        
        // Oyun başladıysa arama durumunu kapat
        if (roomData.state !== 'waiting') {
          setIsSearching(false);
        }
      } else {
        // Oda silinmişse
        setCurrentRoom(null);
        setIsSearching(false);
      }
    });

    setRoomListener(() => unsubscribe);
  };

  const joinMixedMatch = async () => {
    if (!user) return;

    setIsSearching(true);
    setSearchTimeLeft(30);

    try {
      // Önce bekleyen odaları ara
      const waitingRoomsQuery = query(
        collection(db, 'gameRooms'),
        where('mode', '==', 'mixed-match'),
        where('state', '==', 'waiting')
      );

      const waitingRoomsSnapshot = await getDocs(waitingRoomsQuery);
      
      // Uygun oda var mı kontrol et
      for (const roomDoc of waitingRoomsSnapshot.docs) {
        const roomData = { id: roomDoc.id, ...roomDoc.data() } as GameRoom;
        
        // Kullanıcı zaten bu odada mı?
        const isAlreadyInRoom = roomData.players.some(p => p.id === user.id);
        if (isAlreadyInRoom) {
          setCurrentRoom(roomData);
          setupRoomListener(roomData.id);
          return;
        }
        
        // Odada yer var mı? (4 oyuncudan az)
        if (roomData.players.length < roomData.maxPlayers) {
          await joinExistingRoom(roomData);
          return;
        }
      }

      // Uygun oda bulunamadı, yeni oda oluştur
      await createNewRoom();

    } catch (error) {
      console.error('Eşleştirme hatası:', error);
      setIsSearching(false);
    }
  };

  const joinExistingRoom = async (room: GameRoom) => {
    if (!user) return;

    try {
      // Takım ataması yap - daha az oyuncusu olan takıma ekle
      let targetTeamId = '';
      const team1PlayerCount = room.teams[0]?.playerIds.length || 0;
      const team2PlayerCount = room.teams[1]?.playerIds.length || 0;
      
      if (team1PlayerCount <= team2PlayerCount) {
        targetTeamId = room.teams[0].id;
      } else {
        targetTeamId = room.teams[1].id;
      }

      const newPlayer: Player = {
        id: user.id,
        username: user.username,
        teamId: targetTeamId,
      };

      // Oyuncuyu ve takım bilgilerini güncelle
      const updatedPlayers = [...room.players, newPlayer];
      const updatedTeams = room.teams.map(team => {
        if (team.id === targetTeamId) {
          return {
            ...team,
            playerIds: [...team.playerIds, user.id]
          };
        }
        return team;
      });

      // Oda dolu mu kontrol et
      const newState = updatedPlayers.length >= room.maxPlayers ? 'starting' : 'waiting';

      await updateDoc(doc(db, 'gameRooms', room.id), {
        players: updatedPlayers,
        teams: updatedTeams,
        state: newState,
        ...(newState === 'starting' && { startedAt: serverTimestamp() })
      });

      setCurrentRoom({ ...room, players: updatedPlayers, teams: updatedTeams, state: newState });
      setupRoomListener(room.id);

      // Oyun başlıyorsa ilk soruyu yükle
      if (newState === 'starting') {
        setTimeout(() => startFirstRound(room.id), 3000);
      }

    } catch (error) {
      console.error('Odaya katılma hatası:', error);
      setIsSearching(false);
    }
  };

  const createNewRoom = async () => {
    if (!user) return;

    try {
      // Takımları oluştur
      const teams: Team[] = [
        {
          id: 'team1',
          name: 'Takım 1',
          playerIds: [user.id],
          color: '#8B5CF6'
        },
        {
          id: 'team2',
          name: 'Takım 2',
          playerIds: [],
          color: '#14B8A6'
        }
      ];

      const newPlayer: Player = {
        id: user.id,
        username: user.username,
        teamId: 'team1',
      };

      const newRoom: Omit<GameRoom, 'id'> = {
        mode: 'mixed-match',
        players: [newPlayer],
        teams,
        currentRound: 'common-mind',
        roundNumber: 1,
        state: 'waiting',
        scores: { team1: 0, team2: 0 },
        maxPlayers: 4,
        roundResults: [],
        hasAnswered: {},
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'gameRooms'), newRoom);
      const createdRoom = { id: docRef.id, ...newRoom } as GameRoom;
      setCurrentRoom(createdRoom);
      setupRoomListener(docRef.id);

    } catch (error) {
      console.error('Oda oluşturma hatası:', error);
      setIsSearching(false);
    }
  };

  const handleSearchTimeout = async () => {
    if (!currentRoom || !user) {
      setIsSearching(false);
      return;
    }

    try {
      // Mevcut odaya bot oyuncular ekle
      const botsNeeded = currentRoom.maxPlayers - currentRoom.players.length;
      const botPlayers: Player[] = [];
      
      // Kullanılmış bot isimlerini al
      const usedBotNames = new Set<string>();

      for (let i = 0; i < botsNeeded; i++) {
        const botId = `bot_${Date.now()}_${i}`;
        
        // Kullanılmamış bot ismi seç
        let botName = '';
        do {
          botName = botNames[Math.floor(Math.random() * botNames.length)];
        } while (usedBotNames.has(botName));
        usedBotNames.add(botName);
        
        // Takım ataması - eğer tek oyuncu varsa, diğer takıma bot ekle
        // Eğer hiç oyuncu yoksa, botları eşit dağıt
        let targetTeamId = '';
        const team1Count = currentRoom.teams[0]?.playerIds.length || 0;
        const team2Count = currentRoom.teams[1]?.playerIds.length || 0;
        
        // İlk bot her zaman kullanıcının karşı takımına
        if (i === 0 && team1Count > 0 && team2Count === 0) {
          targetTeamId = currentRoom.teams[1].id;
        } else if (i === 0 && team2Count > 0 && team1Count === 0) {
          targetTeamId = currentRoom.teams[0].id;
        } else {
          // Sonraki botları eşit dağıt
          const currentTeam1Count = team1Count + botPlayers.filter(bot => bot.teamId === currentRoom.teams[0].id).length;
          const currentTeam2Count = team2Count + botPlayers.filter(bot => bot.teamId === currentRoom.teams[1].id).length;
          
          if (currentTeam1Count <= currentTeam2Count) {
            targetTeamId = currentRoom.teams[0].id;
          } else {
            targetTeamId = currentRoom.teams[1].id;
          }
        }

        botPlayers.push({
          id: botId,
          username: botName,
          teamId: targetTeamId,
          isBot: true,
        });
        
        console.log(`🤖 Bot eklendi: ${botName} (ID: ${botId}, Team: ${targetTeamId}, isBot: true)`);
      }

      console.log(`🤖 Toplam ${botPlayers.length} bot ekleniyor:`, botPlayers.map(bot => ({ username: bot.username, isBot: bot.isBot })));

      // Takım bilgilerini güncelle
      const updatedPlayers = [...currentRoom.players, ...botPlayers];
      const updatedTeams = currentRoom.teams.map(team => {
        const teamBots = botPlayers.filter(bot => bot.teamId === team.id);
        return {
          ...team,
          playerIds: [...team.playerIds, ...teamBots.map(bot => bot.id)]
        };
      });

      await updateDoc(doc(db, 'gameRooms', currentRoom.id), {
        players: updatedPlayers,
        teams: updatedTeams,
        state: 'starting',
        startedAt: serverTimestamp()
      });

      // İlk soruyu yükle
      setTimeout(() => startFirstRound(currentRoom.id), 3000);

    } catch (error) {
      console.error('Bot ekleme hatası:', error);
      setIsSearching(false);
    }
  };

  const startFirstRound = async (roomId: string) => {
    try {
      // Ortak akıl sorularını getir
      const questionsQuery = query(
        collection(db, 'questions'),
        where('roundType', '==', 'common_sense')
      );
      
      const questionsSnapshot = await getDocs(questionsQuery);
      const questions = questionsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        questionText: doc.data().questionText,
        answerType: doc.data().answerType,
        roundType: doc.data().roundType,
        timeLimit: doc.data().timeLimit
      }));
      
      if (questions.length > 0) {
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        console.log('🎮 Oyun başlıyor! Soru:', randomQuestion.questionText);
        
        // State'leri sıfırla
        setScoreCalculationInProgress(false);
        setGameStartTime(Date.now()); // Oyun başlama zamanını kaydet
        if (autoTimerRef) {
          clearTimeout(autoTimerRef);
          setAutoTimerRef(null);
        }
        
        await updateDoc(doc(db, 'gameRooms', roomId), {
          state: 'playing',
          currentQuestion: {
            id: randomQuestion.id,
            questionText: randomQuestion.questionText,
            answerType: randomQuestion.answerType || 'text',
            roundType: 'common_sense',
            timeLimit: 20 // 20 saniye süre
          },
          answers: {},
          hasAnswered: {}
        });

        // Bot cevaplarını 1-3 saniye arasında hızlıca gönder
        const botDelay = Math.random() * 2000 + 1000; // 1-3 saniye arası
        console.log(`⏰ Botlar ${Math.round(botDelay/1000)} saniye sonra cevap verecek`);
        setTimeout(() => generateBotAnswers(roomId, randomQuestion.questionText), botDelay);
        
        // 22 saniye sonra otomatik olarak puanları hesapla
        const timerId = setTimeout(() => {
          autoCalculateScores(roomId);
        }, 22000);
        setAutoTimerRef(timerId);
      }
    } catch (error) {
      console.error('Soru yükleme hatası:', error);
    }
  };

  const generateBotAnswers = async (roomId: string, questionText: string) => {
    try {
      console.log(`🤖 generateBotAnswers başlatılıyor - Room ID: ${roomId}, Soru: "${questionText}"`);
      
      // En güncel oda verilerini al
      const roomSnapshot = await getDocs(query(collection(db, 'gameRooms'), where('__name__', '==', roomId)));
      if (roomSnapshot.empty) {
        console.log('❌ Oda bulunamadı!');
        return;
      }
      
      const roomData = { id: roomSnapshot.docs[0].id, ...roomSnapshot.docs[0].data() } as GameRoom;
      console.log(`📊 Oda durumu:`, {
        totalPlayers: roomData.players?.length || 0,
        teams: roomData.teams?.length || 0,
        state: roomData.state
      });
      
      const botPlayers = roomData.players.filter(p => p.isBot);
      console.log(`🤖 Bot oyuncular:`, botPlayers.map(bot => ({ username: bot.username, teamId: bot.teamId, isBot: bot.isBot })));
      
      if (botPlayers.length === 0) {
        console.log('❌ Bot oyuncu bulunamadı - Normal oyuncular:', roomData.players.map(p => ({ username: p.username, isBot: p.isBot })));
        return;
      }

      console.log(`🤖 ${botPlayers.length} bot için AI cevap üretiliyor: "${questionText}"`);
      
      const botAnswers: { [key: string]: string } = {};
      
      // Her takım için koordineli AI cevaplar üret
      for (const team of roomData.teams) {
        const teamBots = botPlayers.filter(bot => bot.teamId === team.id);
        console.log(`👥 ${team.name} takımında ${teamBots.length} bot var:`, teamBots.map(b => b.username));
        
        if (teamBots.length >= 2) {
          // Aynı takımdaki botlar AI ile benzer cevaplar versin
          const baseAnswer = await generateAIBotAnswer(questionText);
          const similarAnswer = await generateAISimilarAnswer(baseAnswer, questionText);
          
          // Boş cevap kontrolü
          const validBaseAnswer = baseAnswer && baseAnswer.trim().length > 0 ? baseAnswer : 'ekmek';
          const validSimilarAnswer = similarAnswer && similarAnswer.trim().length > 0 ? similarAnswer : 'peynir';
          
          botAnswers[teamBots[0].id] = validBaseAnswer;
          botAnswers[teamBots[1].id] = validSimilarAnswer;
          
          console.log(`🤖 ${team.name} takımı AI botları:`);
          console.log(`   ${teamBots[0].username}: "${validBaseAnswer}"`);
          console.log(`   ${teamBots[1].username}: "${validSimilarAnswer}"`);
        } else if (teamBots.length === 1) {
          // Tek bot varsa AI cevap ver
          const answer = await generateAIBotAnswer(questionText);
          
          // Boş cevap kontrolü
          const validAnswer = answer && answer.trim().length > 0 ? answer : 'su';
          
          botAnswers[teamBots[0].id] = validAnswer;
          
          console.log(`🤖 ${teamBots[0].username}: "${validAnswer}"`);
        }
      }

      console.log(`📝 Toplam ${Object.keys(botAnswers).length} bot cevabı üretildi:`, botAnswers);

      if (Object.keys(botAnswers).length > 0) {
        const currentAnswers = roomData.answers || {};
        const currentHasAnswered = roomData.hasAnswered || {};
        
        console.log(`💾 Mevcut cevaplar:`, currentAnswers);
        console.log(`✅ Mevcut cevap durumları:`, currentHasAnswered);
        
        const allAnswers = { ...currentAnswers, ...botAnswers };
        const allHasAnswered = { ...currentHasAnswered };
        
        // Bot cevap durumlarını güncelle
        Object.keys(botAnswers).forEach(botId => {
          allHasAnswered[botId] = true;
        });

        console.log(`🔄 Güncellenecek tüm cevaplar:`, allAnswers);
        console.log(`🔄 Güncellenecek tüm cevap durumları:`, allHasAnswered);

        try {
          await updateDoc(doc(db, 'gameRooms', roomId), {
            answers: allAnswers,
            hasAnswered: allHasAnswered
          });

          console.log('✅ AI Bot cevapları başarıyla Firebase\'e gönderildi!');
          console.log('📤 Gönderilen veriler:', { answers: allAnswers, hasAnswered: allHasAnswered });
        } catch (firebaseError) {
          console.error('❌ Firebase güncelleme hatası:', firebaseError);
          throw firebaseError;
        }
      } else {
        console.log('❌ Hiçbir bot cevabı üretilemedi!');
      }
    } catch (error) {
      console.error('❌ AI Bot cevap sistemi genel hatası:', error);
      console.error('❌ Hata detayları:', {
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
        stack: error instanceof Error ? error.stack : undefined,
        roomId,
        questionText
      });
      
      // Acil durum fallback - en azından basit cevaplar gönder
      try {
        console.log('🆘 Acil durum fallback sistemi devreye giriyor...');
        
        const roomSnapshot = await getDocs(query(collection(db, 'gameRooms'), where('__name__', '==', roomId)));
        if (!roomSnapshot.empty) {
          const roomData = { id: roomSnapshot.docs[0].id, ...roomSnapshot.docs[0].data() } as GameRoom;
          const botPlayers = roomData.players.filter(p => p.isBot);
          
          if (botPlayers.length > 0) {
            const emergencyAnswers: { [key: string]: string } = {};
            const emergencyAnswerOptions = ['ekmek', 'peynir', 'yumurta', 'su', 'çay'];
            
            botPlayers.forEach((bot, index) => {
              emergencyAnswers[bot.id] = emergencyAnswerOptions[index % emergencyAnswerOptions.length];
            });
            
            const currentAnswers = roomData.answers || {};
            const currentHasAnswered = roomData.hasAnswered || {};
            const allAnswers = { ...currentAnswers, ...emergencyAnswers };
            const allHasAnswered = { ...currentHasAnswered };
            
            Object.keys(emergencyAnswers).forEach(botId => {
              allHasAnswered[botId] = true;
            });
            
            await updateDoc(doc(db, 'gameRooms', roomId), {
              answers: allAnswers,
              hasAnswered: allHasAnswered
            });
            
            console.log('🆘 Acil durum bot cevapları gönderildi:', emergencyAnswers);
          }
        }
      } catch (emergencyError) {
        console.error('🆘 Acil durum sistemi de başarısız!', emergencyError);
      }
    }
  };

  // Firebaseden soruya göre bot cevabı üret
  const generateAIBotAnswer = async (questionText: string): Promise<string> => {
    try {
      // 1. Firebaseden soruyu bul
      const questionsRef = collection(db, 'questions');
      const qSnapshot = await getDocs(query(questionsRef, where('questionText', '==', questionText)));
      let questionObj: any = null;
      if (!qSnapshot.empty) {
        questionObj = qSnapshot.docs[0].data();
      }

      // 2. Soru tipine ve kategoriye göre prompt hazırla
      let prompt = '';
      let category = questionObj?.category || '';
      if (category) {
        prompt = `Kategori: ${category}\nSoru: ${questionText}\n\nKurallar:\n- Sadece 1 kelimeyle cevap ver.\n- Cevap kategoriye uygun olmalı.\n- Türkçe yaz.\n\nCevap:`;
      } else {
        prompt = `Soru: ${questionText}\n\nKurallar:\n- Sadece 1 kelimeyle cevap ver.\n- Türkçe yaz.\n\nCevap:`;
      }

      // 3. AI'dan cevap al
      let aiAnswer = await tryFreeAIAPIs(prompt); // prompt artık dinamik
      aiAnswer = aiAnswer?.trim().toLowerCase();

      // 4. Kategoriye göre doğrula ve fallback uygula
      if (category === 'içecek') {
        const validDrinks = ['su', 'çay', 'kahve', 'ayran', 'kola', 'meşrubat', 'soda', 'şalgam'];
        if (!validDrinks.includes(aiAnswer)) return 'su';
      }
      // Diğer kategoriler için de benzer kontroller eklenebilir

      // AI cevabı mantıklıysa döndür
      if (aiAnswer && aiAnswer.length > 1 && aiAnswer !== 'bilinmiyor') {
        return aiAnswer;
      }

      // Fallback: gelişmiş ve basit sistemleri sırayla dene
      const smartAnswer = generateAdvancedSmartAnswer(questionText);
      if (smartAnswer !== 'bilinmiyor') return smartAnswer;
      const fallbackAnswer = generateSmartFallbackAnswer(questionText);
      if (fallbackAnswer !== 'bilinmiyor') return fallbackAnswer;
      return generateReliableFallbackAnswer(questionText);
    } catch (error) {
      console.error('❌ AI Bot cevap üretim hatası:', error);
      return generateReliableFallbackAnswer(questionText);
    }
  };

  // Ücretsiz AI API'leri deneme
  const tryFreeAIAPIs = async (questionText: string): Promise<string> => {
    try {
      console.log(`🤖 AI'ya soru soruluyor: "${questionText}"`);
      
      // Kapsamlı Türkçe prompt ile tek kelime cevap talep et
      const prompt = `Soru: "${questionText}"

Bu soruyu analiz et ve tek kelimelik doğru cevap ver. 

KURALLAR:
- Sadece 1 kelime olmalı
- Soruya tam uygun olmalı  
- Türkçe olmalı
- Mantıklı olmalı

ÖRNEKLER:
- Kahvaltılık sorusu → "ekmek", "peynir", "yumurta", "simit"
- Film türü sorusu → "komedi", "aksiyon", "drama"
- İçecek sorusu → "su", "çay", "kahve"  
- Sosyal medya sorusu → "whatsapp", "instagram", "facebook"
- Tatlı sorusu → "baklava", "künefe", "muhallebi"
- Meyve sorusu → "elma", "muz", "portakal"
- Şehir sorusu → "istanbul", "ankara", "izmir"
- Hayvan sorusu → "kedi", "köpek", "kuş"
- Renk sorusu → "mavi", "kırmızı", "yeşil"
- Giyim sorusu → "tişört", "pantolon", "elbise"

Cevap:`;

      const response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 10,
            temperature: 0.5,
            do_sample: true,
            top_p: 0.9
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_HUGGING_FACE_API_KEY || (globalThis as any).expo?.extra?.EXPO_PUBLIC_HUGGING_FACE_API_KEY || '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'}`,
            'Content-Type': 'application/json',
          }
        }
      );
      if (response.status === 200 && response.data) {
        let data = response.data;
        let aiAnswer = '';
        if (Array.isArray(data) && data[0]?.generated_text) {
          aiAnswer = data[0].generated_text.trim();
        } else if (data.generated_text) {
          aiAnswer = data.generated_text.trim();
        }
        aiAnswer = aiAnswer.replace(prompt, '').trim();

        // Sadece ilk kelimeyi al ve temizle
        aiAnswer = aiAnswer.split(/\s+/)[0].toLowerCase().replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ]/g, '');
        
        if (aiAnswer.length >= 2) {
          console.log(`✅ AI tek kelime cevabı: "${aiAnswer}"`);
          return aiAnswer;
        } else {
          console.log(`⚠️ AI cevabı çok kısa: "${aiAnswer}"`);
        }
      } else {
        console.error('❌ API yanıt formatı geçersiz:', response.status);
        return 'bilinmiyor';
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Hugging Face API hatası:', error.message);
      } else {
        console.error('❌ Bilinmeyen Hugging Face API hatası:', error);
      }
    }
    
    console.log('🔄 AI başarısız, fallback kullanılıyor...');
    return 'bilinmiyor';
  };

  // Import edilen güvenilir fallback kullanılıyor

  // Gelişmiş benzer cevap üretimi
  const generateAISimilarAnswer = async (baseAnswer: string, questionText: string): Promise<string> => {
    try {
      console.log(`🔄 "${baseAnswer}" için gelişmiş benzer cevap üretiliyor...`);
      
      // Önce film türleri için özel kontrol
      if (filmSimilarAnswers[baseAnswer]) {
        const similarOptions = filmSimilarAnswers[baseAnswer];
        const similarAnswer = similarOptions[Math.floor(Math.random() * similarOptions.length)];
        console.log(`✅ Film türü benzer cevabı: "${similarAnswer}"`);
        return similarAnswer;
      }
      
      // Önce eş anlamlı kelime kontrolü
      if (synonyms[baseAnswer]) {
        const synonymList = synonyms[baseAnswer];
        const similarAnswer = synonymList[Math.floor(Math.random() * synonymList.length)];
        console.log(`✅ Eş anlamlı kelime bulundu: "${similarAnswer}"`);
        return similarAnswer;
      }
      
      // Aynı kategoriden farklı bir cevap bul
      const question = questionText.toLowerCase();
      for (const pattern of advancedPatterns) {
        if (pattern.answers.includes(baseAnswer)) {
          const otherAnswers = pattern.answers.filter(a => a !== baseAnswer);
          if (otherAnswers.length > 0) {
            const similarAnswer = otherAnswers[Math.floor(Math.random() * otherAnswers.length)];
            console.log(`✅ Aynı kategoriden farklı cevap: "${similarAnswer}"`);
            return similarAnswer;
          }
        }
      }
      
      // Son çare: aynı cevabı ver
      console.log(`🔄 Benzer cevap bulunamadı, aynı cevap veriliyor: "${baseAnswer}"`);
      return baseAnswer;
      
    } catch (error) {
      console.error('❌ Benzer cevap üretme hatası:', error);
      return baseAnswer;
    }
  };

  const autoCalculateScores = async (roomId: string) => {
    // Eğer puan hesaplama zaten devam ediyorsa çık
    if (scoreCalculationInProgress) {
      console.log('⚠️ Puan hesaplama zaten devam ediyor, otomatik hesaplama atlanıyor');
      return;
    }

    try {
      setScoreCalculationInProgress(true);
      console.log('🔄 Puan hesaplama state\'i aktifleştirildi');
      
      // En güncel oda verilerini al
      const roomSnapshot = await getDocs(query(collection(db, 'gameRooms'), where('__name__', '==', roomId)));
      if (roomSnapshot.empty) return;
      
      const roomData = { id: roomSnapshot.docs[0].id, ...roomSnapshot.docs[0].data() } as GameRoom;
      const currentAnswers = roomData.answers || {};
      
      console.log('⏰ Süre doldu, otomatik puan hesaplanıyor...');
      console.log('📝 Mevcut cevaplar:', currentAnswers);
      
      await calculateAdvancedScores(roomId, currentAnswers);
    } catch (error) {
      console.error('Otomatik puan hesaplama hatası:', error);
      setScoreCalculationInProgress(false); // Hata durumunda da sıfırla
    } finally {
      // Her durumda sıfırla
      setScoreCalculationInProgress(false);
    }
  };

  const calculateAdvancedScores = async (roomId: string, answers: { [key: string]: string }) => {
    // Timeout kontrolü - 10 saniye sonra zorla sonlandır
    const timeoutId = setTimeout(() => {
      console.error('❌ Puan hesaplama timeout! Zorla sonlandırılıyor...');
      setScoreCalculationInProgress(false);
    }, 10000);
    
    try {
      console.log('🎯 Gelişmiş puan hesaplama başlıyor...');
      console.log('📝 Gelen cevaplar:', answers);

      // En güncel oda verilerini al
      const roomSnapshot = await getDocs(query(collection(db, 'gameRooms'), where('__name__', '==', roomId)));
      if (roomSnapshot.empty) {
        console.error('❌ Oda bulunamadı');
        return;
      }
      
      const room = { id: roomSnapshot.docs[0].id, ...roomSnapshot.docs[0].data() } as GameRoom;

      // Oyun durumunu puanlama moduna al
      await updateDoc(doc(db, 'gameRooms', roomId), {
        state: 'scoring'
      });

      const newScores = { ...room.scores };
      const teamScoreDetails: { [teamId: string]: any } = {};

      console.log('👥 Takımlar:', room.teams);
      console.log('🎮 Oyuncular:', room.players);

      // Her takım için detaylı puan hesaplama
      for (const team of room.teams) {
        console.log(`\n🏆 ${team.name} takımı işleniyor...`);
        console.log(`👥 Takım oyuncuları:`, team.playerIds);

        if (team.playerIds.length >= 2) {
          const player1Id = team.playerIds[0];
          const player2Id = team.playerIds[1];
          const player1Answer = answers[player1Id] || '';
          const player2Answer = answers[player2Id] || '';
          
          console.log(`📝 ${player1Id} cevabı: "${player1Answer}"`);
          console.log(`📝 ${player2Id} cevabı: "${player2Answer}"`);
          
          // Oyuncu isimlerini al
          const player1 = room.players.find(p => p.id === player1Id);
          const player2 = room.players.find(p => p.id === player2Id);
          
          console.log(`👤 Oyuncu 1: ${player1?.username}`);
          console.log(`👤 Oyuncu 2: ${player2?.username}`);
          
          // Gelişmiş benzerlik hesapla (eş anlamlı kelimeler dahil)
          const similarity = await calculateAdvancedSimilarity(player1Answer, player2Answer);
          const points = Math.round(similarity * 100);
          
          console.log(`🔍 Benzerlik oranı: ${similarity}`);
          console.log(`🎯 Hesaplanan puan: ${points}`);
          
          // Takım puanını güncelle
          newScores[team.id] = (newScores[team.id] || 0) + points;
          
          // Detaylı sonuçları kaydet
          teamScoreDetails[team.id] = {
            score: points,
            similarity: similarity,
            answers: {
              [player1Id]: player1Answer,
              [player2Id]: player2Answer
            },
            playerNames: {
              [player1Id]: player1?.username || 'Bilinmeyen',
              [player2Id]: player2?.username || 'Bilinmeyen'
            }
          };

          console.log(`✅ ${team.name} Takımı Puanlaması:`);
          console.log(`   ${player1?.username}: "${player1Answer}"`);
          console.log(`   ${player2?.username}: "${player2Answer}"`);
          console.log(`   Benzerlik: %${Math.round(similarity * 100)}`);
          console.log(`   Alınan Puan: ${points}`);
        } else {
          console.log(`⚠️ ${team.name} takımında yeterli oyuncu yok (${team.playerIds.length} oyuncu)`);
          
          // Eksik takım için 0 puan
          teamScoreDetails[team.id] = {
            score: 0,
            similarity: 0,
            answers: {},
            playerNames: {}
          };
        }
      }

      // Tur sonucunu kaydet
      const roundResult: RoundResult = {
        roundNumber: room.roundNumber,
        question: room.currentQuestion?.questionText || '',
        teamScores: teamScoreDetails
      };

      const updatedRoundResults = [...(room.roundResults || []), roundResult];

      console.log('💾 Veritabanına kaydediliyor...');
      console.log('🏆 Yeni skorlar:', newScores);
      console.log('📊 Tur sonuçları:', teamScoreDetails);

      // Sonuçları veritabanına kaydet
      await updateDoc(doc(db, 'gameRooms', roomId), {
        scores: newScores,
        roundResults: updatedRoundResults,
        state: 'finished' // Şimdilik tek tur
      });

      console.log('✅ Puan hesaplama tamamlandı!');
      console.log('🏆 Final Skorlar:', newScores);

    } catch (error) {
      console.error('❌ Gelişmiş puan hesaplama hatası:', error);
      console.error('❌ Hata detayları:', {
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
        stack: error instanceof Error ? error.stack : undefined,
        roomId,
        answers
      });
    } finally {
      // Timeout'u temizle
      clearTimeout(timeoutId);
      // Her durumda hesaplama state'ini sıfırla
      setScoreCalculationInProgress(false);
      console.log('🔄 Puan hesaplama state\'i sıfırlandı');
    }
  };

  const calculateAdvancedSimilarity = async (answer1: string, answer2: string): Promise<number> => {
    try {
      if (!answer1 || !answer2) {
        console.log('⚠️ Boş cevap tespit edildi');
        return 0;
      }
      
      const a1 = answer1.toLowerCase().trim();
      const a2 = answer2.toLowerCase().trim();
      
      console.log(`🔍 Gelişmiş kategori bazlı benzerlik hesaplanıyor: "${a1}" vs "${a2}"`);
      
      // Tam eşleşme
      if (a1 === a2) {
        console.log('✅ Tam eşleşme bulundu!');
        return 1;
      }
      
      // Kategori bazlı akıllı benzerlik kontrolü (öncelikli)
      const categorySimilarity = checkSynonyms(a1, a2);
      if (categorySimilarity > 0) {
        console.log(`🎯 Kategori bazlı benzerlik: ${categorySimilarity}`);
        return categorySimilarity;
      }
      
      // Benzer kelimeler kontrolü (sadece aynı kategorideyse)
      if (a1.includes(a2) || a2.includes(a1)) {
        console.log('🔍 Kısmi eşleşme bulundu!');
        return 0.3; // Düşük benzerlik
      }
      
      // Klasik string benzerlik hesaplama (sadece yedek)
      const maxLength = Math.max(a1.length, a2.length);
      if (maxLength === 0) return 1;
      
      // Sadece kısa kelimeler için Levenshtein kullan
      if (maxLength <= 8) {
        const distance = levenshteinDistance(a1, a2);
        const similarity = Math.max(0, (maxLength - distance) / maxLength);
        console.log(`📏 String benzerlik: ${similarity}`);
        
        // String benzerlik çok yüksekse kabul et, değilse reddet
        return similarity > 0.6 ? similarity * 0.4 : 0; // Düşük ağırlık ver
      }
      
      console.log('❌ Hiçbir benzerlik bulunamadı');
      return 0;
      
    } catch (error) {
      console.error('❌ Benzerlik hesaplama hatası:', error);
      return 0;
    }
  };

  // Import edilen checkSynonyms kullanılıyor

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const submitAnswer = async (answer: string) => {
    if (!currentRoom || !user || currentRoom.state !== 'playing') {
      console.log('⚠️ Cevap gönderilemez: oda yok, kullanıcı yok veya oyun oynamıyor');
      return;
    }

    try {
      console.log(`📝 ${user.username} cevabını gönderiyor: "${answer}"`);
      
      const currentAnswers = currentRoom.answers || {};
      const currentHasAnswered = currentRoom.hasAnswered || {};
      
      // Eğer kullanıcı zaten cevap verdiyse, güncelleme yap
      if (currentHasAnswered[user.id]) {
        console.log('🔄 Cevap güncelleniyor...');
      }
      
      const updatedAnswers = {
        ...currentAnswers,
        [user.id]: answer
      };
      
      const updatedHasAnswered = {
        ...currentHasAnswered,
        [user.id]: true
      };

      await updateDoc(doc(db, 'gameRooms', currentRoom.id), {
        answers: updatedAnswers,
        hasAnswered: updatedHasAnswered
      });

      console.log('✅ Cevap başarıyla gönderildi!');
      setCurrentAnswer('');
      
    } catch (error) {
      console.error('❌ Cevap gönderme hatası:', error);
    }
  };

  const leaveRoom = async () => {
    if (currentRoom && user) {
      try {
        // Kullanıcıyı odadan çıkar
        const updatedPlayers = currentRoom.players.filter(p => p.id !== user.id);
        const updatedTeams = currentRoom.teams.map(team => ({
          ...team,
          playerIds: team.playerIds.filter(id => id !== user.id)
        }));

        if (updatedPlayers.length === 0) {
          // Oda boşsa sil
          await deleteDoc(doc(db, 'gameRooms', currentRoom.id));
        } else {
          // Kullanıcıyı odadan çıkar
          await updateDoc(doc(db, 'gameRooms', currentRoom.id), {
            players: updatedPlayers,
            teams: updatedTeams
          });
        }
      } catch (error) {
        console.error('Oda çıkış hatası:', error);
      }
    }

    // Dinleyiciyi temizle
    if (roomListener) {
      roomListener();
      setRoomListener(null);
    }

    // Timer'ları temizle
    if (autoTimerRef) {
      clearTimeout(autoTimerRef);
      setAutoTimerRef(null);
    }

    setCurrentRoom(null);
    setIsSearching(false);
    setSearchTimeLeft(30);
    setCurrentAnswer('');
    setScoreCalculationInProgress(false); // Mutlaka sıfırla
    setGameStartTime(null);
    
    console.log('🚪 Oda başarıyla terk edildi, tüm state\'ler sıfırlandı');
  };

  // Debug amaçlı pattern matching fonksiyonu
  function testPatternMatching(question: string) {
    console.log('🔎 testPatternMatching çalıştı:', question);
    const patterns = [
      { name: 'kahvaltılık', regex: /kahvaltı|kahvaltılık/i },
      { name: 'içecek', regex: /içecek/i },
      { name: 'meyve', regex: /meyve/i },
      { name: 'şehir', regex: /şehir|il/i },
      { name: 'renk', regex: /renk/i },
      { name: 'hayvan', regex: /hayvan/i },
      { name: 'film', regex: /film/i },
    ];
    patterns.forEach(p => {
      if (p.regex.test(question)) {
        console.log(`Pattern eşleşti: ${p.name}`);
      }
    });
  }

  return (
    <GameContext.Provider value={{
      currentRoom,
      isSearching,
      searchTimeLeft,
      joinMixedMatch,
      leaveRoom,
      submitAnswer,
      currentAnswer,
      setCurrentAnswer
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// OpenAI GPT-4o-mini ile bilgi yarışması botu
export const getBotAnswer = async (userPrompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        store: true,
        messages: [
          { role: 'system', content: 'Sen bilgi yarışması oynayan, kısa ve net cevaplar veren bir Türkçe botsun. Sadece cevabı ver.' },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 50,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: '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',
        },
      }
    );
    const botReply = response.data.choices[0].message.content.trim();
    return botReply;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      // @ts-ignore
      console.error('Bot cevap alma hatası:', error.response?.data || error.message);
    } else {
      console.error('Bot cevap alma hatası:', error);
    }
    return 'Bir hata oluştu.';
  }
};