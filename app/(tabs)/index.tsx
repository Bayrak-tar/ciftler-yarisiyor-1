import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { 
  Play, 
  Users, 
  Shuffle, 
  Trophy,
  Calendar,
  Target,
  Plus,
  UserPlus
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats = [
    { label: 'Oynanmış Oyun', value: user?.gamesPlayed || 0, icon: Calendar },
    { label: 'Toplam Puan', value: user?.totalScore || 0, icon: Target },
    { label: 'Sıralama', value: '#42', icon: Trophy },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#18181B' : '#F8FAFC' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={isDark ? ['#232136', '#18181B'] : ['#8B5CF6', '#A855F7']}
        style={styles.header}
      >
        <Animated.View entering={FadeInUp.delay(200)} style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Hoş geldin,</Text>
            <Text style={styles.usernameText}>{user?.username}!</Text>
          </View>
          
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Users size={32} color="#8B5CF6" />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: isDark ? '#27272A' : 'rgba(255,255,255,0.2)' }]}>
              <stat.icon size={20} color="white" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.Text entering={FadeInDown.delay(600)} style={[styles.sectionTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
          Karışık Eşleşme
        </Animated.Text>

        {/* Hızlı Eşleşme */}
        <Animated.View entering={FadeInDown.delay(800)}>
          <TouchableOpacity
            style={styles.gameModeCard}
            onPress={() => router.push('/(tabs)/game?mode=mixed-match')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#F97316', '#FB923C']}
              style={styles.gameModeGradient}
            >
              <View style={styles.gameModeHeader}>
                <Shuffle size={32} color="white" />
                <Text style={styles.playersText}>4 Oyuncu</Text>
              </View>
              
              <View style={styles.gameModeContent}>
                <Text style={styles.gameModeTitle}>Hızlı Eşleşme</Text>
                <Text style={styles.gameModeDescription}>
                  Rastgele oyuncularla anında eşleş ve yarışmaya başla
                </Text>
              </View>
              
              <View style={styles.playButton}>
                <Play size={20} color="white" fill="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Özel Oda Oluştur */}
        <Animated.View entering={FadeInDown.delay(1000)}>
          <TouchableOpacity
            style={styles.gameModeCard}
            onPress={() => router.push('/private-room/create')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#14B8A6', '#06B6D4']}
              style={styles.gameModeGradient}
            >
              <View style={styles.gameModeHeader}>
                <Plus size={32} color="white" />
                <Text style={styles.playersText}>Özel Oda</Text>
              </View>
              
              <View style={styles.gameModeContent}>
                <Text style={styles.gameModeTitle}>Özel Oda Oluştur</Text>
                <Text style={styles.gameModeDescription}>
                  Arkadaşlarınla özel bir oda oluştur ve davet et
                </Text>
              </View>
              
              <View style={styles.playButton}>
                <UserPlus size={20} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Odaya Katıl */}
        <Animated.View entering={FadeInDown.delay(1200)}>
          <TouchableOpacity
            style={styles.gameModeCard}
            onPress={() => router.push('/private-room/join')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.gameModeGradient}
            >
              <View style={styles.gameModeHeader}>
                <Users size={32} color="white" />
                <Text style={styles.playersText}>Katıl</Text>
              </View>
              
              <View style={styles.gameModeContent}>
                <Text style={styles.gameModeTitle}>Odaya Katıl</Text>
                <Text style={styles.gameModeDescription}>
                  Oda kodunu girerek arkadaşlarının odasına katıl
                </Text>
              </View>
              
              <View style={styles.playButton}>
                <Play size={20} color="white" fill="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1400)} style={[styles.howToPlay, { backgroundColor: isDark ? '#27272A' : 'white' }]}>
          <Text style={[styles.howToPlayTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>Nasıl Oynanır?</Text>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[styles.stepText, { color: isDark ? '#A1A1AA' : '#4B5563' }]}>
                Hızlı eşleşme seç veya özel oda oluştur
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.stepText, { color: isDark ? '#A1A1AA' : '#4B5563' }]}>
                Ortak akıl sorusuna takım arkadaşınla aynı cevabı ver
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.stepText, { color: isDark ? '#A1A1AA' : '#4B5563' }]}>
                Benzer cevaplar yüksek puan getirir!
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  usernameText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 4,
  },
  avatarContainer: {
    marginLeft: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 24,
  },
  gameModeCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  gameModeGradient: {
    padding: 24,
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameModeHeader: {
    alignItems: 'center',
    marginRight: 20,
  },
  playersText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  gameModeContent: {
    flex: 1,
  },
  gameModeTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
  },
  gameModeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  howToPlay: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  howToPlayTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 20,
  },
  steps: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 22,
  },
});