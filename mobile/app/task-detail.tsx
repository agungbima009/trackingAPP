import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SwipeableButton } from '@/components/swipeable-button';
import SuccessCheckOverlay from '@/components/SuccessCheckOverlay';
import { tasksAPI, locationsAPI } from '@/services/api';
import LocationTrackingService from '@/services/locationTracking';


interface LocationPoint {
  id: string;
  time: string;
  location: string;
  coordinates: string;
  notes?: string;
}

export default function TaskDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isTracking, setIsTracking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationPoint[]>([]);
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextTrackingTime, setNextTrackingTime] = useState<Date | null>(null);
  const [locationStats, setLocationStats] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('');

  // Fetch task data on mount
  useEffect(() => {
    loadTaskDetail();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTaskDetail();
    }, [])
  );

  // Cleanup effect - stop tracking when component unmounts or task is completed
  useEffect(() => {
    return () => {
      // Don't stop tracking when component unmounts - let it continue
      // Only stop when user explicitly completes the task
    };
  }, []);

  // Periodic refresh of location data while task is in progress
  useEffect(() => {
    let refreshInterval: ReturnType<typeof setInterval>;
    const currentStatus = task?.computed_status || task?.status;

    if (currentStatus === 'in progress' && task) {
      // Refresh location data every 5 minutes
      refreshInterval = setInterval(() => {
        loadLocationData(task.taken_task_id);
        calculateNextTrackingTime(task.taken_task_id);
      }, 5 * 60 * 1000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [task]);

  // Format next tracking time
  const getNextTrackingTimeText = () => {
    if (!nextTrackingTime) return '';

    const now = new Date();
    const diff = nextTrackingTime.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes <= 0) return 'Segera';
    if (minutes < 60) return `${minutes} menit lagi`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) return `${hours} jam lagi`;
    return `${hours} jam ${remainingMinutes} menit lagi`;
  };

  const loadTaskDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await tasksAPI.getMyTasks();

      // Find the specific task by taken_task_id
      const foundTask = response.data.find(
        (t: any) => t.taken_task_id === params.taskId
      );

      if (foundTask) {
        setTask(foundTask);
        // Check if task is already in progress
        if ((foundTask.computed_status || foundTask.status) === 'in progress') {
          setIsTracking(true);

          // Load real location data from API
          await loadLocationData(foundTask.taken_task_id);

          // Resume location tracking if not already active
          if (!LocationTrackingService.isActive()) {
            await LocationTrackingService.startTracking(foundTask.taken_task_id);
          }

          // Calculate next tracking time based on last location
          await calculateNextTrackingTime(foundTask.taken_task_id);
        }
      } else {
        setError('Task not found');
      }
    } catch (error: any) {
      console.error('Error loading task:', error);
      setError(error.message || 'Failed to load task');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocationData = async (takenTaskId: string) => {
    try {
      // Fetch real location data from API
      const response = await locationsAPI.getTaskLocations(takenTaskId);

      if (response.locations && response.locations.data) {
        // Transform API data to LocationPoint format
        const transformedLocations: LocationPoint[] = response.locations.data.map((loc: any) => ({
          id: loc.location_id,
          time: new Date(loc.recorded_at).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          location: loc.address || `${loc.latitude}, ${loc.longitude}`,
          coordinates: `${loc.latitude}, ${loc.longitude}`,
          notes: loc.tracking_status === 'manual' ? 'Dicatat manual' : 'Dicatat otomatis',
        }));

        setLocationHistory(transformedLocations);

        // Set current location (most recent)
        if (transformedLocations.length > 0) {
          setCurrentLocation(transformedLocations[0].location);
        }

        // Fetch route stats (need to pass user_id from response)
        if (response.locations.data.length > 0) {
          const userId = response.locations.data[0].user_id;
          const routeResponse = await locationsAPI.getTaskRoute(takenTaskId, userId);
          setLocationStats({
            totalLocations: routeResponse.total_points || 0,
            totalDistance: routeResponse.total_distance_km || 0,
            duration: calculateDuration(routeResponse.start_time, routeResponse.end_time),
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading location data:', error);
      // Keep empty arrays on error
      setLocationHistory([]);
      setLocationStats(null);
    }
  };

  const calculateDuration = (startTime?: string, endTime?: string): string => {
    if (!startTime || !endTime) return '0h';
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const hours = Math.round((end - start) / (1000 * 60 * 60) * 10) / 10;
    return `${hours}h`;
  };

  const calculateNextTrackingTime = async (takenTaskId: string) => {
    try {
      const response = await locationsAPI.getTaskLocations(takenTaskId);

      if (response.locations && response.locations.data && response.locations.data.length > 0) {
        const lastLocation = response.locations.data[0]; // Most recent
        const lastRecordedTime = new Date(lastLocation.recorded_at);
        const nextTime = new Date(lastRecordedTime.getTime() + 1 * 60 * 1000); // Add 1 minute (for testing)
        setNextTrackingTime(nextTime);
      } else {
        // No locations yet, next tracking is 1 minute from now
        const nextTime = new Date();
        nextTime.setMinutes(nextTime.getMinutes() + 1);
        setNextTrackingTime(nextTime);
      }
    } catch (error) {
      console.error('Error calculating next tracking time:', error);
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
      case 'pending': return 'MENUNGGU';
      case 'in progress': return 'BERJALAN';
      case 'completed': return 'SELESAI';
      case 'inactive': return 'TIDAK AKTIF';
      default: return status.toUpperCase();
    }
  };

  const handleStartTracking = async () => {
    if (!task) return;

    try {
      // Call API to start task
      await tasksAPI.startTask(task.taken_task_id);

      // Show success animation
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start task');
    }
  };

  const handleSuccessFinish = async () => {
    setShowSuccess(false);
    setIsTracking(true);

    try {
      // Add a delay to allow backend to process the status change
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Reload task data to get updated status (retry up to 3 times)
      let verifiedTask = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries && !verifiedTask) {
        const response = await tasksAPI.getMyTasks();
        const foundTask = response.data.find(
          (t: any) => t.taken_task_id === params.taskId
        );

        if (foundTask) {
          const taskStatus = foundTask.computed_status || foundTask.status;
          
          if (taskStatus === 'in progress') {
            verifiedTask = foundTask;
            break;
          } else {
            console.warn(`Task status is "${taskStatus}", retrying... (${retryCount + 1}/${maxRetries})`);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }
      }

      if (!verifiedTask) {
        throw new Error('Task did not update to in progress status after multiple retries');
      }

      setTask(verifiedTask);

      // Now start GPS tracking with verified in-progress task
      const trackingStarted = await LocationTrackingService.startTracking(verifiedTask.taken_task_id);

      if (trackingStarted) {
        // Calculate next tracking time (1 minute from now - for testing)
        const nextTime = new Date();
        nextTime.setMinutes(nextTime.getMinutes() + 1);
        setNextTrackingTime(nextTime);

        // Load initial location data (with small delay to let first location record)
        setTimeout(() => {
          loadLocationData(verifiedTask.taken_task_id);
        }, 2000);

        Alert.alert(
          'Pelacakan Dimulai',
          'Lokasi Anda akan dicatat setiap menit selama tugas berlangsung (mode testing).',
          [{ text: 'Mengerti' }]
        );
      } else {
        Alert.alert(
          'Peringatan',
          'Gagal memulai pelacakan lokasi. Izin lokasi mungkin tidak diberikan.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error in handleSuccessFinish:', error);
      Alert.alert(
        'Kesalahan',
        error.message || 'Terjadi kesalahan saat memulai pelacakan',
        [{ text: 'OK' }]
      );
      setIsTracking(false);
    }
  };

  const handleCreateNewReport = () => {
    // Navigate to create new report with all task data
    const taskInfo = encodeURIComponent(JSON.stringify({
      taskId: task.taken_task_id,
      taskTitle: taskData?.title,
      taskLocation: taskData?.location,
      taskDate: task.date,
      taskStartTime: task.start_time,
    }));
    router.push(`/report-detail?reportId=new&taskData=${taskInfo}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={22} color="#1d1d1f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DETAIL TUGAS</Text>
          <View style={styles.moreButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading task details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !task) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={22} color="#1d1d1f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DETAIL TUGAS</Text>
          <View style={styles.moreButton} />
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={44} color="#EF4444" />
          <Text style={styles.errorTitle}>{error || 'Task not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTaskDetail}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatus = task.computed_status || task.status;
  const taskData = task.task;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Success Check Overlay */}
      <SuccessCheckOverlay
        visible={showSuccess}
        onFinish={handleSuccessFinish}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={22} color="#1d1d1f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DETAIL TUGAS</Text>
        <TouchableOpacity style={styles.moreButton}>
          <IconSymbol name="ellipsis" size={22} color="#1d1d1f" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Task Info Card */}
        <View style={styles.section}>
          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={styles.taskHeaderLeft}>
                <View style={[styles.priorityBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
                  <Text style={styles.priorityBadgeText}>{getStatusText(currentStatus)}</Text>
                </View>
                <Text style={styles.taskId}>
                  {task.ticket_number || task.taken_task_id?.substring(0, 8)}
                </Text>
              </View>
            </View>

            <Text style={styles.taskTitle}>{taskData?.title || 'No title'}</Text>
            <Text style={styles.taskDescription}>{taskData?.description || 'No description'}</Text>

            <View style={styles.taskMeta}>
              <View style={styles.taskMetaItem}>
                <IconSymbol name="location.fill" size={14} color="#86868b" />
                <Text style={styles.taskMetaText}>{taskData?.location || 'No location'}</Text>
              </View>
              {taskData?.start_time && taskData?.end_time && (
                <View style={styles.taskMetaItem}>
                  <IconSymbol name="clock.fill" size={14} color="#86868b" />
                  <Text style={styles.taskMetaText}>
                    Jam Kerja: {taskData.start_time} - {taskData.end_time}
                  </Text>
                </View>
              )}
              <View style={styles.taskMetaItem}>
                <IconSymbol name="calendar" size={14} color="#86868b" />
                <Text style={styles.taskMetaText}>Tanggal: {task.date}</Text>
              </View>
            </View>

            {!task.is_within_work_hours && currentStatus === 'inactive' && (
              <View style={styles.deadlineAlert}>
                <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#F59E0B" />
                <Text style={styles.deadlineAlertText}>
                  Di luar jam kerja ({taskData?.start_time} - {taskData?.end_time})
                </Text>
              </View>
            )}

            {task.start_time && (
              <View style={styles.startedAtContainer}>
                <IconSymbol name="clock.fill" size={14} color="#3B82F6" />
                <Text style={styles.startedAtText}>
                  {currentStatus === 'in progress' ? 'Dimulai: ' : 'Dijadwalkan: '}
                  {new Date(task.start_time).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Create Report Section - Show for in progress tasks */}
        {currentStatus === 'in progress' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LAPORAN</Text>
            <TouchableOpacity style={styles.createReportButton} onPress={handleCreateNewReport}>
              <View style={styles.createReportContent}>
                <View style={styles.createReportIcon}>
                  <IconSymbol size={22} name="doc.text.fill" color="#FFFFFF" />
                </View>
                <View style={styles.createReportText}>
                  <Text style={styles.createReportTitle}>Lihat Laporan</Text>
                  <Text style={styles.createReportSubtitle}>Foto + Deskripsi atau Deskripsi Saja</Text>
                </View>
              </View>
              <IconSymbol size={20} name="chevron.right" color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Tracking Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATUS TUGAS</Text>
          <View style={[styles.trackingCard, currentStatus === 'in progress' && styles.trackingCardActive]}>
            {currentStatus === 'in progress' ? (
              <>
                <View style={styles.trackingHeader}>
                  <View style={styles.trackingStatusBadge}>
                    <View style={styles.pulseIndicator} />
                    <Text style={styles.trackingStatusText}>TRACKING AKTIF</Text>
                  </View>
                </View>

                <View style={styles.trackingStats}>
                  <View style={styles.trackingStat}>
                    <IconSymbol name="location.fill" size={18} color="#1d1d1f" />
                    <Text style={styles.trackingStatValue}>{locationStats?.totalLocations || 0}</Text>
                    <Text style={styles.trackingStatLabel}>LOKASI</Text>
                  </View>
                  <View style={styles.trackingDivider} />
                  <View style={styles.trackingStat}>
                    <IconSymbol name="clock.fill" size={18} color="#1d1d1f" />
                    <Text style={styles.trackingStatValue}>{locationStats?.duration || '0h'}</Text>
                    <Text style={styles.trackingStatLabel}>DURASI</Text>
                  </View>
                  <View style={styles.trackingDivider} />
                  <View style={styles.trackingStat}>
                    <IconSymbol name="map.fill" size={18} color="#1d1d1f" />
                    <Text style={styles.trackingStatValue}>{locationStats?.totalDistance || 0}</Text>
                    <Text style={styles.trackingStatLabel}>KM</Text>
                  </View>
                </View>

                {currentLocation && (
                  <View style={styles.currentLocation}>
                    <IconSymbol name="location.fill" size={14} color="#1d1d1f" />
                    <Text style={styles.currentLocationText}>
                      {currentLocation}
                    </Text>
                  </View>
                )}

                {nextTrackingTime && (
                  <View style={styles.nextTrackingInfo}>
                    <IconSymbol name="clock.arrow.circlepath" size={14} color="#3B82F6" />
                    <Text style={styles.nextTrackingText}>
                      Pembaruan lokasi berikutnya: {getNextTrackingTimeText()}
                    </Text>
                  </View>
                )}
              </>
            ) : currentStatus === 'pending' ? (
              <View style={styles.trackingInactive}>
                <IconSymbol name="clock.fill" size={44} color="#FFC107" />
                <Text style={styles.trackingInactiveTitle}>Menunggu Dimulai</Text>
                <Text style={styles.trackingInactiveText}>
                  Geser tombol di bawah untuk memulai tugas ini
                </Text>
              </View>
            ) : currentStatus === 'inactive' ? (
              <View style={styles.trackingInactive}>
                <IconSymbol name="exclamationmark.triangle.fill" size={44} color="#F59E0B" />
                <Text style={styles.trackingInactiveTitle}>Di Luar Jam Kerja</Text>
                <Text style={styles.trackingInactiveText}>
                  Tugas ini hanya dapat dimulai pada jam kerja ({taskData?.start_time} - {taskData?.end_time})
                </Text>
              </View>
            ) : currentStatus === 'completed' ? (
              <View style={styles.trackingInactive}>
                <IconSymbol name="checkmark.circle.fill" size={44} color="#10B981" />
                <Text style={styles.trackingInactiveTitle}>Tugas Selesai</Text>
                <Text style={styles.trackingInactiveText}>
                  Tugas ini telah diselesaikan
                </Text>
              </View>
            ) : (
              <View style={styles.trackingInactive}>
                <IconSymbol name="info.circle.fill" size={44} color="#86868b" />
                <Text style={styles.trackingInactiveTitle}>Status: {getStatusText(currentStatus)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          {currentStatus === 'pending' && task.is_within_work_hours ? (
            <SwipeableButton
              onSwipeComplete={handleStartTracking}
            />
          ) : currentStatus === 'inactive' ? (
            <View style={styles.inactiveButtonContainer}>
              <IconSymbol name="lock.fill" size={18} color="#6B7280" />
              <Text style={styles.inactiveButtonText}>Tidak dapat dimulai di luar jam kerja</Text>
            </View>
          ) : currentStatus === 'completed' ? (
            <TouchableOpacity
              style={styles.completedButton}
              onPress={() => router.back()}
            >
              <IconSymbol name="arrow.left.circle.fill" size={18} color="#10B981" />
              <Text style={styles.completedButtonText}>Kembali</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Location History */}
        {currentStatus === 'in progress' && locationHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>RIWAYAT LOKASI</Text>
              <View style={styles.locationCountBadge}>
                <IconSymbol size={12} name="location.fill" color="#1d1d1f" />
                <Text style={styles.locationCountText}>{locationHistory.length} Lokasi</Text>
              </View>
            </View>

            {/* Summary Stats */}
            <View style={styles.locationStatsCard}>
              <View style={styles.locationStat}>
                <IconSymbol size={18} name="mappin.circle.fill" color="#1d1d1f" />
                <Text style={styles.locationStatValue}>{locationHistory.length}</Text>
                <Text style={styles.locationStatLabel}>Dikunjungi</Text>
              </View>
              <View style={styles.locationStatDivider} />
              <View style={styles.locationStat}>
                <IconSymbol size={18} name="clock.fill" color="#1d1d1f" />
                <Text style={styles.locationStatValue}>{locationStats?.duration || '0h'}</Text>
                <Text style={styles.locationStatLabel}>Durasi</Text>
              </View>
              <View style={styles.locationStatDivider} />
              <View style={styles.locationStat}>
                <IconSymbol size={18} name="figure.walk" color="#1d1d1f" />
                <Text style={styles.locationStatValue}>{locationStats?.totalDistance || 0}</Text>
                <Text style={styles.locationStatLabel}>KM</Text>
              </View>
            </View>

            {/* Location Timeline */}
            <View style={styles.locationTimeline}>
              {locationHistory.map((location, index) => (
                <View key={location.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <Text style={styles.timelineTime}>{location.time}</Text>
                    <View style={styles.timelineDotContainer}>
                      <View style={[
                        styles.timelineDot,
                        index === 0 && styles.timelineDotActive
                      ]}>
                        <IconSymbol
                          size={12}
                          name={index === 0 ? "checkmark" : "location.fill"}
                          color="#FFFFFF"
                        />
                      </View>
                      {index < locationHistory.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>
                  </View>

                  <View style={styles.timelineCard}>
                    <Text style={styles.timelineLocation}>{location.location}</Text>
                    <View style={styles.timelineCoords}>
                      <IconSymbol size={11} name="ruler" color="#86868b" />
                      <Text style={styles.timelineCoordsText}>{location.coordinates}</Text>
                    </View>
                    {location.notes && (
                      <Text style={styles.timelineNotes}>{location.notes}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1d1d1f',
    letterSpacing: 0.5,
  },
  moreButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#86868b',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  locationCountText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1d1d1f',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  taskId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#86868b',
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#86868b',
    lineHeight: 20,
    marginBottom: 16,
  },
  taskMeta: {
    gap: 12,
    marginBottom: 16,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskMetaText: {
    fontSize: 13,
    color: '#86868b',
  },
  deadlineAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  deadlineAlertText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  requirementItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  requirementBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#1d1d1f',
    marginTop: 6,
  },
  requirementText: {
    flex: 1,
    fontSize: 13,
    color: '#1d1d1f',
    lineHeight: 20,
  },
  trackingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  trackingCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
  },
  trackingHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trackingStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pulseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  trackingStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  trackingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  trackingStat: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  trackingStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1d1d1f',
  },
  trackingStatLabel: {
    fontSize: 10,
    color: '#86868b',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  trackingDivider: {
    width: 1,
    backgroundColor: '#e5e5ea',
    marginHorizontal: 8,
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  currentLocationText: {
    flex: 1,
    fontSize: 12,
    color: '#1d1d1f',
  },
  nextTrackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginTop: 8,
  },
  nextTrackingText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '500',
  },
  trackingInactive: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  trackingInactiveTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1d1d1f',
    marginTop: 12,
    marginBottom: 4,
  },
  trackingInactiveText: {
    fontSize: 13,
    color: '#86868b',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  liveTrackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    height: 60,
    borderWidth: 1,
    borderColor: '#1d1d1f',
  },
  trackingButtonIconSection: {
    backgroundColor: '#1d1d1f',
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 11,
    borderBottomLeftRadius: 11,
  },
  trackingButtonTextSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  trackingButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  locationStatsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  locationStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  locationStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d1d1f',
  },
  locationStatLabel: {
    fontSize: 10,
    color: '#86868b',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontWeight: '500',
  },
  locationStatDivider: {
    width: 1,
    backgroundColor: '#e5e5ea',
    marginHorizontal: 6,
  },
  locationTimeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 60,
  },
  timelineTime: {
    fontSize: 11,
    fontWeight: '500',
    color: '#86868b',
    marginBottom: 8,
  },
  timelineDotContainer: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1d1d1f',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineDotActive: {
    backgroundColor: '#10B981',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e5e5ea',
    marginTop: 4,
    minHeight: 40,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  timelineLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 6,
  },
  timelineCoords: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  timelineCoordsText: {
    fontSize: 11,
    color: '#86868b',
    fontFamily: 'monospace',
  },
  timelineNotes: {
    fontSize: 12,
    color: '#86868b',
    lineHeight: 18,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#86868b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  startedAtContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 12,
  },
  startedAtText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  inactiveButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 8,
  },
  inactiveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  completedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
  },
  completedButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
  },
  createReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
  },
  createReportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  createReportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createReportText: {
    flex: 1,
  },
  createReportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  createReportSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
});
