'use client'

import Link from 'next/link'
import { BrandLogo } from '@/components/BrandLogo'
import { PrimaryButton } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) { setError('El correo o la contraseña no son válidos.'); return }
    router.push('/dashboard')
  }

  return <main className="min-h-screen bg-secondary/40 px-5 py-8"><div className="mx-auto max-w-md"><BrandLogo /><div className="mt-16 rounded-3xl border border-border bg-background p-7 shadow-sm"><h1 className="text-3xl font-bold">Inicia sesión</h1><p className="mt-2 text-sm text-muted-foreground">Administra tus publicaciones o guarda tus alojamientos favoritos.</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-semibold">Correo<input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal" /></label><label className="block text-sm font-semibold">Contraseña<input required type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-3 font-normal" /></label>{error && <p className="text-sm text-red-600">{error}</p>}<PrimaryButton type="submit" disabled={loading} className="w-full">{loading ? 'Entrando...' : 'Entrar'}</PrimaryButton></form><p className="mt-6 text-sm text-muted-foreground">¿Aún no tienes cuenta? <Link href="/registro" className="font-semibold text-foreground">Regístrate</Link></p></div></div></main>
}