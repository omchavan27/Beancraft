import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await api.put(`/api/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data.success) {
        setAlertMsg(`Booking #${bookingId} status updated to "${newStatus}" in MySQL!`);
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        setTimeout(() => setAlertMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update booking status:', err);
      alert('Failed to update booking status in database.');
    } finally {
      setUpdatingId(null);
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
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold text-coffee-dark mb-1">Table Reservations (Admin)</h1>
          <p className="text-muted small mb-0">Confirm or cancel table reservations requested by customers</p>
        </div>
        <button onClick={fetchBookings} className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
          <i className="bi bi-arrow-clockwise"></i>
          <span>Refresh Bookings</span>
        </button>
      </div>

      {alertMsg && (
        <div className="alert alert-success py-2 d-flex align-items-center gap-2 mb-4 rounded-3 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{alertMsg}</div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-coffee mb-2" role="status"></div>
          <div>Loading reservations from MySQL...</div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card card-beancraft border-0 p-5 text-center">
          <i className="bi bi-calendar2-x fs-1 text-muted mb-2"></i>
          <h4 className="fw-bold text-coffee-dark">No table bookings found</h4>
          <p className="text-muted small">Customer reservations will appear here in real-time.</p>
        </div>
      ) : (
        <div className="card card-beancraft border-0 p-3 p-md-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Table</th>
                  <th>Date & Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-bold text-coffee-dark">BOOK#{b.id}</td>
                    <td>
                      <div className="fw-bold text-coffee-dark">{b.customer_name}</div>
                      <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                        {b.customer_email}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-warning-subtle text-dark border px-2 py-1 fw-bold">
                        Table {b.table_no}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-coffee-dark">{b.date}</div>
                      <div className="text-muted small">
                        <i className="bi bi-clock me-1"></i> {b.time}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1">
                        <i className="bi bi-people-fill me-1"></i> {b.guests}
                      </span>
                    </td>
                    <td>{getStatusBadge(b.status)}</td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        {b.status !== 'Confirmed' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'Confirmed')}
                            disabled={updatingId === b.id}
                            className="btn btn-sm btn-success rounded-pill px-3"
                          >
                            <i className="bi bi-check-lg me-1"></i> Confirm
                          </button>
                        )}
                        {b.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'Cancelled')}
                            disabled={updatingId === b.id}
                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                          >
                            <i className="bi bi-x-lg me-1"></i> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-3 border-top text-muted small">
            
          </div>
        </div>
      )}
    </div>
  );
}
