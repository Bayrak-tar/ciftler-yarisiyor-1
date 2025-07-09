import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { router } from 'expo-router';
import { ArrowLeft, Users, LogIn } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

export default function JoinPrivateRoomScreen() {
  const { user } = useAuth();
  const { joinPrivateRoom } = useGame();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async () => {
    if (!user) return;

    if (!roomCode.trim()) {
      Alert.alert('Hata', 'Lütfen oda kodunu girin');
      return;
    }

    setIsJoining(true);
    try {
      const success = await joinPrivateRoom(roomCode.trim());
      if (success) {
        router.replace(`/private-room/${roomCode.trim()}`);
      } else {
        Alert.alert('Hata', 'Oda bulunamadı veya dolu');
      }
    } catch (error) {
      Alert.alert('Hata', 'Odaya katılırken bir hata oluştu');
    } finally {
      setIsJoining(false);
    }
  };

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
          
          <View style={styles.headerCenter}>
            <LogIn size={24} color="white" />
            <Text style={styles.headerTitle}>Odaya Katıl</Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.joinSection}>
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
            <Users size={48} color="#8B5CF6" />
            <Text style={[styles.infoTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
              Özel Odaya Katıl
            </Text>
            <Text style={[styles.infoDescription, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
              Arkadaşının gönderdiği oda kodunu girerek oyuna katıl. Oda sahibi oyunu başlattığında yarışma başlayacak.
            </Text>
          </View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.formSection}>
            <View style={[styles.inputCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
              <Text style={[styles.inputLabel, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                Oda Kodu
              </Text>
              
              <View style={[styles.inputContainer, { 
                backgroundColor: isDark ? '#18181B' : '#F9FAFB',
                borderColor: isDark ? '#3F3F46' : '#E5E7EB'
              }]}>
                <TextInput
                  style={[styles.input, { color: isDark ? '#F3F4F6' : '#111827' }]}
                  placeholder="Oda kodunu girin..."
                  placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                  value={roomCode}
                  onChangeText={setRoomCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={20}
                />
              </View>

              <TouchableOpacity
                style={[styles.joinButton, { opacity: (roomCode.trim() && !isJoining) ? 1 : 0.5 }]}
                onPress={handleJoinRoom}
                disabled={!roomCode.trim() || isJoining}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7']}
                  style={styles.joinButtonGradient}
                >
                  <LogIn size={20} color="white" />
                  <Text style={styles.joinButtonText}>
                    {isJoining ? 'Katılınıyor...' : 'Odaya Katıl'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600)} style={[styles.tipsCard, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
            <Text style={[styles.tipsTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
              💡 İpuçları
            </Text>
            <View style={styles.tips}>
              <Text style={[styles.tipText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                • Oda kodu büyük/küçük harf duyarlıdır
              </Text>
              <Text style={[styles.tipText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                • Her odada en fazla 4 oyuncu olabilir
              </Text>
              <Text style={[styles.tipText, { color: isDark ? '#A1A1AA' : '#6B7280' }]}>
                • Sadece oda sahibi oyunu başlatabilir
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
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
  joinSection: {
    flex: 1,
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
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
  },
  formSection: {
    marginBottom: 24,
  },
  inputCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  joinButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  joinButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  tips: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
});