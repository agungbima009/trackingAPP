import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportsAPI } from '@/services/api';

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

  // Parse task data if passed from task detail
  let taskData = null;
  if (params.taskData && typeof params.taskData === 'string') {
    try {
      taskData = JSON.parse(decodeURIComponent(params.taskData));
    } catch (error) {
      console.error('Error parsing task data:', error);
    }
  }

  // State management
  const isNewReport = params.reportId === 'new';
  const [isEditingDescription, setIsEditingDescription] = useState(isNewReport);
  const [reportDescription, setReportDescription] = useState(
    isNewReport
      ? ''
      : 'Inspeksi rutin gedung sudah selesai. Tidak ada temuan masalah. Semua sistem berjalan normal dan tidak terlihat kerusakan struktural maupun sistem elektrikal.'
  );
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load draft on mount for new reports
  useEffect(() => {
    if (isNewReport && taskData?.taskId) {
      loadDraft();
    }
  }, []);

  const loadDraft = async () => {
    try {
      const draftKey = `report_draft_${taskData?.taskId}`;
      const draftJson = await AsyncStorage.getItem(draftKey);

      if (draftJson) {
        const draft = JSON.parse(draftJson);
        setReportDescription(draft.description || '');
        setPhotos(draft.photos || []);
        setHasDraft(true);
        console.log('Draft loaded successfully');
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  // Helper function to convert image to base64
  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Determine the image type from URI
      const imageType = uri.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';

      // Return with proper data URI format
      return `data:image/${imageType};base64,${base64}`;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  const deleteDraft = async () => {
    Alert.alert(
      'Hapus Draft',
      'Apakah Anda yakin ingin menghapus draft ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const draftKey = `report_draft_${taskData?.taskId}`;
              await AsyncStorage.removeItem(draftKey);
              setHasDraft(false);
              setReportDescription('');
              setPhotos([]);
              Alert.alert('Sukses', 'Draft berhasil dihapus');
            } catch (error) {
              console.error('Error deleting draft:', error);
              Alert.alert('Error', 'Gagal menghapus draft');
            }
          },
        },
      ]
    );
  };

  // Report data - use task data if available for new reports
  const report = isNewReport && taskData ? {
    id: 'NEW',
    taskId: taskData.taskId,
    title: taskData.taskTitle || 'Laporan Baru',
    date: taskData.taskDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    status: 'draft',
    startTime: taskData.taskStartTime ? new Date(taskData.taskStartTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
    endTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    duration: '-',
    hasPhoto: false,
  } : {
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

  // Handle save draft to AsyncStorage
  const handleSaveDraft = async () => {
    try {
      const draftData = {
        taskId: taskData?.taskId || report.taskId,
        title: report.title,
        description: reportDescription,
        photos: photos,
        date: report.date,
        time: report.time,
        savedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        `report_draft_${taskData?.taskId || report.id}`,
        JSON.stringify(draftData)
      );

      setHasDraft(true);
      Alert.alert('Sukses', 'Draft laporan berhasil disimpan', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan draft laporan');
      console.error('Error saving draft:', error);
    }
  };

  // Handle submit report
  const handleSubmitReport = async () => {
    if (reportDescription.trim() === '') {
      Alert.alert('Error', 'Deskripsi laporan harus diisi');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Error', 'Minimal 1 foto harus diunggah');
      return;
    }

    Alert.alert(
      'Kirim Laporan',
      'Apakah Anda yakin ingin mengirim laporan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kirim',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              // Convert photos to base64
              console.log('Converting photos to base64...');
              const base64Photos = await Promise.all(
                photos.map(photo => convertImageToBase64(photo.uri))
              );

              // Get taken_task_id from taskData
              const takenTaskId = taskData?.taskId;
              if (!takenTaskId) {
                throw new Error('Task assignment ID not found');
              }

              console.log('Submitting report to API...', {
                takenTaskId,
                descriptionLength: reportDescription.length,
                photosCount: base64Photos.length,
              });

              // Call API to submit report
              const response = await reportsAPI.createReport(
                takenTaskId,
                reportDescription,
                base64Photos
              );

              console.log('Report submitted successfully:', response);

              // Delete draft after successful submission
              const draftKey = `report_draft_${taskData?.taskId || report.id}`;
              await AsyncStorage.removeItem(draftKey);

              setIsSubmitting(false);
              Alert.alert('Sukses', 'Laporan berhasil dikirim', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error: any) {
              console.error('Error submitting report:', error);
              setIsSubmitting(false);
              Alert.alert(
                'Error',
                error.message || 'Gagal mengirim laporan. Silakan coba lagi.'
              );
            }
          },
        },
      ]
    );
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

  // Check if report can be submitted
  const canSubmit = reportDescription.trim().length > 0 && photos.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={20} color="#1d1d1f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isNewReport ? 'Buat Laporan Baru' : 'Detail Laporan'}
        </Text>
        <TouchableOpacity style={styles.moreButton}>
          <IconSymbol name="ellipsis" size={20} color="#1d1d1f" />
        </TouchableOpacity>
      </View>

      {/* Draft Status Banner */}
      {hasDraft && isNewReport && (
        <View style={styles.draftBanner}>
          <View style={styles.draftBannerContent}>
            <IconSymbol name="doc.text.fill" size={16} color="#F59E0B" />
            <Text style={styles.draftBannerText}>Draft tersimpan</Text>
          </View>
          <TouchableOpacity onPress={deleteDraft}>
            <Text style={styles.draftDeleteText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      )}

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
                <IconSymbol size={14} name="calendar" color="#86868b" />
                <Text style={styles.reportMetaText}>{report.date}</Text>
              </View>
              <View style={styles.reportMetaItem}>
                <IconSymbol size={14} name="clock.fill" color="#86868b" />
                <Text style={styles.reportMetaText}>
                  {report.startTime} - {report.endTime} ({report.duration})
                </Text>
              </View>
              <View style={styles.reportMetaItem}>
                <IconSymbol size={14} name="list.bullet" color="#86868b" />
                <Text style={styles.reportMetaText}>Task: {report.taskId}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Deskripsi Laporan</Text>
            {!isNewReport && (
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
                  size={14}
                  name={isEditingDescription ? "checkmark" : "pencil"}
                  color="#FFFFFF"
                />
                <Text style={styles.editButtonText}>
                  {isEditingDescription ? 'Simpan' : 'Edit'}
                </Text>
              </TouchableOpacity>
            )}
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
              <IconSymbol size={12} name="photo.fill" color="#1d1d1f" />
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
                <IconSymbol size={28} name="plus" color="#1d1d1f" />
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
                      <IconSymbol size={14} name="xmark" color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Upload Photo Button */}
                <TouchableOpacity
                  style={styles.photoItem}
                  onPress={() => setShowPhotoOptions(true)}
                >
                  <View style={styles.uploadPhotoPlaceholder}>
                    <IconSymbol size={28} name="plus" color="#1d1d1f" />
                    <Text style={styles.uploadPhotoText}>Tambah Foto</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          {isNewReport ? (
            <>
              <View style={styles.actionsCard}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveDraftButton]}
                  onPress={handleSaveDraft}
                >
                  <IconSymbol size={18} name="folder.fill" color="#FFFFFF" />
                  <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Simpan Draft</Text>
                </TouchableOpacity>

                {/* Submit Report Button - Only show if description and photos exist */}
                {canSubmit && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.submitButton,
                      isSubmitting && styles.buttonDisabled
                    ]}
                    onPress={handleSubmitReport}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={[styles.actionButtonText, { color: '#FFFFFF', marginLeft: 8 }]}>
                          Mengirim...
                        </Text>
                      </>
                    ) : (
                      <>
                        <IconSymbol size={18} name="paperplane.fill" color="#FFFFFF" />
                        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                          Kirim Laporan
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Submission Requirements Info */}
              {!canSubmit && (
                <View style={styles.requirementsCard}>
                  <IconSymbol name="info.circle.fill" size={16} color="#F59E0B" />
                  <Text style={styles.requirementsText}>
                    Untuk mengirim laporan, lengkapi deskripsi dan minimal 1 foto
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.actionsCard}>
              <TouchableOpacity style={styles.actionButton}>
                <IconSymbol size={18} name="square.and.arrow.up" color="#1d1d1f" />
                <Text style={styles.actionButtonText}>Share Laporan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <IconSymbol size={18} name="doc.on.doc" color="#1d1d1f" />
                <Text style={styles.actionButtonText}>Duplikat</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <IconSymbol size={18} name="square.and.arrow.down" color="#1d1d1f" />
                <Text style={styles.actionButtonText}>Export PDF</Text>
              </TouchableOpacity>
            </View>
          )}
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
                  <IconSymbol size={20} name="xmark" color="#1d1d1f" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalOptions}>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleCameraPhoto}
                >
                  <View style={styles.modalOptionIcon}>
                    <IconSymbol size={28} name="camera.fill" color="#1d1d1f" />
                  </View>
                  <View style={styles.modalOptionText}>
                    <Text style={styles.modalOptionTitle}>Ambil Foto Kamera</Text>
                    <Text style={styles.modalOptionDesc}>Ambil foto menggunakan kamera perangkat</Text>
                  </View>
                  <IconSymbol size={18} name="chevron.right" color="#86868b" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleGalleryPhoto}
                >
                  <View style={styles.modalOptionIcon}>
                    <IconSymbol size={28} name="photo.on.rectangle" color="#1d1d1f" />
                  </View>
                  <View style={styles.modalOptionText}>
                    <Text style={styles.modalOptionTitle}>Pilih dari Galeri</Text>
                    <Text style={styles.modalOptionDesc}>Pilih foto dari galeri perangkat</Text>
                  </View>
                  <IconSymbol size={18} name="chevron.right" color="#86868b" />
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
    letterSpacing: -0.3,
  },
  moreButton: {
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
  section: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reportId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#86868b',
  },
  reportTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  reportMeta: {
    gap: 8,
  },
  reportMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportMetaText: {
    fontSize: 13,
    color: '#86868b',
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  descriptionEditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#1d1d1f',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#86868b',
    lineHeight: 22,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  editButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#86868b',
  },
  photoCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  photoCountText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1d1d1f',
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
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#1d1d1f',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  uploadPhotoText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1d1d1f',
  },
  photoDeleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  locationCountText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1d1d1f',
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
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#f5f5f7',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1d1d1f',
  },
  primaryActionButton: {
    backgroundColor: '#000000',
  },
  saveDraftButton: {
    backgroundColor: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#10B981',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  requirementsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  requirementsText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  draftBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  draftBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  draftBannerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
  },
  draftDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  modalOptions: {
    gap: 10,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 2,
  },
  modalOptionDesc: {
    fontSize: 12,
    color: '#86868b',
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#86868b',
  },
});
