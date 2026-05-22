import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { MotiView } from 'moti';
import { useApp } from '../../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { GlassCard } from '../../components/shared/GlassCard';
import { CustomButton } from '../../components/shared/CustomButton';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Award, 
  History, 
  LogOut, 
  CheckCircle,
  HelpCircle
} from 'lucide-react-native';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, bookings } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Alex Mercer');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out from ParkEase?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive',
        onPress: () => {
          logout();
          // Navigate back to onboarding stack
          navigation.replace('Login');
        }
      }
    ]);
  };

  const handleSave = () => {
    setEditing(false);
    Alert.alert('Success', 'Profile details updated successfully.');
  };

  if (!user) return null;

  const completedBookings = bookings.filter(b => b.status === 'completed' || b.endTime < Date.now()).length;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <Text style={styles.screenTitle}>My Account</Text>

      {/* Avatar Header */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.avatarHeader}
      >
        <Image 
          source={{ uri: user.avatarUrl }} 
          style={styles.avatar} 
        />
        <View style={styles.avatarInfo}>
          <Text style={styles.avatarName}>{user.name}</Text>
          <View style={styles.reputationRow}>
            <Award size={14} color="#FFB300" style={{ marginRight: 4 }} />
            <Text style={styles.reputationText}>Reputation: {user.reputation} XP</Text>
          </View>
        </View>
      </MotiView>

      {/* Analytics grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsCol}>
          <GlassCard style={styles.statsCard}>
            <History size={20} color={COLORS.primary} style={{ marginBottom: 6 }} />
            <Text style={styles.statsValue}>{user.totalBookings}</Text>
            <Text style={styles.statsLabel}>Total Bookings</Text>
          </GlassCard>
        </View>
        
        <View style={styles.statsCol}>
          <GlassCard style={styles.statsCard}>
            <CheckCircle size={20} color={COLORS.secondary} style={{ marginBottom: 6 }} />
            <Text style={styles.statsValue}>{completedBookings}</Text>
            <Text style={styles.statsLabel}>Trips Completed</Text>
          </GlassCard>
        </View>

        <View style={styles.statsCol}>
          <GlassCard style={styles.statsCard}>
            <Award size={20} color="#FF3D00" style={{ marginBottom: 6 }} />
            <Text style={styles.statsValue}>{user.reputation > 50 ? 'Silver' : 'Bronze'}</Text>
            <Text style={styles.statsLabel}>Tier Level</Text>
          </GlassCard>
        </View>
      </View>

      {/* Details Card */}
      <GlassCard style={styles.detailsCard}>
        <Text style={styles.cardHeader}>PERSONAL DETAILS</Text>

        <View style={styles.detailRow}>
          <User size={16} color={COLORS.textSecondary} style={styles.rowIcon} />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>FULL NAME</Text>
            {editing ? (
              <TextInput 
                value={name} 
                onChangeText={setName} 
                style={styles.rowInput}
              />
            ) : (
              <Text style={styles.rowValue}>{user.name}</Text>
            )}
          </View>
        </View>

        <View style={styles.detailRow}>
          <Mail size={16} color={COLORS.textSecondary} style={styles.rowIcon} />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>EMAIL ADDRESS</Text>
            <Text style={styles.rowValue}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Phone size={16} color={COLORS.textSecondary} style={styles.rowIcon} />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>PHONE NUMBER</Text>
            {editing ? (
              <TextInput 
                value={phone} 
                onChangeText={setPhone} 
                style={styles.rowInput}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.rowValue}>{user.phone}</Text>
            )}
          </View>
        </View>

        <CustomButton 
          title={editing ? "Save Changes" : "Edit Profile"}
          onPress={editing ? handleSave : () => setEditing(true)}
          type="outline"
          style={styles.editBtn}
        />
      </GlassCard>

      {/* Quick shortcuts */}
      <GlassCard style={styles.detailsCard}>
        <Text style={styles.cardHeader}>SUPPORT & LEGAL</Text>
        
        <TouchableOpacity style={styles.supportLink} activeOpacity={0.7}>
          <Shield size={16} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
          <Text style={styles.supportLinkText}>Privacy Policy & Terms</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportLink} activeOpacity={0.7}>
          <HelpCircle size={16} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
          <Text style={styles.supportLinkText}>Frequently Asked Questions</Text>
        </TouchableOpacity>
      </GlassCard>

      {/* Logout */}
      <CustomButton 
        title="Sign Out"
        onPress={handleLogout}
        type="ghost"
        icon={<LogOut size={18} color={COLORS.error} />}
        textStyle={{ color: COLORS.error }}
        style={styles.logoutBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingTop: 60,
    paddingHorizontal: SPACING.md,
    paddingBottom: 110,
  },
  screenTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  avatarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarInfo: {
    marginLeft: 16,
  },
  avatarName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  reputationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reputationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: SPACING.lg,
  },
  statsCol: {
    flex: 1,
    paddingHorizontal: 6,
  },
  statsCard: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  statsLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 2,
  },
  detailsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    paddingBottom: 10,
  },
  rowIcon: {
    marginRight: 12,
    alignSelf: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  rowValue: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 2,
  },
  rowInput: {
    height: 30,
    color: COLORS.white,
    ...TYPOGRAPHY.bodySmall,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    padding: 0,
    marginTop: 2,
  },
  editBtn: {
    height: 40,
    marginTop: 8,
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  supportLinkText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: SPACING.md,
    height: 50,
  },
});
