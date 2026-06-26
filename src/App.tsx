import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Search from './pages/Search';
import MyBookings from './pages/MyBookings';
import api from './api/api';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');

  // Refrescar token cuando cambia la ruta (login, logout)
  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, [location.pathname]);

  useEffect(() => {
    if (token) {
      api.get('/users/current')
        .then(r => setUsername(r.data.username || r.data.email || ''))
        .catch(() => {
          // Token inválido, limpiar
          localStorage.removeItem('token');
          setToken(null);
        });
    } else {
      setUsername('');
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('bookingIds');
    setToken(null);
    navigate('/login');
  };

  const initial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <nav className="nav">
      <NavLink to="/search" className="nav-brand">
        <span className="nav-brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
          </svg>
        </span>
        Fly Away
      </NavLink>

      <div className="nav-right">
        {token ? (
          <>
            <NavLink to="/search" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
              Buscar vuelos
            </NavLink>
            <NavLink to="/my-bookings" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
              Mis reservas
            </NavLink>
            <div className="nav-user">
              <span className="nav-user-avatar">{initial}</span>
              {username}
            </div>
            <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
              Iniciar sesión
            </NavLink>
            <NavLink to="/register" className="btn btn-sm">Crear cuenta</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<Search />} />
        <Route path="/my-bookings" element={
          <ProtectedRoute><MyBookings /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
