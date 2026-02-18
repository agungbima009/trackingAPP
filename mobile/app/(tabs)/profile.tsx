import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserData(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userEmail');
              await AsyncStorage.removeItem('user');

              // Navigate to login
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: 'person.fill', label: 'Edit Profile', action: 'navigate' },
        { icon: 'lock.fill', label: 'Change Password', action: 'navigate' },
        { icon: 'bell.fill', label: 'Notifications', action: 'toggle', value: notificationsEnabled, onToggle: setNotificationsEnabled },
      ],
    },
    {
      section: 'Preferences',
      items: [
        { icon: 'moon.fill', label: 'Dark Mode', action: 'toggle', value: darkModeEnabled, onToggle: setDarkModeEnabled },
        { icon: 'globe', label: 'Language', action: 'navigate', value: 'English' },
        { icon: 'location.fill', label: 'Location Services', action: 'navigate' },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: 'questionmark.circle.fill', label: 'Help & Support', action: 'navigate' },
        { icon: 'doc.text.fill', label: 'Terms & Conditions', action: 'navigate' },
        { icon: 'shield.fill', label: 'Privacy Policy', action: 'navigate' },
      ],
    },
  ];

  const renderMenuItem = (item: any) => {
    if (item.action === 'toggle') {
      return (
        <View key={item.label} style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <IconSymbol size={18} name={item.icon} color="#86868b" />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#e5e5ea', true: '#1d1d1f' }}
            thumbColor={item.value ? '#FFFFFF' : '#f5f5f7'}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity key={item.label} style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <View style={styles.menuIcon}>
            <IconSymbol size={18} name={item.icon} color="#86868b" />
          </View>
          <Text style={styles.menuLabel}>{item.label}</Text>
        </View>
        <View style={styles.menuItemRight}>
          {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
          <IconSymbol size={18} name="chevron.right" color="#86868b" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity style={styles.headerButton}>
          <IconSymbol size={20} name="gearshape.fill" color="#1d1d1f" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#1d1d1f" style={{ marginVertical: 20 }} />
          ) : (
            <>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userData?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.editAvatarButton}>
                  <IconSymbol size={14} name="camera.fill" color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.userName}>{userData?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{userData?.email || 'email@example.com'}</Text>

              {userData?.department && (
                <View style={styles.userInfoChip}>
                  <IconSymbol size={12} name="building.2.fill" color="#1d1d1f" />
                  <Text style={styles.userInfoText}>{userData.department}</Text>
                </View>
              )}

              {userData?.position && (
                <View style={styles.userInfoChip}>
                  <IconSymbol size={12} name="briefcase.fill" color="#1d1d1f" />
                  <Text style={styles.userInfoText}>{userData.position}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Menu Sections */}
        {menuItems.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuContainer}>
              {section.items.map((item) => renderMenuItem(item))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol size={18} name="arrow.right.square.fill" color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    letterSpacing: -0.3,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1d1d1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#86868b',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#e5e5ea',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#86868b',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1d1d1f',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuValue: {
    fontSize: 13,
    color: '#86868b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 11,
    color: '#86868b',
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 6,
    gap: 4,
  },
  userInfoText: {
    fontSize: 12,
    color: '#86868b',
    fontWeight: '500',
  },
});
