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
import { Car, Mail, Lock, User } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, 'Alex Mercer');
      navigation.replace('Main');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerQuickDemo = async () => {
    setLoading(true);
    try {
      await login('driver@parkease.com', 'Alex Mercer');
      navigation.replace('Main');
    } catch (e: any) {
      Alert.alert('Demo Login Failed', e.message);
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
          <Text style={styles.subtitle}>Intelligent Real-time Parking</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 20, delay: 200 }}
          style={styles.cardWrapper}
        >
          <GlassCard style={styles.card}>
            <Text style={styles.formTitle}>Sign In</Text>

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
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
              icon={<Lock size={20} color={COLORS.textSecondary} />}
            />

            <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitButton}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <CustomButton
              title="Explore with Demo Account"
              onPress={triggerQuickDemo}
              type="outline"
              disabled={loading}
            />
          </GlassCard>
        </MotiView>

        <MotiView 
          style={styles.footer}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 500, delay: 400 }}
        >
          <Text style={styles.footerText}>New to ParkEase? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
            <Text style={styles.signupText}>Create Account</Text>
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitButton: {
    marginBottom: SPACING.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  dividerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
    fontWeight: '600',
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
  signupText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
