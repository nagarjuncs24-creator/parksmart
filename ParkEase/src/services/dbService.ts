import { isFirebaseMocked, db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDoc,
  setDoc
} from 'firebase/firestore';
import { ParkingSpot, Booking, UserProfile, CommunityReport } from '../types';

// Pre-seeded premium parking spot data for Bangalore (Central Hub)
const MOCK_SPOTS: ParkingSpot[] = [
  {
    id: 'spot-01',
    title: 'MG Road Metro Block A',
    description: 'Secure open-air parking directly adjacent to MG Road metro station. Perfect for daily commuters.',
    latitude: 12.9754,
    longitude: 77.6062,
    status: 'free',
    type: 'street',
    pricePerHour: 40,
    verified: true,
    timestamp: Date.now(),
    features: ['CCTV', 'Handicap Accessible'],
  },
  {
    id: 'spot-02',
    title: 'Indiranagar 12th Main Premium',
    description: 'Valet and self-parking facility on the bustling 12th main Indiranagar. Covered and highly secure.',
    latitude: 12.9698,
    longitude: 77.6415,
    status: 'occupied',
    type: 'garage',
    pricePerHour: 80,
    verified: true,
    timestamp: Date.now(),
    features: ['Covered', 'CCTV', 'Valet'],
  },
  {
    id: 'spot-03',
    title: 'Koramangala 5th Block EV Hub',
    description: 'High-speed EV charging bays with designated parking spaces. Located near popular restaurants.',
    latitude: 12.9348,
    longitude: 77.6189,
    status: 'free',
    type: 'mall',
    pricePerHour: 60,
    verified: true,
    timestamp: Date.now(),
    features: ['EV Charging', 'Covered', 'CCTV'],
  },
  {
    id: 'spot-04',
    title: 'UB City Executive Parking',
    description: 'Ultra-premium automated garage at UB City. Fully temperature controlled and monitored.',
    latitude: 12.9716,
    longitude: 77.5956,
    status: 'free',
    type: 'garage',
    pricePerHour: 150,
    verified: true,
    timestamp: Date.now(),
    features: ['Covered', 'CCTV', 'Valet', 'Handicap Accessible'],
  },
  {
    id: 'spot-05',
    title: 'Brigade Road Commuter Bay',
    description: 'Affordable open street parking. Safe neighborhood, active community reporting.',
    latitude: 12.9738,
    longitude: 77.6074,
    status: 'reserved',
    type: 'street',
    pricePerHour: 50,
    verified: false,
    timestamp: Date.now(),
    features: ['Handicap Accessible'],
  },
  {
    id: 'spot-06',
    title: 'Forum Mall P3 Basement',
    description: 'Multi-level shopping mall parking. High security, automated ticket validation.',
    latitude: 12.9342,
    longitude: 77.6112,
    status: 'free',
    type: 'mall',
    pricePerHour: 70,
    verified: true,
    timestamp: Date.now(),
    features: ['Covered', 'CCTV'],
  }
];

const MOCK_REPORTS: CommunityReport[] = [
  {
    id: 'rep-01',
    userId: 'user-mock-1',
    latitude: 12.9730,
    longitude: 77.6050,
    type: 'illegal_parking',
    description: 'Delivery truck blocking three street parking bays.',
    verified: true,
    upvotes: 8,
    timestamp: Date.now() - 3600000 * 2,
    spotId: 'spot-01',
  },
  {
    id: 'rep-02',
    userId: 'user-mock-2',
    latitude: 12.9355,
    longitude: 77.6195,
    type: 'blocked_exit',
    description: 'Double parked SUV making exit difficult from the EV charger.',
    verified: false,
    upvotes: 3,
    timestamp: Date.now() - 1800000,
    spotId: 'spot-03',
  }
];

// Persistent state variables in mock mode
let mockSpotsState = [...MOCK_SPOTS];
let mockBookingsState: Booking[] = [];
let mockReportsState = [...MOCK_REPORTS];
let mockUserProfileState: UserProfile = {
  uid: 'demo-user-123',
  email: 'driver@parkease.com',
  name: 'Alex Mercer',
  phone: '+91 98765 43210',
  reputation: 85,
  totalBookings: 12,
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
};

// ==========================================
// PARKING SPOTS OPERATIONS
// ==========================================

export async function getParkingSpots(): Promise<ParkingSpot[]> {
  if (!isFirebaseMocked && db) {
    try {
      const col = collection(db, 'parkingSpots');
      const snapshot = await getDocs(col);
      if (snapshot.empty) {
        // If empty, let's bootstrap Firestore with our mock spots!
        for (const spot of MOCK_SPOTS) {
          await setDoc(doc(db, 'parkingSpots', spot.id), spot);
        }
        return MOCK_SPOTS;
      }
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ParkingSpot));
    } catch (e) {
      console.warn('Firebase query failed, using local fallback:', e);
      return mockSpotsState;
    }
  }
  return new Promise(resolve => setTimeout(() => resolve(mockSpotsState), 300));
}

export async function updateParkingSpot(spotId: string, updates: Partial<ParkingSpot>): Promise<void> {
  if (!isFirebaseMocked && db) {
    try {
      await updateDoc(doc(db, 'parkingSpots', spotId), updates);
      return;
    } catch (e) {
      console.warn('Firebase update failed, using local state:', e);
    }
  }
  mockSpotsState = mockSpotsState.map(s => s.id === spotId ? { ...s, ...updates } as ParkingSpot : s);
}

// ==========================================
// BOOKING OPERATIONS
// ==========================================

export async function createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'startTime' | 'endTime'>): Promise<Booking> {
  const newBooking: Booking = {
    ...bookingData,
    id: `bkg-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    startTime: Date.now(),
    endTime: Date.now() + bookingData.hours * 3600000,
  };

  if (!isFirebaseMocked && db) {
    try {
      await addDoc(collection(db, 'bookings'), newBooking);
      // Also update the spot status to reserved
      await updateDoc(doc(db, 'parkingSpots', bookingData.spotId), { status: 'reserved' });
      return newBooking;
    } catch (e) {
      console.warn('Firebase booking failed, using local state:', e);
    }
  }

  mockBookingsState = [newBooking, ...mockBookingsState];
  mockSpotsState = mockSpotsState.map(s => s.id === bookingData.spotId ? { ...s, status: 'reserved' } : s);
  mockUserProfileState.totalBookings += 1;
  return newBooking;
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  if (!isFirebaseMocked && db) {
    try {
      const q = query(
        collection(db, 'bookings'), 
        where('userId', '==', userId), 
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
    } catch (e) {
      console.warn('Firebase query failed, using local state:', e);
      return mockBookingsState.filter(b => b.userId === userId);
    }
  }
  return new Promise(resolve => 
    setTimeout(() => resolve(mockBookingsState.filter(b => b.userId === userId)), 300)
  );
}

export async function cancelBooking(bookingId: string): Promise<void> {
  let spotId = '';
  if (!isFirebaseMocked && db) {
    try {
      const docRef = doc(db, 'bookings', bookingId);
      const bookingSnap = await getDoc(docRef);
      if (bookingSnap.exists()) {
        spotId = bookingSnap.data().spotId;
        await updateDoc(docRef, { status: 'cancelled' });
        await updateDoc(doc(db, 'parkingSpots', spotId), { status: 'free' });
      }
      return;
    } catch (e) {
      console.warn('Firebase cancellation failed, using local state:', e);
    }
  }

  const booking = mockBookingsState.find(b => b.id === bookingId);
  if (booking) {
    booking.status = 'cancelled';
    spotId = booking.spotId;
    mockSpotsState = mockSpotsState.map(s => s.id === spotId ? { ...s, status: 'free' } : s);
  }
}

// ==========================================
// REPORTS OPERATIONS
// ==========================================

export async function submitReport(reportData: Omit<CommunityReport, 'id' | 'verified' | 'upvotes' | 'timestamp'>): Promise<CommunityReport> {
  const newReport: CommunityReport = {
    ...reportData,
    id: `rep-${Math.random().toString(36).substr(2, 9)}`,
    verified: false,
    upvotes: 0,
    timestamp: Date.now(),
  };

  if (!isFirebaseMocked && db) {
    try {
      await addDoc(collection(db, 'reports'), newReport);
      return newReport;
    } catch (e) {
      console.warn('Firebase report failed, using local state:', e);
    }
  }

  mockReportsState = [newReport, ...mockReportsState];
  mockUserProfileState.reputation += 5; // Reward user for reporting
  return newReport;
}

export async function getReports(latitude: number, longitude: number, radiusKm: number = 2): Promise<CommunityReport[]> {
  if (!isFirebaseMocked && db) {
    try {
      const col = collection(db, 'reports');
      const snapshot = await getDocs(col);
      return snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as CommunityReport))
        .filter(r => {
          // Quick distance formula (1 degree lat ~= 111km)
          const dist = Math.sqrt((r.latitude - latitude) ** 2 + (r.longitude - longitude) ** 2) * 111;
          return dist <= radiusKm;
        });
    } catch (e) {
      console.warn('Firebase query failed, using local reports:', e);
    }
  }

  return mockReportsState.filter(r => {
    const dist = Math.sqrt((r.latitude - latitude) ** 2 + (r.longitude - longitude) ** 2) * 111;
    return dist <= radiusKm;
  });
}

export async function upvoteReport(reportId: string): Promise<void> {
  if (!isFirebaseMocked && db) {
    try {
      const docRef = doc(db, 'reports', reportId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const curUpvotes = snap.data().upvotes || 0;
        await updateDoc(docRef, { upvotes: curUpvotes + 1 });
      }
      return;
    } catch (e) {
      console.warn('Firebase upvote failed:', e);
    }
  }

  mockReportsState = mockReportsState.map(r => r.id === reportId ? { ...r, upvotes: r.upvotes + 1 } : r);
}

// ==========================================
// USER PROFILE OPERATIONS
// ==========================================

export async function getUserProfile(userId: string): Promise<UserProfile> {
  if (!isFirebaseMocked && db) {
    try {
      const docRef = doc(db, 'users', userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (e) {
      console.warn('Firebase profile fetch failed:', e);
    }
  }
  return new Promise(resolve => setTimeout(() => resolve(mockUserProfileState), 200));
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  if (!isFirebaseMocked && db) {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
      return;
    } catch (e) {
      console.warn('Firebase profile update failed:', e);
    }
  }
  mockUserProfileState = { ...mockUserProfileState, ...updates };
}
