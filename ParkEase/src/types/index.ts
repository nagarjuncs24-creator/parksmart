export interface ParkingSpot {
  id: string;
  latitude: number;
  longitude: number;
  status: 'free' | 'occupied' | 'reserved';
  type: 'street' | 'mall' | 'garage' | 'valet';
  pricePerHour: number;
  reportedBy?: string;
  verified: boolean;
  timestamp: number;
  title: string;
  description: string;
  features?: string[]; // e.g. ["EV Charging", "Covered", "CCTV", "Handicap Accessible"]
}

export interface Booking {
  id: string;
  spotId: string;
  userId: string;
  hours: number;
  totalPrice: number;
  paymentId?: string | null;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: number;
  startTime: number;
  endTime: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  reputation: number;
  totalBookings: number;
  createdAt: number;
  avatarUrl?: string;
}

export interface CommunityReport {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  type: 'illegal_parking' | 'poor_marking' | 'unavailable' | 'blocked_exit';
  description: string;
  photoUri?: string | null;
  verified: boolean;
  upvotes: number;
  timestamp: number;
  spotId?: string;
}
