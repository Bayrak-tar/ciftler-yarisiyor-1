import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { User, Trophy, Calendar, Target, Settings, CircleHelp as HelpCircle, LogOut, CreditCard as Edit3, Star, TrendingUp } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats = [
    { label: 'Toplam Puan', value: user?.totalScore || 0, icon: Target, color: '#8B5CF6' },
    { label: 'Oynanmış Oyun', value: user?.gamesPlayed || 0, icon: Calendar, color: '#14B8A6' },
    { label: 'Sıralama', value: '#42', icon: Trophy, color: '#F97316' },
    { label: 'Kazanma Oranı', value: '73%', icon: TrendingUp, color: '#EF4444' },
  ];

  const achievements = [
    { title: 'İlk Adım', description: 'İlk oyununuzu tamamladınız', earned: true },
    { title: 'Çift Uyum', description: '5 ortak akıl sorusunda tam puan aldınız', earned: true },
    { title: 'Bilgi Ustası', description: '10 genel kültür sorusunu doğru cevapladınız', earned: false },
    { title: 'Seri Kazanan', description: 'Üst üste 5 oyun kazandınız', earned: false },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#18181B' : '#F8FAFC' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={isDark ? ['#232136', '#18181B'] : ['#8B5CF6', '#A855F7']}
        style={styles.header}
      >
        <Animated.View entering={FadeInUp.delay(200)} style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={48} color="white" />
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Edit3 size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <stat.icon size={20} color="white" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Başarılar</Text>
          <View style={styles.achievementsList}>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementItem}>
                <View style={[styles.achievementIcon, { opacity: achievement.earned ? 1 : 0.3 }]}> 
                  <Star size={20} color={achievement.earned ? '#FFD700' : '#9CA3AF'} fill={achievement.earned ? '#FFD700' : 'none'} />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={[styles.achievementTitle, { opacity: achievement.earned ? 1 : 0.6 }]}> 
                    {achievement.title}
                  </Text>
                  <Text style={[styles.achievementDescription, { opacity: achievement.earned ? 1 : 0.5 }]}> 
                    {achievement.description}
                  </Text>
                </View>
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <Text style={styles.earnedText}>Tamamlandı</Text>
                  </View>
                )}
              </View>
            ))}
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  username: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statValue: {
    fontSize: 18,
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
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  achievementDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  earnedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  earnedText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});