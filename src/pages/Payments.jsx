import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Payments() {
  const location = useLocation();
  const [payments, setPayments] = useState([]);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(location.state?.message || '');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, ordersRes] = await Promise.all([
        api.get('/api/payments/my'),
        api.get('/api/orders/my'),
      ]);

      if (paymentsRes.data.success) {
        setPayments(paymentsRes.data.payments);
      }

      if (ordersRes.data.success) {
        // Filter orders that have no payment completed
        const unpaid = ordersRes.data.orders.filter((o) => !o.payment && o.status !== 'Cancelled');
        setUnpaidOrders(unpaid);

        // Pre-select if redirected from cart or order list
        if (location.state?.placedOrderId) {
          setSelectedOrderId(String(location.state.placedOrderId));
        } else if (unpaid.length > 0) {
          setSelectedOrderId(String(unpaid[0].id));
        }
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentUnpaidOrder = unpaidOrders.find((o) => String(o.id) === String(selectedOrderId));

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) {
      setError('Please select an order to pay for.');
      return;
    }

    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/api/payments', {
        order_id: selectedOrderId,
        method: paymentMethod,
        amount: currentUnpaidOrder?.total,
      });

      if (res.data.success) {
        setMessage(`Payment of ₹${res.data.amount} via ${res.data.method} completed and saved to MySQL!`);
        setSelectedOrderId('');
        fetchData(); // refresh lists
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment simulation failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-coffee-dark mb-1">Cafe Payments</h1>
          <p className="text-muted small mb-0">Record payments for orders using Cash, UPI, or Card</p>
        </div>
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
        {/* Payment Simulation Form */}
        <div className="col-12 col-lg-5">
          <div className="card card-beancraft border-0 p-4 sticky-top" style={{ top: '80px' }}>
            <h4 className="fw-bold text-coffee-dark mb-3">
              <i className="bi bi-credit-card-2-front me-2 text-coffee-accent"></i> Make a Payment
            </h4>

            {unpaidOrders.length === 0 ? (
              <div className="text-center py-4 bg-light rounded-3 border">
                <i className="bi bi-check-all text-success fs-1 mb-2 d-block"></i>
                <h5 className="fw-bold text-coffee-dark">All Orders Paid!</h5>
                <p className="text-muted small mb-3">You have no pending unpaid cafe orders at this time.</p>
                <Link to="/menu" className="btn btn-sm btn-coffee rounded-pill px-3">
                  Order Food
                </Link>
              </div>
            ) : (
              <form onSubmit={handlePayNow}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-coffee-dark">Select Unpaid Order</label>
                  <select
                    className="form-select"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    required
                  >
                    {unpaidOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        Order #{order.id} — ₹{Number(order.total).toFixed(2)} ({new Date(order.order_date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                {currentUnpaidOrder && (
                  <div className="p-3 bg-light rounded-3 mb-3 border">
                    <div className="d-flex justify-content-between text-muted small mb-1">
                      <span>Order ID:</span>
                      <strong className="text-dark">#{currentUnpaidOrder.id}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-muted small mb-1">
                      <span>Status:</span>
                      <span className="badge bg-secondary">{currentUnpaidOrder.status}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                      <span className="fw-bold text-coffee-dark">Amount Due:</span>
                      <span className="fw-bold fs-4 text-coffee-accent">₹{Number(currentUnpaidOrder.total).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-coffee-dark">Payment Method</label>
                  <div className="row g-2">
                    {['UPI', 'Card', 'Cash'].map((method) => (
                      <div key={method} className="col-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`btn w-100 py-2 d-flex flex-column align-items-center justify-content-center rounded-3 ${
                            paymentMethod === method
                              ? 'btn-coffee text-white shadow-sm'
                              : 'btn-outline-secondary bg-white'
                          }`}
                        >
                          <i className={`bi ${method === 'UPI' ? 'bi-qr-code-scan' : method === 'Card' ? 'bi-credit-card' : 'bi-cash-coin'} fs-4 mb-1`}></i>
                          <span className="small fw-bold">{method}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="btn btn-coffee w-100 py-3 rounded-pill fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2"
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Recording Payment in MySQL...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock-fill"></i>
                      <span>Pay ₹{currentUnpaidOrder ? Number(currentUnpaidOrder.total).toFixed(2) : '0.00'}</span>
                    </>
                  )}
                </button>
                <div className="text-center text-muted small mt-2">
                  Demonstration Payment (No real money involved)
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Payment History Table */}
        <div className="col-12 col-lg-7">
          <div className="card card-beancraft border-0 p-3 p-md-4">
            <h4 className="fw-bold text-coffee-dark mb-3">
              <i className="bi bi-clock-history me-2 text-coffee-accent"></i> Payment History
            </h4>

            {loading ? (
              <div className="text-center py-4 text-muted">
                <div className="spinner-border spinner-border-sm text-coffee me-2" role="status"></div>
                Loading transactions...
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-receipt fs-1 mb-2 d-block"></i>
                <div>No payment records found yet.</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-uppercase">
                    <tr>
                      <th>Payment ID</th>
                      <th>Order ID</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Date</th>
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
                        <td className="fw-bold text-coffee-accent">₹{Number(p.amount).toFixed(2)}</td>
                        <td>
                          <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">
                            {p.method}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
