"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Save,
  ShieldCheck,
  UserRound,
  GraduationCap,
  Loader2,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { AppHeader, Footer } from "@/components/Shared";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useCurrentUserProfile, getInitials } from "@/lib/supabase/useProfile";
import { UNIVERSITIES, resolveUniversity } from "@/lib/universities";
import { updateUserProfile } from "@/lib/supabase/profiles";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading } = useCurrentUserProfile();
  
  const [loggingOut, setLoggingOut] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [university, setUniversity] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setDistrict(profile.district || "");
      
      const uni = resolveUniversity(profile.university);
      setUniversity(uni ? uni.storedValue : (profile.university || ""));
    }
  }, [profile]);

  const initials = profile ? getInitials(profile.first_name, profile.last_name) : (loading ? "..." : "U");
  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : (loading ? "Cargando perfil..." : "Usuario Habitat");
  const displayRole = profile?.role === 'owner' ? "Propietario / Anfitrión" : "Estudiante";

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    setSaveStatus('idle');
    setErrorMessage("");

    try {
      await updateUserProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        district: district,
        university: profile.role === 'student' ? university : undefined
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMessage(err.message || "Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF8FC] text-[#1B1B1E]">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-black">Mi perfil</h1>
        <form onSubmit={handleSubmit} className="grid items-start gap-8 lg:grid-cols-12">
          
          <aside className="space-y-6 lg:col-span-4">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="grid size-20 place-items-center rounded-full bg-[#18181B] text-2xl font-black text-white">
                  {initials}
                </div>
                <div>
                  <h2 className="text-xl font-black">{fullName}</h2>
                  <p className="mt-1 text-sm font-bold text-[#8D4B00]">{displayRole}</p>
                  <p className="mt-1 text-xs text-[#887364]">{profile?.email || ""}</p>
                </div>
              </div>
            </section>
            
            <nav className="rounded-2xl bg-white p-2 shadow-sm">
              <button
                type="button"
                className="flex min-h-12 w-full items-center justify-between rounded-xl px-3 text-left text-xs font-bold bg-[#FFF7CC] text-[#18181B]"
              >
                <span className="flex items-center gap-3">
                  <UserRound size={17} className="text-[#8D4B00]" />
                  Información personal
                </span>
                <ChevronRight size={15} />
              </button>
              
              <div className="my-1 border-t border-[#EAE7EB]" />
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex min-h-12 w-full items-center justify-between rounded-xl px-3 text-left text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <LogOut size={17} className="text-red-600" />
                  {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
                </span>
              </button>
            </nav>
          </aside>

          <section className="space-y-6 lg:col-span-8">
            <ProfileSection
              icon={UserRound}
              title="Información personal y contacto"
              subtitle="Datos con los que te identificarás frente a la comunidad Habitat."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-xs font-bold text-[#554336]">
                  Nombres
                  <input
                    required
                    className="field bg-[#F6F2F7]"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={saving || loading}
                  />
                </label>
                <label className="grid gap-2 text-xs font-bold text-[#554336]">
                  Apellidos
                  <input
                    required
                    className="field bg-[#F6F2F7]"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={saving || loading}
                  />
                </label>
                <label className="grid gap-2 text-xs font-bold text-[#554336]">
                  Teléfono celular / WhatsApp
                  <input
                    className="field bg-[#F6F2F7]"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={saving || loading}
                  />
                </label>
                <label className="grid gap-2 text-xs font-bold text-[#554336]">
                  Distrito / Ciudad
                  <input
                    className="field bg-[#F6F2F7]"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    disabled={saving || loading}
                  />
                </label>
              </div>
            </ProfileSection>

            {profile?.role === 'student' && (
              <ProfileSection
                icon={GraduationCap}
                title="Validación académica"
                subtitle="Tu información universitaria para conectar con propietarios."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-xs font-bold text-[#554336]">
                    Universidad
                    <select
                      className="field bg-[#F6F2F7]"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      disabled={saving || loading}
                    >
                      <option value="">Selecciona tu universidad</option>
                      {UNIVERSITIES.map((uni) => (
                        <option key={uni.id} value={uni.storedValue}>
                          {uni.fullName} ({uni.shortName})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </ProfileSection>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row items-center">
                {saveStatus === 'success' && (
                  <span className="text-sm font-bold text-[#006E2D]">Perfil actualizado correctamente.</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-sm font-bold text-red-600">{errorMessage}</span>
                )}
                
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-6 py-3 text-sm font-black shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-[#F0EDF1] p-4 text-xs leading-5 text-[#554336]">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#887364]" />
                <p>
                  <strong className="text-[#1B1B1E]">Privacidad protegida:</strong>{" "}
                  La información de tu perfil se comparte con la contraparte únicamente cuando decides realizar o aceptar una reserva.
                </p>
              </div>
            </div>
          </section>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function ProfileSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-3 border-b border-[#EAE7EB] pb-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-2">
          <Icon className="mt-0.5 text-[#8D4B00]" size={21} />
          <div>
            <h2 className="font-black">{title}</h2>
            <p className="mt-1 text-xs text-[#887364]">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
