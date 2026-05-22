import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useApp } from '../../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { GlassCard } from '../../components/shared/GlassCard';
import { Calendar, Clock, MapPin, Receipt, AlertCircle, Trash2 } from 'lucide-react-native';

// Custom Live Countdown Timer for active tickets
const TicketTimer = ({ endTime, onExpire }: { endTime: number; onExpire: () => void }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const difference = endTime - Date.now();
      if (difference <= 0) {
        setTimeLeft('EXPIRED');
        onExpire();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const hString = hours > 0 ? `${hours}h ` : '';
      const mString = `${minutes.toString().padStart(2, '0')}m `;
      const sString = `${seconds.toString().padStart(2, '0')}s`;
      
      setTimeLeft(`${hString}${mString}${sString}`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  return (
    <View style={styles.timerBadge}>
      <Clock size={14} color="#00C853" style={{ marginRight: 6 }} />
      <Text style={styles.timerText}>{timeLeft}</Text>
    </View>
  );
};

export default function HistoryScreen() {
  const { bookings, spots, cancelReservation, refreshAllData } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAllData();
    setRefreshing(false);
  };

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this booking? A processing refund will be initiated to your original Stripe card.',
      [
        { text: 'Keep Spot', style: 'cancel' },
        { 
          text: 'Cancel Booking', 
          style: 'destructive',
          onPress: async () => {
            await cancelReservation(bookingId);
            Alert.alert('Refund Initiated', 'Spot has been freed up. Refund processed successfully.');
          }
        }
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: any }) => {
    const spot = spots.find(s => s.id === item.spotId);
    const isActive = item.status === 'active' && item.endTime > Date.now();
    const isCancelled = item.status === 'cancelled';
    const isCompleted = item.status === 'completed' || (item.status === 'active' && item.endTime <= Date.now());

    const dateFormatted = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <MotiView
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.cardWrapper}
      >
        <GlassCard style={[styles.ticketCard, isActive && styles.activeTicketBorder]}>
          {/* Header Row */}
          <View style={styles.ticketHeader}>
            <View>
              <Text style={styles.spotTitle}>{spot?.title || 'Unknown Spot'}</Text>
              <Text style={styles.bookingDate}>{dateFormatted}</Text>
            </View>

            {isActive ? (
              <TicketTimer endTime={item.endTime} onExpire={refreshAllData} />
            ) : (
              <View style={[
                styles.statusBadge, 
                { backgroundColor: isCancelled ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)' }
              ]}>
                <Text style={[
                  styles.statusText, 
                  { color: isCancelled ? COLORS.error : COLORS.textSecondary }
                ]}>
                  {isCancelled ? 'CANCELLED' : 'COMPLETED'}
                </Text>
              </View>
            )}
          </View>

          {/* Details */}
          <View style={styles.ticketDetails}>
            <View style={styles.detailRow}>
              <MapPin size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.detailText}>{spot?.type.toUpperCase()} • Ground Floor Bay</Text>
            </View>
            <View style={styles.detailRow}>
              <Receipt size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.detailText}>₹{item.totalPrice} • {item.hours} hours booked</Text>
            </View>
          </View>

          {/* Virtual Barcode for Active tickets */}
          {isActive && (
            <View style={styles.barcodeSection}>
              <View style={styles.barcodeDivider}>
                <View style={styles.barcodeCircleLeft} />
                <View style={styles.barcodeDashLine} />
                <View style={styles.barcodeCircleRight} />
              </View>
              
              <View style={styles.barcodeWrapper}>
                <Text style={styles.barcodeVisual}>|||| | | ||| || ||| | ||| || ||| || ||</Text>
                <Text style={styles.barcodeLabel}>TICKET ID: {item.id.toUpperCase()}</Text>
              </View>

              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => handleCancel(item.id)}
                activeOpacity={0.8}
              >
                <Trash2 size={16} color={COLORS.error} style={{ marginRight: 6 }} />
                <Text style={styles.cancelBtnText}>Release Spot & Refund</Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>
      </MotiView>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>My Reservations</Text>
      
      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={48} color={COLORS.border} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>No Reservations Found</Text>
          <Text style={styles.emptySubtitle}>Booked spots will render here as premium barcode digital passes.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  screenTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  listContainer: {
    paddingBottom: 110, // Safe padding above bottom tabs
  },
  cardWrapper: {
    marginBottom: SPACING.md,
  },
  ticketCard: {
    padding: SPACING.md,
  },
  activeTicketBorder: {
    borderColor: 'rgba(0, 200, 83, 0.4)',
    borderWidth: 1.5,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  spotTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
  },
  bookingDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.2)',
  },
  timerText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  ticketDetails: {
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    padding: 10,
    borderRadius: BORDER_RADIUS.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  barcodeSection: {
    marginTop: 12,
  },
  barcodeDivider: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  barcodeCircleLeft: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.background,
    position: 'absolute',
    left: -23,
  },
  barcodeCircleRight: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.background,
    position: 'absolute',
    right: -23,
  },
  barcodeDashLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 1,
    opacity: 0.5,
  },
  barcodeWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 12,
  },
  barcodeVisual: {
    fontSize: 22,
    color: COLORS.white,
    letterSpacing: 2,
    opacity: 0.85,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  barcodeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 1.1,
  },
  cancelBtn: {
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  cancelBtnText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    marginTop: 12,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
});
