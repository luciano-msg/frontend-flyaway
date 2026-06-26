import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

interface Flight {
  id: number;
  flightNumber: string;
  airlineName: string;
  estDepartureTime: string;
  estArrivalTime: string;
  availableSeats: number;
}

export default function Search() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [flightNumber, setFlightNumber] = useState('');
  const [airlineName, setAirlineName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setFeedback(null);
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (flightNumber) params.flightNumber = flightNumber;
      if (airlineName) params.airlineName = airlineName;
      if (dateFrom) params.estDepartureTimeFrom = new Date(dateFrom).toISOString();
      if (dateTo) params.estDepartureTimeTo = new Date(dateTo).toISOString();

      const res = await api.get('/flights/search', { params });
      setFlights(res.data.items ?? []);
      setSearched(true);
    } catch (err: any) {
      if (!err.response) {
        setSearchError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else {
        setSearchError('Ocurrió un error al buscar vuelos. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (flightId: number) => {
    if (!token) { navigate('/login'); return; }
    setFeedback(null);
    setBookingLoading(flightId);
    try {
      const res = await api.post('/flights/book', { flightId });
      const bookingId = res.data.id;
      const stored = JSON.parse(localStorage.getItem('bookingIds') || '[]');
      if (!stored.includes(bookingId)) stored.push(bookingId);
      localStorage.setItem('bookingIds', JSON.stringify(stored));
      // Refresh flights para actualizar asientos
      setFlights(flights.map(f => f.id === flightId ? { ...f, availableSeats: f.availableSeats - 1 } : f));
      setFeedback({ type: 'ok', msg: `Reserva confirmada. ID de reserva: #${bookingId}` });
    } catch (err: any) {
      const data = err.response?.data;
      const detail = data?.detail || (typeof data === 'string' ? data : '');
      let msg = 'No se pudo completar la reserva.';
      if (/past|pasado|departed/i.test(detail)) msg = 'No puedes reservar un vuelo que ya pasó.';
      else if (/overlap|superpuesto|overlapping/i.test(detail)) msg = 'Ya tienes una reserva en ese horario.';
      else if (/no seats|sin asientos|seats available/i.test(detail)) msg = 'Este vuelo ya no tiene asientos disponibles.';
      else if (detail) msg = detail;
      setFeedback({ type: 'err', msg });
    } finally {
      setBookingLoading(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <p className="page-eyebrow">Búsqueda</p>
        <h1>Encuentra tu próximo vuelo</h1>
        <p>Filtra por número de vuelo, aerolínea o rango de fechas.</p>
      </div>

      <form onSubmit={handleSearch}>
        <div className="search-card">
          <div className="search-grid">
            <div className="field">
              <label className="field-label">Número de vuelo</label>
              <input
                className="input"
                placeholder="LA123"
                value={flightNumber}
                onChange={e => setFlightNumber(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Aerolínea</label>
              <input
                className="input"
                placeholder="LATAM"
                value={airlineName}
                onChange={e => setAirlineName(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Salida desde</label>
              <input
                className="input"
                type="datetime-local"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Salida hasta</label>
              <input
                className="input"
                type="datetime-local"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? (<><span className="spinner" /> Buscando</>) : 'Buscar'}
            </button>
          </div>
        </div>
      </form>

      {searchError && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{searchError}</span>
        </div>
      )}

      {feedback && (
        <div className={'alert ' + (feedback.type === 'ok' ? 'alert-success' : 'alert-error')}>
          <span className="alert-icon">{feedback.type === 'ok' ? '✓' : '⚠️'}</span>
          <span>{feedback.msg}</span>
        </div>
      )}

      {searched && flights.length === 0 && !searchError && (
        <div className="empty">
          <div className="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <h3>Sin resultados</h3>
          <p>No encontramos vuelos con esos criterios. Prueba ajustando los filtros o ampliando el rango de fechas.</p>
        </div>
      )}

      {flights.length > 0 && (
        <div className="results">
          <div className="results-header">
            <div className="results-count">
              <strong>{flights.length}</strong> vuelo{flights.length !== 1 ? 's' : ''} encontrado{flights.length !== 1 ? 's' : ''}
            </div>
          </div>
          {flights.map(f => {
            const seatClass = f.availableSeats === 0 ? 'none' : f.availableSeats < 10 ? 'low' : '';
            return (
              <div className="flight-row" key={f.id}>
                <div className="flight-badge">{f.airlineName.substring(0, 2).toUpperCase()}</div>

                <div className="flight-main">
                  <div className="flight-route">
                    {f.flightNumber}
                    <span className="flight-route-arrow">·</span>
                    <span style={{ fontWeight: 500, color: 'var(--smoke)' }}>{f.airlineName}</span>
                  </div>
                  <div className="flight-meta">
                    <span>{fmtDate(f.estDepartureTime)}</span>
                  </div>
                </div>

                <div className="flight-time">
                  <div className="flight-time-label">Salida</div>
                  {fmtTime(f.estDepartureTime)}
                </div>

                <div className="flight-time">
                  <div className="flight-time-label">Llegada</div>
                  {fmtTime(f.estArrivalTime)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={'flight-seats ' + seatClass}>
                    {f.availableSeats > 0 ? `${f.availableSeats} asientos` : 'Sin cupo'}
                  </span>
                  {token ? (
                    <button
                      className="btn btn-sm"
                      onClick={() => handleBook(f.id)}
                      disabled={bookingLoading === f.id || f.availableSeats === 0}
                    >
                      {bookingLoading === f.id ? <span className="spinner" /> : 'Reservar'}
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
                      Inicia sesión
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
