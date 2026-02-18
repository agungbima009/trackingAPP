import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('Semua');
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
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
        setUserName(user.name || 'User');
        setUserEmail(user.email || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Data statistik
  const todayStats = {
    available: 5,
    inProgress: 1,
    completed: 3,
  };

  // Data tugas yang tersedia
  const availableTasks = [
    {
      id: 'TSK-001',
      title: 'Inspeksi Gedung B - Lantai 5',
      location: 'Jl. Thamrin No. 45, Jakarta Pusat',
      priority: 'high',
      deadline: '16 Feb 2026, 16:00',
      estimatedTime: '2 jam',
      description: 'Melakukan inspeksi rutin gedung B lantai 5',
      status: 'available'
    },
    {
      id: 'TSK-002',
      title: 'Survei Lokasi Project C',
      location: 'Jl. Sudirman No. 123, Jakarta Selatan',
      priority: 'medium',
      deadline: '16 Feb 2026, 18:00',
      estimatedTime: '3 jam',
      description: 'Survei lokasi untuk persiapan konstruksi project C',
      status: 'available'
    },
    {
      id: 'TSK-003',
      title: 'Meeting dengan Client XYZ',
      location: 'Plaza Indonesia, Jakarta Pusat',
      priority: 'high',
      deadline: '17 Feb 2026, 10:00',
      estimatedTime: '1.5 jam',
      description: 'Meeting untuk presentasi proposal project',
      status: 'available'
    },
    {
      id: 'TSK-004',
      title: 'Pengecekan Material Site A',
      location: 'Jl. HR Rasuna Said, Jakarta Selatan',
      priority: 'low',
      deadline: '17 Feb 2026, 14:00',
      estimatedTime: '1 jam',
      description: 'Cek kondisi dan jumlah material di site A',
      status: 'available'
    },
  ];

  // Tugas yang sedang dikerjakan
  const activeTask = {
    id: 'TSK-005',
    title: 'Inspeksi Rutin Gedung A',
    location: 'Menara BCA, Jakarta',
    startTime: '08:00',
    duration: '2 jam 15 menit',
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Urgent';
      case 'medium': return 'Normal';
      case 'low': return 'Rendah';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <IconSymbol size={24} name="person.fill" color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>
              {isLoading ? 'Loading...' : userName}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <IconSymbol size={20} name="bell.fill" color="#1d1d1f" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >

        {/* Quick Stats */}
        <View style={styles.section}>
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{todayStats.available}</Text>
              <Text style={styles.quickStatLabel}>Tersedia</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{todayStats.inProgress}</Text>
              <Text style={styles.quickStatLabel}>Aktif</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{todayStats.completed}</Text>
              <Text style={styles.quickStatLabel}>Selesai</Text>
            </View>
          </View>
        </View>

        {/* Active Task Card */}
        {activeTask && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tugas Sedang Dikerjakan</Text>

            <TouchableOpacity style={styles.activeTaskCard}>
              <View style={styles.activeTaskHeader}>
                <View style={styles.activeTaskBadge}>
                  <View style={styles.pulseIndicator} />
                  <Text style={styles.activeTaskBadgeText}>AKTIF</Text>
                </View>
                <Text style={styles.activeTaskId}>{activeTask.id}</Text>
              </View>

              <Text style={styles.activeTaskTitle}>{activeTask.title}</Text>

              <View style={styles.activeTaskInfo}>
                <View style={styles.activeTaskInfoItem}>
                  <IconSymbol size={16} name="location.fill" color="#86868b" />
                  <Text style={styles.activeTaskInfoText}>{activeTask.location}</Text>
                </View>
                <View style={styles.activeTaskInfoItem}>
                  <IconSymbol size={16} name="clock.fill" color="#86868b" />
                  <Text style={styles.activeTaskInfoText}>
                    Mulai {activeTask.startTime} • {activeTask.duration}
                  </Text>
                </View>
              </View>

              <View style={styles.activeTaskActions}>
                <TouchableOpacity
                  style={styles.activeTaskButton}
                  onPress={() => router.push(`/task-detail?taskId=${activeTask.id}`)}
                >
                  <IconSymbol size={16} name="eye.fill" color="#FFFFFF" />
                  <Text style={styles.activeTaskButtonText}>Lihat Detail</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Available Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tugas Tersedia</Text>
            <TouchableOpacity style={styles.filterButton}>
              <IconSymbol size={18} name="line.3.horizontal.decrease.circle" color="#1d1d1f" />
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterTabs}>
              {['Semua', 'Urgent', 'Normal', 'Rendah'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterTab,
                    selectedFilter === filter && styles.filterTabActive,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      selectedFilter === filter && styles.filterTabTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Tasks List */}
          <View style={styles.tasksList}>
            {availableTasks.map((task) => (
              <TouchableOpacity key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskHeaderLeft}>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(task.priority) }
                    ]}>
                      <Text style={styles.priorityBadgeText}>
                        {getPriorityText(task.priority)}
                      </Text>
                    </View>
                    <Text style={styles.taskId}>{task.id}</Text>
                  </View>
                </View>

                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description}
                </Text>

                <View style={styles.taskMeta}>
                  <View style={styles.taskMetaItem}>
                    <IconSymbol size={14} name="location.fill" color="#86868b" />
                    <Text style={styles.taskMetaText} numberOfLines={1}>
                      {task.location}
                    </Text>
                  </View>
                  <View style={styles.taskMetaItem}>
                    <IconSymbol size={14} name="clock.fill" color="#86868b" />
                    <Text style={styles.taskMetaText}>{task.estimatedTime}</Text>
                  </View>
                </View>

                <View style={styles.taskFooter}>
                  <View style={styles.deadlineContainer}>
                    <IconSymbol size={14} name="calendar" color="#EF4444" />
                    <Text style={styles.deadlineText}>{task.deadline}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.takeTaskButton}
                    onPress={() => router.push(`/task-detail?taskId=${task.id}`)}
                  >
                    <Text style={styles.takeTaskButtonText}>Ambil Tugas</Text>
                    <IconSymbol size={14} name="arrow.right.circle.fill" color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1d1d1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 11,
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickStatValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  activeTaskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  activeTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeTaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  pulseIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeTaskBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1d1d1f',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeTaskId: {
    fontSize: 12,
    color: '#86868b',
  },
  activeTaskTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  activeTaskInfo: {
    gap: 8,
    marginBottom: 16,
  },
  activeTaskInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeTaskInfoText: {
    fontSize: 13,
    color: '#86868b',
  },
  activeTaskActions: {
    flexDirection: 'row',
    gap: 12,
  },
  activeTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
  },
  activeTaskButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  filterButton: {
    padding: 8,
  },
  filterScroll: {
    marginBottom: 16,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d2d2d7',
  },
  filterTabActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#86868b',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  tasksList: {
    gap: 12,
    paddingBottom: 24,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#86868b',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 13,
    color: '#86868b',
    lineHeight: 19,
    marginBottom: 12,
  },
  taskMeta: {
    gap: 8,
    marginBottom: 12,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskMetaText: {
    fontSize: 13,
    color: '#86868b',
    flex: 1,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  takeTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  takeTaskButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
