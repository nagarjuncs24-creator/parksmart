import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Dimensions,
  Alert
} from 'react-native';
import Svg, { Path, Rect, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { useApp } from '../../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { GlassCard } from '../../components/shared/GlassCard';
import { 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  Eye, 
  RefreshCw,
  Power
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Premium Vector Spline Graph drawn in Pure SVGs (100% cross-platform compatible and crash-proof)
const AnalyticsChart = () => {
  const chartWidth = width - 64;
  const chartHeight = 120;
  const padding = 15;
  
  // Weekly points: Mon, Tue, Wed, Thu, Fri, Sat, Sun
  const data = [12, 19, 32, 25, 45, 68, 55];
  const maxVal = Math.max(...data);
  const minVal = 0;
  
  // Helper to map data points to SVG coordinates
  const getCoordinates = () => {
    const points: { x: number; y: number }[] = [];
    const stepX = (chartWidth - padding * 2) / (data.length - 1);
    
    data.forEach((val, i) => {
      const x = padding + i * stepX;
      // Invert Y because SVG coordinates start from top-left
      const y = chartHeight - padding - ((val - minVal) / (maxVal - minVal)) * (chartHeight - padding * 2);
      points.push({ x, y });
    });
    return points;
  };

  const coords = getCoordinates();
  
  // Construct cubic spline path string for smooth curves
  const makePathString = () => {
    if (coords.length === 0) return '';
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const current = coords[i];
      const next = coords[i + 1];
      const cpX1 = current.x + (next.x - current.x) / 3;
      const cpY1 = current.y;
      const cpX2 = current.x + 2 * (next.x - current.x) / 3;
      const cpY2 = next.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const pathD = makePathString();

  return (
    <View style={styles.chartWrapper}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Horizontal grid lines */}
        <Line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
        <Line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
        <Line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

        {/* Spline Curve Path */}
        <Path
          d={pathD}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Highlight Circles on points */}
        {coords.map((c, i) => (
          <G key={i}>
            <Circle
              cx={c.x}
              cy={c.y}
              r={4}
              fill={COLORS.primary}
              stroke={COLORS.background}
              strokeWidth={1.5}
            />
            {i === coords.length - 2 && ( // Highlight Sat (peak day)
              <Circle
                cx={c.x}
                cy={c.y}
                r={8}
                fill="none"
                stroke={COLORS.secondary}
                strokeWidth={1.5}
              />
            )}
          </G>
        ))}

        {/* Chart Day Labels */}
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
          const stepX = (chartWidth - padding * 2) / 6;
          const x = padding + i * stepX;
          return (
            <SvgText
              key={day + i}
              x={x}
              y={chartHeight - 2}
              fill={COLORS.textSecondary}
              fontSize={8}
              fontWeight="700"
              textAnchor="middle"
            >
              {day}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

export default function AdminDashboard() {
  const { spots, bookings, reports, adminToggleSpot, refreshAllData } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const activeReservations = bookings.filter(b => b.status === 'active' && b.endTime > Date.now()).length;
  
  // Stats Aggregation
  const totalRevenue = bookings
    .filter(b => b.status === 'active' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0) + 1240; // Base historical seed

  const occupiedCount = spots.filter(s => s.status !== 'free').length;
  const occupancyRate = Math.round((occupiedCount / spots.length) * 100);

  const handleToggle = async (spotId: string, currentStatus: string) => {
    await adminToggleSpot(spotId);
    Alert.alert('Status Sync', `Parking spot ${spotId} toggled successfully.`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAllData();
    setRefreshing(false);
  };

  const renderSpotManagerItem = ({ item }: { item: any }) => {
    const isFree = item.status === 'free';
    const isReserved = item.status === 'reserved';
    
    let statusColor = COLORS.secondary;
    let label = 'VACANT';
    if (isReserved) {
      statusColor = '#FFB300';
      label = 'RESERVED';
    } else if (item.status === 'occupied') {
      statusColor = COLORS.accent;
      label = 'BUSY';
    }

    return (
      <View style={styles.spotRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowSpotTitle}>{item.title}</Text>
          <Text style={styles.rowSpotDetails}>{item.type.toUpperCase()} • ₹{item.pricePerHour}/hr</Text>
        </View>

        <View style={styles.rowActions}>
          <View style={[styles.miniBadge, { borderColor: statusColor }]}>
            <Text style={[styles.miniBadgeText, { color: statusColor }]}>{label}</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.powerBtn,
              { backgroundColor: isFree ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 200, 83, 0.1)' }
            ]}
            onPress={() => handleToggle(item.id, item.status)}
            activeOpacity={0.8}
          >
            <Power size={14} color={isFree ? COLORS.error : COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Control Panel</Text>
          <Text style={styles.screenSubtitle}>System Operator Analytics & Toggles</Text>
        </View>

        <TouchableOpacity 
          style={styles.refreshBtn}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCol}>
            <GlassCard style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <DollarSign size={16} color={COLORS.secondary} />
                <Text style={styles.kpiLabel}>REVENUE</Text>
              </View>
              <Text style={styles.kpiValue}>₹{totalRevenue}</Text>
            </GlassCard>
          </View>

          <View style={styles.kpiCol}>
            <GlassCard style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <Eye size={16} color={COLORS.primary} />
                <Text style={styles.kpiLabel}>OCCUPANCY</Text>
              </View>
              <Text style={styles.kpiValue}>{occupancyRate}%</Text>
            </GlassCard>
          </View>

          <View style={styles.kpiCol}>
            <GlassCard style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <ShieldAlert size={16} color={COLORS.accent} />
                <Text style={styles.kpiLabel}>VIOLATIONS</Text>
              </View>
              <Text style={styles.kpiValue}>{reports.length}</Text>
            </GlassCard>
          </View>
        </View>

        {/* Analytics Graph card */}
        <GlassCard style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <TrendingUp size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardHeader}>WEEKLY RESERVATIONS RATIO</Text>
          </View>
          <AnalyticsChart />
          <Text style={styles.chartSubtitle}>Peak activities logged Saturday afternoons on Indiranagar 12th Main.</Text>
        </GlassCard>

        {/* Spots manager */}
        <GlassCard style={styles.spotManagerCard}>
          <Text style={styles.cardHeader}>SPOT AVAILABILITY MANAGER</Text>
          <Text style={styles.managerDesc}>Tap the power toggle switches to simulate hardware sensors changing real-time occupancy coordinates instantly.</Text>
          
          <FlatList
            data={spots}
            keyExtractor={item => item.id}
            renderItem={renderSpotManagerItem}
            scrollEnabled={false} // Let the main scrollview take control
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </GlassCard>
        
        <View style={{ height: 40 }} />
      </ScrollView>
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
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    paddingBottom: 110,
  },
  kpiGrid: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: SPACING.md,
  },
  kpiCol: {
    flex: 1,
    paddingHorizontal: 6,
  },
  kpiCard: {
    padding: 12,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  analyticsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.2,
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  chartSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  spotManagerCard: {
    padding: SPACING.md,
  },
  managerDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 15,
  },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowSpotTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontWeight: '700',
  },
  rowSpotDetails: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    marginRight: 10,
  },
  miniBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  powerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
