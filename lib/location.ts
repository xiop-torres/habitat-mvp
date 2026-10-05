export function getPublicCoordinates(lat: number | null | undefined, lng: number | null | undefined) {
  if (lat == null || lng == null) {
    return null
  }

  // Redondeo a 3 decimales para aproximación determinística (aprox. ~111m)
  const publicLat = Math.round(lat * 1000) / 1000
  const publicLng = Math.round(lng * 1000) / 1000

  return { publicLat, publicLng }
}

import { resolveUniversity } from './universities'

/**
 * Calculates the straight-line distance in kilometers between two coordinates
 * using the Haversine formula.
 */
export function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

/**
 * Estimates walking time in minutes based on straight-line distance.
 * Assumes a walking speed of 5 km/h (1 km ≈ 12 minutes).
 */
export function calculateWalkingMinutes(distanceKm: number): number {
  const speedKmH = 5
  const timeHours = distanceKm / speedKmH
  const timeMinutes = Math.round(timeHours * 60)
  
  // Return at least 1 minute if distance > 0
  if (distanceKm > 0 && timeMinutes === 0) return 1
  return timeMinutes
}

/**
 * Generates a distance label string (e.g., "A 12 min caminando") 
 * given the exact coordinates of a listing and the target university string.
 * This should ONLY be run securely with exact coordinates.
 */
export function generateDistanceLabel(
  exactLat: number | null | undefined, 
  exactLng: number | null | undefined, 
  universityString: string | null | undefined
): string | null {
  if (exactLat == null || exactLng == null || !universityString) {
    return null
  }
  
  const uni = resolveUniversity(universityString)
  if (!uni) {
    return null
  }
  
  const distanceKm = calculateDistanceKm(exactLat, exactLng, uni.lat, uni.lng)
  const walkingMinutes = calculateWalkingMinutes(distanceKm)
  
  return `A ${walkingMinutes} min caminando`
}
