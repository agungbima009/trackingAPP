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
          <IconSymbol name="chevron.left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Tugas</Text>
        <TouchableOpacity style={styles.moreButton}>
          <IconSymbol name="ellipsis" size={24} color="#1F2937" />
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
                <IconSymbol name="location.fill" size={16} color="#6B7280" />
                <Text style={styles.taskMetaText}>{task.location}</Text>
              </View>
              <View style={styles.taskMetaItem}>
                <IconSymbol name="clock.fill" size={16} color="#6B7280" />
                <Text style={styles.taskMetaText}>Estimasi: {task.estimatedDuration}</Text>
              </View>
              <View style={styles.taskMetaItem}>
                <IconSymbol name="person.fill" size={16} color="#6B7280" />
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
          <Text style={styles.sectionTitle}>Persyaratan</Text>
          {task.requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <View style={styles.requirementBullet} />
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>

        {/* Tracking Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Tracking</Text>
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
                    <IconSymbol name="location.fill" size={20} color="#10B981" />
                    <Text style={styles.trackingStatValue}>12</Text>
                    <Text style={styles.trackingStatLabel}>Lokasi Terekam</Text>
                  </View>
                  <View style={styles.trackingDivider} />
                  <View style={styles.trackingStat}>
                    <IconSymbol name="clock.fill" size={20} color="#10B981" />
                    <Text style={styles.trackingStatValue}>1.5</Text>
                    <Text style={styles.trackingStatLabel}>Jam Aktif</Text>
                  </View>
                  <View style={styles.trackingDivider} />
                  <View style={styles.trackingStat}>
                    <IconSymbol name="map.fill" size={20} color="#10B981" />
                    <Text style={styles.trackingStatValue}>2.3</Text>
                    <Text style={styles.trackingStatLabel}>KM Jarak</Text>
                  </View>
                </View>

                <View style={styles.currentLocation}>
                  <IconSymbol name="location.fill" size={16} color="#10B981" />
                  <Text style={styles.currentLocationText}>
                    Gedung Utama, Lantai 3 - Ruang Server
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.trackingInactive}>
                <IconSymbol name="location.slash.fill" size={48} color="#9CA3AF" />
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
                <IconSymbol name="stop.fill" size={20} color="#EF4444" />
                <Text style={styles.secondaryButtonText}>Hentikan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1 }]}
                onPress={handleCreateReport}
              >
                <IconSymbol name="camera.fill" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Buat Laporan</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Location History */}
        {isTracking && locationHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riwayat Lokasi</Text>
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
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  moreButton: {
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
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
    borderRadius: 12,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  taskId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
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
    fontSize: 14,
    color: '#6B7280',
  },
  deadlineAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
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
    borderRadius: 10,
  },
  requirementBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginTop: 6,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  trackingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  trackingCardActive: {
    backgroundColor: '#1F2937',
  },
  trackingHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trackingStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pulseIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  trackingStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  trackingStatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  trackingDivider: {
    width: 1,
    backgroundColor: '#374151',
    marginHorizontal: 8,
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  currentLocationText: {
    flex: 1,
    fontSize: 13,
    color: '#D1D5DB',
  },
  trackingInactive: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  trackingInactiveTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  trackingInactiveText: {
    fontSize: 14,
    color: '#9CA3AF',
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
    backgroundColor: '#1F2937',
    borderRadius: 40,
    overflow: 'hidden',
    height: 70,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  trackingButtonIconSection: {
    backgroundColor: '#3B82F6',
    width: 90,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
  },
  trackingButtonTextSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  trackingButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  locationLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    minHeight: 40,
  },
  locationCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  locationDot: {
    position: 'absolute',
    left: -24,
    top: 16,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
