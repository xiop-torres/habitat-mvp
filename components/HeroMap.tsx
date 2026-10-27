'use client'

import dynamic from 'next/dynamic'
import type { HeroMapProps } from './HeroMapInner'

// Must load client-only: Leaflet uses `window`
const HeroMapInner = dynamic(() => import('./HeroMapInner'), {
  ssr: false,
  loading: () => (
    // Skeleton while the map JS loads — cream background matching the page
    <div className="absolute inset-0 bg-[#F8F6F0] animate-pulse" aria-hidden="true" />
  ),
})

export default function HeroMap(props: HeroMapProps) {
  return <HeroMapInner {...props} />
}

