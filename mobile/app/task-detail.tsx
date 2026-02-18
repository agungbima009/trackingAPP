import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SwipeableButton } from '@/components/swipeable-button';
import SuccessCheckOverlay from '@/components/SuccessCheckOverlay';


interface LocationPoint {
  id: string;
  time: string;
  latitude: number;
  longitude: number;
  address: string;
}

export default function TaskDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isTracking, setIsTracking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationPoint[]>([]);

  // Sample task data (in real app, fetch based on params.taskId)
  const task = {
    id: params.taskId || 'TSK-001',
    title: 'Inspeksi Komponen Listrik',
    description: 'Melakukan pemeriksaan menyeluruh terhadap seluruh komponen listrik di gedung utama',
    location: 'Gedung Utama, Lantai 3',
    priority: 'high',
    deadline: '2 Jam Lagi',
    estimatedDuration: '3-4 jam',
    assignedBy: 'Supervisor Teknik',
    requirements: [
      'Pastikan semua peralatan keselamatan digunakan',
      'Dokumentasi setiap temuan',
      'Laporkan jika ada komponen yang perlu diganti',
    ],
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
      case 'high': return 'URGENT';
      case 'medium': return 'NORMAL';
      case 'low': return 'RENDAH';
      default: return 'UNKNOWN';
    }
  };

  const handleStartTracking = () => {
    // Show success animation
    setShowSuccess(true);
  };

  const handleSuccessFinish = () => {
    setShowSuccess(false);
    setIsTracking(true);
    // Tracking started - no alert needed, animation provides feedback
    // In real app: Start GPS tracking service
  };

  const handleStopTracking = () => {
    Alert.alert(
      'Hentikan Tracking?',
      'Apakah Anda yakin ingin menghentikan pelacakan lokasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hentikan',
          style: 'destructive',
          onPress: () => {
            setIsTracking(false);
            Alert.alert('Tracking Dihentikan', 'Pelacakan lokasi telah dihentikan');
          },
        },
      ]
    );
  };

  const handleCreateReport = () => {
    router.push('/(tabs)/laporan');
    // In real app: Navigate to report creation with task context
  };

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
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                  <Text style={styles.priorityBadgeText}>{getPriorityText(task.priority)}</Text>
                </View>
                <Text style={styles.taskId}>{task.id}</Text>
              </View>
            </View>

            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>

            <View style={styles.taskMeta}>
              <View style={styles.taskMetaItem}>
                <IconSymbol name="location.fill" size={14} color="#86868b" />
                <Text style={styles.taskMetaText}>{task.location}</Text>
              </View>
              <View style={styles.taskMetaItem}>
                <IconSymbol name="clock.fill" size={14} color="#86868b" />
                <Text style={styles.taskMetaText}>Estimasi: {task.estimatedDuration}</Text>
              </View>
              <View style={styles.taskMetaItem}>
                <IconSymbol name="person.fill" size={14} color="#86868b" />
                <Text style={styles.taskMetaText}>Diberikan oleh: {task.assignedBy}</Text>
              </View>
            </View>

            <View style={styles.deadlineAlert}>
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
              <Text style={styles.deadlineAlertText}>Deadline: {task.deadline}</Text>
            </View>
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSYARATAN</Text>
          {task.requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <View style={styles.requirementBullet} />
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>

        {/* Tracking Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATUS TRACKING</Text>
          <View style={[styles.trackingCard, isTracking && styles.trackingCardActive]}>
            {isTracking ? (
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
                    <Text style={styles.trackingStatValue}>12</Text>
                    <Text style={styles.trackingStatLabel}>LOKASI</Text>
                  </View>
                  <View style={styles.trackingDivider} />
                  <View style={styles.trackingStat}>
                    <IconSymbol name="clock.fill" size={18} color="#1d1d1f" />
                    <Text style={styles.trackingStatValue}>1.5</Text>
                    <Text style={styles.trackingStatLabel}>JAM</Text>
                  </View>
                  <View style={styles.trackingDivider} />
                  <View style={styles.trackingStat}>
                    <IconSymbol name="map.fill" size={18} color="#1d1d1f" />
                    <Text style={styles.trackingStatValue}>2.3</Text>
                    <Text style={styles.trackingStatLabel}>KM</Text>
                  </View>
                </View>

                <View style={styles.currentLocation}>
                  <IconSymbol name="location.fill" size={14} color="#1d1d1f" />
                  <Text style={styles.currentLocationText}>
                    Gedung Utama, Lantai 3 - Ruang Server
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.trackingInactive}>
                <IconSymbol name="location.slash.fill" size={44} color="#86868b" />
                <Text style={styles.trackingInactiveTitle}>Tracking Belum Dimulai</Text>
                <Text style={styles.trackingInactiveText}>
                  Mulai tracking untuk merekam lokasi Anda selama mengerjakan tugas ini
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          {!isTracking ? (
            <SwipeableButton 
              onSwipeComplete={handleStartTracking}
            />
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 1 }]}
                onPress={handleStopTracking}
              >
                <IconSymbol name="stop.fill" size={18} color="#EF4444" />
                <Text style={styles.secondaryButtonText}>Hentikan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1 }]}
                onPress={handleCreateReport}
              >
                <IconSymbol name="camera.fill" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Buat Laporan</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Location History */}
        {isTracking && locationHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RIWAYAT LOKASI</Text>
            <View style={styles.locationHistory}>
              {locationHistory.map((location, index) => (
                <View key={location.id} style={styles.locationItem}>
                  <View style={styles.locationLeft}>
                    <Text style={styles.locationTime}>{location.time}</Text>
                    <View style={styles.locationLine} />
                  </View>
                  <View style={styles.locationCard}>
                    <View style={styles.locationDot} />
                    <Text style={styles.locationAddress}>{location.address}</Text>
                    <Text style={styles.locationCoords}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
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
  locationHistory: {
    gap: 0,
  },
  locationItem: {
    flexDirection: 'row',
    gap: 16,
  },
  locationLeft: {
    alignItems: 'center',
    width: 60,
  },
  locationTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#86868b',
    marginBottom: 8,
  },
  locationLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#e5e5ea',
    minHeight: 40,
  },
  locationCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  locationDot: {
    position: 'absolute',
    left: -24,
    top: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1d1d1f',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  locationAddress: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 11,
    color: '#86868b',
  },
});
