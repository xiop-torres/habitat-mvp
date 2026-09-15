'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, CalendarDays, MapPin, MessageCircle, ShieldCheck } from 'lucide-react'
import { AppHeader, Footer } from '@/components/Shared'

export function FlowShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#FEFDF8] text-[#18181B]"><AppHeader />{children}<Footer /></div>
}

export function SuccessState({ eyebrow, title, description, primaryLabel, primaryHref, secondaryLabel, secondaryHref, icon = 'check' }: { eyebrow: string; title: string; description: string; primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string; icon?: 'check' | 'calendar' }) {
  const Icon = icon === 'calendar' ? CalendarDays : CheckCircle2
  return <FlowShell><main className="mx-auto flex max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:min-h-[680px] lg:px-8"><section className="w-full max-w-2xl rounded-[28px] border border-[#E4E4E7] bg-white p-6 text-center shadow-[0_12px_30px_rgba(24,24,27,0.06)] sm:p-10"><div className="mx-auto grid size-20 place-items-center rounded-full bg-[#FACC15] text-[#18181B]"><Icon size={38} strokeWidth={2.5} /></div><p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#A16207]">{eyebrow}</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#71717A]">{description}</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><Link href={primaryHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-5 py-3 text-sm font-black transition hover:bg-[#EAB308]">{primaryLabel}<ArrowRight size={17} /></Link><Link href={secondaryHref} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#D4D4D8] px-5 py-3 text-sm font-bold transition hover:border-[#18181B]">{secondaryLabel}</Link></div></section></main></FlowShell>
}

export function InfoPanel({ title, children, icon: Icon = ShieldCheck }: { title: string; children: React.ReactNode; icon?: typeof ShieldCheck }) {
  return <section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#FFF7CC] text-[#A16207]"><Icon size={19} /></div><h2 className="font-black">{title}</h2></div><div className="mt-4 text-sm leading-6 text-[#71717A]">{children}</div></section>
}

export function CalendarNotice({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-3 rounded-xl border border-[#FDE68A] bg-[#FFF7CC] p-4 text-sm text-[#52525B]"><CalendarDays className="mt-0.5 shrink-0 text-[#A16207]" size={18} />{children}</div>
}
