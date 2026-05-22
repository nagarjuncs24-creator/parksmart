import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert
} from 'react-native';
import { MotiView, MotiText } from 'moti';
import { useApp } from '../../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import { GlassCard } from '../../components/shared/GlassCard';
import { AnimatedInput } from '../../components/shared/AnimatedInput';
import { CustomButton } from '../../components/shared/CustomButton';
import { Car, Mail, Lock, User, Phone } from 'lucide-react-native';

export default function SignupScreen({ navigation }: any) {
  const { signup } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name) {
      newErrors.name = 'Full name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(email, name);
      navigation.replace('Main');
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <MotiView
          from={{ opacity: 0, scale: 0.8, translateY: -30 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          style={styles.logoHeader}
        >
          <View style={styles.logoCircle}>
            <Car size={36} color={COLORS.white} strokeWidth={2.5} />
          </View>
          <MotiText style={styles.appTitle}>Park<Text style={{ color: COLORS.primary }}>Ease</Text></MotiText>
          <Text style={styles.subtitle}>Create your Smart Parking account</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 20, delay: 200 }}
          style={styles.cardWrapper}
        >
          <GlassCard style={styles.card}>
            <Text style={styles.formTitle}>Sign Up</Text>

            <AnimatedInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              error={errors.name}
              icon={<User size={20} color={COLORS.textSecondary} />}
            />

            <AnimatedInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              icon={<Mail size={20} color={COLORS.textSecondary} />}
            />

            <AnimatedInput
              label="Mobile Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={errors.phone}
              icon={<Phone size={20} color={COLORS.textSecondary} />}
            />

            <AnimatedInput
              label="Choose Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
              icon={<Lock size={20} color={COLORS.textSecondary} />}
            />

            <CustomButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={styles.submitButton}
            />
          </GlassCard>
        </MotiView>

        <MotiView 
          style={styles.footer}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 500, delay: 400 }}
        >
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
        </MotiView>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
    paddingBottom: 40,
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  appTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    letterSpacing: 1.1,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    padding: SPACING.lg,
  },
  formTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  loginText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
