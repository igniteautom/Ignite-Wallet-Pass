import { Business } from '../types';

export const GEOFENCE_INSIDE_THRESHOLD_FEET = 30; // 30 feet proximity required to be "inside"
export const VISIT_DURATION_REQUIRED_SECONDS = 1200; // 20 minutes = 1200s
export const VISIT_REWARD_POINTS = 25;
export const VISIT_REWARD_STAMPS = 1;

/**
 * Calculates distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Converts meters to feet
 */
export function metersToFeet(meters: number): number {
  return meters * 3.28084;
}

/**
 * Formats distance in a clean human-readable string (ft or miles)
 */
export function formatDistance(feet: number): string {
  if (feet <= 0) return '0 ft';
  if (feet < 500) {
    return `${Math.round(feet)} ft`;
  }
  const miles = feet / 5280;
  if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  }
  return `${Math.round(miles)} mi`;
}

/**
 * Formats seconds into MM:SS
 */
export function formatSecondsToTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export interface BusinessWithDistance {
  business: Business;
  distanceMeters: number;
  distanceFeet: number;
  isInside: boolean;
}

/**
 * Finds all businesses sorted by distance from the user coordinate
 */
export function getSortedBusinessesByDistance(
  businesses: Business[],
  userLat: number,
  userLon: number
): BusinessWithDistance[] {
  return businesses
    .map((biz) => {
      const coords = biz.coordinates || { latitude: 37.774929, longitude: -122.419416 };
      const distMeters = calculateDistanceMeters(userLat, userLon, coords.latitude, coords.longitude);
      const distFeet = metersToFeet(distMeters);
      return {
        business: biz,
        distanceMeters: distMeters,
        distanceFeet: distFeet,
        isInside: distFeet <= GEOFENCE_INSIDE_THRESHOLD_FEET
      };
    })
    .sort((a, b) => a.distanceFeet - b.distanceFeet);
}
