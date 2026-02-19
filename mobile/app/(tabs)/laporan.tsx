import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { reportsAPI } from '@/services/api';

interface Report {
  report_id: string;
  ticket_number?: string;
  report: string;
  created_at: string;
  takenTask: {
    taken_task_id: string;
    task: {
      task_id: string;
      title: string;
      location?: string;
    };
  };
  image?: string;
}

export default function LaporanScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    total_reports: 0,
    reports_this_month: 0,
    reports_this_week: 0,
  });

  // Fetch reports on mount
  useEffect(() => {
    fetchReports();
    fetchStatistics();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await reportsAPI.getMyReports();

      if (response.reports && response.reports.data) {
        setReports(response.reports.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await reportsAPI.getMyStatistics();
      if (response.statistics) {
        setStatistics(response.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchReports(), fetchStatistics()]);
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getPhotoCount = (imageString?: string) => {
    if (!imageString) return 0;
    try {
      const images = JSON.parse(imageString);
      return Array.isArray(images) ? images.length : 0;
    } catch {
      return 0;
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#1d1d1f"
          />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ringkasan Laporan</Text>

          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <View style={styles.summaryStatIcon}>
                <IconSymbol size={20} name="doc.text.fill" color="#FFFFFF" />
              </View>
              <Text style={styles.summaryStatValue}>{statistics.total_reports}</Text>
              <Text style={styles.summaryStatLabel}>Total</Text>
            </View>

            <View style={styles.summaryStatItem}>
              <View style={styles.summaryStatIcon}>
                <IconSymbol size={20} name="calendar.circle.fill" color="#FFFFFF" />
              </View>
              <Text style={styles.summaryStatValue}>{statistics.reports_this_month}</Text>
              <Text style={styles.summaryStatLabel}>Bulan Ini</Text>
            </View>

            <View style={styles.summaryStatItem}>
              <View style={styles.summaryStatIcon}>
                <IconSymbol size={20} name="calendar" color="#FFFFFF" />
              </View>
              <Text style={styles.summaryStatValue}>{statistics.reports_this_week}</Text>
              <Text style={styles.summaryStatLabel}>Minggu Ini</Text>
            </View>
          </View>
        </View>

        {/* Reports List */}
        <View style={styles.reportsSection}>
          <View style={styles.reportsSectionHeader}>
            <Text style={styles.sectionTitle}>Daftar Laporan</Text>
            <Text style={styles.totalReportsText}>
              {reports.length} Laporan
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.reportsList}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.reportCard}>
                  {/* Header Skeleton */}
                  <View style={styles.reportHeader}>
                    <View style={styles.reportHeaderLeft}>
                      <View style={[styles.skeleton, styles.skeletonDot]} />
                      <View style={[styles.skeleton, styles.skeletonTicket]} />
                    </View>
                    <View style={[styles.skeleton, styles.skeletonBadge]} />
                  </View>

                  {/* Title Skeleton */}
                  <View style={[styles.skeleton, styles.skeletonTitle]} />

                  {/* Description Skeleton */}
                  <View style={[styles.skeleton, styles.skeletonDescLine]} />
                  <View style={[styles.skeleton, styles.skeletonDescLineShort]} />

                  {/* Meta Skeleton */}
                  <View style={styles.reportMeta}>
                    <View style={[styles.skeleton, styles.skeletonMeta]} />
                  </View>
                </View>
              ))}
            </View>
          ) : reports.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <IconSymbol size={60} name="doc.text" color="#86868b" />
              </View>
              <Text style={styles.emptyTitle}>Belum Ada Laporan</Text>
              <Text style={styles.emptyDescription}>
                Laporan yang Anda buat dari tugas akan muncul di sini
              </Text>
            </View>
          ) : (
            <View style={styles.reportsList}>
              {reports.map((report) => {
                const photoCount = getPhotoCount(report.image);
                const hasPhoto = photoCount > 0;

                return (
                  <TouchableOpacity
                    key={report.report_id}
                    style={styles.reportCard}
                    onPress={() => router.push(`/report-detail?reportId=${report.report_id}&takenTaskId=${report.takenTask?.taken_task_id}`)}
                  >
                    {/* Report Header */}
                    <View style={styles.reportHeader}>
                      <View style={styles.reportHeaderLeft}>
                        <View style={[
                          styles.reportStatusDot,
                          { backgroundColor: '#10B981' }
                        ]} />
                        <Text style={styles.reportId}>
                          {report.ticket_number || report.report_id.substring(0, 8).toUpperCase()}
                        </Text>
                      </View>
                      <View style={[
                        styles.reportStatusBadge,
                        { backgroundColor: '#10B981' }
                      ]}>
                        <Text style={styles.reportStatusText}>Selesai</Text>
                      </View>
                    </View>

                    {/* Report Title */}
                    <Text style={styles.reportTitle}>
                      {report.takenTask?.task?.title || 'Laporan Tugas'}
                    </Text>

                    {/* Report Description */}
                    <Text style={styles.reportDescription} numberOfLines={2}>
                      {report.report}
                    </Text>

                    {/* Report Meta */}
                    <View style={styles.reportMeta}>
                      <View style={styles.reportMetaItem}>
                        <IconSymbol size={14} name="clock.fill" color="#86868b" />
                        <Text style={styles.reportMetaText}>
                          {formatDate(report.created_at)} • {formatTime(report.created_at)}
                        </Text>
                      </View>

                      {report.takenTask?.task?.location && (
                        <View style={styles.reportMetaItem}>
                          <IconSymbol size={14} name="location.fill" color="#86868b" />
                          <Text style={styles.reportMetaText} numberOfLines={1}>
                            {report.takenTask.task.location}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Photo Indicator */}
                    {hasPhoto && (
                      <View style={styles.photoIndicator}>
                        <IconSymbol size={14} name="photo.fill" color="#1d1d1f" />
                        <Text style={styles.photoIndicatorText}>
                          {photoCount} Foto terlampir
                        </Text>
                      </View>
                    )}

                    {/* Report Actions */}
                    <View style={styles.reportActions}>
                      <TouchableOpacity
                        style={[styles.reportActionButton, styles.viewButton]}
                        onPress={() => router.push(`/report-detail?reportId=${report.report_id}&takenTaskId=${report.takenTask?.taken_task_id}`)}
                      >
                        <IconSymbol size={16} name="eye.fill" color="#FFFFFF" />
                        <Text style={[styles.reportActionText, { color: '#FFFFFF' }]}>
                          Lihat Detail
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
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
  totalReportsText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#86868b',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#86868b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#86868b',
    textAlign: 'center',
    lineHeight: 20,
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
  // Skeleton Styles
  skeleton: {
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  skeletonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skeletonTicket: {
    width: 100,
    height: 14,
    borderRadius: 4,
  },
  skeletonBadge: {
    width: 60,
    height: 20,
    borderRadius: 4,
  },
  skeletonTitle: {
    width: '80%',
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
    width: '60%',
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonMeta: {
    width: 150,
    height: 14,
    borderRadius: 4,
  },
});
