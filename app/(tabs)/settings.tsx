import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Moon, Globe, Lock, Trash2, ChevronRight, User, Info, LogOut } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('tr');
  const { theme, toggleTheme } = useTheme();
  const [showLangModal, setShowLangModal] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleAccountDelete = () => {
    Alert.alert('Hesap Sil', 'Hesabınızı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => {/* Hesap silme işlemi */} },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => {
        logout();
        router.replace('/(auth)/login');
      } },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      'Hakkında',
      'Çiftler Yarışıyor\nSürüm: 1.0.0\nBu uygulama çiftler için eğlenceli bir bilgi yarışması sunar.\nTelif © 2025',
      [{ text: 'Kapat', style: 'cancel' }]
    );
  };

  // Dil değiştirme fonksiyonu
  const handleLanguageChange = () => {
    setShowLangModal(true);
  };

  // Modern ve profesyonel bir modal ile dil seçimi
  const renderLanguageModal = () => (
    showLangModal && (
      <View style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        backgroundColor: theme === 'dark' ? '#232136' : '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
        zIndex: 100,
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: theme === 'dark' ? '#F3F4F6' : '#111827', textAlign: 'center' }}>Dil Seçimi</Text>
        <TouchableOpacity onPress={() => { setLanguage('tr'); setShowLangModal(false); }} style={{ padding: 16, borderRadius: 12, backgroundColor: language === 'tr' ? '#8B5CF6' : 'transparent', marginBottom: 8 }}>
          <Text style={{ color: language === 'tr' ? 'white' : (theme === 'dark' ? '#F3F4F6' : '#111827'), fontWeight: language === 'tr' ? 'bold' : 'normal', textAlign: 'center' }}>Türkçe</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setLanguage('en'); setShowLangModal(false); }} style={{ padding: 16, borderRadius: 12, backgroundColor: language === 'en' ? '#8B5CF6' : 'transparent', marginBottom: 8 }}>
          <Text style={{ color: language === 'en' ? 'white' : (theme === 'dark' ? '#F3F4F6' : '#111827'), fontWeight: language === 'en' ? 'bold' : 'normal', textAlign: 'center' }}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowLangModal(false)} style={{ padding: 16, borderRadius: 12, backgroundColor: theme === 'dark' ? '#27272A' : '#F3F4F6', marginTop: 8 }}>
          <Text style={{ color: theme === 'dark' ? '#F3F4F6' : '#111827', textAlign: 'center' }}>İptal</Text>
        </TouchableOpacity>
      </View>
    )
  );

  // Tema renkleri
  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#18181B' : 'white';
  const cardColor = isDark ? '#27272A' : 'white';
  const textColor = isDark ? '#F3F4F6' : '#111827';
  const secondaryText = isDark ? '#A1A1AA' : '#6B7280';

  return (
    <LinearGradient colors={isDark ? ['#232136', '#18181B'] : ['#8B5CF6', '#A855F7']} style={styles.header}>
      <View style={[styles.container, { backgroundColor }]}> 
        <Text style={[styles.title, { color: textColor }]}>Ayarlar</Text>
        <View style={[styles.settingItem, { backgroundColor: cardColor }]}> 
          <Bell size={20} color="#8B5CF6" />
          <Text style={[styles.settingText, { color: textColor }]}>Bildirimler</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            thumbColor={notifications ? '#8B5CF6' : '#ccc'}
            trackColor={{ true: '#C084FC', false: '#E5E7EB' }}
          />
        </View>
        <View style={[styles.settingItem, { backgroundColor: cardColor }]}> 
          <Moon size={20} color="#8B5CF6" />
          <Text style={[styles.settingText, { color: textColor }]}>Karanlık Mod</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? '#8B5CF6' : '#ccc'}
            trackColor={{ true: '#C084FC', false: '#E5E7EB' }}
          />
        </View>
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: cardColor }]} onPress={() => setShowLangModal(true)}>
          <Globe size={20} color="#8B5CF6" />
          <Text style={[styles.settingText, { color: textColor }]}>Dil: <Text style={{ fontWeight: 'bold' }}>{language === 'tr' ? 'Türkçe' : 'English'}</Text></Text>
          <ChevronRight size={18} color="#8B5CF6" />
        </TouchableOpacity>
        {renderLanguageModal()}
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: cardColor }]}>
          <User size={20} color="#8B5CF6" />
          <Text style={[styles.settingText, { color: textColor }]}>Profil Bilgileri</Text>
          <ChevronRight size={18} color="#8B5CF6" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: cardColor }]} onPress={handleAbout}>
          <Info size={20} color="#8B5CF6" />
          <Text style={[styles.settingText, { color: textColor }]}>Hakkında</Text>
          <ChevronRight size={18} color="#8B5CF6" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: cardColor }]} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={[styles.settingText, { color: '#EF4444' }]}>Çıkış Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: cardColor }]} onPress={handleAccountDelete}>
          <Trash2 size={20} color="#EF4444" />
          <Text style={[styles.settingText, { color: '#EF4444' }]}>Hesabı Sil</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 48 : 64,
    paddingHorizontal: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 32,
    alignSelf: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
});
