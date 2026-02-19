import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { tasksAPI } from '@/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('Semua');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const filterOptions = ['Semua', 'Menunggu', 'Berjalan', 'Selesai'];

  // Load user data on mount
  useEffect(() => {
    loadUserData();
    loadTasksData();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTasksData();
    }, [])
  );

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
    }
  };

  const loadTasksData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch my tasks and statistics
      const [tasksResponse, statsResponse] = await Promise.all([
        tasksAPI.getMyTasks(),
        tasksAPI.getMyStatistics(),
      ]);

      setMyTasks(tasksResponse.data || []);
      setStatistics(statsResponse);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      setError(error.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadTasksData();
    setIsRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await tasksAPI.startTask(taskId);
      await loadTasksData();
    } catch (error: any) {
      alert(error.message || 'Failed to start task');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFC107';
      case 'in progress': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'inactive': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'in progress': return 'Berjalan';
      case 'completed': return 'Selesai';
      case 'inactive': return 'Tidak Aktif';
      default: return status;
    }
  };

  const getFilteredTasks = () => {
    if (selectedFilter === 'Semua') {
      return myTasks;
    }
    return myTasks.filter((task) => {
      // Use computed_status if available, otherwise use status
      const taskStatus = task.computed_status || task.status;

      if (selectedFilter === 'Menunggu') return taskStatus === 'pending';
      if (selectedFilter === 'Berjalan') return taskStatus === 'in progress';
      if (selectedFilter === 'Selesai') return taskStatus === 'completed';
      return true;
    });
  };

  const activeTask = myTasks.find(task => (task.computed_status || task.status) === 'in progress');

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
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >

        {/* Quick Stats */}
        <View style={styles.section}>
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{statistics?.total_tasks || 0}</Text>
              <Text style={styles.quickStatLabel}>Total</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{statistics?.in_progress || 0}</Text>
              <Text style={styles.quickStatLabel}>Aktif</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{statistics?.completed || 0}</Text>
              <Text style={styles.quickStatLabel}>Selesai</Text>
            </View>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadTasksData} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Task Card */}
        {activeTask && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tugas Sedang Dikerjakan</Text>

            <TouchableOpacity
              style={[styles.activeTaskCard, { borderLeftColor: getStatusColor(activeTask.computed_status || activeTask.status) }]}
              onPress={() => router.push(`/task-detail?taskId=${activeTask.taken_task_id}`)}
            >
              <View style={styles.activeTaskHeader}>
                <View style={styles.activeTaskBadge}>
                  <View style={styles.pulseIndicator} />
                  <Text style={styles.activeTaskBadgeText}>AKTIF</Text>
                </View>
                <Text style={styles.activeTaskId}>{activeTask.ticket_number || activeTask.taken_task_id?.substring(0, 8)}</Text>
              </View>

              <Text style={styles.activeTaskTitle}>{activeTask.task?.title}</Text>

              <View style={styles.activeTaskInfo}>
                <View style={styles.activeTaskInfoItem}>
                  <IconSymbol size={16} name="location.fill" color="#86868b" />
                  <Text style={styles.activeTaskInfoText}>{activeTask.task?.location}</Text>
                </View>
                <View style={styles.activeTaskInfoItem}>
                  <IconSymbol size={16} name="clock.fill" color="#86868b" />
                  <Text style={styles.activeTaskInfoText}>
                    Mulai {new Date(activeTask.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>

              <View style={styles.activeTaskActions}>
                <TouchableOpacity
                  style={styles.activeTaskButton}
                  onPress={() => router.push(`/task-detail?taskId=${activeTask.taken_task_id}`)}
                >
                  <IconSymbol size={16} name="eye.fill" color="#FFFFFF" />
                  <Text style={styles.activeTaskButtonText}>Lihat Detail</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* My Tasks (Tugas Saya) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tugas Saya</Text>

            {/* Filter Dropdown Button */}
            <View style={styles.filterDropdownContainerInline}>
              <TouchableOpacity
                style={styles.filterDropdownButton}
                onPress={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <View style={styles.filterDropdownButtonContent}>
                  <Text style={styles.filterDropdownButtonText}>{selectedFilter}</Text>
                  <IconSymbol
                    size={16}
                    name={showFilterDropdown ? 'chevron.up' : 'chevron.down'}
                    color="#1d1d1f"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dropdown Menu */}
          {showFilterDropdown && (
            <View style={styles.filterDropdownMenu}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterDropdownItem,
                    selectedFilter === option && styles.filterDropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedFilter(option);
                    setShowFilterDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterDropdownItemText,
                      selectedFilter === option && styles.filterDropdownItemTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tasks List */}
          {isLoading ? (
            <View style={styles.tasksList}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.taskCard}>
                  {/* Header Skeleton */}
                  <View style={styles.taskHeader}>
                    <View style={styles.taskHeaderLeft}>
                      <View style={[styles.skeleton, styles.skeletonBadge]} />
                      <View style={[styles.skeleton, styles.skeletonTaskId]} />
                    </View>
                  </View>

                  {/* Title Skeleton */}
                  <View style={[styles.skeleton, styles.skeletonTaskTitle]} />

                  {/* Description Skeleton */}
                  <View style={[styles.skeleton, styles.skeletonDescLine]} />
                  <View style={[styles.skeleton, styles.skeletonDescLineShort]} />

                  {/* Meta Skeleton */}
                  <View style={styles.taskMeta}>
                    <View style={[styles.skeleton, styles.skeletonMetaItem]} />
                    <View style={[styles.skeleton, styles.skeletonMetaItem]} />
                  </View>

                  {/* Footer Skeleton */}
                  <View style={styles.taskFooter}>
                    <View style={[styles.skeleton, styles.skeletonButton]} />
                  </View>
                </View>
              ))}
            </View>
          ) : getFilteredTasks().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks found</Text>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {getFilteredTasks().map((task) => (
                <View
                  key={task.taken_task_id}
                  style={styles.taskCard}
                >
                  <View style={styles.taskHeader}>
                    <View style={styles.taskHeaderLeft}>
                      <View style={[
                        styles.priorityBadge,
                        { backgroundColor: getStatusColor(task.computed_status || task.status) }
                      ]}>
                        <Text style={styles.priorityBadgeText}>
                          {getStatusText(task.computed_status || task.status)}
                        </Text>
                      </View>
                      <Text style={styles.taskId}>{task.ticket_number || task.taken_task_id?.substring(0, 8)}</Text>
                    </View>
                  </View>

                  <Text style={styles.taskTitle}>{task.task?.title}</Text>
                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {task.task?.description}
                  </Text>

                  <View style={styles.taskMeta}>
                    <View style={styles.taskMetaItem}>
                      <IconSymbol size={14} name="location.fill" color="#86868b" />
                      <Text style={styles.taskMetaText} numberOfLines={1}>
                        {task.task?.location}
                      </Text>
                    </View>
                    <View style={styles.taskMetaItem}>
                      <IconSymbol size={14} name="calendar" color="#86868b" />
                      <Text style={styles.taskMetaText}>{task.date}</Text>
                    </View>
                    {task.task && task.task.start_time && task.task.end_time && (
                      <View style={styles.taskMetaItem}>
                        <IconSymbol size={14} name="clock" color="#86868b" />
                        <Text style={styles.taskMetaText}>
                          {task.task.start_time} - {task.task.end_time}
                        </Text>
                      </View>
                    )}
                  </View>

                  {!task.is_within_work_hours && (task.computed_status || task.status) === 'inactive' && (
                    <View style={styles.inactiveWarning}>
                      <IconSymbol size={14} name="exclamationmark.triangle.fill" color="#F59E0B" />
                      <Text style={styles.inactiveWarningText}>
                        Di luar jam kerja{task.task?.start_time && task.task?.end_time ? ` (${task.task.start_time} - ${task.task.end_time})` : ''}
                      </Text>
                    </View>
                  )}

                  <View style={styles.taskFooter}>
                    {task.start_time && (
                      <View style={styles.deadlineContainer}>
                        <IconSymbol size={14} name="clock.fill" color="#3B82F6" />
                        <Text style={styles.startTimeText}>
                          {new Date(task.start_time).toLocaleString('id-ID', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() => router.push(`/task-detail?taskId=${task.taken_task_id}`)}
                    >
                      <Text style={styles.detailButtonText}>Detail</Text>
                      <IconSymbol size={14} name="arrow.right.circle.fill" color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
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
    borderColor: Colors.light.yellowAccent,
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
    borderWidth: 2,
    borderLeftWidth: 4,
    borderColor: '#e5e5ea',
    borderLeftColor: Colors.light.yellow,
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
    backgroundColor: Colors.light.yellowAccent,
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
  filterDropdownContainerInline: {
    minWidth: 120,
  },
  filterDropdownContainer: {
    marginBottom: 16,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterDropdownButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterDropdownButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  filterDropdownButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1d1d1f',
  },
  filterDropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  filterDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  filterDropdownItemActive: {
    backgroundColor: '#f5f5f7',
  },
  filterDropdownItemText: {
    fontSize: 14,
    color: '#86868b',
    fontWeight: '500',
  },
  filterDropdownItemTextActive: {
    color: '#000000',
    fontWeight: '600',
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
  startTimeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#86868b',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#86868b',
    textAlign: 'center',
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCC',
  },
  errorText: {
    fontSize: 14,
    color: '#C00',
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#C00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  inactiveWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  inactiveWarningText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
    flex: 1,
  },
  inactiveBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Skeleton Styles
  skeleton: {
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  skeletonBadge: {
    width: 70,
    height: 20,
    borderRadius: 4,
  },
  skeletonTaskId: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  skeletonTaskTitle: {
    width: '85%',
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDescLine: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonDescLineShort: {
    width: '65%',
    height: 14,
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonMetaItem: {
    width: 120,
    height: 14,
    borderRadius: 4,
  },
  skeletonButton: {
    width: '100%',
    height: 36,
    borderRadius: 8,
  },
});
