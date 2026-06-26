import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

interface Booking {
  id: number;
  flightId: number;
  flightNumber: string;
  airlineName?: string;
  estDepartureTime: string;
  estArrivalTime: string;
  bookingDate: string;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fmtFull = (iso: string) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    const ids: number[] = JSON.parse(localStorage.getItem('bookingIds') || '[]');
    if (ids.length === 0) { setLoading(false); return; }

    Promise.all(ids.map(async (id) => {
      try {
        const booking = (await api.get(`/flights/book/${id}`)).data;
        // El backend no incluye airlineName en la reserva, lo traemos del vuelo
        try {
          const flight = (await api.get(`/flights/${booking.flightId}`)).data;
          booking.airlineName = flight.airlineName;
        } catch { /* dejamos undefined */ }
        return booking;
      } catch {
        return null;
      }
    }))
      .then(results => setBookings(results.filter(Boolean) as Booking[]))
      .catch(() => setError('No se pudieron cargar tus reservas.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <p className="page-eyebrow">Historial</p>
          <h1>Mis reservas</h1>
          <p>Cargando tu información...</p>
        </div>
        <div className="bookings-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="booking-card">
              <div className="skeleton" style={{ height: '14px', width: '40%', marginBottom: '12px' }} />
              <div className="skeleton" style={{ height: '28px', width: '50%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '20px' }} />
              <div className="skeleton" style={{ height: '60px', width: '100%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <p className="page-eyebrow">Historial</p>
        <h1>Mis reservas</h1>
        <p>Todas tus reservas confirmadas en un solo lugar.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>
            </svg>
          </div>
          <h3>Aún no tienes reservas</h3>
          <p>Cuando reserves un vuelo, aparecerá aquí con todos los detalles.</p>
          <Link to="/search" className="btn btn-primary">Buscar vuelos</Link>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map(b => (
            <div className="booking-card" key={b.id}>
              <div className="booking-card-header">
                <span className="booking-id">Reserva #{b.id}</span>
                <span className="booking-status">Confirmada</span>
              </div>

              <div className="booking-flight">{b.flightNumber}</div>
              <div className="booking-airline">{b.airlineName || 'Aerolínea'}</div>

              <div className="booking-times">
                <div>
                  <div className="booking-time-label">Salida</div>
                  <div className="booking-time-value">{fmtTime(b.estDepartureTime)}</div>
                  <div className="booking-time-label" style={{ marginTop: '2px', textTransform: 'none', letterSpacing: 0 }}>
                    {fmtDate(b.estDepartureTime)}
                  </div>
                </div>
                <div className="booking-divider">→</div>
                <div>
                  <div className="booking-time-label">Llegada</div>
                  <div className="booking-time-value">{fmtTime(b.estArrivalTime)}</div>
                  <div className="booking-time-label" style={{ marginTop: '2px', textTransform: 'none', letterSpacing: 0 }}>
                    {fmtDate(b.estArrivalTime)}
                  </div>
                </div>
              </div>

              <div className="booking-footer">
                Reservado el {fmtFull(b.bookingDate)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
