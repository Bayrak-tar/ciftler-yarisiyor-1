import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Copy, Share2, Users, Play, Crown } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

export default function PrivateRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { user } = useAuth();
  const { currentRoom, joinPrivateRoom, startPrivateGame, leaveRoom } = useGame();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (roomId && !currentRoom) {
      // Odaya katılmaya çalış
      joinPrivateRoom(roomId);
    }
  }, [roomId]);

  const isRoomOwner = currentRoom?.ownerId === user?.id;

  // Oyun başladığında tüm oyuncuları otomatik olarak oyun ekranına yönlendir
  useEffect(() => {
    if (currentRoom?.state === 'starting' || currentRoom?.state === 'playing') {
      // Eğer kullanıcı oda sahibi değilse (yani oyunu başlatan değilse) otomatik yönlendir
      if (!isRoomOwner) {
        router.replace(`/(tabs)/game?mode=private&roomId=${currentRoom.id}`);
      }
    }
  }, [currentRoom?.state, isRoomOwner, currentRoom?.id]);

  const handleStartGame = async () => {
    if (!currentRoom || !isRoomOwner) return;

    setIsStarting(true);
    try {
      await startPrivateGame(currentRoom.id);
      router.replace(`/(tabs)/game?mode=private&roomId=${currentRoom.id}`);
    } catch (error) {
      Alert.alert('Hata', 'Oyun başlatılırken bir hata oluştu');
    } finally {
      setIsStarting(false);
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Odadan Ayrıl',
      'Odadan ayrılmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Ayrıl', style: 'destructive', onPress: () => {
          leaveRoom();
          router.back();
        }},
      ]
    );
  };

  const shareRoomLink = async () => {
    if (!currentRoom) return;
    
    const roomLink = `https://ciftler-yarisiyor.com/private-room/${currentRoom.id}`;
    const message = `🎮 Çiftler Yarışıyor oyununa davet edildiniz!\n\nOda Kodu: ${currentRoom.id}\nBağlantı: ${roomLink}\n\nHemen katıl ve yarışmaya başla!`;

    try {
      await Share.share({
        message,
        title: 'Çiftler Yarışıyor - Oyun Daveti',
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  const copyRoomCode = async () => {
    if (!currentRoom) return;
    
    try {
      Clipboard.setString(currentRoom.id);
      Alert.alert('Kopyalandı', 'Oda kodu panoya kopyalandı');
    } catch (error) {
      Alert.alert('Hata', 'Oda kodu kopyalanamadı');
    }
  };

  if (!currentRoom) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#18181B' : '#F8FAFC' }]}>
        <LinearGradient
          colors={isDark ? ['#232136', '#18181B'] : ['#8B5CF6', '#A855F7']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Oda Bulunamadı</Text>
            
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={[styles.errorCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
            <Users size={48} color="#EF4444" />
            <Text style={[styles.errorTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
              Oda Bulunamadı
            </Text>
            <Text style={[styles.errorDescription, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
              Bu oda mevcut değil veya silinmiş olabilir. Lütfen oda kodunu kontrol edin.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#18181B' : '#F8FAFC' }]}>
      <LinearGradient
        colors={isDark ? ['#232136', '#18181B'] : ['#8B5CF6', '#A855F7']}
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
            <Users size={24} color="white" />
            <Text style={styles.headerTitle}>Özel Oda</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.shareHeaderButton}
            onPress={shareRoomLink}
          >
            <Share2 size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.roomSection}>
          <View style={[styles.roomCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
            <View style={styles.roomHeader}>
              <Text style={[styles.roomTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                Oyun Odası
              </Text>
              {isRoomOwner && (
                <View style={styles.ownerBadge}>
                  <Crown size={16} color="#FFD700" />
                  <Text style={styles.ownerText}>Oda Sahibi</Text>
                </View>
              )}
            </View>
            
            <View style={styles.roomCodeContainer}>
              <Text style={[styles.roomCodeLabel, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                Oda Kodu
              </Text>
              <View style={styles.roomCodeBox}>
                <Text style={styles.roomCodeText}>{currentRoom.id}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={copyRoomCode}
                >
                  <Copy size={20} color="#8B5CF6" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareRoomLink}
              >
                <Share2 size={20} color="#8B5CF6" />
                <Text style={styles.shareButtonText}>Davet Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.playersSection}>
          <View style={[styles.playersCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
            <Text style={[styles.playersTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
              Oyuncular ({currentRoom.players.length}/4)
            </Text>
            
            {currentRoom.players.map((player) => (
              <View key={player.id} style={styles.playerItem}>
                <View style={styles.playerAvatar}>
                  <Users size={16} color="#8B5CF6" />
                </View>
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerName, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                    {player.username}
                    {player.id === user?.id && ' (Sen)'}
                  </Text>
                  {player.id === currentRoom.ownerId && (
                    <View style={styles.ownerIndicator}>
                      <Crown size={12} color="#FFD700" />
                      <Text style={styles.ownerIndicatorText}>Oda Sahibi</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {/* Boş slotları göster */}
            {Array.from({ length: 4 - currentRoom.players.length }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.emptySlot}>
                <View style={styles.emptyAvatar}>
                  <Users size={16} color="#9CA3AF" />
                </View>
                <Text style={[styles.emptySlotText, { color: isDark ? '#71717A' : '#9CA3AF' }]}>
                  Oyuncu bekleniyor...
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {isRoomOwner && currentRoom.players.length >= 2 && (
          <Animated.View entering={FadeInDown.delay(600)} style={styles.startSection}>
            <TouchableOpacity
              style={[styles.startButton, { opacity: isStarting ? 0.6 : 1 }]}
              onPress={handleStartGame}
              disabled={isStarting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#F97316', '#FB923C']}
                style={styles.startButtonGradient}
              >
                <Play size={20} color="white" fill="white" />
                <Text style={styles.startButtonText}>
                  {isStarting ? 'Oyun Başlatılıyor...' : 'Oyunu Başlat'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={[styles.startNote, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
              {currentRoom.players.length < 4 
                ? `Eksik ${4 - currentRoom.players.length} oyuncu bot ile tamamlanacak`
                : 'Tüm oyuncular hazır!'
              }
            </Text>
          </Animated.View>
        )}

        {!isRoomOwner && (
          <Animated.View entering={FadeInDown.delay(600)} style={styles.waitingSection}>
            <View style={[styles.waitingCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
              <Text style={[styles.waitingTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                Oda Sahibi Bekleniyor
              </Text>
              <Text style={[styles.waitingDescription, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                Oda sahibi oyunu başlattığında yarışma başlayacak
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
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
  shareHeaderButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  roomSection: {
    marginBottom: 24,
  },
  roomCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roomTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ownerText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
  },
  roomCodeContainer: {
    marginBottom: 20,
  },
  roomCodeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  roomCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  roomCodeText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  copyButton: {
    padding: 8,
  },
  actionButtons: {
    marginBottom: 0,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5CF6',
  },
  playersSection: {
    marginBottom: 24,
  },
  playersCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  playersTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  ownerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ownerIndicatorText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#D97706',
  },
  emptySlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  emptyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptySlotText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  startSection: {
    alignItems: 'center',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 12,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  startNote: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  waitingSection: {
    alignItems: 'center',
  },
  waitingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  waitingTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  waitingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
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
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12,
  },
  errorDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});