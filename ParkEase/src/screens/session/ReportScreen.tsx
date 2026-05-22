import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useApp } from '../../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { GlassCard } from '../../components/shared/GlassCard';
import { CustomButton } from '../../components/shared/CustomButton';
import { 
  AlertTriangle, 
  Map, 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle, 
  Plus, 
  X,
  Sparkles
} from 'lucide-react-native';

export default function ReportScreen() {
  const { reports, createReport, upvoteCommunityReport } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  
  const [type, setType] = useState<'illegal_parking' | 'poor_marking' | 'unavailable' | 'blocked_exit'>('illegal_parking');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reportTypes = [
    { id: 'illegal_parking', label: 'Illegal Parking' },
    { id: 'blocked_exit', label: 'Blocked Way' },
    { id: 'poor_marking', label: 'Poor Marking' },
    { id: 'unavailable', label: 'Unavailable Spot' }
  ];

  const handleSubmit = async () => {
    if (!description) {
      Alert.alert('Details Needed', 'Please describe the violation or issue.');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate Bangalore center coordinate seeds
      const lat = 12.9716 + (Math.random() - 0.5) * 0.02;
      const lng = 77.5946 + (Math.random() - 0.5) * 0.02;
      
      await createReport(type, description, lat, lng);
      
      setDescription('');
      setModalVisible(false);
      
      Alert.alert(
        'Report Registered!',
        'Thank you! You have earned +5 Reputation XP for helping keep Bangalore parking safe.'
      );
    } catch (e) {
      Alert.alert('Submission Failed', 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderReportItem = ({ item }: { item: any }) => {
    const timeAgo = 'Just now';
    
    return (
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.reportItemWrapper}
      >
        <GlassCard style={styles.reportCard}>
          <View style={styles.reportCardHeader}>
            <View style={styles.reportBadgeContainer}>
              <AlertTriangle size={14} color={COLORS.accent} style={{ marginRight: 6 }} />
              <Text style={styles.reportBadgeText}>
                {item.type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.timeText}>{timeAgo}</Text>
          </View>

          <Text style={styles.reportDesc}>{item.description}</Text>

          <View style={styles.reportFooter}>
            <Text style={styles.reportLocationText}>
              Loc: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
            </Text>

            <TouchableOpacity 
              style={styles.upvoteBtn}
              onPress={() => upvoteCommunityReport(item.id)}
              activeOpacity={0.8}
            >
              <ThumbsUp size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.upvoteText}>Upvote ({item.upvotes})</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </MotiView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Community Hub</Text>
          <Text style={styles.screenSubtitle}>Crowdsourced Bengaluru Parking Watch</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.floatAddBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Mock Active Hotzone Heatmap Graphic */}
      <GlassCard style={styles.heatmapCard}>
        <View style={styles.heatmapHeader}>
          <Map size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.heatmapTitle}>ACTIVE CONGESTION HOTZONES</Text>
        </View>
        <View style={styles.heatmapGraphic}>
          <View style={[styles.heatmapCircle, { left: '30%', top: '25%', width: 50, height: 50, opacity: 0.6 }]} />
          <View style={[styles.heatmapCircle, { left: '65%', top: '50%', width: 75, height: 75, opacity: 0.4 }]} />
          <View style={[styles.heatmapCircle, { left: '45%', top: '70%', width: 30, height: 30, opacity: 0.8 }]} />
          <Text style={styles.heatmapLegend}>3 High-Priority Violations reported within 2km</Text>
        </View>
      </GlassCard>

      <Text style={styles.feedTitle}>Recent Incidents Nearby</Text>

      {reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageSquare size={36} color={COLORS.border} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>All clear! No recent incident reports.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Custom overlay modal for submitting reports */}
      <AnimatePresence>
        {modalVisible && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.overlay}
          >
            <MotiView
              from={{ translateY: 200, scale: 0.9 }}
              animate={{ translateY: 0, scale: 1 }}
              exit={{ translateY: 200, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20 }}
              style={styles.modalCard}
            >
              <GlassCard style={styles.modalGlassCard}>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Sparkles size={18} color="#FFB300" style={{ marginRight: 6 }} />
                    <Text style={styles.modalTitle}>Report Incident</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <X size={18} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalForm} keyboardShouldPersistTaps="handled">
                  <Text style={styles.formLabel}>SELECT ISSUE TYPE</Text>
                  <View style={styles.typeGrid}>
                    {reportTypes.map(t => (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => setType(t.id as any)}
                        style={[
                          styles.typePill,
                          type === t.id && styles.typePillActive
                        ]}
                      >
                        <Text style={[
                          styles.typePillText,
                          type === t.id && styles.typePillTextActive
                        ]}>
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.formLabel}>INCIDENT DESCRIPTION</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe the incident (e.g. Black SUV double-parked onIndiranagar corner blocking access)..."
                    placeholderTextColor={COLORS.textSecondary}
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                  />

                  <CustomButton
                    title={submitting ? 'Submitting Report...' : 'Register Report (+5 XP)'}
                    onPress={handleSubmit}
                    loading={submitting}
                    style={styles.submitBtn}
                  />
                </ScrollView>
              </GlassCard>
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
    paddingHorizontal: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  screenTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
  },
  screenSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  floatAddBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  heatmapCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  heatmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heatmapTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.2,
  },
  heatmapGraphic: {
    height: 100,
    backgroundColor: 'rgba(15,23,42,0.4)', // slate 900
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heatmapCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.accent,
  },
  heatmapLegend: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '700',
    zIndex: 2,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  feedTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 110,
  },
  reportItemWrapper: {
    marginBottom: SPACING.md,
  },
  reportCard: {
    padding: SPACING.md,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  reportBadgeText: {
    fontSize: 9,
    color: COLORS.error,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  reportDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    lineHeight: 18,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    paddingTop: 8,
  },
  reportLocationText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(45,90,254,0.08)',
    borderRadius: BORDER_RADIUS.sm,
  },
  upvoteText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  modalCard: {
    width: '100%',
  },
  modalGlassCard: {
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: SPACING.md,
    maxHeight: height * 0.75,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
  },
  modalForm: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 10,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    marginBottom: 8,
  },
  typePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typePillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  typePillTextActive: {
    color: COLORS.white,
  },
  textArea: {
    height: 120,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    color: COLORS.white,
    padding: 12,
    ...TYPOGRAPHY.bodySmall,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: {
    height: 52,
  },
});
