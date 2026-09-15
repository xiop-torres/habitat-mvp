'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { BrandLogo } from '@/components/BrandLogo'
import { PrimaryButton } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('El correo o la contraseña no son válidos.')
      return
    }
    router.push('/perfil')
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <main className="mx-auto grid min-h-[calc(100vh-74px)] max-w-md content-center px-5 py-8">
        <BrandLogo />
        <section className="mt-12 rounded-3xl border border-border bg-background p-7 shadow-sm">
          <h1 className="text-3xl font-bold">Inicia sesión</h1>
          <p className="mt-2 text-sm text-muted-foreground">Administra tus publicaciones o guarda tus alojamientos favoritos.</p>
          <button type="button" onClick={() => signIn('google', { callbackUrl: '/buscar' })} className="mt-8 flex min-h-11 w-full items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-semibold">Continuar con Google</button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" /></div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold">Correo<input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="field mt-2" /></label>
            <label className="block text-sm font-semibold">Contraseña<input required type="password" value={password} onChange={event => setPassword(event.target.value)} className="field mt-2" /></label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <PrimaryButton type="submit" disabled={loading} className="w-full">{loading ? 'Entrando...' : 'Entrar'}</PrimaryButton>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">¿Aún no tienes cuenta? <Link href="/registro" className="font-semibold text-foreground">Regístrate</Link></p>
        </section>
      </main>
      <footer className="border-t border-border bg-card px-5 py-5 text-center text-xs text-muted-foreground">© 2026 Habitat. Acceso seguro para estudiantes y propietarios.</footer>
    </div>
  )
}
