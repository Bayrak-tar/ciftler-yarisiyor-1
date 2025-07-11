import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '@/contexts/GameContext';
import { useLocalSearchParams, router } from 'expo-router';
import { Users, User, Shuffle, Clock, ArrowLeft, Loader, Send, Trophy, Target, CircleCheck as CheckCircle } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function GameScreen() {
  const { mode, roomId } = useLocalSearchParams<{ mode: string; roomId?: string }>();
  const { 
    currentRoom, 
    isSearching, 
    searchTimeLeft, 
    joinMixedMatch, 
    leaveRoom,
    submitAnswer,
    currentAnswer,
    setCurrentAnswer
  } = useGame();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(20);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!currentRoom && mode === 'mixed-match' && !isSearching) {
      joinMixedMatch();
    }
  }, [currentRoom, mode, isSearching]);

  useEffect(() => {
    if (currentRoom?.state === 'playing' && currentRoom.currentQuestion) {
      setTimeLeft(20);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentRoom?.state, currentRoom?.currentQuestion]);

  const handleLeaveRoom = () => {
    Alert.alert(
      'Oyundan Ayrıl',
      'Oyundan ayrılmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Ayrıl', style: 'destructive', onPress: () => {
          leaveRoom();
          router.back();
        }},
      ]
    );
  };

  const handleSubmitAnswer = () => {
    if (currentAnswer.trim() && !hasUserAnswered) {
      submitAnswer(currentAnswer);
    }
  };

  const hasUserAnswered = user ? currentRoom?.hasAnswered?.[user.id] : false;

  // Arama ekranı
  if (isSearching) {
    return (
      <LinearGradient colors={['#F97316', '#FB923C']} style={styles.container}>
        <View style={styles.searchContainer}>
          <Animated.View 
            entering={FadeInUp.delay(200)}
            style={styles.searchContent}
          >
            <Shuffle size={64} color="white" />
            <Text style={styles.searchTitle}>Oyuncu Aranıyor...</Text>
            <Text style={styles.searchSubtitle}>
              Karışık eşleşme modunda uygun oyuncular bulunuyor
            </Text>
            
            <View style={styles.timerContainer}>
              <Clock size={24} color="white" />
              <Text style={styles.timerText}>{searchTimeLeft}s</Text>
            </View>
            
            <Text style={styles.searchNote}>
              {searchTimeLeft > 0 
                ? `${searchTimeLeft} saniye sonra bot oyuncularla başlayacak`
                : 'Bot oyuncularla oyun başlatılıyor...'
              }
            </Text>
          </Animated.View>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => {
              leaveRoom();
              router.back();
            }}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (!currentRoom) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#18181B' : '#F8FAFC' }]}> 
        <LinearGradient
          colors={isDark ? ['#232136', '#18181B'] : ['#F97316', '#FB923C']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Oyun Bulunamadı</Text>
            
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={[styles.errorCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
            <Shuffle size={48} color="#EF4444" />
            <Text style={[styles.errorTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
              Oyun Odası Bulunamadı
            </Text>
            <Text style={[styles.errorDescription, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
              Oyun odası bulunamadı. Yeni bir oyun başlatmak için lütfen tekrar deneyin.
            </Text>
            
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => joinMixedMatch()}
            >
              <LinearGradient
                colors={['#F97316', '#FB923C']}
                style={styles.retryButtonGradient}
              >
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#18181B' : '#F8FAFC' }]}>
      <LinearGradient
        colors={isDark ? ['#232136', '#18181B'] : ['#F97316', '#FB923C']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleLeaveRoom}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Shuffle size={24} color="white" />
            <Text style={styles.headerTitle}>
              {currentRoom.isPrivate ? 'Özel Oda' : 'Karışık Eşleşme'}
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            {currentRoom.state === 'playing' && (
              <View style={[styles.gameTimer, { backgroundColor: timeLeft <= 5 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.2)' }]}>
                <Clock size={16} color="white" />
                <Text style={[styles.gameTimerText, { color: timeLeft <= 5 ? '#FEF2F2' : 'white' }]}>{timeLeft}s</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Takımlar */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.teamsContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
            Takımlar
          </Text>
          <View style={styles.teamsGrid}>
            {currentRoom.teams.map((team) => (
              <View key={team.id} style={[styles.teamCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
                <View style={[styles.teamHeader, { backgroundColor: team.color }]}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamScore}>
                    {currentRoom.scores[team.id] || 0} puan
                  </Text>
                </View>
                <View style={styles.teamPlayers}>
                  {team.playerIds.map((playerId) => {
                    const player = currentRoom.players.find(p => p.id === playerId);
                    const hasAnswered = currentRoom.hasAnswered?.[playerId];
                    return (
                      <View key={playerId} style={styles.playerItem}>
                        <User size={16} color={team.color} />
                        <Text style={[styles.playerName, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                          {player?.username}
                          {player?.isBot && ' 🤖'}
                        </Text>
                        {currentRoom.state === 'playing' && hasAnswered && (
                          <CheckCircle size={16} color="#10B981" />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Oyun Durumu */}
        {currentRoom.state === 'starting' && (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.statusContainer}>
            <View style={[styles.statusCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
              <Loader size={32} color="#F97316" />
              <Text style={[styles.statusTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                Oyun Başlıyor!
              </Text>
              <Text style={[styles.statusText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                Tüm oyuncular hazır. Ortak akıl sorusu yükleniyor...
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Puanlama Durumu */}
        {currentRoom.state === 'scoring' && (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.statusContainer}>
            <View style={[styles.statusCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
              <Target size={32} color="#10B981" />
              <Text style={[styles.statusTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                Puanlar Hesaplanıyor!
              </Text>
              <Text style={[styles.statusText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                Cevapların benzerliği analiz ediliyor...
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Ortak Akıl Sorusu */}
        {currentRoom.state === 'playing' && currentRoom.currentQuestion && (
          <Animated.View entering={FadeInDown.delay(600)} style={styles.questionContainer}>
            <View style={[styles.questionCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
              <View style={styles.questionHeader}>
                <Text style={styles.roundBadge}>ORTAK AKIL</Text>
                <View style={styles.questionTimer}>
                  <Clock size={16} color={timeLeft <= 5 ? "#EF4444" : "#F97316"} />
                  <Text style={[styles.questionTimerText, { color: timeLeft <= 5 ? "#EF4444" : "#F97316" }]}>{timeLeft}s</Text>
                </View>
              </View>
              
              <Text style={[styles.questionText, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                {currentRoom.currentQuestion.questionText}
              </Text>
              
              <Text style={[styles.questionInstruction, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                Takım arkadaşınızla aynı cevabı vermeye çalışın. Benzer cevaplar yüksek puan getirir!
              </Text>
              
              {hasUserAnswered ? (
                <View style={styles.answeredContainer}>
                  <CheckCircle size={48} color="#10B981" />
                  <Text style={[styles.answeredText, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                    Cevabınız Alındı!
                  </Text>
                  <Text style={[styles.answeredSubtext, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                    Diğer oyuncuların cevapları bekleniyor...
                  </Text>
                </View>
              ) : (
                <View style={styles.answerContainer}>
                  <TextInput
                    style={[styles.answerInput, { 
                      backgroundColor: isDark ? '#18181B' : '#F9FAFB',
                      color: isDark ? '#F3F4F6' : '#111827',
                      borderColor: isDark ? '#3F3F46' : '#E5E7EB'
                    }]}
                    placeholder="Cevabınızı yazın..."
                    placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                    value={currentAnswer}
                    onChangeText={setCurrentAnswer}
                    multiline
                    maxLength={100}
                    editable={timeLeft > 0}
                  />
                  
                  <TouchableOpacity
                    style={[styles.submitButton, { 
                      opacity: (currentAnswer.trim() && timeLeft > 0) ? 1 : 0.5,
                      backgroundColor: timeLeft > 0 ? '#F97316' : '#9CA3AF'
                    }]}
                    onPress={handleSubmitAnswer}
                    disabled={!currentAnswer.trim() || timeLeft <= 0}
                  >
                    <Send size={20} color="white" />
                    <Text style={styles.submitButtonText}>
                      {timeLeft > 0 ? 'Gönder' : 'Süre Doldu'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Oyun Sonucu */}
        {currentRoom.state === 'finished' && (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.resultContainer}>
            <View style={[styles.resultCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
              <Trophy size={48} color="#FFD700" />
              <Text style={[styles.resultTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                Oyun Bitti!
              </Text>
              
              {/* Detaylı Sonuçlar */}
              {currentRoom.roundResults && currentRoom.roundResults.length > 0 && (
                <View style={styles.detailedResults}>
                  <Text style={[styles.detailsTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                    Sonuçlar
                  </Text>
                  
                  {currentRoom.roundResults.map((result, index) => (
                    <View key={index} style={styles.roundDetail}>
                      <Text style={[styles.roundQuestion, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                        Soru: {result.question}
                      </Text>
                      
                      {Object.entries(result.teamScores).map(([teamId, teamResult]) => {
                        const team = currentRoom.teams.find(t => t.id === teamId);
                        return (
                          <View key={teamId} style={[styles.teamResult, { borderLeftColor: team?.color }]}>
                            <Text style={[styles.teamResultName, { color: team?.color }]}>
                              {team?.name}
                            </Text>
                            
                            <View style={styles.answersContainer}>
                              {Object.entries(teamResult.answers).map(([playerId, answer]) => (
                                <View key={playerId} style={styles.answerRow}>
                                  <Text style={[styles.playerAnswerName, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                                    {teamResult.playerNames[playerId]}:
                                  </Text>
                                  <Text style={[styles.playerAnswer, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                                    "{answer}"
                                  </Text>
                                </View>
                              ))}
                            </View>
                            
                            <View style={styles.scoreRow}>
                              <Text style={[styles.similarityText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                                Benzerlik: %{Math.round(teamResult.similarity * 100)}
                              </Text>
                              <Text style={[styles.pointsText, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                                +{teamResult.score} puan
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.finalScores}>
                <Text style={[styles.finalScoresTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                  Final Skorları
                </Text>
                {currentRoom.teams
                  .sort((a, b) => (currentRoom.scores[b.id] || 0) - (currentRoom.scores[a.id] || 0))
                  .map((team, index) => (
                    <View key={team.id} style={styles.scoreRow}>
                      <View style={styles.scoreLeft}>
                        {index === 0 && <Trophy size={20} color="#FFD700" />}
                        <Text style={styles.scorePosition}>#{index + 1}</Text>
                        <Text style={[styles.scoreTeam, { color: team.color }]}>
                          {team.name}
                        </Text>
                      </View>
                      <Text style={[styles.scorePoints, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                        {currentRoom.scores[team.id] || 0} puan
                      </Text>
                    </View>
                  ))}
              </View>
              
              <TouchableOpacity
                style={styles.playAgainButton}
                onPress={() => {
                  leaveRoom();
                  if (currentRoom?.isPrivate) {
                    router.replace('/private-room/create');
                  } else {
                    router.back();
                  }
                }}
              >
                <LinearGradient
                  colors={['#F97316', '#FB923C']}
                  style={styles.playAgainGradient}
                >
                  <Text style={styles.playAgainText}>
                    {currentRoom?.isPrivate ? 'Tekrar Oyna' : 'Ana Menüye Dön'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  gameTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gameTimerText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  searchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  searchContent: {
    alignItems: 'center',
    marginBottom: 48,
  },
  searchTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 24,
    textAlign: 'center',
  },
  searchSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  searchNote: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  teamsContainer: {
    marginBottom: 24,
  },
  teamsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  teamCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  teamHeader: {
    padding: 16,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  teamScore: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  teamPlayers: {
    padding: 16,
    gap: 8,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  roundBadge: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#F97316',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  questionTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questionTimerText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#F97316',
  },
  questionText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    lineHeight: 28,
    marginBottom: 12,
  },
  questionInstruction: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 24,
  },
  answerContainer: {
    gap: 16,
  },
  answerInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  answeredContainer: {
    alignItems: 'center',
    padding: 32,
  },
  answeredText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
  },
  answeredSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  resultContainer: {
    marginBottom: 24,
  },
  resultCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 24,
  },
  detailedResults: {
    width: '100%',
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  roundDetail: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(249, 115, 22, 0.05)',
    borderRadius: 12,
  },
  roundQuestion: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  teamResult: {
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
  },
  teamResultName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  answersContainer: {
    marginBottom: 8,
  },
  answerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  playerAnswerName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
    minWidth: 80,
  },
  playerAnswer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  similarityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  pointsText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  finalScores: {
    width: '100%',
    marginBottom: 32,
  },
  finalScoresTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  scorePosition: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#F97316',
    width: 40,
  },
  scoreTeam: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  scorePoints: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  playAgainButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  playAgainGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  playAgainText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});