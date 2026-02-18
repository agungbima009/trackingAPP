import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LaporanScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('Hari Ini');

  const reports = [
    {
      id: 'RPT-001',
      title: 'Inspeksi Gedung B - Lantai 5',
      date: '16 Feb 2026',
      time: '14:30',
      location: 'Plaza Indonesia, Jakarta',
      status: 'completed',
      hasPhoto: true,
      photoCount: 3,
      description: 'Inspeksi rutin gedung sudah selesai. Tidak ada temuan masalah.',
    },
    {
      id: 'RPT-002',
      title: 'Meeting dengan Client XYZ',
      date: '16 Feb 2026',
      time: '11:00',
      location: 'Jl. Sudirman No. 123',
      status: 'completed',
      hasPhoto: false,
      photoCount: 0,
      description: 'Meeting membahas proyek baru fase 2.',
    },
    {
      id: 'RPT-003',
      title: 'Survei Lokasi Proyek A',
      date: '16 Feb 2026',
      time: '09:15',
      location: 'Jl. HR Rasuna Said',
      status: 'completed',
      hasPhoto: true,
      photoCount: 5,
      description: 'Survei lokasi untuk persiapan konstruksi.',
    },
    {
      id: 'RPT-004',
      title: 'Check-in Pagi',
      date: '16 Feb 2026',
      time: '08:00',
      location: 'Kantor Pusat',
      status: 'completed',
      hasPhoto: false,
      photoCount: 0,
      description: 'Hadir dan siap bekerja.',
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Laporan Saya</Text>
        <TouchableOpacity style={styles.headerButton}>
          <IconSymbol size={20} name="line.3.horizontal.decrease.circle" color="#1d1d1f" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ringkasan Hari Ini</Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <View style={styles.summaryStatIcon}>
                <IconSymbol size={20} name="doc.text.fill" color="#FFFFFF" />
              </View>
              <Text style={styles.summaryStatValue}>4</Text>
              <Text style={styles.summaryStatLabel}>Total</Text>
            </View>

            <View style={styles.summaryStatItem}>
              <View style={styles.summaryStatIcon}>
                <IconSymbol size={20} name="photo.fill" color="#FFFFFF" />
              </View>
              <Text style={styles.summaryStatValue}>8</Text>
              <Text style={styles.summaryStatLabel}>Foto</Text>
            </View>

            <View style={styles.summaryStatItem}>
              <View style={styles.summaryStatIcon}>
                <IconSymbol size={20} name="checkmark.circle.fill" color="#FFFFFF" />
              </View>
              <Text style={styles.summaryStatValue}>4</Text>
              <Text style={styles.summaryStatLabel}>Selesai</Text>
            </View>
          </View>
        </View>

        {/* Quick Create Button */}
        <View style={styles.quickCreateSection}>
          <TouchableOpacity style={styles.quickCreateButton}>
            <View style={styles.quickCreateContent}>
              <View style={styles.quickCreateIcon}>
                <IconSymbol size={22} name="camera.fill" color="#FFFFFF" />
              </View>
              <View style={styles.quickCreateText}>
                <Text style={styles.quickCreateTitle}>Buat Laporan Baru</Text>
                <Text style={styles.quickCreateSubtitle}>Foto + Status atau Status Saja</Text>
              </View>
            </View>
            <IconSymbol size={20} name="chevron.right" color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterTabs}>
              {['Hari Ini', 'Kemarin', 'Minggu Ini', 'Bulan Ini'].map((filter) => (
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
        </View>

        {/* Reports List */}
        <View style={styles.reportsSection}>
          <View style={styles.reportsSectionHeader}>
            <Text style={styles.sectionTitle}>Daftar Laporan</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reportsList}>
            {reports.map((report) => (
              <TouchableOpacity key={report.id} style={styles.reportCard}>
                {/* Report Header */}
                <View style={styles.reportHeader}>
                  <View style={styles.reportHeaderLeft}>
                    <View style={[
                      styles.reportStatusDot,
                      { backgroundColor: getStatusColor(report.status) }
                    ]} />
                    <Text style={styles.reportId}>{report.id}</Text>
                  </View>
                  <View style={[
                    styles.reportStatusBadge,
                    { backgroundColor: getStatusColor(report.status) }
                  ]}>
                    <Text style={styles.reportStatusText}>
                      {getStatusText(report.status)}
                    </Text>
                  </View>
                </View>

                {/* Report Title */}
                <Text style={styles.reportTitle}>{report.title}</Text>

                {/* Report Description */}
                <Text style={styles.reportDescription} numberOfLines={2}>
                  {report.description}
                </Text>

                {/* Report Meta */}
                <View style={styles.reportMeta}>
                  <View style={styles.reportMetaItem}>
                    <IconSymbol size={14} name="clock.fill" color="#86868b" />
                    <Text style={styles.reportMetaText}>
                      {report.date} • {report.time}
                    </Text>
                  </View>
                  
                  <View style={styles.reportMetaItem}>
                    <IconSymbol size={14} name="location.fill" color="#86868b" />
                    <Text style={styles.reportMetaText} numberOfLines={1}>
                      {report.location}
                    </Text>
                  </View>
                </View>

                {/* Photo Indicator */}
                {report.hasPhoto && (
                  <View style={styles.photoIndicator}>
                    <IconSymbol size={14} name="photo.fill" color="#1d1d1f" />
                    <Text style={styles.photoIndicatorText}>
                      {report.photoCount} Foto terlampir
                    </Text>
                  </View>
                )}

                {/* Report Actions */}
                <View style={styles.reportActions}>
                  <TouchableOpacity style={styles.reportActionButton}>
                    <IconSymbol size={16} name="square.and.arrow.up" color="#86868b" />
                    <Text style={styles.reportActionText}>Share</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.reportActionButton}>
                    <IconSymbol size={16} name="doc.on.doc" color="#86868b" />
                    <Text style={styles.reportActionText}>Duplikat</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.reportActionButton, styles.viewButton]}
                    onPress={() => router.push(`/report-detail?reportId=${report.id}`)}
                  >
                    <IconSymbol size={16} name="eye.fill" color="#FFFFFF" />
                    <Text style={[styles.reportActionText, { color: '#FFFFFF' }]}>
                      Lihat Detail
                    </Text>
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
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStatItem: {
    alignItems: 'center',
    gap: 6,
  },
  summaryStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryStatLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  quickCreateSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  quickCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
  },
  quickCreateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  quickCreateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickCreateText: {
    flex: 1,
  },
  quickCreateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  quickCreateSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  filterSection: {
    marginTop: 20,
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
  reportsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  reportsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000',
  },
  reportsList: {
    gap: 12,
    paddingBottom: 20,
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
    gap: 6,
  },
  reportStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reportId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#86868b',
  },
  reportStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  reportStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 6,
  },
  reportDescription: {
    fontSize: 13,
    color: '#86868b',
    lineHeight: 19,
    marginBottom: 12,
  },
  reportMeta: {
    gap: 6,
    marginBottom: 10,
  },
  reportMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportMetaText: {
    fontSize: 12,
    color: '#86868b',
    flex: 1,
  },
  photoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  photoIndicatorText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1d1d1f',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  reportActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#f5f5f7',
  },
  viewButton: {
    backgroundColor: '#000000',
    flex: 1,
    justifyContent: 'center',
  },
  reportActionText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#86868b',
  },
});
