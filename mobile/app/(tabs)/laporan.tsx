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
          <IconSymbol size={24} name="line.3.horizontal.decrease.circle" color="#1F2937" />
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
              <View style={[styles.summaryStatIcon, { backgroundColor: '#3B82F6' }]}>
                <IconSymbol size={24} name="doc.text.fill" color="#FFFFFF" />
              </View>
              <Text style={styles.summaryStatValue}>4</Text>
              <Text style={styles.summaryStatLabel}>Total Laporan</Text>
            </View>

            <View style={styles.summaryStatItem}>
              <View style={[styles.summaryStatIcon, { backgroundColor: '#10B981' }]}>
                <IconSymbol size={24} name="photo.fill" color="#FFFFFF" />
              </View>
              <Text style={styles.summaryStatValue}>8</Text>
              <Text style={styles.summaryStatLabel}>Foto Dilampirkan</Text>
            </View>

            <View style={styles.summaryStatItem}>
              <View style={[styles.summaryStatIcon, { backgroundColor: '#8B5CF6' }]}>
                <IconSymbol size={24} name="checkmark.circle.fill" color="#FFFFFF" />
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
                <IconSymbol size={28} name="camera.fill" color="#FFFFFF" />
              </View>
              <View style={styles.quickCreateText}>
                <Text style={styles.quickCreateTitle}>Buat Laporan Baru</Text>
                <Text style={styles.quickCreateSubtitle}>Foto + Status atau Status Saja</Text>
              </View>
            </View>
            <IconSymbol size={24} name="chevron.right" color="#3B82F6" />
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
                    <IconSymbol size={14} name="clock.fill" color="#6B7280" />
                    <Text style={styles.reportMetaText}>
                      {report.date} • {report.time}
                    </Text>
                  </View>
                  
                  <View style={styles.reportMetaItem}>
                    <IconSymbol size={14} name="location.fill" color="#6B7280" />
                    <Text style={styles.reportMetaText} numberOfLines={1}>
                      {report.location}
                    </Text>
                  </View>
                </View>

                {/* Photo Indicator */}
                {report.hasPhoto && (
                  <View style={styles.photoIndicator}>
                    <IconSymbol size={16} name="photo.fill" color="#3B82F6" />
                    <Text style={styles.photoIndicatorText}>
                      {report.photoCount} Foto terlampir
                    </Text>
                  </View>
                )}

                {/* Report Actions */}
                <View style={styles.reportActions}>
                  <TouchableOpacity style={styles.reportActionButton}>
                    <IconSymbol size={18} name="square.and.arrow.up" color="#6B7280" />
                    <Text style={styles.reportActionText}>Share</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.reportActionButton}>
                    <IconSymbol size={18} name="doc.on.doc" color="#6B7280" />
                    <Text style={styles.reportActionText}>Duplikat</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.reportActionButton, styles.viewButton]}
                    onPress={() => router.push(`/report-detail?reportId=${report.id}`)}
                  >
                    <IconSymbol size={18} name="eye.fill" color="#3B82F6" />
                    <Text style={[styles.reportActionText, { color: '#3B82F6' }]}>
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStatItem: {
    alignItems: 'center',
    gap: 8,
  },
  summaryStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  quickCreateSection: {
    paddingHorizontal: 20,
  },
  quickCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3B82F6',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickCreateText: {
    flex: 1,
  },
  quickCreateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  quickCreateSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  filterSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  reportsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  reportsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  reportsList: {
    gap: 12,
    paddingBottom: 24,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
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
    gap: 8,
  },
  reportStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reportId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  reportStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportMeta: {
    gap: 8,
    marginBottom: 12,
  },
  reportMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportMetaText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  photoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  photoIndicatorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  reportActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  viewButton: {
    backgroundColor: '#EFF6FF',
    flex: 1,
    justifyContent: 'center',
  },
  reportActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
});
