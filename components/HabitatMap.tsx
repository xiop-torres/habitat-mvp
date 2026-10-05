'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import type { MapHome } from './HabitatMapInner'

const HabitatMapInner = dynamic(() => import('./HabitatMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[440px] items-center justify-center rounded-3xl border border-[#E4E4E7] bg-[#F4F2EB] shadow-sm">
      <Loader2 className="animate-spin text-[#EAB308]" size={32} />
    </div>
  ),
})

export default function HabitatMap({ homes, className }: { homes: MapHome[]; className?: string }) {
  return <HabitatMapInner homes={homes} className={className} />
}
