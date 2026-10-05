export function getPublicCoordinates(lat: number | null | undefined, lng: number | null | undefined) {
  if (lat == null || lng == null) {
    return null
  }

  // Redondeo a 3 decimales para aproximación determinística (aprox. ~111m)
  const publicLat = Math.round(lat * 1000) / 1000
  const publicLng = Math.round(lng * 1000) / 1000

  return { publicLat, publicLng }
}
