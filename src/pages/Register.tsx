import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

interface Errors {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  general?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpiar error de ese campo al escribir
    if (errors[e.target.name as keyof Errors]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const validate = (): Errors => {
    const e: Errors = {};

    // Email
    if (!form.email.trim()) {
      e.email = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Ingresa un email válido (ej. nombre@dominio.com).';
    }

    // First name
    if (!form.firstName.trim()) {
      e.firstName = 'El nombre es obligatorio.';
    } else if (!/^[A-ZÁÉÍÓÚÑ]/.test(form.firstName)) {
      e.firstName = 'El nombre debe empezar con mayúscula (ej. Luciano).';
    }

    // Last name
    if (!form.lastName.trim()) {
      e.lastName = 'El apellido es obligatorio.';
    } else if (!/^[A-ZÁÉÍÓÚÑ]/.test(form.lastName)) {
      e.lastName = 'El apellido debe empezar con mayúscula (ej. Sanchez).';
    }

    // Password
    if (!form.password) {
      e.password = 'La contraseña es obligatoria.';
    } else if (form.password.length < 8) {
      e.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (!/[A-Z]/.test(form.password)) {
      e.password = 'La contraseña debe incluir al menos una letra mayúscula.';
    } else if (!/[0-9]/.test(form.password)) {
      e.password = 'La contraseña debe incluir al menos un número.';
    }

    return e;
  };

  const parseBackendError = (err: any): Errors => {
    const data = err.response?.data;
    const status = err.response?.status;

    // ProblemDetail con detail (ValidationException)
    if (data?.detail) {
      const detail = String(data.detail);
      if (/already exists|en uso|registrado/i.test(detail)) {
        return { email: 'Este email ya está registrado. Inicia sesión o usa otro.' };
      }
      if (/alphanumeric|password/i.test(detail)) {
        return { password: 'La contraseña no cumple los requisitos (mayúscula y número).' };
      }
      return { general: detail };
    }

    // String plano (MethodArgumentNotValidException)
    if (typeof data === 'string') {
      const out: Errors = {};
      if (/firstName/i.test(data)) out.firstName = 'El nombre debe empezar con mayúscula.';
      if (/lastName/i.test(data)) out.lastName = 'El apellido debe empezar con mayúscula.';
      if (/password/i.test(data)) out.password = 'La contraseña debe tener mínimo 8 caracteres.';
      if (/email|Email/.test(data)) out.email = 'El email no es válido.';
      if (Object.keys(out).length) return out;
      return { general: 'Algunos datos no son válidos. Revisa el formulario.' };
    }

    if (status === 400) {
      return { general: 'Datos inválidos. Revisa los campos del formulario.' };
    }
    if (!err.response) {
      return { general: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.' };
    }
    return { general: 'Error al registrarse. Intenta nuevamente.' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await api.post('/users/register', form);
      setSuccess('¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setErrors(parseBackendError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="auth-aside-content">
          <p className="auth-aside-eyebrow">Fly Away Travel</p>
          <h2>Tu próximo destino, a un solo clic.</h2>
          <p>Únete a miles de viajeros que confían en nosotros para encontrar y reservar sus vuelos.</p>
        </div>
        <div className="auth-aside-features">
          <div className="auth-feature">
            <span className="auth-feature-check">✓</span>
            Búsqueda en tiempo real
          </div>
          <div className="auth-feature">
            <span className="auth-feature-check">✓</span>
            Reservas instantáneas
          </div>
          <div className="auth-feature">
            <span className="auth-feature-check">✓</span>
            Historial siempre disponible
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1>Crear cuenta</h1>
          <p className="auth-card-subtitle">Completa los datos para empezar a reservar.</p>

          {errors.general && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="field-label">Email</label>
              <input
                className={'input' + (errors.email ? ' has-error' : '')}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="field">
              <label className="field-label">Nombre</label>
              <input
                className={'input' + (errors.firstName ? ' has-error' : '')}
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Luciano"
                autoComplete="given-name"
              />
              {errors.firstName && <div className="field-error">{errors.firstName}</div>}
            </div>

            <div className="field">
              <label className="field-label">Apellido</label>
              <input
                className={'input' + (errors.lastName ? ' has-error' : '')}
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Sanchez"
                autoComplete="family-name"
              />
              {errors.lastName && <div className="field-error">{errors.lastName}</div>}
            </div>

            <div className="field">
              <label className="field-label">Contraseña</label>
              <input
                className={'input' + (errors.password ? ' has-error' : '')}
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
              {errors.password ? (
                <div className="field-error">{errors.password}</div>
              ) : (
                <div className="field-hint">Mínimo 8 caracteres, una mayúscula y un número.</div>
              )}
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? (<><span className="spinner" /> Creando cuenta...</>) : 'Crear cuenta'}
            </button>
          </form>

          <p className="center-link">
            ¿Ya tienes cuenta? <Link to="/login" className="text-link">Inicia sesión</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
