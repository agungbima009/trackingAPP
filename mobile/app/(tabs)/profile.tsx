import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

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
              <IconSymbol size={20} name={item.icon} color="#6B7280" />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={item.value ? '#3B82F6' : '#F3F4F6'}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity key={item.label} style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <View style={styles.menuIcon}>
            <IconSymbol size={20} name={item.icon} color="#6B7280" />
          </View>
          <Text style={styles.menuLabel}>{item.label}</Text>
        </View>
        <View style={styles.menuItemRight}>
          {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
          <IconSymbol size={20} name="chevron.right" color="#9CA3AF" />
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
          <IconSymbol size={24} name="gearshape.fill" color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <IconSymbol size={48} name="person.fill" color="#FFFFFF" />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <IconSymbol size={16} name="camera.fill" color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>Edgar Carlost</Text>
          <Text style={styles.userEmail}>edgar.carlost@email.com</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>88</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
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
        <TouchableOpacity style={styles.logoutButton}>
          <IconSymbol size={20} name="arrow.right.square.fill" color="#EF4444" />
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
});
