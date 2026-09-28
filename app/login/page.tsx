'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { PrimaryButton } from '@/components/ui/button'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const err = params.get('error')
      if (err === 'auth_callback') {
        setError('No se pudo verificar el enlace de confirmación. Intenta iniciar sesión o solicita un nuevo enlace.')
      } else if (err === 'missing_config') {
        setError('Error de configuración del sistema de autenticación.')
      }
    }
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (loading) return

    setError('')
    setInfo('')

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) {
      setError('Por favor ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)

    try {
      const supabase = createSupabaseBrowserClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (signInError) {
        const msg = signInError.message.toLowerCase()
        if (msg.includes('invalid login credentials') || signInError.status === 400) {
          setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
        } else if (msg.includes('email not confirmed')) {
          setError('Debes confirmar tu correo electrónico antes de ingresar. Revisa tu bandeja de entrada.')
        } else {
          setError(signInError.message || 'Error al iniciar sesión.')
        }
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('No se pudo establecer la sesión.')
        setLoading(false)
        return
      }

      // Consultar public.profiles para obtener el rol real respaldado por base de datos
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profileError || !profile) {
        setError('No se encontró un perfil registrado para este usuario. Contacta a soporte.')
        setLoading(false)
        return
      }

      // Redirección según rol obtenido de profiles
      router.refresh()
      if (profile.role === 'owner') {
        router.push('/propietario')
      } else if (profile.role === 'student') {
        router.push('/buscar')
      } else {
        router.push('/buscar')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado al iniciar sesión.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <main className="mx-auto grid min-h-[calc(100vh-74px)] max-w-md content-center px-5 py-8">
        <BrandLogo />
        <section className="mt-12 rounded-3xl border border-border bg-background p-7 shadow-sm">
          <h1 className="text-3xl font-bold">Inicia sesión</h1>
          <p className="mt-2 text-sm text-muted-foreground">Administra tus publicaciones o guarda tus alojamientos favoritos.</p>
          <button type="button" onClick={() => router.push('/buscar')} className="mt-8 flex min-h-11 w-full items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-semibold">Continuar con Google</button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" /></div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold">
              Correo
              <input
                required
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="tu@correo.com"
                className="field mt-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Contraseña
              <input
                required
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="Tu contraseña"
                className="field mt-2"
              />
            </label>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                {info}
              </div>
            )}
            <PrimaryButton type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </PrimaryButton>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">¿Aún no tienes cuenta? <Link href="/registro" className="font-semibold text-foreground">Regístrate</Link></p>
        </section>
      </main>
      <footer className="border-t border-border bg-card px-5 py-5 text-center text-xs text-muted-foreground">© 2026 Habitat. Acceso seguro para estudiantes y propietarios.</footer>
    </div>
  )
}
