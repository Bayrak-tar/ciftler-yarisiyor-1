import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame, GameMode } from '@/contexts/GameContext';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  Users, 
  User, 
  Shuffle, 
  Clock,
  MessageCircle,
  ArrowLeft,
  Loader
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

export default function GameScreen() {
  const { mode } = useLocalSearchParams<{ mode: GameMode }>();
  const { currentRoom, isLoading, joinRoom, leaveRoom } = useGame();
  const [timeLeft, setTimeLeft] = useState(30);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const modeConfig = {
    'couple-vs-couple': {
      title: 'Çift vs Çift',
      icon: Users,
      color: ['#8B5CF6', '#A855F7'],
    },
    'individual-vs-individual': {
      title: 'Birey vs Birey',
      icon: User,
      color: ['#14B8A6', '#06B6D4'],
    },
    'mixed-match': {
      title: 'Karışık Eşleşme',
      icon: Shuffle,
      color: ['#F97316', '#FB923C'],
    },
  };

  const config = mode ? modeConfig[mode] : modeConfig['couple-vs-couple'];

  useEffect(() => {
    if (mode && !currentRoom && !isLoading) {
      joinRoom(mode);
    }
  }, [mode]);

  useEffect(() => {
    if (currentRoom?.state === 'playing') {
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
  }, [currentRoom?.state]);

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

  if (isLoading) {
    return (
      <LinearGradient colors={config.color} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.View 
            entering={FadeInUp.delay(200)}
            style={styles.loadingContent}
          >
            <Loader size={48} color="white" />
            <Text style={styles.loadingTitle}>Oyuncu Aranıyor...</Text>
            <Text style={styles.loadingText}>
              Uygun rakipler bulunuyor, lütfen bekleyin
            </Text>
          </Animated.View>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (!currentRoom) {
    return (
      <View style={styles.container}>
        <Text>Oyun odası bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#18181B' : '#F8FAFC' }]}>
      <LinearGradient
        colors={isDark ? ['#232136', '#18181B'] : config.color}
        style={styles.header}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleLeaveRoom}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <config.icon size={24} color="white" />
            <Text style={styles.headerTitle}>{config.title}</Text>
          </View>
          
          <TouchableOpacity style={styles.chatButton}>
            <MessageCircle size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <View style={[styles.content, { backgroundColor: isDark ? '#18181B' : 'white' }] }>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.gameInfo}>
          <View style={styles.roundInfo}>
            <Text style={styles.roundText}>
              {currentRoom.roundNumber}. Tur - {getRoundName(currentRoom.currentRound)}
            </Text>
            <View style={styles.timerContainer}>
              <Clock size={16} color="white" />
              <Text style={styles.timerText}>{timeLeft}s</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.playersContainer}>
          <Text style={styles.playersTitle}>Oyuncular</Text>
          <View style={styles.playersList}>
            {currentRoom.players.map((player, index) => (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <View style={styles.playerAvatar}>
                    <User size={20} color="#8B5CF6" />
                  </View>
                  <Text style={styles.playerName}>{player.username}</Text>
                </View>
                <Text style={styles.playerScore}>
                  {currentRoom.scores[player.id] || 0} puan
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {currentRoom.state === 'playing' && (
          <Animated.View entering={FadeInDown.delay(600)} style={styles.gameArea}>
            <GameRoundComponent round={currentRoom.currentRound} />
          </Animated.View>
        )}

        {currentRoom.state === 'starting' && (
          <Animated.View entering={FadeInDown.delay(600)} style={styles.waitingArea}>
            <Text style={styles.waitingTitle}>Oyun Başlıyor!</Text>
            <Text style={styles.waitingText}>
              Tüm oyuncular hazır. Yakında başlayacaksınız...
            </Text>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}

function GameRoundComponent({ round }: { round: string }) {
  switch (round) {
    case 'common-mind':
      return <CommonMindRound />;
    case 'popular-answer':
      return <PopularAnswerRound />;
    case 'general-knowledge':
      return <GeneralKnowledgeRound />;
    default:
      return null;
  }
}

function CommonMindRound() {
  const [answer, setAnswer] = useState('');

  return (
    <View style={styles.roundContainer}>
      <Text style={styles.roundTitle}>Ortak Akıl</Text>
      <Text style={styles.questionText}>
        Partnerinizle ne zaman tanıştınız? (Ay/Yıl)
      </Text>
      <View style={styles.answerContainer}>
        <Text style={styles.answerLabel}>Cevabınız:</Text>
        <TouchableOpacity style={styles.answerInput}>
          <Text style={styles.answerPlaceholder}>Cevabınızı yazın...</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Cevabı Gönder</Text>
      </TouchableOpacity>
    </View>
  );
}

function PopularAnswerRound() {
  const options = ['Antalya', 'İstanbul', 'Bodrum', 'Kapadokya'];

  return (
    <View style={styles.roundContainer}>
      <Text style={styles.roundTitle}>En Popüler Cevap</Text>
      <Text style={styles.questionText}>
        Türkiye'de en çok ziyaret edilen tatil yeri hangisidir?
      </Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity key={index} style={styles.optionButton}>
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function GeneralKnowledgeRound() {
  return (
    <View style={styles.roundContainer}>
      <Text style={styles.roundTitle}>Genel Kültür</Text>
      <Text style={styles.categoryText}>Kategori: Tarih</Text>
      <Text style={styles.questionText}>
        Osmanlı İmparatorluğu hangi yılda kuruldu?
      </Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>1299</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>1326</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>1354</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>1389</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getRoundName(round: string): string {
  switch (round) {
    case 'common-mind':
      return 'Ortak Akıl';
    case 'popular-answer':
      return 'En Popüler Cevap';
    case 'general-knowledge':
      return 'Genel Kültür';
    default:
      return 'Bilinmeyen Tur';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
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
  chatButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingContent: {
    alignItems: 'center',
    marginBottom: 48,
  },
  loadingTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 24,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
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
  gameInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  roundInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  playersContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  playersTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  playersList: {
    gap: 12,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  playerScore: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5CF6',
  },
  gameArea: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
  },
  waitingArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  waitingTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
  },
  waitingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  roundContainer: {
    alignItems: 'center',
  },
  roundTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8B5CF6',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
  },
  answerContainer: {
    width: '100%',
    marginBottom: 24,
  },
  answerLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  answerInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  answerPlaceholder: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});