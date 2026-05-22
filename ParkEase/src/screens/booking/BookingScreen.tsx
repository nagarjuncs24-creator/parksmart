import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { MotiView } from 'moti';
import { useApp } from '../../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { GlassCard } from '../../components/shared/GlassCard';
import { CustomButton } from '../../components/shared/CustomButton';
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Lock, 
  Sparkles,
  DollarSign
} from 'lucide-react-native';

export default function BookingScreen({ route, navigation }: any) {
  const { spot } = route.params;
  const { bookSpot } = useApp();
  
  const [hours, setHours] = useState(1);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Pricing calculations
  const baseFare = spot.pricePerHour * hours;
  const convenienceFee = 15;
  const tax = Math.round(baseFare * 0.18); // 18% GST
  const total = baseFare + convenienceFee + tax;

  const handleHoursChange = (amount: number) => {
    const nextVal = hours + amount;
    if (nextVal >= 1 && nextVal <= 24) {
      setHours(nextVal);
    }
  };

  const formatCardNumber = (text: string) => {
    const clean = text.replace(/\D/g, '');
    const groups = clean.match(/.{1,4}/g);
    setCardNumber(groups ? groups.slice(0, 4).join(' ') : clean);
  };

  const formatExpiry = (text: string) => {
    const clean = text.replace(/\D/g, '');
    if (clean.length >= 2) {
      setExpiry(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
    } else {
      setExpiry(clean);
    }
  };

  const handlePay = async () => {
    if (!cardNumber || cardNumber.length < 19) {
      Alert.alert('Payment Error', 'Please enter a valid 16-digit card number.');
      return;
    }
    if (!expiry || expiry.length < 5) {
      Alert.alert('Payment Error', 'Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert('Payment Error', 'Please enter a valid 3-digit CVV.');
      return;
    }
    if (!cardName) {
      Alert.alert('Payment Error', 'Please enter the cardholder name.');
      return;
    }

    setLoading(true);

    try {
      // Simulate bank transaction delay (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Perform booking reservation in universal store
      await bookSpot(spot.id, hours);
      
      setSuccess(true);
      
      // Keep success screen visible for 1.5 seconds, then transition back
      setTimeout(() => {
        navigation.goBack();
        Alert.alert(
          'Booking Confirmed!', 
          `Your reservation at ${spot.title} is now active. View route details in your Booking History.`
        );
      }, 1500);

    } catch (e: any) {
      Alert.alert('Reservation Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          style={styles.successCircle}
        >
          <Sparkles size={60} color={COLORS.secondary} />
        </MotiView>
        <Text style={styles.successTitle}>Payment Secured!</Text>
        <Text style={styles.successSubtitle}>Spot reserved. Syncing ticket details...</Text>
        <ActivityIndicator size="small" color={COLORS.secondary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Secure Reservation</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Spot Detail Card */}
        <GlassCard style={styles.spotOverviewCard}>
          <Text style={styles.sectionTitle}>PARKING BAY</Text>
          <Text style={styles.spotName}>{spot.title}</Text>
          <Text style={styles.spotDesc}>{spot.description}</Text>
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>₹{spot.pricePerHour}/hour</Text>
          </View>
        </GlassCard>

        {/* Duration Picker */}
        <GlassCard style={styles.durationCard}>
          <Text style={styles.sectionTitle}>RESERVATION DURATION</Text>
          <View style={styles.pickerRow}>
            <TouchableOpacity 
              onPress={() => handleHoursChange(-1)}
              style={styles.adjustBtn}
            >
              <Text style={styles.adjustBtnText}>-</Text>
            </TouchableOpacity>
            
            <View style={styles.durationDisplay}>
              <Text style={styles.durationValue}>{hours}</Text>
              <Text style={styles.durationUnit}>{hours === 1 ? 'Hour' : 'Hours'}</Text>
            </View>

            <TouchableOpacity 
              onPress={() => handleHoursChange(1)}
              style={styles.adjustBtn}
            >
              <Text style={styles.adjustBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.durationHint}>You will be notified 15 minutes before expiration.</Text>
        </GlassCard>

        {/* Stripe Credit Card Simulator */}
        <GlassCard style={styles.cardForm}>
          <View style={styles.paymentHeader}>
            <CreditCard size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.paymentTitle}>STRIPE SIMULATED CHECKOUT</Text>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>CARD NUMBER</Text>
            <TextInput
              value={cardNumber}
              onChangeText={formatCardNumber}
              placeholder="4111 2222 3333 4444"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              maxLength={19}
              style={styles.textInput}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputWrapper, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.inputLabel}>EXPIRY DATE</Text>
              <TextInput
                value={expiry}
                onChangeText={formatExpiry}
                placeholder="MM/YY"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
                maxLength={5}
                style={styles.textInput}
              />
            </View>

            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
                secureTextEntry
                maxLength={3}
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>CARDHOLDER NAME</Text>
            <TextInput
              value={cardName}
              onChangeText={setCardName}
              placeholder="e.g. Alex Mercer"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="words"
              style={styles.textInput}
            />
          </View>

          <View style={styles.securitySeal}>
            <Lock size={12} color={COLORS.secondary} style={{ marginRight: 4 }} />
            <Text style={styles.securitySealText}>PCI-DSS Compliant 256-bit SSL Encryption</Text>
          </View>
        </GlassCard>

        {/* Digital Invoice Receipt */}
        <View style={styles.receipt}>
          <Text style={styles.receiptTitle}>RECEIPT INVOICE</Text>
          
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Base Fare ({hours} hr{hours > 1 ? 's' : ''})</Text>
            <Text style={styles.receiptValue}>₹{baseFare}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Platform Tech Fee</Text>
            <Text style={styles.receiptValue}>₹{convenienceFee}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>GST Tax (18%)</Text>
            <Text style={styles.receiptValue}>₹{tax}</Text>
          </View>

          <View style={styles.receiptDivider} />

          <View style={styles.receiptTotalRow}>
            <Text style={styles.receiptTotalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.receiptTotalValue}>₹{total}</Text>
          </View>
        </View>

        {/* Action Button */}
        <CustomButton
          title={loading ? 'Processing Transaction...' : `Confirm & Pay ₹${total}`}
          onPress={handlePay}
          loading={loading}
          icon={<Lock size={18} color={COLORS.white} />}
          style={styles.payBtn}
        />
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.full,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  spotOverviewCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  spotName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    marginBottom: 4,
  },
  spotDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  priceTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45, 90, 254, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  priceTagText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  durationCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  adjustBtn: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustBtnText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '600',
  },
  durationDisplay: {
    alignItems: 'center',
  },
  durationValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
  },
  durationUnit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  durationHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  cardForm: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  paymentTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.8,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.6,
  },
  textInput: {
    height: 50,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 12,
    color: COLORS.white,
    ...TYPOGRAPHY.bodySmall,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  securitySeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  securitySealText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  receipt: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Slate 900 tint
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: SPACING.lg,
  },
  receiptTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  receiptValue: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontWeight: '600',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.4,
    marginVertical: 10,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTotalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  receiptTotalValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  payBtn: {
    height: 56,
  },
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,200,83,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    marginBottom: 8,
  },
  successSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
