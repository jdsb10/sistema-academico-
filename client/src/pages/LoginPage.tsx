import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ApiError } from '../lib/api';

export default function LoginPage() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await iniciarSesion(email, password);
      const destino = (location.state as { from?: string })?.from ?? '/';
      navigate(destino, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('No se pudo iniciar sesion. Intente nuevamente.');
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Lado de marca: encabezado compacto en móvil y pieza editorial en escritorio. */}
      <section className="relative flex-shrink-0 overflow-hidden bg-primary px-6 py-6 text-text-inverse sm:px-10 sm:py-10 lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:px-14 lg:py-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full border border-white/10" aria-hidden />
        <div className="pointer-events-none absolute -right-10 -top-10 h-[300px] w-[300px] rounded-full border border-white/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-[rgba(185,75,39,0.1)] blur-3xl" aria-hidden />

        <div className="relative hidden lg:block">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden /> Campus · Acceso institucional
          </span>
        </div>

        {/* Copy de apoyo: discreto en móvil, protagonista en escritorio. El H1 de la página es el del formulario. */}
        <div className="relative max-w-[520px] lg:mt-0">
          <p className="text-[19px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[22px] lg:text-[clamp(2.4rem,3.6vw,4rem)] lg:leading-[1.02] lg:tracking-[-0.05em]">
            La gestión académica,
            <span className="block text-accent-soft">en un solo lugar.</span>
          </p>
          <p className="mt-2 max-w-[440px] text-[13px] leading-relaxed text-white/65 sm:mt-3 sm:text-[14px] lg:mt-6 lg:text-[15px]">
            Facultades, grupos, asistencia, calificaciones y trazabilidad en una misma plataforma universitaria.
          </p>

          <ul className="mt-10 hidden space-y-4 border-t border-white/10 pt-8 lg:block">
            {[
              ['01', 'Estructura y carga académica'],
              ['02', 'Asistencia y evaluación'],
              ['03', 'Auditoría y respaldos'],
            ].map(([numero, texto]) => (
              <li key={numero} className="flex items-center gap-4 text-sm text-white/75">
                <span className="font-mono text-xs text-accent-soft">{numero}</span>
                <span className="h-px w-8 bg-white/20" aria-hidden />
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-8 hidden items-center gap-3 border-t border-white/10 pt-6 text-xs text-white/60 lg:flex">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          Acceso restringido a cuentas institucionales
        </div>
      </section>

      {/* Formulario: manda en móvil y escritorio. */}
      <section className="flex flex-1 items-center justify-center bg-bg px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="w-full max-w-[420px]">
          <p className="page-kicker">Bienvenido de nuevo</p>
          <h1 className="text-[26px] font-semibold tracking-[-0.035em] text-text">Ingresa a tu espacio</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">Ingrese con su correo institucional</p>

          <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-5" noValidate>
            <Input
              label="Correo electronico"
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@universidad.edu.co"
            />
            <Input
              label="Contrasena"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
            />

            {error && (
              <div role="alert" className="rounded-lg border border-border bg-danger-soft px-4 py-3 text-[13px] font-medium text-danger">
                {error}
              </div>
            )}

            <Button type="submit" cargando={cargando} className="mt-1 h-11 w-full">
              Iniciar sesion
              {!cargando && <ArrowRight className="h-4 w-4" aria-hidden />}
            </Button>
          </form>

          <div className="mt-7 flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-light" aria-hidden />
            <p className="text-xs leading-relaxed text-text-muted">
              Cinco intentos fallidos bloquean la cuenta durante 15 minutos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
