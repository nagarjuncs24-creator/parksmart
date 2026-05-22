import { ParkingSpot } from '../types';

export interface ForecastDataPoint {
  hour: string;
  occupancy: number; // 0 to 100 percentage
}

export interface PredictionResult {
  currentOccupancy: number;
  status: 'highly_available' | 'moderate' | 'congested';
  statusText: string;
  statusColor: string;
  bestTimeToPark: string;
  hourlyForecast: ForecastDataPoint[];
}

/**
 * Predicts the parking occupancy profile for a specific spot and day factor.
 * Uses a modeled mathematical formula mimicking real city behavior (peak commute hours).
 */
export function getSpotOccupancyPrediction(spot: ParkingSpot, targetHour: number = new Date().getHours()): PredictionResult {
  const hourlyForecast: ForecastDataPoint[] = [];
  
  // Seed factors based on spot pricing and location types
  const priceFactor = Math.max(0.5, 150 / spot.pricePerHour); // Cheaper spots get filled quicker
  const typeBase = spot.type === 'street' ? 0.3 : spot.type === 'mall' ? 0.4 : 0.2;

  for (let h = 0; h < 24; h++) {
    let occupancyVal = 0;

    // Build standard double-peak urban congestion curve:
    // Peak 1: Morning commute (9 AM - 11 AM)
    // Peak 2: Evening dinner/shopping (6 PM - 8 PM)
    if (spot.type === 'mall') {
      // Malls peak in the afternoon and evening
      occupancyVal = 15 + 75 * Math.sin(((h - 10) / 12) * Math.PI) * Math.sin(((h - 10) / 12) * Math.PI);
      if (h < 10) occupancyVal = 10;
    } else if (spot.type === 'street') {
      // Streets peak around lunch and early evening
      occupancyVal = 20 + 65 * Math.sin(((h - 8) / 14) * Math.PI);
    } else {
      // Standard dual peak (office rush hours)
      const mornPeak = Math.exp(-0.1 * Math.pow(h - 10, 2)) * 75;
      const evePeak = Math.exp(-0.08 * Math.pow(h - 19, 2)) * 85;
      occupancyVal = Math.max(10, mornPeak + evePeak + typeBase * 20);
    }

    // Apply spot factors (adjust for price and verification status)
    occupancyVal = occupancyVal * priceFactor;
    occupancyVal = Math.min(98, Math.max(5, Math.round(occupancyVal)));

    hourlyForecast.push({
      hour: `${h === 0 ? '12' : h > 12 ? h - 12 : h}${h >= 12 ? 'PM' : 'AM'}`,
      occupancy: occupancyVal,
    });
  }

  // Get current occupancy from the target hour
  const currentOccupancy = hourlyForecast[targetHour]?.occupancy || 50;

  // Compute recommendation
  let status: 'highly_available' | 'moderate' | 'congested';
  let statusText = 'Available';
  let statusColor = '#00C853'; // emerald
  let bestTimeToPark = 'Now';

  if (currentOccupancy < 40) {
    status = 'highly_available';
    statusText = 'High Vacancy (AI Predicted)';
    statusColor = '#00C853';
  } else if (currentOccupancy < 75) {
    status = 'moderate';
    statusText = 'Moderate Traffic';
    statusColor = '#FFB300';
    bestTimeToPark = 'After 7:00 PM';
  } else {
    status = 'congested';
    statusText = 'High Congestion';
    statusColor = '#FF3D00';
    // Find hour with lowest occupancy in the next 6 hours
    let minOcc = 100;
    let bestH = targetHour;
    for (let i = 1; i <= 6; i++) {
      const nextH = (targetHour + i) % 24;
      const occ = hourlyForecast[nextH].occupancy;
      if (occ < minOcc) {
        minOcc = occ;
        bestH = nextH;
      }
    }
    bestTimeToPark = `Around ${bestH > 12 ? bestH - 12 : bestH}:00 ${bestH >= 12 ? 'PM' : 'AM'}`;
  }

  return {
    currentOccupancy,
    status,
    statusText,
    statusColor,
    bestTimeToPark,
    hourlyForecast,
  };
}
