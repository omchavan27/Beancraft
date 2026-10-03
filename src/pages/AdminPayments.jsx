import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/payments');
      if (res.data.success) {
        setPayments(res.data.payments);
        setTotalRevenue(res.data.totalRevenue || 0);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold text-coffee-dark mb-1">Payments & Revenue Ledger</h1>
         
        </div>
        <button onClick={fetchPayments} className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
          <i className="bi bi-arrow-clockwise"></i>
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Revenue Card Summary */}
      <div className="card card-beancraft bg-coffee-dark text-white p-4 mb-4 border-0">
        <div className="row align-items-center">
          <div className="col-md-7">
            <span className="text-warning small fw-bold text-uppercase tracking-wider">
              <i className="bi bi-cash-stack me-1"></i> Total Realized Revenue (SQL SUM)
            </span>
            <div className="display-5 fw-bold text-white mt-1 mb-1">
              ₹{Number(totalRevenue).toFixed(2)}
            </div>
            
          </div>
          <div className="col-md-5 text-md-end mt-3 mt-md-0">
            <div className="d-inline-flex gap-2">
              <span className="badge bg-warning text-dark px-3 py-2 fs-6 rounded-pill">
                {payments.length} Transactions Recorded
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-coffee mb-2" role="status"></div>
          <div>Loading transactions from MySQL...</div>
        </div>
      ) : payments.length === 0 ? (
        <div className="card card-beancraft border-0 p-5 text-center">
          <i className="bi bi-credit-card-2-back fs-1 text-muted mb-2"></i>
          <h4 className="fw-bold text-coffee-dark">No payments recorded</h4>
          <p className="text-muted small">Payments made by customers will be logged here.</p>
        </div>
      ) : (
        <div className="card card-beancraft border-0 p-3 p-md-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Payment ID</th>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-bold text-coffee-dark">PAY#{p.id}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        Order #{p.order_id}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-coffee-dark">{p.customer_name}</div>
                      <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                        {p.customer_email}
                      </div>
                    </td>
                    <td className="fw-bold text-coffee-accent fs-6">
                      ₹{Number(p.amount).toFixed(2)}
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">
                        {p.method}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill">
                        <i className="bi bi-check-circle-fill me-1"></i> {p.status}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(p.payment_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-3 border-top d-flex justify-content-between text-muted small">
            <span>Showing all <strong>{payments.length}</strong> transactions</span>
           
          </div>
        </div>
      )}
    </div>
  );
}
