import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { ArrowLeft, Copy, Share2, Users, Play } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

export default function CreatePrivateRoomScreen() {
  const { user } = useAuth();
  const { createPrivateRoom, currentRoom } = useGame();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    if (!user) return;

    setIsCreating(true);
    try {
      const roomId = await createPrivateRoom();
      if (roomId) {
        router.replace(`/private-room/${roomId}`);
      }
    } catch (error) {
      Alert.alert('Hata', 'Oda oluşturulurken bir hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  const shareRoomLink = async (roomId: string) => {
    const roomLink = `https://ciftler-yarisiyor.com/private-room/${roomId}`;
    const message = `🎮 Çiftler Yarışıyor oyununa davet edildiniz!\n\nOda Kodu: ${roomId}\nBağlantı: ${roomLink}\n\nHemen katıl ve yarışmaya başla!`;

    try {
      await Share.share({
        message,
        title: 'Çiftler Yarışıyor - Oyun Daveti',
      });
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };

  const copyRoomCode = async (roomId: string) => {
    try {
      Clipboard.setString(roomId);
      Alert.alert('Kopyalandı', 'Oda kodu panoya kopyalandı');
    } catch (error) {
      Alert.alert('Hata', 'Oda kodu kopyalanamadı');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#18181B' : '#F8FAFC' }]}>
      <LinearGradient
        colors={isDark ? ['#232136', '#18181B'] : ['#14B8A6', '#06B6D4']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Users size={24} color="white" />
            <Text style={styles.headerTitle}>Özel Oda</Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {!currentRoom ? (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.createSection}>
            <View style={[styles.infoCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
              <Users size={48} color="#14B8A6" />
              <Text style={[styles.infoTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                Özel Oda Oluştur
              </Text>
              <Text style={[styles.infoDescription, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                Arkadaşlarınla özel bir oyun odası oluştur. Oda kodunu paylaşarak arkadaşlarını davet edebilirsin.
              </Text>
              
              <View style={styles.features}>
                <View style={styles.feature}>
                  <View style={styles.featureDot} />
                  <Text style={[styles.featureText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                    En fazla 4 oyuncu
                  </Text>
                </View>
                <View style={styles.feature}>
                  <View style={styles.featureDot} />
                  <Text style={[styles.featureText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                    Sadece sen oyunu başlatabilirsin
                  </Text>
                </View>
                <View style={styles.feature}>
                  <View style={styles.featureDot} />
                  <Text style={[styles.featureText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                    Eksik oyuncular bot ile tamamlanır
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.createButton, { opacity: isCreating ? 0.6 : 1 }]}
              onPress={handleCreateRoom}
              disabled={isCreating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#14B8A6', '#06B6D4']}
                style={styles.createButtonGradient}
              >
                <Users size={20} color="white" />
                <Text style={styles.createButtonText}>
                  {isCreating ? 'Oda Oluşturuluyor...' : 'Oda Oluştur'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.roomSection}>
            <View style={[styles.roomCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
              <Text style={[styles.roomTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                Oda Oluşturuldu!
              </Text>
              
              <View style={styles.roomCodeContainer}>
                <Text style={[styles.roomCodeLabel, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                  Oda Kodu
                </Text>
                <View style={styles.roomCodeBox}>
                  <Text style={styles.roomCodeText}>{currentRoom.id}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyRoomCode(currentRoom.id)}
                  >
                    <Copy size={20} color="#14B8A6" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => shareRoomLink(currentRoom.id)}
                >
                  <Share2 size={20} color="#14B8A6" />
                  <Text style={styles.shareButtonText}>Davet Gönder</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.playersSection}>
                <Text style={[styles.playersTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                  Oyuncular ({currentRoom.players.length}/4)
                </Text>
                
                {currentRoom.players.map((player) => (
                  <View key={player.id} style={styles.playerItem}>
                    <View style={styles.playerAvatar}>
                      <Users size={16} color="#14B8A6" />
                    </View>
                    <Text style={[styles.playerName, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                      {player.username}
                      {player.id === user?.id && ' (Sen)'}
                    </Text>
                  </View>
                ))}
              </View>

              {currentRoom.players.length >= 2 && user?.id === currentRoom.ownerId && (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => router.push(`/private-room/${currentRoom.id}`)}
                >
                  <LinearGradient
                    colors={['#F97316', '#FB923C']}
                    style={styles.startButtonGradient}
                  >
                    <Play size={20} color="white" fill="white" />
                    <Text style={styles.startButtonText}>Odayı Yönet</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
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
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  createSection: {
    flex: 1,
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12,
  },
  infoDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  features: {
    alignSelf: 'stretch',
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#14B8A6',
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  roomSection: {
    flex: 1,
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
  roomTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  roomCodeContainer: {
    marginBottom: 24,
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  copyButton: {
    padding: 8,
  },
  actionButtons: {
    marginBottom: 24,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#14B8A6',
  },
  playersSection: {
    marginBottom: 24,
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
    paddingVertical: 8,
  },
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
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
});