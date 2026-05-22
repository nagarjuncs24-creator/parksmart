import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { MotiView, AnimatePresence } from 'moti';
import { useApp } from '../../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { getSpotOccupancyPrediction } from '../../services/aiService';
import { 
  Search, 
  Navigation, 
  Zap, 
  ShieldCheck, 
  Compass, 
  Clock, 
  Info, 
  X,
  MapPin
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Premium Custom Dark Mode styling for Map
const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#475569" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0f172a" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "visibility": "off" }] },
  { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
  { "featureType": "administrative.neighborhood", "stylers": [{ "visibility": "off" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#0f2e22" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#15803d" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#020617" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#1e293b" }] }
];

export default function HomeScreen({ navigation }: any) {
  const { spots, loading } = useApp();
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [region, setRegion] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.07,
    longitudeDelta: 0.07,
  });

  const mapRef = useRef<MapView>(null);

  const filters = ['All', 'EV Charging', 'Covered', 'Valet', 'Street'];

  const filteredSpots = spots.filter(spot => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'EV Charging') return spot.features?.includes('EV Charging');
    if (activeFilter === 'Covered') return spot.features?.includes('Covered');
    if (activeFilter === 'Valet') return spot.features?.includes('Valet');
    if (activeFilter === 'Street') return spot.type === 'street';
    return true;
  });

  const handleSpotSelect = (spot: any) => {
    setSelectedSpot(spot);
    mapRef.current?.animateToRegion({
      latitude: spot.latitude - 0.005, // Center spot with bottom sheet offset
      longitude: spot.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }, 400);
  };

  const centerToDefault = () => {
    mapRef.current?.animateToRegion({
      latitude: 12.9716,
      longitude: 77.5946,
      latitudeDelta: 0.045,
      longitudeDelta: 0.045,
    }, 400);
  };

  if (loading && spots.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>Loading Interactive Maps...</Text>
      </View>
    );
  }

  // AI occupancy prediction for the bottom sheet
  const aiPrediction = selectedSpot ? getSpotOccupancyPrediction(selectedSpot) : null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => setSelectedSpot(null)}
      >
        {filteredSpots.map(s => {
          const isSelected = selectedSpot?.id === s.id;
          const pinColor = 
            s.status === 'free' 
              ? COLORS.secondary 
              : s.status === 'reserved' 
                ? '#FFB300' 
                : COLORS.accent;

          return (
            <Marker
              key={s.id}
              coordinate={{ latitude: s.latitude, longitude: s.longitude }}
              onPress={() => handleSpotSelect(s)}
            >
              <View style={[
                styles.customMarker, 
                { backgroundColor: pinColor },
                isSelected && styles.customMarkerSelected
              ]}>
                <View style={styles.markerInnerCircle}>
                  <Text style={styles.markerText}>₹{s.pricePerHour}</Text>
                </View>
                {/* Pointer tip */}
                <View style={[styles.markerTip, { borderTopColor: pinColor }]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Floating Header Filters */}
      <View style={styles.floatingHeader}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <Text style={styles.searchText}>Search central Bengaluru parking...</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              onPress={() => {
                setActiveFilter(filter);
                setSelectedSpot(null);
              }}
              style={[
                styles.filterPill,
                activeFilter === filter && styles.filterPillActive
              ]}
              activeOpacity={0.8}
            >
              {filter === 'EV Charging' && <Zap size={14} color={activeFilter === filter ? COLORS.white : '#FFB300'} style={{ marginRight: 4 }} />}
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Float Target Re-center button */}
      <TouchableOpacity 
        style={styles.recenterButton} 
        onPress={centerToDefault}
        activeOpacity={0.8}
      >
        <Compass size={24} color={COLORS.white} />
      </TouchableOpacity>

      {/* Bottom Sheet Card Details */}
      <AnimatePresence>
        {selectedSpot && aiPrediction && (
          <MotiView
            from={{ translateY: 300, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            exit={{ translateY: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            style={styles.bottomCard}
          >
            <View style={styles.bottomCardInner}>
              <View style={styles.dragHandle} />
              
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.spotTitle}>{selectedSpot.title}</Text>
                    {selectedSpot.verified && (
                      <View style={styles.verifiedBadge}>
                        <ShieldCheck size={14} color="#00C853" />
                      </View>
                    )}
                  </View>
                  <View style={styles.spotTypeRow}>
                    <MapPin size={14} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.spotTypeText}>
                      {selectedSpot.type.toUpperCase()} • 5 mins away
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  onPress={() => setSelectedSpot(null)} 
                  style={styles.closeBtn}
                >
                  <X size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>PRICE</Text>
                  <Text style={styles.infoValue}>₹{selectedSpot.pricePerHour}<Text style={styles.infoValueUnit}>/hr</Text></Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>STATUS</Text>
                  <View style={[
                    styles.statusPill, 
                    { backgroundColor: selectedSpot.status === 'free' ? 'rgba(0,200,83,0.1)' : 'rgba(255,61,0,0.1)' }
                  ]}>
                    <Text style={[
                      styles.statusPillText, 
                      { color: selectedSpot.status === 'free' ? COLORS.secondary : COLORS.accent }
                    ]}>
                      {selectedSpot.status === 'free' ? 'AVAILABLE' : selectedSpot.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* AI Forecast Banner */}
              <View style={[styles.aiBanner, { borderColor: aiPrediction.statusColor + '40' }]}>
                <View style={styles.aiBannerHeader}>
                  <Info size={16} color={aiPrediction.statusColor} style={{ marginRight: 6 }} />
                  <Text style={[styles.aiTitle, { color: aiPrediction.statusColor }]}>
                    {aiPrediction.statusText}
                  </Text>
                </View>
                <Text style={styles.aiDescription}>
                  Current congestion is <Text style={{ fontWeight: '700', color: COLORS.white }}>{aiPrediction.currentOccupancy}%</Text>. Best time to secure this spot is <Text style={{ color: COLORS.secondary, fontWeight: '700' }}>{aiPrediction.bestTimeToPark}</Text>.
                </Text>
              </View>

              {/* Amenities */}
              {selectedSpot.features && selectedSpot.features.length > 0 && (
                <View style={styles.amenitiesContainer}>
                  {selectedSpot.features.map((feat: string) => (
                    <View key={feat} style={styles.amenityTag}>
                      {feat === 'EV Charging' ? <Zap size={12} color="#FFB300" style={{ marginRight: 4 }} /> : null}
                      <Text style={styles.amenityText}>{feat}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Book Button */}
              {selectedSpot.status === 'free' ? (
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => {
                    const spotToBook = selectedSpot;
                    setSelectedSpot(null);
                    navigation.navigate('Booking', { spot: spotToBook });
                  }}
                  activeOpacity={0.9}
                >
                  <Navigation size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.bookBtnText}>Reserve Spot & Pay</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.disabledBtn}>
                  <Clock size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={styles.disabledBtnText}>Spot Currently Unavailable</Text>
                </View>
              )}
            </View>
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
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  map: {
    width: width,
    height: height,
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchBar: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)', // Translucent Slate 800
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  searchText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  filtersScroll: {
    marginTop: 12,
  },
  filtersContainer: {
    paddingRight: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 270, // Float above bottom sheet
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
    zIndex: 9,
  },
  customMarker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    ...SHADOWS.light,
  },
  customMarkerSelected: {
    borderWidth: 2,
    borderColor: COLORS.white,
    transform: [{ scale: 1.15 }],
  },
  markerInnerCircle: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  markerText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  markerTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
    borderTopWidth: 6,
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 100, // Positioned safely above custom bottom tab bar
    left: 16,
    right: 16,
    zIndex: 20,
  },
  bottomCardInner: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)', // Slate 800 translucent
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    ...SHADOWS.strong,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    marginRight: 6,
  },
  verifiedBadge: {
    padding: 2,
  },
  spotTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  spotTypeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.full,
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.4)', // Slate 900 tint
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  infoValueUnit: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 4,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  aiBanner: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(15,23,42,0.3)',
    padding: 12,
    marginBottom: 12,
  },
  aiBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  aiDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  amenityText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  bookBtnText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.white,
  },
  disabledBtn: {
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  disabledBtnText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
