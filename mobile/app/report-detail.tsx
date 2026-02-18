import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ImagePicker from 'expo-image-picker';

interface LocationPoint {
  id: string;
  time: string;
  location: string;
  coordinates: string;
  notes?: string;
}

interface Photo {
  id: string;
  uri: string;
  name: string;
}

export default function ReportDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // State management
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [reportDescription, setReportDescription] = useState('Inspeksi rutin gedung sudah selesai. Tidak ada temuan masalah. Semua sistem berjalan normal dan tidak terlihat kerusakan struktural maupun sistem elektrikal.');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Sample report data (in real app, fetch based on params.reportId)
  const report = {
    id: params.reportId || 'RPT-001',
    taskId: 'TSK-005',
    title: 'Inspeksi Gedung B - Lantai 5',
    date: '16 Feb 2026',
    time: '14:30',
    status: 'completed',
    startTime: '08:00',
    endTime: '14:30',
    duration: '6.5 jam',
    hasPhoto: true,
  };

  // Handle adding photo from camera
  const handleCameraPhoto = async () => {
    setShowPhotoOptions(false);
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Akses Ditolak', 'Izin kamera diperlukan untuk mengambil foto');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newPhoto: Photo = {
          id: Date.now().toString(),
          uri: asset.uri,
          name: `Photo ${photos.length + 1}`,
        };
        setPhotos([...photos, newPhoto]);
        Alert.alert('Sukses', 'Foto berhasil ditambahkan');
      }
    } catch (error) {
      Alert.alert('Kesalahan', 'Terjadi kesalahan saat mengambil foto');
      console.error(error);
    }
  };

  // Handle selecting photo from gallery
  const handleGalleryPhoto = async () => {
    setShowPhotoOptions(false);
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Akses Ditolak', 'Izin galeri diperlukan untuk memilih foto');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newPhoto: Photo = {
          id: Date.now().toString(),
          uri: asset.uri,
          name: `Photo ${photos.length + 1}`,
        };
        setPhotos([...photos, newPhoto]);
        Alert.alert('Sukses', 'Foto berhasil ditambahkan');
      }
    } catch (error) {
      Alert.alert('Kesalahan', 'Terjadi kesalahan saat memilih foto');
      console.error(error);
    }
  };

  // Handle removing photo
  const handleRemovePhoto = (photoId: string) => {
    Alert.alert('Hapus Foto', 'Apakah Anda yakin ingin menghapus foto ini?', [
      {
        text: 'Batal',
        style: 'cancel'
      },
      {
        text: 'Hapus',
        onPress: () => {
          setPhotos(photos.filter(p => p.id !== photoId));
        },
        style: 'destructive'
      }
    ]);
  };

  // Handle save description
  const handleSaveDescription = () => {
    if (reportDescription.trim() === '') {
      Alert.alert('Peringatan', 'Deskripsi tidak boleh kosong');
      return;
    }
    setIsEditingDescription(false);
    Alert.alert('Sukses', 'Deskripsi laporan telah diperbarui');
  };

  // Location history from tracking
  const locationHistory: LocationPoint[] = [
    {
      id: '1',
      time: '14:30',
      location: 'Gedung B - Lantai 5, Ruang Meeting',
      coordinates: '-6.1944, 106.8229',
      notes: 'Selesai inspeksi, dokumentasi lengkap',
    },
    {
      id: '2',
      time: '13:15',
      location: 'Gedung B - Lantai 4, Koridor Utama',
      coordinates: '-6.1940, 106.8225',
      notes: 'Pemeriksaan sistem HVAC',
    },
    {
      id: '3',
      time: '11:30',
      location: 'Gedung B - Lantai 3, Ruang Server',
      coordinates: '-6.1938, 106.8228',
      notes: 'Pengecekan server dan network equipment',
    },
    {
      id: '4',
      time: '10:00',
      location: 'Gedung B - Lantai 2, Ruang Elektrikal',
      coordinates: '-6.1935, 106.8230',
      notes: 'Inspeksi panel listrik utama',
    },
    {
      id: '5',
      time: '08:30',
      location: 'Gedung B - Lantai 1, Lobby',
      coordinates: '-6.1932, 106.8232',
      notes: 'Check-in dan persiapan peralatan',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'draft': return '#6B7280';
      default: return '#D1D5DB';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'pending': return 'Tertunda';
      case 'draft': return 'Draft';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Laporan</Text>
        <TouchableOpacity style={styles.moreButton}>
          <IconSymbol name="ellipsis" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Report Info Card */}
        <View style={styles.section}>
          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportHeaderLeft}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(report.status) }
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {getStatusText(report.status)}
                  </Text>
                </View>
                <Text style={styles.reportId}>{report.id}</Text>
              </View>
            </View>

            <Text style={styles.reportTitle}>{report.title}</Text>

            <View style={styles.reportMeta}>
              <View style={styles.reportMetaItem}>
                <IconSymbol size={16} name="calendar" color="#6B7280" />
                <Text style={styles.reportMetaText}>{report.date}</Text>
              </View>
              <View style={styles.reportMetaItem}>
                <IconSymbol size={16} name="clock.fill" color="#6B7280" />
                <Text style={styles.reportMetaText}>
                  {report.startTime} - {report.endTime} ({report.duration})
                </Text>
              </View>
              <View style={styles.reportMetaItem}>
                <IconSymbol size={16} name="list.bullet" color="#6B7280" />
                <Text style={styles.reportMetaText}>Task: {report.taskId}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Deskripsi Laporan</Text>
            <TouchableOpacity 
              onPress={() => {
                if (isEditingDescription) {
                  handleSaveDescription();
                } else {
                  setIsEditingDescription(true);
                }
              }}
              style={styles.editButton}
            >
              <IconSymbol 
                size={16} 
                name={isEditingDescription ? "checkmark" : "pencil"} 
                color="#FFFFFF" 
              />
              <Text style={styles.editButtonText}>
                {isEditingDescription ? 'Simpan' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {isEditingDescription ? (
            <View style={styles.descriptionEditCard}>
              <TextInput
                style={styles.descriptionInput}
                multiline
                placeholder="Masukkan deskripsi laporan..."
                placeholderTextColor="#9CA3AF"
                value={reportDescription}
                onChangeText={setReportDescription}
              />
              <TouchableOpacity 
                onPress={() => setIsEditingDescription(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{reportDescription}</Text>
            </View>
          )}
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Foto Dokumentasi</Text>
            <View style={styles.photoCountBadge}>
              <IconSymbol size={14} name="photo.fill" color="#3B82F6" />
              <Text style={styles.photoCountText}>{photos.length} Foto</Text>
            </View>
          </View>
          
          {photos.length === 0 ? (
            // Tampilkan tombol tambah foto ketika tidak ada foto
            <TouchableOpacity 
              style={styles.photoItem}
              onPress={() => setShowPhotoOptions(true)}
            >
              <View style={styles.uploadPhotoPlaceholder}>
                <IconSymbol size={32} name="plus" color="#3B82F6" />
                <Text style={styles.uploadPhotoText}>Tambah Foto</Text>
              </View>
            </TouchableOpacity>
          ) : (
            // Tampilkan galeri foto dengan tombol tambah di akhir
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photosGrid}>
                {/* Existing Photos */}
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.photoItem}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={styles.photoImage}
                    />
                    <TouchableOpacity 
                      style={styles.photoDeleteButton}
                      onPress={() => handleRemovePhoto(photo.id)}
                    >
                      <IconSymbol size={16} name="xmark" color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Upload Photo Button */}
                <TouchableOpacity 
                  style={styles.photoItem}
                  onPress={() => setShowPhotoOptions(true)}
                >
                  <View style={styles.uploadPhotoPlaceholder}>
                    <IconSymbol size={32} name="plus" color="#3B82F6" />
                    <Text style={styles.uploadPhotoText}>Tambah Foto</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Location Tracking */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Lokasi</Text>
            <View style={styles.locationCountBadge}>
              <IconSymbol size={14} name="location.fill" color="#10B981" />
              <Text style={styles.locationCountText}>{locationHistory.length} Lokasi</Text>
            </View>
          </View>

          {/* Summary Stats */}
          <View style={styles.locationStatsCard}>
            <View style={styles.locationStat}>
              <IconSymbol size={20} name="mappin.circle.fill" color="#3B82F6" />
              <Text style={styles.locationStatValue}>{locationHistory.length}</Text>
              <Text style={styles.locationStatLabel}>Lokasi Dikunjungi</Text>
            </View>
            <View style={styles.locationStatDivider} />
            <View style={styles.locationStat}>
              <IconSymbol size={20} name="clock.fill" color="#10B981" />
              <Text style={styles.locationStatValue}>{report.duration}</Text>
              <Text style={styles.locationStatLabel}>Total Durasi</Text>
            </View>
            <View style={styles.locationStatDivider} />
            <View style={styles.locationStat}>
              <IconSymbol size={20} name="figure.walk" color="#F59E0B" />
              <Text style={styles.locationStatValue}>0.8</Text>
              <Text style={styles.locationStatLabel}>KM Jarak</Text>
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
                    <IconSymbol size={12} name="ruler" color="#9CA3AF" />
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

        {/* Actions */}
        <View style={styles.section}>
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol size={20} name="square.and.arrow.up" color="#3B82F6" />
              <Text style={styles.actionButtonText}>Share Laporan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol size={20} name="doc.on.doc" color="#3B82F6" />
              <Text style={styles.actionButtonText}>Duplikat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol size={20} name="square.and.arrow.down" color="#3B82F6" />
              <Text style={styles.actionButtonText}>Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Photo Upload Options Modal */}
      <Modal
        visible={showPhotoOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoOptions(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={[]}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tambah Foto</Text>
                <TouchableOpacity onPress={() => setShowPhotoOptions(false)}>
                  <IconSymbol size={24} name="xmark" color="#1F2937" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalOptions}>
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={handleCameraPhoto}
                >
                  <View style={styles.modalOptionIcon}>
                    <IconSymbol size={32} name="camera.fill" color="#3B82F6" />
                  </View>
                  <View style={styles.modalOptionText}>
                    <Text style={styles.modalOptionTitle}>Ambil Foto Kamera</Text>
                    <Text style={styles.modalOptionDesc}>Ambil foto menggunakan kamera perangkat</Text>
                  </View>
                  <IconSymbol size={20} name="chevron.right" color="#D1D5DB" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={handleGalleryPhoto}
                >
                  <View style={styles.modalOptionIcon}>
                    <IconSymbol size={32} name="photo.on.rectangle" color="#10B981" />
                  </View>
                  <View style={styles.modalOptionText}>
                    <Text style={styles.modalOptionTitle}>Pilih dari Galeri</Text>
                    <Text style={styles.modalOptionDesc}>Pilih foto dari galeri perangkat</Text>
                  </View>
                  <IconSymbol size={20} name="chevron.right" color="#D1D5DB" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowPhotoOptions(false)}
              >
                <Text style={styles.modalCancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reportId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  reportMeta: {
    gap: 12,
  },
  reportMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportMetaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  descriptionEditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  photoCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  photoItem: {
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  uploadPhotoPlaceholder: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  uploadPhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  photoDeleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  locationStatsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  locationStat: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  locationStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  locationStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  locationStatDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  locationTimeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 60,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  timelineDotContainer: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
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
    backgroundColor: '#E5E7EB',
    marginTop: 4,
    minHeight: 40,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  timelineLocation: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  timelineCoords: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timelineCoordsText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  timelineNotes: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3B82F6',
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalOptions: {
    gap: 12,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  modalOptionIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalOptionDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
});
