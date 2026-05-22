import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { COLORS, TYPOGRAPHY } from '../../theme';
import { Car } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, scale: 0.5, translateY: 50 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 12, delay: 300 }}
        style={styles.logoContainer}
      >
        <View style={styles.iconCircle}>
          <Car size={60} color={COLORS.white} strokeWidth={2.5} />
        </View>
        
        <MotiView
          from={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ type: 'timing', duration: 800, delay: 800 }}
          style={styles.titleWrapper}
        >
          <MotiText style={styles.title}>Park</MotiText>
          <MotiText style={[styles.title, { color: COLORS.primary }]}>Ease</MotiText>
        </MotiView>
        
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 1000, delay: 1500 }}
          style={styles.tagline}
        >
          Find Parking Instantly
        </MotiText>
      </MotiView>

      <MotiView
        from={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: width * 0.4 }}
        transition={{ type: 'timing', duration: 2000, delay: 500 }}
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 42,
    color: COLORS.white,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 10,
    letterSpacing: 1.2,
  },
  loader: {
    position: 'absolute',
    bottom: 100,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});

export default SplashScreen;
