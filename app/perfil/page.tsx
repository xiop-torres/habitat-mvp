"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  HelpCircle,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";
import { AppHeader, Footer } from "@/components/Shared";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useCurrentUserProfile, getInitials } from "@/lib/supabase/useProfile";

const serviceOptions = [
  "WiFi fibra óptica (>100 Mbps)",
  "Baño privado",
  "Escritorio de estudio",
  "Luz y agua incluidos",
];
const profileNav: { label: string; Icon: LucideIcon; active: boolean }[] = [
  { label: "Información personal y académica", Icon: UserRound, active: true },
  { label: "Seguridad y contraseña", Icon: LockKeyhole, active: false },
  {
    label: "Preferencias de habitación",
    Icon: SlidersHorizontal,
    active: false,
  },
  { label: "Notificaciones y alertas", Icon: Bell, active: false },
  { label: "Mis visitas y postulaciones", Icon: CalendarDays, active: false },
];

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading } = useCurrentUserProfile();
  const [loggingOut, setLoggingOut] = useState(false);
  const [saved, setSaved] = useState(false);
  const [services, setServices] = useState(serviceOptions);
  const [housingTypes, setHousingTypes] = useState([
    "Habitación privada",
    "Minidepartamento",
  ]);
  const [budget, setBudget] = useState(800);

  const initials = profile ? getInitials(profile.first_name, profile.last_name) : (loading ? "..." : "U");
  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : (loading ? "Cargando perfil..." : "Usuario Habitat");

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

  function toggle(
    list: string[],
    value: string,
    setter: (next: string[]) => void,
  ) {
    setter(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value],
    );
  }

  function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-[#FBF8FC] text-[#1B1B1E]">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs text-[#554336]">
          <span>Inicio</span>
          <span>›</span>
          <span>Mi cuenta</span>
          <span>›</span>
          <strong>Perfil</strong>
        </nav>
        <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF7CC] px-3 py-1 text-[11px] font-black text-[#8D4B00]">
              <UserRound size={14} /> {profile?.role === 'owner' ? 'Espacio del propietario' : 'Espacio del estudiante'}
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {profile?.role === 'owner' ? 'Mi perfil de propietario' : 'Mi perfil estudiantil'}
            </h1>
            <p className="mt-2 text-sm text-[#554336]">
              {profile?.role === 'owner'
                ? 'Gestiona tu identidad verificada de arrendador y tus datos de contacto para estudiantes.'
                : 'Gestiona tu identidad verificada, información universitaria y preferencias de búsqueda.'}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-xs font-bold shadow-sm md:self-auto">
            <span className="size-2.5 animate-pulse rounded-full bg-[#006E2D]" />{" "}
            Cuenta verificada por Habitat{" "}
            <BadgeCheck size={16} className="text-[#006E2D]" />
          </span>
        </div>
        <form
          onSubmit={saveProfile}
          className="mt-8 grid items-start gap-6 lg:grid-cols-12"
        >
          <aside className="space-y-5 lg:sticky lg:top-24 lg:col-span-4">
            <section className="relative overflow-hidden rounded-2xl bg-white p-6 text-center shadow-sm">
              <div className="absolute -right-12 -top-12 size-36 rounded-full bg-[#FFF7CC] blur-2xl" />
              <div className="relative">
                <div className="relative mx-auto size-24">
                  <div className="grid size-full place-items-center rounded-full bg-[#FACC15] text-2xl font-black">
                    {initials}
                  </div>
                  <button
                    type="button"
                    aria-label="Cambiar foto de perfil"
                    className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-[#18181B] text-white shadow-sm"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-black">{fullName}</h2>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#D9FBE0] px-2.5 py-1 text-[11px] font-black text-[#006E2D]">
                  <BadgeCheck size={14} /> {profile?.role === 'owner' ? 'Propietario verificado' : 'Estudiante verificado'}
                </span>
                <p className="mt-3 text-sm font-bold">
                  {profile?.university || (profile?.role === 'owner' ? 'Arrendador verificado' : 'Universidad no registrada')}
                </p>
                <p className="mt-1 text-xs text-[#554336]">
                  {profile?.role === 'owner' ? 'Anfitrión verificado Habitat' : 'Estudiante acreditado'}
                </p>
                <div className="mt-5 space-y-2 rounded-xl bg-[#F6F2F7] p-4 text-left text-xs">
                  <p>
                    <Mail className="mr-2 inline size-4 text-[#8D4B00]" />{" "}
                    {profile?.email || (loading ? 'Cargando correo...' : 'Sin correo')}
                  </p>
                  {profile?.phone && (
                    <p>
                      <Phone className="mr-2 inline size-4 text-[#8D4B00]" />{" "}
                      {profile.phone}
                    </p>
                  )}
                  <p>
                    <CalendarDays className="mr-2 inline size-4 text-[#887364]" />{" "}
                    Miembro activo
                  </p>
                  <p>
                    <ShieldCheck className="mr-2 inline size-4 text-[#006E2D]" />{" "}
                    Identidad validada por Habitat
                  </p>
                </div>
              </div>
              <div className="mt-6 border-t border-[#EAE7EB] pt-5 text-left">
                <div className="flex justify-between text-xs font-bold">
                  <span>Perfil completado</span>
                  <span className="text-[#8D4B00]">90%</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-[#EAE7EB]">
                  <div className="h-full w-[90%] rounded-full bg-[#FACC15]" />
                </div>
                <div className="mt-3 rounded-xl bg-[#FFF7CC] p-3 text-xs leading-5 text-[#554336]">
                  <Sparkles className="mr-1 inline size-4 text-[#8D4B00]" />{" "}
                  Agrega un contacto de emergencia para llegar al 100%.
                </div>
              </div>
            </section>
            <nav className="rounded-2xl bg-white p-2 shadow-sm">
              {profileNav.map(({ label, Icon, active }) => (
                <button
                  type="button"
                  key={label}
                  className={`flex min-h-12 w-full items-center justify-between rounded-xl px-3 text-left text-xs font-bold ${active ? "bg-[#FFF7CC] text-[#18181B]" : "text-[#554336] hover:bg-[#F6F2F7]"}`}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      size={17}
                      className={active ? "text-[#8D4B00]" : "text-[#887364]"}
                    />
                    {label}
                  </span>
                  <ChevronRight size={15} />
                </button>
              ))}
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
            <div className="rounded-2xl bg-[#F0EDF1] p-4">
              <div className="flex gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#FFF7CC]">
                  <HelpCircle size={18} className="text-[#8D4B00]" />
                </div>
                <div>
                  <p className="text-xs font-black">
                    ¿Dudas con tu validación?
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-[#554336]">
                    El equipo Habitat te apoya por WhatsApp en días hábiles.
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-xs font-black text-[#8D4B00]"
                  >
                    Escribir a soporte →
                  </button>
                </div>
              </div>
            </div>
          </aside>
          <section className="space-y-6 lg:col-span-8">
            <ProfileSection
              icon={UserRound}
              title="Información personal y contacto"
              subtitle="Datos con los que te identificarás frente a propietarios y compañeros de piso."
              badge="Datos sincronizados"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nombres completos" defaultValue={profile?.first_name || ""} />
                <Field label="Apellidos" defaultValue={profile?.last_name || ""} />
                <Field
                  label="Teléfono celular / WhatsApp"
                  defaultValue={profile?.phone || ""}
                  icon={Phone}
                  verified={Boolean(profile?.phone)}
                />
                <Field
                  label="Documento de identidad (DNI)"
                  defaultValue="No registrado"
                  disabled
                />
                <Field
                  label="Ciudad de procedencia"
                  defaultValue={profile?.district || "Arequipa, Perú"}
                />
                <Field
                  label="Residiendo actualmente en"
                  defaultValue="Arequipa"
                  icon={MapPin}
                />
              </div>
            </ProfileSection>
            <ProfileSection
              icon={GraduationCap}
              title={profile?.role === 'owner' ? "Validación de propietario" : "Validación académica universitaria"}
              subtitle={profile?.role === 'owner'
                ? "Tu identidad de arrendador contrastada genera confianza con estudiantes."
                : "Tu identidad universitaria contrastada genera confianza con propietarios."}
              badge="Acreditado 2026"
            >
              <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#FFF7CC] p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-[#FACC15]">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <p className="font-black">
                      {profile?.role === 'owner' ? 'Propietario / Anfitrión verificado' : 'Estudiante activo con cuenta verificada'}
                    </p>
                    <p className="mt-1 text-xs text-[#554336]">
                      Identidad verificada por Habitat.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-white px-3 py-2 text-xs font-black shadow-sm"
                >
                  Actualizar documento
                </button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-[#F6F2F7] p-4 md:col-span-2">
                  <p className="text-xs font-bold text-[#887364]">
                    {profile?.role === 'owner' ? 'Distrito / Zona principal' : 'Universidad actual'}
                  </p>
                  <p className="mt-2 font-black">
                    {profile?.university || (profile?.role === 'owner' ? 'Arequipa' : 'Universidad no registrada')}
                  </p>
                  <p className="mt-1 text-xs text-[#554336]">
                    Campus o sede universitaria principal
                  </p>
                </div>
                <Field
                  label="Rol en Habitat"
                  defaultValue={profile?.role === 'owner' ? 'Propietario / Arrendador' : 'Estudiante universitario'}
                  disabled
                />
                <Field
                  label="Correo registrado"
                  defaultValue={profile?.email || ""}
                  disabled
                  verified
                />
                <div className="flex items-center gap-3 rounded-xl bg-[#F6F2F7] p-3 md:col-span-2">
                  <FileCheck2 className="text-[#006E2D]" size={24} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black">
                      Identidad_Verificada_Habitat.pdf
                    </p>
                    <p className="text-[11px] text-[#887364]">
                      Acreditación de identidad activa
                    </p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-[#006E2D]">
                    Aprobado ✓
                  </span>
                </div>
              </div>
            </ProfileSection>
            <ProfileSection
              icon={SlidersHorizontal}
              title="Preferencias de alojamiento"
              subtitle="Adaptamos las alertas y recomendaciones para tu presupuesto real."
            >
              <div>
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <p className="text-xs font-bold text-[#554336]">
                    Presupuesto mensual estimado
                  </p>
                  <strong className="text-2xl font-black text-[#A16207]">
                    S/ 500 - S/ {budget}
                  </strong>
                </div>
                <input
                  aria-label="Presupuesto máximo"
                  type="range"
                  min="500"
                  max="1500"
                  step="50"
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                  className="mt-4 h-2 w-full accent-[#FACC15]"
                />
                <div className="mt-2 flex justify-between text-[10px] text-[#887364]">
                  <span>S/ 350</span>
                  <span>S/ 650 promedio Arequipa</span>
                  <span>S/ 1,500+</span>
                </div>
              </div>
              <div className="mt-6">
                <p className="mb-3 text-xs font-bold text-[#554336]">
                  Tipo de estancia favorita
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {["Habitación privada", "Minidepartamento", "Residencia"].map(
                    (type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() =>
                          toggle(housingTypes, type, setHousingTypes)
                        }
                        className={`rounded-xl p-3 text-left text-xs font-black ${housingTypes.includes(type) ? "bg-[#FFF7CC] ring-1 ring-[#FACC15]" : "bg-[#F6F2F7]"}`}
                      >
                        <span className="flex items-center justify-between">
                          {type}
                          {housingTypes.includes(type) && <Check size={15} />}
                        </span>
                        <span className="mt-1 block text-[10px] font-normal text-[#887364]">
                          {type === "Residencia"
                            ? "Exclusiva alumnos"
                            : type === "Habitación privada"
                              ? "En depa o casa"
                              : "Independiente"}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="mt-6">
                <p className="mb-3 text-xs font-bold text-[#554336]">
                  Servicios indispensables para tu estudio
                </p>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#F0EDF1] px-3 py-2 text-[11px] font-bold"
                    >
                      <Wifi size={15} className="text-[#8D4B00]" />
                      {service}
                      <button
                        type="button"
                        aria-label={`Quitar ${service}`}
                        onClick={() => toggle(services, service, setServices)}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-xl bg-[#F6F2F7] px-3 py-2 text-xs font-black text-[#8D4B00]"
                  >
                    <Plus size={14} /> Añadir servicio
                  </button>
                </div>
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#F6F2F7] p-4">
                <Sparkles className="mt-0.5 text-[#006E2D]" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-black">
                    Ambiente de estudio y silencio
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#554336]">
                    No fumador, sin fiestas entre semana y horarios flexibles
                    para guardias médicas.
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-black text-[#8D4B00]"
                >
                  Editar
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#EAE7EB] p-3 text-xs">
                <div className="grid size-8 place-items-center rounded-lg bg-[#FFF7CC]">
                  <MapPin size={17} className="text-[#8D4B00]" />
                </div>
                <span className="flex-1">
                  Distancia máxima aceptada:{" "}
                  <strong>15 minutos a pie de UCSM</strong>
                </span>
                <span className="hidden font-bold text-[#006E2D] sm:block">
                  Recomendación óptima
                </span>
              </div>
            </ProfileSection>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <button
                  type="button"
                  className="rounded-xl bg-[#F0EDF1] px-5 py-3 text-sm font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-6 py-3 text-sm font-black shadow-sm"
                >
                  <Save size={17} /> Guardar cambios
                </button>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-[#F0EDF1] p-4 text-xs leading-5 text-[#554336]">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-[#887364]"
                />
                <p>
                  <strong className="text-[#1B1B1E]">
                    Privacidad protegida:
                  </strong>{" "}
                  Tu carné universitario y DNI solo se usan para validar tu
                  condición de estudiante y dar seguridad a la comunidad
                  Habitat.
                </p>
              </div>
            </div>
          </section>
        </form>
      </main>
      <Footer />
      {saved && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1B1B1E] px-5 py-3 text-sm font-bold text-white shadow-xl"
        >
          ¡Cambios guardados!
        </div>
      )}
    </div>
  );
}

function ProfileSection({
  icon: Icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: string;
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
        {badge && (
          <span className="w-fit rounded-full bg-[#D9FBE0] px-2.5 py-1 text-[10px] font-black text-[#006E2D]">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  defaultValue,
  disabled = false,
  verified = false,
  icon: Icon,
}: {
  label: string;
  defaultValue: string;
  disabled?: boolean;
  verified?: boolean;
  icon?: typeof Phone;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold text-[#554336]">
      {label}
      <div className="relative">
        <input
          key={defaultValue}
          className={`field ${disabled ? "cursor-not-allowed bg-[#EAE7EB]" : "bg-[#F6F2F7]"} ${verified ? "pr-24" : ""}`}
          defaultValue={defaultValue}
          disabled={disabled}
        />
        {Icon && (
          <Icon
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#887364]"
          />
        )}
        {verified && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#D9FBE0] px-2 py-0.5 text-[10px] font-black text-[#006E2D]">
            Verificado
          </span>
        )}
      </div>
    </label>
  );
}
