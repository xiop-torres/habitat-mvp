import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Habitat, inicio"
      className={cn('inline-flex min-h-11 shrink-0 items-center rounded-xl', className)}
    >
      <Image
        src="/brand/logo_habitat.png"
        alt="Habitat — Tu espacio, más cerca."
        width={246}
        height={102}
        className={cn('h-auto max-w-full', compact ? 'w-[108px] sm:w-[123px]' : 'w-[164px]')}
      />
    </Link>
  )
}
