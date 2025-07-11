import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Medal, Award, Crown, User, Calendar } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  gamesPlayed: number;
  winRate: number;
  rank: number;
}

export default function LeaderboardScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('weekly');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const periods = [
    { key: 'daily', label: 'Günlük' },
    { key: 'weekly', label: 'Haftalık' },
    { key: 'monthly', label: 'Aylık' },
    { key: 'allTime', label: 'Tüm Zamanlar' },
  ];

  const leaderboardData: LeaderboardEntry[] = [
    { id: '1', username: 'AşkınGücü', score: 4850, gamesPlayed: 48, winRate: 85, rank: 1 },
    { id: '2', username: 'ÇiftKalp', score: 4720, gamesPlayed: 52, winRate: 82, rank: 2 },
    { id: '3', username: 'Sevgililer', score: 4590, gamesPlayed: 45, winRate: 88, rank: 3 },
    { id: '4', username: 'İkiGönülBir', score: 4320, gamesPlayed: 38, winRate: 79, rank: 4 },
    { id: '5', username: 'SonsuzAşk', score: 4180, gamesPlayed: 41, winRate: 76, rank: 5 },
    { id: '6', username: 'Beraber', score: 3950, gamesPlayed: 35, winRate: 73, rank: 6 },
    { id: '7', username: 'TekYürek', score: 3820, gamesPlayed: 33, winRate: 71, rank: 7 },
    { id: '8', username: 'Birlikte', score: 3650, gamesPlayed: 29, winRate: 69, rank: 8 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Award size={24} color="#CD7F32" />;
      default:
        return (
          <View style={styles.rankNumber}>
            <Text style={styles.rankNumberText}>{rank}</Text>
          </View>
        );
    }
  };

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1:
        return ['#FFD700', '#FFA500'];
      case 2:
        return ['#C0C0C0', '#A8A8A8'];
      case 3:
        return ['#CD7F32', '#B8860B'];
      default:
        return ['#8B5CF6', '#A855F7'];
    }
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isTopThree = item.rank <= 3;
    
    return (
      <Animated.View entering={FadeInDown.delay(200 + index * 100)}>
        <View style={[styles.leaderboardItem, isTopThree && styles.topThreeItem]}>
          {isTopThree ? (
            <LinearGradient
              colors={getRankColors(item.rank)}
              style={styles.topThreeGradient}
            >
              <View style={styles.itemContent}>
                <View style={styles.rankContainer}>
                  {getRankIcon(item.rank)}
                </View>
                
                <View style={styles.playerInfo}>
                  <View style={styles.playerAvatar}>
                    <User size={16} color="white" />
                  </View>
                  <View style={styles.playerDetails}>
                    <Text style={styles.topThreeUsername}>{item.username}</Text>
                    <Text style={styles.topThreeStats}>
                      {item.gamesPlayed} oyun • %{item.winRate} kazanma
                    </Text>
                  </View>
                </View>
                
                <View style={styles.scoreContainer}>
                  <Text style={styles.topThreeScore}>{item.score.toLocaleString()}</Text>
                  <Text style={styles.topThreeScoreLabel}>puan</Text>
                </View>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.itemContent}>
              <View style={styles.rankContainer}>
                {getRankIcon(item.rank)}
              </View>
              
              <View style={styles.playerInfo}>
                <View style={styles.regularPlayerAvatar}>
                  <User size={16} color="#8B5CF6" />
                </View>
                <View style={styles.playerDetails}>
                  <Text style={styles.regularUsername}>{item.username}</Text>
                  <Text style={styles.regularStats}>
                    {item.gamesPlayed} oyun • %{item.winRate} kazanma
                  </Text>
                </View>
              </View>
              
              <View style={styles.scoreContainer}>
                <Text style={styles.regularScore}>{item.score.toLocaleString()}</Text>
                <Text style={styles.regularScoreLabel}>puan</Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#18181B' : '#F8FAFC' }] }>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 0 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={isDark ? ['#232136', '#18181B'] : ['#8B5CF6', '#A855F7']}
          style={styles.header}
        >
          <Animated.View entering={FadeInUp.delay(200)} style={styles.headerContent}>
            <Trophy size={32} color="white" />
            <Text style={styles.headerTitle}>Skor Tablosu</Text>
            <Text style={styles.headerSubtitle}>En iyi çiftleri keşfedin</Text>
          </Animated.View>
        </LinearGradient>
        <Animated.View entering={FadeInDown.delay(400)} style={styles.periodSelector}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodContainer}
          >
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.selectedPeriodButton
                ]}
                onPress={() => setSelectedPeriod(period.key as any)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.selectedPeriodButtonText
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </ScrollView>
      <FlatList
        data={leaderboardData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        style={{ flex: 1 }}
      />
    </View>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  periodSelector: {
    marginBottom: 24,
  },
  periodContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedPeriodButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  selectedPeriodButtonText: {
    color: 'white',
  },
  listContainer: {
    paddingBottom: 24,
  },
  leaderboardItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topThreeItem: {
    marginBottom: 16,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  topThreeGradient: {
    padding: 20,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumberText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#6B7280',
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  regularPlayerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playerDetails: {
    flex: 1,
  },
  topThreeUsername: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  topThreeStats: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  regularUsername: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  regularStats: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  topThreeScore: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  topThreeScoreLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  regularScore: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  regularScoreLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});