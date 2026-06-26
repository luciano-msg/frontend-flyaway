import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

interface Errors {
  email?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof Errors]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.email.trim()) e.email = 'Ingresa tu email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email no válido.';
    if (!form.password) e.password = 'Ingresa tu contraseña.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/search');
    } catch (err: any) {
      const data = err.response?.data;
      const detail = data?.detail || (typeof data === 'string' ? data : '');

      // El backend devuelve "Username does not exist" tanto si no existe como si la contraseña está mal
      if (/does not exist|no existe|not found/i.test(detail)) {
        setErrors({ general: 'Email o contraseña incorrectos. Verifica tus datos e intenta de nuevo.' });
      } else if (!err.response) {
        setErrors({ general: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.' });
      } else {
        setErrors({ general: detail || 'No pudimos iniciar tu sesión. Intenta nuevamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="auth-aside-content">
          <p className="auth-aside-eyebrow">Fly Away Travel</p>
          <h2>Bienvenido de vuelta.</h2>
          <p>Inicia sesión para reservar vuelos y consultar tu historial de viajes.</p>
        </div>
        <div className="auth-aside-features">
          <div className="auth-feature">
            <span className="auth-feature-check">✓</span>
            Tus reservas en un solo lugar
          </div>
          <div className="auth-feature">
            <span className="auth-feature-check">✓</span>
            Reserva en segundos
          </div>
          <div className="auth-feature">
            <span className="auth-feature-check">✓</span>
            Soporte 24/7
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1>Iniciar sesión</h1>
          <p className="auth-card-subtitle">Ingresa tus credenciales para continuar.</p>

          {errors.general && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{errors.general}</span>
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
              <label className="field-label">Contraseña</label>
              <input
                className={'input' + (errors.password ? ' has-error' : '')}
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Tu contraseña"
                autoComplete="current-password"
              />
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? (<><span className="spinner" /> Ingresando...</>) : 'Iniciar sesión'}
            </button>
          </form>

          <p className="center-link">
            ¿No tienes cuenta? <Link to="/register" className="text-link">Regístrate</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
