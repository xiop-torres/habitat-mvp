export interface University {
  id: string
  fullName: string
  shortName: string
  storedValue: string
  lat: number
  lng: number
}

export const UNIVERSITIES: University[] = [
  {
    id: 'ucsm',
    fullName: 'Universidad Católica de Santa María',
    shortName: 'UCSM',
    storedValue: 'UCSM',
    lat: -16.40618,
    lng: -71.54763,
  },
  {
    id: 'unsa',
    fullName: 'Universidad Nacional de San Agustín',
    shortName: 'UNSA',
    storedValue: 'UNSA',
    lat: -16.39712,
    lng: -71.53721,
  },
  {
    id: 'ucsp',
    fullName: 'Universidad Católica San Pablo',
    shortName: 'UCSP',
    storedValue: 'Universidad Católica San Pablo',
    lat: -16.38970,
    lng: -71.53570,
  },
  {
    id: 'utp',
    fullName: 'Universidad Tecnológica del Perú',
    shortName: 'UTP',
    storedValue: 'UTP',
    lat: -16.40100,
    lng: -71.53300,
  }
]

export function resolveUniversity(value: string | null | undefined): University | null {
  if (!value) return null
  
  const normalized = value.toLowerCase().trim()
  
  for (const uni of UNIVERSITIES) {
    if (
      normalized === uni.id ||
      normalized === uni.shortName.toLowerCase() ||
      normalized === uni.fullName.toLowerCase() ||
      normalized === uni.storedValue.toLowerCase()
    ) {
      return uni
    }
  }

  if (normalized.includes('santa maría') || normalized.includes('santa maria') || normalized === 'ucsm') {
    return UNIVERSITIES.find(u => u.id === 'ucsm') || null
  }
  if (normalized.includes('san agustín') || normalized.includes('san agustin') || normalized === 'unsa') {
    return UNIVERSITIES.find(u => u.id === 'unsa') || null
  }
  if (normalized.includes('san pablo') || normalized === 'ucsp') {
    return UNIVERSITIES.find(u => u.id === 'ucsp') || null
  }
  if (normalized.includes('tecnológica del perú') || normalized.includes('tecnologica del peru') || normalized === 'utp') {
    return UNIVERSITIES.find(u => u.id === 'utp') || null
  }

  return null
}
