import React, { createContext, useContext, useState, useEffect } from 'react';
import { ParkingSpot, Booking, UserProfile, CommunityReport } from '../types';
import * as dbService from '../services/dbService';

interface AppContextType {
  user: UserProfile | null;
  spots: ParkingSpot[];
  bookings: Booking[];
  reports: CommunityReport[];
  loading: boolean;
  login: (email: string, name?: string) => Promise<void>;
  signup: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  bookSpot: (spotId: string, hours: number) => Promise<Booking>;
  cancelReservation: (bookingId: string) => Promise<void>;
  createReport: (type: CommunityReport['type'], description: string, lat: number, lng: number, spotId?: string) => Promise<void>;
  upvoteCommunityReport: (reportId: string) => Promise<void>;
  adminToggleSpot: (spotId: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial load
  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = async () => {
    setLoading(true);
    try {
      const allSpots = await dbService.getParkingSpots();
      setSpots(allSpots);

      // Default mock user profile upon initial start so screen displays nicely
      const profile = await dbService.getUserProfile('demo-user-123');
      setUser(profile);

      if (profile) {
        const userBkgs = await dbService.getUserBookings(profile.uid);
        setBookings(userBkgs);
      }

      // Seed reports based on center location
      const localReports = await dbService.getReports(12.9716, 77.5946, 10);
      setReports(localReports);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, name: string = 'Alex Mercer') => {
    setLoading(true);
    try {
      // Fetch or simulate profile creation
      const profile = await dbService.getUserProfile('demo-user-123');
      const updatedProfile = { ...profile, email, name };
      await dbService.updateUserProfile('demo-user-123', updatedProfile);
      setUser(updatedProfile);

      // Load bookings
      const userBkgs = await dbService.getUserBookings(updatedProfile.uid);
      setBookings(userBkgs);
    } catch (e) {
      console.error('Login error:', e);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, name: string) => {
    setLoading(true);
    try {
      await login(email, name);
    } catch (e) {
      console.error('Signup error:', e);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setBookings([]);
  };

  const bookSpot = async (spotId: string, hours: number) => {
    if (!user) throw new Error('User not logged in');
    
    const spot = spots.find(s => s.id === spotId);
    if (!spot) throw new Error('Parking spot not found');

    const booking = await dbService.createBooking({
      spotId,
      userId: user.uid,
      hours,
      totalPrice: spot.pricePerHour * hours,
      status: 'active',
    });

    // Update local state instantly
    setBookings(prev => [booking, ...prev]);
    setSpots(prev => 
      prev.map(s => s.id === spotId ? { ...s, status: 'reserved' } : s)
    );
    
    // Increment user stats locally
    setUser(prev => prev ? { ...prev, totalBookings: prev.totalBookings + 1 } : null);
    
    return booking;
  };

  const cancelReservation = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    await dbService.cancelBooking(bookingId);

    // Update local states
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
    );
    setSpots(prev => 
      prev.map(s => s.id === booking.spotId ? { ...s, status: 'free' } : s)
    );
  };

  const createReport = async (
    type: CommunityReport['type'], 
    description: string, 
    lat: number, 
    lng: number, 
    spotId?: string
  ) => {
    if (!user) return;
    const report = await dbService.submitReport({
      userId: user.uid,
      latitude: lat,
      longitude: lng,
      type,
      description,
      spotId,
    });
    setReports(prev => [report, ...prev]);
    // Award reputation points locally
    setUser(prev => prev ? { ...prev, reputation: prev.reputation + 5 } : null);
  };

  const upvoteCommunityReport = async (reportId: string) => {
    await dbService.upvoteReport(reportId);
    setReports(prev => 
      prev.map(r => r.id === reportId ? { ...r, upvotes: r.upvotes + 1 } : r)
    );
  };

  const adminToggleSpot = async (spotId: string) => {
    const spot = spots.find(s => s.id === spotId);
    if (!spot) return;

    const newStatus = spot.status === 'free' ? 'occupied' : 'free';
    await dbService.updateParkingSpot(spotId, { status: newStatus });
    setSpots(prev => 
      prev.map(s => s.id === spotId ? { ...s, status: newStatus } : s)
    );
  };

  return (
    <AppContext.Provider value={{
      user,
      spots,
      bookings,
      reports,
      loading,
      login,
      signup,
      logout,
      bookSpot,
      cancelReservation,
      createReport,
      upvoteCommunityReport,
      adminToggleSpot,
      refreshAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
