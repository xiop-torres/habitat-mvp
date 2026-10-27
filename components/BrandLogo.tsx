import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function BrandLogo({
  compact = false,
  className,
  variant = 'default',
}: {
  compact?: boolean
  className?: string
  variant?: 'default' | 'white'
}) {
  return (
    <Link
      href="/"
      aria-label="Habitat, inicio"
      className={cn('relative inline-flex min-h-11 shrink-0 items-center rounded-xl', className)}
    >
      <Image
        src="/brand/logo_habitat.png"
        alt="Habitat — Tu espacio, más cerca."
        width={246}
        height={102}
        className={cn(
          'h-auto max-w-full transition-opacity duration-300',
          compact ? 'w-[108px] sm:w-[123px]' : 'w-[164px]',
          variant === 'white' ? 'opacity-0' : 'opacity-100'
        )}
        priority
      />
      <Image
        src="/logo-blanco.png"
        alt="Habitat — Tu espacio, más cerca."
        width={1947}
        height={808}
        className={cn(
          'absolute inset-0 my-auto h-auto max-w-full transition-opacity duration-300',
          compact ? 'w-[108px] sm:w-[123px]' : 'w-[164px]',
          variant === 'white' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        priority
      />
    </Link>
  )
}
