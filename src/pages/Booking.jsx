import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Booking() {
  const [tableNo, setTableNo] = useState('T1');
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('18:00');
  const [guests, setGuests] = useState(2);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const tables = [
    { id: 'T1', name: 'Table 1 (Window Side)', capacity: '2 Guests' },
    { id: 'T2', name: 'Table 2 (Cozy Booth)', capacity: '4 Guests' },
    { id: 'T3', name: 'Table 3 (Patio Garden)', capacity: '4 Guests' },
    { id: 'T4', name: 'Table 4 (Family Table)', capacity: '6 Guests' },
    { id: 'T5', name: 'Table 5 (Lounge Sofa)', capacity: '4 Guests' },
  ];

  const timeSlots = [
    '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '18:00', '19:30', '20:45'
  ];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/bookings/my');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/api/bookings', {
        table_no: tableNo,
        date,
        time,
        guests: Number(guests),
      });

      if (res.data.success) {
        setMessage(`Table ${tableNo} reserved successfully for ${date} at ${time}! Waiting for Admin confirmation.`);
        fetchBookings(); // refresh table
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book table. Please pick another table or time.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="badge badge-status-confirmed px-3 py-1 rounded-pill"><i className="bi bi-check-circle-fill me-1"></i> Confirmed</span>;
      case 'Cancelled':
        return <span className="badge badge-status-cancelled px-3 py-1 rounded-pill"><i className="bi bi-x-circle-fill me-1"></i> Cancelled</span>;
      default:
        return <span className="badge badge-status-pending px-3 py-1 rounded-pill"><i className="bi bi-hourglass-split me-1"></i> Pending</span>;
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-coffee-dark mb-1">Book a Cafe Table</h1>
          <p className="text-muted small mb-0">Reserve premium seating for coffee dates, work sessions, or group hangouts</p>
        </div>
        <button onClick={fetchBookings} className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
          <i className="bi bi-arrow-clockwise"></i>
          <span>Refresh Bookings</span>
        </button>
      </div>

      {message && (
        <div className="alert alert-success py-3 d-flex align-items-center gap-2 mb-4 rounded-3 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{message}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-3 d-flex align-items-center gap-2 mb-4 rounded-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <div>{error}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Booking Form */}
        <div className="col-12 col-lg-5">
          <div className="card card-beancraft border-0 p-4">
            <h4 className="fw-bold text-coffee-dark mb-3">
              <i className="bi bi-calendar-plus me-2 text-coffee-accent"></i> Reservation Details
            </h4>

            <form onSubmit={handleBookingSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-coffee-dark">Select Table</label>
                <div className="d-flex flex-column gap-2">
                  {tables.map((tbl) => (
                    <div
                      key={tbl.id}
                      onClick={() => setTableNo(tbl.id)}
                      className={`p-2 px-3 border rounded-3 d-flex justify-content-between align-items-center cursor-pointer ${
                        tableNo === tbl.id ? 'border-2 border-warning bg-warning-subtle' : 'bg-light'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${tableNo === tbl.id ? 'bi-check-circle-fill text-coffee-dark' : 'bi-circle text-muted'}`}></i>
                        <span className="fw-bold text-coffee-dark">{tbl.name}</span>
                      </div>
                      <span className="badge bg-white text-coffee-dark border">{tbl.capacity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-coffee-dark">Reservation Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold text-coffee-dark">Number of Guests</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="10"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-coffee-dark">Preferred Time Slot</label>
                <div className="d-flex flex-wrap gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`btn btn-sm rounded-pill px-3 ${
                        time === slot ? 'btn-coffee text-white shadow-sm' : 'btn-outline-secondary bg-white'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-coffee w-100 py-3 rounded-pill fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Saving Reservation in MySQL...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-calendar-check-fill"></i>
                    <span>Confirm & Book Table {tableNo}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Bookings List */}
        <div className="col-12 col-lg-7">
          <div className="card card-beancraft border-0 p-3 p-md-4">
            <h4 className="fw-bold text-coffee-dark mb-3">
              <i className="bi bi-calendar2-range me-2 text-coffee-accent"></i> My Table Bookings
            </h4>

            {loading ? (
              <div className="text-center py-4 text-muted">
                <div className="spinner-border spinner-border-sm text-coffee me-2" role="status"></div>
                Loading reservations...
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-calendar-x fs-1 mb-2 d-block"></i>
                <h5 className="text-coffee-dark fw-bold">No bookings yet</h5>
                <p className="small">Use the reservation form on the left to book your cafe table.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-uppercase">
                    <tr>
                      <th>Booking ID</th>
                      <th>Table</th>
                      <th>Date & Time</th>
                      <th>Guests</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td className="fw-bold text-coffee-dark">BOOK#{b.id}</td>
                        <td>
                          <span className="badge bg-warning-subtle text-dark border px-2 py-1 fw-bold">
                            Table {b.table_no}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold text-coffee-dark">{b.date}</div>
                          <div className="text-muted small">
                            <i className="bi bi-clock me-1"></i>
                            {b.time}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border px-2 py-1">
                            <i className="bi bi-people-fill me-1"></i> {b.guests}
                          </span>
                        </td>
                        <td>{getStatusBadge(b.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
