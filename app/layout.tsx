import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/Providers'


export const metadata: Metadata = {
  title: 'Habitat | Tu próximo hogar cerca de tu universidad',
  description: 'Habitaciones y alojamientos para estudiantes en todo el Perú, cerca de tu universidad y campus.',
  generator: 'v0.app',
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#FEFDF8' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" className="bg-background"><body className="font-sans antialiased"><Providers>{children}</Providers>{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
